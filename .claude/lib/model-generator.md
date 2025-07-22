# Model Generator for BACO

This library generates database models and TypeScript interfaces from feature specifications in baco.md files.

## Overview

The model generator:
- Parses feature descriptions to extract entities and fields
- Generates TypeScript interfaces
- Creates database schemas (Mongoose, Prisma, TypeORM)
- Handles relationships between models
- Applies validation rules
- Generates CRUD operations specific to each model

## Feature Parsing Strategy

### 1. Entity Detection

```typescript
interface ExtractedEntity {
  name: string;
  fields: FieldDefinition[];
  relationships: Relationship[];
  validations: Validation[];
  indexes: Index[];
}

interface FieldDefinition {
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  defaultValue?: any;
  enum?: string[];
  description?: string;
}

type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'objectId' | 'array' | 'object';
```

### 2. Feature Text Analysis

```typescript
const fieldPatterns = {
  // "Title (required, string)"
  explicitField: /(\w+)\s*\(([^)]+)\)/g,
  
  // "- Title: string, required"
  bulletField: /^-\s*(\w+):\s*(.+)$/gm,
  
  // "Status (enum: todo, in-progress, done)"
  enumField: /(\w+)\s*\(enum:\s*([^)]+)\)/g,
  
  // "User authentication" -> implies User model
  implicitEntity: /(\w+)\s+(management|authentication|system)/gi,
  
  // "assigned to users" -> relationship
  relationship: /(belongs to|has many|assigned to|associated with)\s+(\w+)/gi
};

function parseFeatureText(featureText: string): ExtractedEntity[] {
  const entities: Map<string, ExtractedEntity> = new Map();
  
  // Extract explicit field definitions
  const fieldMatches = featureText.matchAll(fieldPatterns.explicitField);
  for (const match of fieldMatches) {
    const fieldName = match[1];
    const attributes = match[2].split(',').map(s => s.trim());
    
    // Process field attributes
    const field = processFieldAttributes(fieldName, attributes);
    addFieldToEntity(entities, field);
  }
  
  // Extract enum definitions
  const enumMatches = featureText.matchAll(fieldPatterns.enumField);
  for (const match of enumMatches) {
    const fieldName = match[1];
    const enumValues = match[2].split(',').map(s => s.trim());
    
    const field: FieldDefinition = {
      name: toCamelCase(fieldName),
      type: 'string',
      required: false,
      unique: false,
      enum: enumValues
    };
    
    addFieldToEntity(entities, field);
  }
  
  // Detect relationships
  const relationshipMatches = featureText.matchAll(fieldPatterns.relationship);
  for (const match of relationshipMatches) {
    const relationType = match[1];
    const relatedEntity = match[2];
    
    // Add relationship to current entity
    addRelationship(entities, relationType, relatedEntity);
  }
  
  return Array.from(entities.values());
}
```

### 3. Model Type Inference

```typescript
function inferFieldType(value: string): FieldType {
  const typePatterns = {
    string: /(string|text|varchar|char)/i,
    number: /(number|int|integer|float|decimal|numeric)/i,
    boolean: /(boolean|bool)/i,
    date: /(date|datetime|timestamp)/i,
    objectId: /(id|objectid|reference|ref)/i,
    array: /(array|list|\[\])/i,
    object: /(object|json)/i
  };
  
  for (const [type, pattern] of Object.entries(typePatterns)) {
    if (pattern.test(value)) {
      return type as FieldType;
    }
  }
  
  // Default to string
  return 'string';
}
```

## Model Generation

### 1. TypeScript Interface Generation

