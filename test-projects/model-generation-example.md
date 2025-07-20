# Model Generation Example

## Input: Task Management API Feature

```
FEATURE: Task Management CRUD

[HIGH PRIORITY] Create, read, update, and delete tasks with the following fields:
- Title (required, string)
- Description (optional, string)
- Status (enum: todo, in-progress, done)
- Priority (enum: low, medium, high)
- Due date (optional, date)
- Created/updated timestamps

Dependencies: User Authentication

FEATURE: Task Assignment

[MEDIUM PRIORITY] Ability to assign tasks to users:
- Assign task to user by ID
- List tasks assigned to a user
- Filter tasks by assignee
```

## Model Detection Output

### Detected Entities:

1. **Task**
   - title: string (required)
   - description: string (optional)
   - status: enum ['todo', 'in-progress', 'done']
   - priority: enum ['low', 'medium', 'high']
   - dueDate: date (optional)
   - assigneeId: objectId (relation to User)
   - createdAt: date
   - updatedAt: date

2. **User** (from authentication feature)
   - email: string (required, unique)
   - password: string (required)
   - name: string
   - tasks: Task[] (has many)

## Generated TypeScript Interfaces

### src/types/task.ts
```typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assigneeId: string;
  assignee?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assigneeId: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}
```

### src/types/user.ts
```typescript
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  password?: string;
}
```

## Generated Mongoose Schemas

### src/models/Task.ts
```typescript
import { Schema, model, Document } from 'mongoose';
import { Task } from '../types/task';

const taskSchema = new Schema<Task & Document>({
  title: {
    type: String,
    required: [true, 'title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  assigneeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes for performance
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ assigneeId: 1, status: 1 });
taskSchema.index({ deleted: 1 });

// Virtual for assignee population
taskSchema.virtual('assignee', {
  ref: 'User',
  localField: 'assigneeId',
  foreignField: '_id',
  justOne: true
});

// Instance methods
taskSchema.methods.softDelete = function() {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Static methods
taskSchema.statics.findActive = function() {
  return this.find({ deleted: false });
};

taskSchema.statics.findByAssignee = function(userId: string) {
  return this.find({ assigneeId: userId, deleted: false });
};

export const Task = model<Task & Document>('Task', taskSchema);
```

### src/models/User.ts
```typescript
import { Schema, model, Document } from 'mongoose';
import { User } from '../types/user';
import bcrypt from 'bcryptjs';

const userSchema = new Schema<User & Document>({
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ deleted: 1 });

// Virtual for tasks
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'assigneeId'
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = model<User & Document>('User', userSchema);
```

## Customized CRUD Controller

The CRUD template would be customized for Task:

### src/controllers/taskController.ts
```typescript
// Instead of generic "Item", we have Task-specific implementation
const createTask = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const taskData = {
    ...req.body,
    assigneeId: req.body.assigneeId || req.userId, // Default to current user
    createdBy: req.userId,
    updatedBy: req.userId
  };

  const task = new Task(taskData);
  await task.save();
  await task.populate('assignee');

  res.status(201).json({
    success: true,
    data: task,
    message: 'Task created successfully'
  });
};

// Search includes title and description
const getTasks = async (req: Request, res: Response) => {
  const { search, assigneeId, status, priority } = req.query;
  
  const query = { deleted: false };
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (assigneeId) query.assigneeId = assigneeId;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  
  const tasks = await Task.find(query)
    .populate('assignee', 'name email')
    .sort('-createdAt');
    
  res.json({
    success: true,
    data: tasks
  });
};
```

## Benefits of Model Generation

1. **Type Safety**: Generated TypeScript interfaces ensure type safety across the application
2. **Consistency**: All models follow the same structure and patterns
3. **Relationships**: Automatically handles relationships between models
4. **Validation**: Includes field validation based on requirements
5. **CRUD Customization**: CRUD operations are tailored to specific models
6. **Less Manual Work**: No need to manually create models and schemas