```typescript
export function generateTypeScriptInterface(entity: ExtractedEntity): string {
  const { name, fields, relationships } = entity;
  const interfaceName = toPascalCase(name);
  
  let output = `export interface ${interfaceName} {\n`;
  output += `  id: string;\n`;
  
  // Add fields
  for (const field of fields) {
    const optional = field.required ? '' : '?';
    const type = mapToTypeScriptType(field);
    output += `  ${field.name}${optional}: ${type};\n`;
  }
  
  // Add relationships
  for (const rel of relationships) {
    if (rel.type === 'belongsTo') {
      output += `  ${rel.field}Id: string;\n`;
      output += `  ${rel.field}?: ${toPascalCase(rel.model)};\n`;
    } else if (rel.type === 'hasMany') {
      output += `  ${rel.field}: ${toPascalCase(rel.model)}[];\n`;
    }
  }
  
  // Add timestamps
  output += `  createdAt: Date;\n`;
  output += `  updatedAt: Date;\n`;
  
  output += `}\n\n`;
  
  // Generate create/update DTOs
  output += generateDTOs(entity);
  
  return output;
}

function generateDTOs(entity: ExtractedEntity): string {
  const baseName = toPascalCase(entity.name);
  let output = '';
  
  // Create DTO
  output += `export interface Create${baseName}Dto {\n`;
  for (const field of entity.fields) {
    if (field.name !== 'id' && !field.defaultValue) {
      const optional = field.required ? '' : '?';
      const type = mapToTypeScriptType(field);
      output += `  ${field.name}${optional}: ${type};\n`;
    }
  }
  output += `}\n\n`;
  
  // Update DTO
  output += `export interface Update${baseName}Dto extends Partial<Create${baseName}Dto> {}\n\n`;
  
  return output;
}
```

### 2. Mongoose Schema Generation

```typescript
export function generateMongooseSchema(entity: ExtractedEntity): string {
  const { name, fields, relationships, indexes } = entity;
  const schemaName = `${toCamelCase(name)}Schema`;
  
  let output = `import { Schema, model, Document } from 'mongoose';\n`;
  output += `import { ${toPascalCase(name)} } from '../types';\n\n`;
  
  output += `const ${schemaName} = new Schema<${toPascalCase(name)} & Document>({\n`;
  
  // Add fields
  for (const field of fields) {
    output += `  ${field.name}: {\n`;
    output += `    type: ${mapToMongooseType(field.type)},\n`;
    
    if (field.required) {
      output += `    required: [true, '${field.name} is required'],\n`;
    }
    
    if (field.unique) {
      output += `    unique: true,\n`;
    }
    
    if (field.enum) {
      output += `    enum: ${JSON.stringify(field.enum)},\n`;
    }
    
    if (field.defaultValue !== undefined) {
      output += `    default: ${JSON.stringify(field.defaultValue)},\n`;
    }
    
    if (field.type === 'string') {
      output += `    trim: true,\n`;
      if (field.name.toLowerCase().includes('email')) {
        output += `    lowercase: true,\n`;
      }
    }
    
    output += `  },\n`;
  }
  
  // Add relationships
  for (const rel of relationships) {
    if (rel.type === 'belongsTo') {
      output += `  ${rel.field}Id: {\n`;
      output += `    type: Schema.Types.ObjectId,\n`;
      output += `    ref: '${toPascalCase(rel.model)}',\n`;
      output += `    required: true\n`;
      output += `  },\n`;
    }
  }
  
  // Add deleted flag for soft deletes
  output += `  deleted: {\n`;
  output += `    type: Boolean,\n`;
  output += `    default: false\n`;
  output += `  },\n`;
  output += `  deletedAt: Date,\n`;
  
  output += `}, {\n`;
  output += `  timestamps: true\n`;
  output += `});\n\n`;
  
  // Add indexes
  for (const index of indexes) {
    output += `${schemaName}.index(${JSON.stringify(index.fields)});\n`;
  }
  
  // Add text index for search
  const textFields = fields
    .filter(f => f.type === 'string' && (f.name.includes('name') || f.name.includes('title') || f.name.includes('description')))
    .map(f => f.name);
    
  if (textFields.length > 0) {
    const textIndex = textFields.reduce((acc, field) => {
      acc[field] = 'text';
      return acc;
    }, {} as Record<string, string>);
    output += `${schemaName}.index(${JSON.stringify(textIndex)});\n`;
  }
  
  // Add virtual for relationships
  for (const rel of relationships) {
    if (rel.type === 'hasMany') {
      output += `\n${schemaName}.virtual('${rel.field}', {\n`;
      output += `  ref: '${toPascalCase(rel.model)}',\n`;
      output += `  localField: '_id',\n`;
      output += `  foreignField: '${toCamelCase(name)}Id'\n`;
      output += `});\n`;
    }
  }
  
  // Add methods
  output += `\n// Instance methods\n`;
  output += `${schemaName}.methods.softDelete = function() {\n`;
  output += `  this.deleted = true;\n`;
  output += `  this.deletedAt = new Date();\n`;
  output += `  return this.save();\n`;
  output += `};\n\n`;
  
  // Add static methods
  output += `// Static methods\n`;
  output += `${schemaName}.statics.findActive = function() {\n`;
  output += `  return this.find({ deleted: false });\n`;
  output += `};\n\n`;
  
  output += `export const ${toPascalCase(name)} = model<${toPascalCase(name)} & Document>('${toPascalCase(name)}', ${schemaName});\n`;
  
  return output;
}
```

### 3. Prisma Schema Generation

```typescript
export function generatePrismaModel(entity: ExtractedEntity): string {
  const { name, fields, relationships } = entity;
  const modelName = toPascalCase(name);
  
  let output = `model ${modelName} {\n`;
  output += `  id        String   @id @default(cuid())\n`;
  
  // Add fields
  for (const field of fields) {
    const optional = field.required ? '' : '?';
    const type = mapToPrismaType(field);
    output += `  ${field.name.padEnd(10)} ${type}${optional}`;
    
    if (field.unique) {
      output += ` @unique`;
    }
    
    if (field.defaultValue !== undefined) {
      output += ` @default(${formatPrismaDefault(field.defaultValue)})`;
    }
    
    output += `\n`;
  }
  
  // Add relationships
  for (const rel of relationships) {
    if (rel.type === 'belongsTo') {
      output += `  ${rel.field}Id String\n`;
      output += `  ${rel.field}    ${toPascalCase(rel.model)} @relation(fields: [${rel.field}Id], references: [id])\n`;
    } else if (rel.type === 'hasMany') {
      output += `  ${rel.field}    ${toPascalCase(rel.model)}[]\n`;
    }
  }
  
  // Add timestamps
  output += `  createdAt DateTime @default(now())\n`;
  output += `  updatedAt DateTime @updatedAt\n`;
  output += `  deleted   Boolean  @default(false)\n`;
  output += `  deletedAt DateTime?\n`;
  
  // Add indexes
  output += `\n`;
  output += `  @@index([deleted])\n`;
  
  const searchableFields = fields
    .filter(f => f.type === 'string' && (f.name.includes('name') || f.name.includes('title')))
    .map(f => f.name);
    
  if (searchableFields.length > 0) {
    output += `  @@index([${searchableFields.join(', ')}])\n`;
  }
  
  output += `}\n`;
  
  return output;
}
```

## Integration with Templates

### 1. Template Variable Replacement

```typescript
export function customizeTemplateWithModel(
  template: string, 
  entity: ExtractedEntity,
  options: {
    framework: string;
    orm: string;
  }
): string {
  let customized = template;
  
  // Replace model name variations
  customized = customized.replace(/\{\{modelName\}\}/g, entity.name);
  customized = customized.replace(/\{\{ModelName\}\}/g, toPascalCase(entity.name));
  customized = customized.replace(/\{\{model_name\}\}/g, toSnakeCase(entity.name));
  customized = customized.replace(/\{\{model-name\}\}/g, toKebabCase(entity.name));
  
  // Replace collection name
  const collectionName = pluralize(toCamelCase(entity.name));
  customized = customized.replace(/\{\{collection\}\}/g, collectionName);
  
  // Replace generic "Item" with actual model name
  customized = customized.replace(/\bItem\b/g, toPascalCase(entity.name));
  customized = customized.replace(/\bitem\b/g, toCamelCase(entity.name));
  customized = customized.replace(/\bitems\b/g, collectionName);
  
  // Replace field lists
  if (customized.includes('{{fields}}')) {
    const fieldList = generateFieldList(entity, options.framework);
    customized = customized.replace(/\{\{fields\}\}/g, fieldList);
  }
  
  // Replace validation rules
  if (customized.includes('{{validations}}')) {
    const validations = generateValidations(entity, options.framework);
    customized = customized.replace(/\{\{validations\}\}/g, validations);
  }
  
  return customized;
}
```

### 2. CRUD Customization

```typescript
export function generateModelSpecificCRUD(
  entity: ExtractedEntity,
  baseTemplate: string
): string {
  let crud = baseTemplate;
  
  // Customize create operation
  const requiredFields = entity.fields.filter(f => f.required);
  const createValidation = requiredFields.map(f => 
    `if (!${f.name}) errors.push({ field: '${f.name}', message: '${f.name} is required' });`
  ).join('\n  ');
  
  crud = crud.replace('// Validation', createValidation);
  
  // Customize search functionality
  const searchableFields = entity.fields
    .filter(f => f.type === 'string')
    .map(f => f.name);
    
  if (searchableFields.length > 0) {
    const searchQuery = `
    if (search) {
      query.$or = [
        ${searchableFields.map(f => `{ ${f}: { $regex: search, $options: 'i' } }`).join(',\n        ')}
      ];
    }`;
    
    crud = crud.replace('// Search functionality', searchQuery);
  }
  
  // Add relationship population
  const belongsToRelations = entity.relationships
    .filter(r => r.type === 'belongsTo')
    .map(r => `.populate('${r.field}')`)
    .join('');
    
  crud = crud.replace('.find(query)', `.find(query)${belongsToRelations}`);
  
  return crud;
}
```

## Example Usage

### From Feature Text:
```
FEATURE: Task Management CRUD

Create, read, update, and delete tasks with the following fields:
- Title (required, string)
- Description (optional, string)
- Status (enum: todo, in-progress, done)
- Priority (enum: low, medium, high)
- Due date (optional, date)
- Assigned to user (relationship)
```

### Generated TypeScript Interface:
```typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedToId: string;
  assignedTo?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedToId: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}
```

### Generated Mongoose Schema:
```typescript
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
    enum: ['todo', 'in-progress', 'done']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  dueDate: {
    type: Date
  },
  assignedToId: {
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
```

## Integration with BACO Commands

### During `/baco plan`:
```typescript
// Extract entities from all features
const entities = [];
for (const feature of features) {
  const extracted = parseFeatureText(feature.content);
  entities.push(...extracted);
}

// Store in session for later use
session.entities = entities;
```

### During `/baco execute`:
```typescript
// Generate models based on detected entities
for (const entity of session.entities) {
  // Generate TypeScript interfaces
  const interfaceCode = generateTypeScriptInterface(entity);
  Write(`${projectPath}/src/types/${entity.name}.ts`, interfaceCode);
  
  // Generate database schema
  if (framework.orm === 'mongoose') {
    const schemaCode = generateMongooseSchema(entity);
    Write(`${projectPath}/src/models/${entity.name}.ts`, schemaCode);
  } else if (framework.orm === 'prisma') {
    // Append to schema.prisma
    const prismaModel = generatePrismaModel(entity);
    appendToFile(`${projectPath}/prisma/schema.prisma`, prismaModel);
  }
  
  // Customize CRUD template
  const crudTemplate = await loadTemplate('rest-api-crud');
  const customizedCrud = customizeTemplateWithModel(crudTemplate, entity, framework);
  Write(`${projectPath}/src/controllers/${entity.name}Controller.ts`, customizedCrud);
}
```