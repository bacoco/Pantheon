---
name: "Validation Error Handling"
description: "Comprehensive validation and error handling patterns for forms and APIs"
category: "error-handling"
frameworks: ["express", "react", "typescript"]
dependencies: 
  - package: "zod"
    version: "^3.22.0"
  - package: "express-validator"
    version: "^7.0.0"
  - package: "joi"
    version: "^17.11.0"
  - package: "yup"
    version: "^1.3.0"
tags: ["validation", "error-handling", "forms", "api", "schema-validation"]
---

## Overview

This template provides validation error handling patterns including:
- Schema-based validation with multiple libraries
- Form validation with error display
- API request validation
- Custom validation rules
- Error message formatting
- Internationalization support
- Client and server-side validation

## Code

### Zod Schema Validation (src/schemas/userSchema.ts)
```typescript
import { z } from 'zod';

// Custom error messages
const requiredError = (field: string) => `${field} is required`;
const minLengthError = (field: string, min: number) => 
  `${field} must be at least ${min} characters`;

// Reusable schemas
export const emailSchema = z
  .string({ required_error: requiredError('Email') })
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string({ required_error: requiredError('Password') })
  .min(8, minLengthError('Password', 8))
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// User schemas
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string()
    .min(2, minLengthError('Name', 2))
    .max(50, 'Name must be less than 50 characters')
    .trim(),
  age: z.number()
    .int('Age must be a whole number')
    .min(18, 'You must be at least 18 years old')
    .max(120, 'Age must be less than 120'),
  role: z.enum(['user', 'admin', 'moderator'], {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
  preferences: z.object({
    newsletter: z.boolean().default(false),
    notifications: z.boolean().default(true)
  }).optional(),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ password: true, confirmPassword: true });

// Type inference
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Validation function with custom error formatting
export const validateUserInput = (data: unknown) => {
  try {
    const validated = createUserSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        if (!acc[path]) {
          acc[path] = [];
        }
        acc[path].push(err.message);
        return acc;
      }, {} as Record<string, string[]>);

      return { 
        success: false, 
        errors: formattedErrors,
        rawErrors: error.errors 
      };
    }
    
    return { 
      success: false, 
      errors: { general: ['An unexpected error occurred'] } 
    };
  }
};
```

### Express Middleware Validation (src/middleware/validation.ts)
```typescript
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

// Zod validation middleware
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Express-validator example
import { body, validationResult, ValidationChain } from 'express-validator';

export const userValidationRules = (): ValidationChain[] => [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error('Email already in use');
      }
    }),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/)
    .withMessage('Password must contain letters, numbers, and special characters'),
  
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  
  body('age')
    .isInt({ min: 18, max: 120 })
    .withMessage('Age must be between 18 and 120')
    .toInt(),
  
  body('tags')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 tags allowed')
    .customSanitizer((tags) => tags.map((tag: string) => tag.trim().toLowerCase()))
];

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors: Record<string, string[]> = {};
    
    errors.array().forEach(err => {
      if ('path' in err) {
        if (!extractedErrors[err.path]) {
          extractedErrors[err.path] = [];
        }
        extractedErrors[err.path].push(err.msg);
      }
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  }
  
  next();
};
```

### React Form Validation Hook (src/hooks/useFormValidation.ts)
```typescript
import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
  reValidateMode?: 'onChange' | 'onBlur';
  defaultValues?: Partial<T>;
}

interface FieldError {
  message: string;
  type: string;
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  mode = 'onSubmit',
  reValidateMode = 'onChange',
  defaultValues = {}
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<Partial<T>>(defaultValues);
  const [errors, setErrors] = useState<Record<string, FieldError>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validate single field
  const validateField = useCallback((name: string, value: any) => {
    try {
      const fieldSchema = schema.shape[name as keyof typeof schema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [name]: {
            message: error.errors[0].message,
            type: error.errors[0].code
          }
        }));
      }
    }
  }, [schema]);

  // Validate all fields
  const validateForm = useCallback(async () => {
    try {
      await schema.parseAsync(values);
      setErrors({});
      setIsValid(true);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, FieldError> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          if (!newErrors[path]) {
            newErrors[path] = {
              message: err.message,
              type: err.code
            };
          }
        });
        setErrors(newErrors);
        setIsValid(false);
        return false;
      }
      return false;
    }
  }, [schema, values]);

  // Handle field change
  const handleChange = useCallback((name: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;

    setValues(prev => ({ ...prev, [name]: value }));

    if (mode === 'onChange' || (touched[name] && reValidateMode === 'onChange')) {
      validateField(name, value);
    }
  }, [mode, reValidateMode, touched, validateField]);

  // Handle field blur
  const handleBlur = useCallback((name: string) => () => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (mode === 'onBlur' || reValidateMode === 'onBlur') {
      validateField(name, values[name as keyof typeof values]);
    }
  }, [mode, reValidateMode, values, validateField]);

  // Get field props
  const getFieldProps = useCallback((name: string) => ({
    name,
    value: values[name as keyof typeof values] || '',
    onChange: handleChange(name),
    onBlur: handleBlur(name),
    error: touched[name] ? errors[name] : undefined,
    'aria-invalid': touched[name] && !!errors[name],
    'aria-describedby': touched[name] && errors[name] ? `${name}-error` : undefined
  }), [values, errors, touched, handleChange, handleBlur]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit: (data: T) => void | Promise<void>) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      const isFormValid = await validateForm();
      
      if (isFormValid) {
        try {
          await onSubmit(values as T);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      setIsSubmitting(false);
    };
  }, [validateForm, values]);

  // Reset form
  const reset = useCallback((newValues?: Partial<T>) => {
    setValues(newValues || defaultValues);
    setErrors({});
    setTouched({});
    setIsValid(false);
  }, [defaultValues]);

  // Set custom errors (e.g., from server)
  const setError = useCallback((name: string, error: FieldError) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // Watch for value changes
  useEffect(() => {
    if (mode === 'onChange') {
      validateForm();
    }
  }, [values, mode, validateForm]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    getFieldProps,
    handleSubmit,
    reset,
    setError,
    setValues,
    validateField,
    validateForm
  };
}
```

### React Form Component with Validation (src/components/UserForm.tsx)
```typescript
import React from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { createUserSchema } from '../schemas/userSchema';

const UserForm: React.FC = () => {
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    getFieldProps,
    handleSubmit,
    setError
  } = useFormValidation({
    schema: createUserSchema,
    mode: 'onBlur',
    defaultValues: {
      role: 'user',
      preferences: {
        newsletter: false,
        notifications: true
      }
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle server validation errors
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            setError(field, {
              message: Array.isArray(messages) ? messages[0] : messages,
              type: 'server'
            });
          });
        }
        return;
      }

      // Success handling
      console.log('User created:', result);
    } catch (error) {
      setError('general', {
        message: 'An error occurred. Please try again.',
        type: 'submit'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.general.message}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          {...getFieldProps('email')}
          type="email"
          id="email"
          className={`mt-1 block w-full rounded-md shadow-sm
            ${errors.email && touched.email
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
        />
        {errors.email && touched.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          {...getFieldProps('password')}
          type="password"
          id="password"
          className={`mt-1 block w-full rounded-md shadow-sm
            ${errors.password && touched.password
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
        />
        {errors.password && touched.password && (
          <p id="password-error" className="mt-1 text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          {...getFieldProps('confirmPassword')}
          type="password"
          id="confirmPassword"
          className={`mt-1 block w-full rounded-md shadow-sm
            ${errors.confirmPassword && touched.confirmPassword
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
        />
        {errors.confirmPassword && touched.confirmPassword && (
          <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          {...getFieldProps('name')}
          type="text"
          id="name"
          className={`mt-1 block w-full rounded-md shadow-sm
            ${errors.name && touched.name
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
        />
        {errors.name && touched.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Age
        </label>
        <input
          {...getFieldProps('age')}
          type="number"
          id="age"
          className={`mt-1 block w-full rounded-md shadow-sm
            ${errors.age && touched.age
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
        />
        {errors.age && touched.age && (
          <p id="age-error" className="mt-1 text-sm text-red-600">
            {errors.age.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          {...getFieldProps('role')}
          id="role"
          className={`mt-1 block w-full rounded-md shadow-sm
            ${errors.role && touched.role
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
        {errors.role && touched.role && (
          <p id="role-error" className="mt-1 text-sm text-red-600">
            {errors.role.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isValid}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
          ${isSubmitting || !isValid
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
      >
        {isSubmitting ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
};

export default UserForm;
```

### API Error Response Handler (src/utils/apiErrorResponse.ts)
```typescript
import { Response } from 'express';
import { ZodError } from 'zod';
import { ValidationError } from 'joi';

interface ApiError {
  field?: string;
  message: string;
  code?: string;
  value?: any;
}

export class ApiErrorResponse {
  static validation(res: Response, errors: ApiError[], message = 'Validation failed') {
    return res.status(400).json({
      success: false,
      message,
      errors: errors.map(err => ({
        field: err.field,
        message: err.message,
        code: err.code || 'VALIDATION_ERROR'
      }))
    });
  }

  static fromZodError(res: Response, error: ZodError) {
    const errors: ApiError[] = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
      value: err.code === 'invalid_type' ? undefined : (err as any).received
    }));

    return this.validation(res, errors);
  }

  static fromJoiError(res: Response, error: ValidationError) {
    const errors: ApiError[] = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      code: detail.type,
      value: detail.context?.value
    }));

    return this.validation(res, errors);
  }

  static fromExpressValidator(res: Response, errors: any[]) {
    const formattedErrors: ApiError[] = errors.map(err => ({
      field: err.path || err.param,
      message: err.msg,
      code: 'VALIDATION_ERROR',
      value: err.value
    }));

    return this.validation(res, formattedErrors);
  }

  static conflict(res: Response, resource: string, field?: string) {
    return res.status(409).json({
      success: false,
      message: `${resource} already exists`,
      errors: [{
        field,
        message: `This ${field || resource.toLowerCase()} is already taken`,
        code: 'CONFLICT'
      }]
    });
  }

  static unauthorized(res: Response, message = 'Authentication required') {
    return res.status(401).json({
      success: false,
      message,
      errors: [{
        message,
        code: 'UNAUTHORIZED'
      }]
    });
  }

  static forbidden(res: Response, message = 'Access denied') {
    return res.status(403).json({
      success: false,
      message,
      errors: [{
        message,
        code: 'FORBIDDEN'
      }]
    });
  }

  static notFound(res: Response, resource: string) {
    return res.status(404).json({
      success: false,
      message: `${resource} not found`,
      errors: [{
        message: `${resource} not found`,
        code: 'NOT_FOUND'
      }]
    });
  }

  static serverError(res: Response, message = 'Internal server error', error?: Error) {
    const response: any = {
      success: false,
      message,
      errors: [{
        message,
        code: 'SERVER_ERROR'
      }]
    };

    // Include error details in development
    if (process.env.NODE_ENV === 'development' && error) {
      response.debug = {
        message: error.message,
        stack: error.stack
      };
    }

    return res.status(500).json(response);
  }
}
```

## Usage

1. Install validation libraries:
   ```bash
   npm install zod express-validator joi yup
   ```

2. Create validation schemas for your data models

3. Use validation middleware in Express routes:
   ```typescript
   router.post('/users', 
     validateRequest(createUserSchema),
     createUser
   );
   ```

4. Use validation hooks in React forms:
   ```tsx
   const { getFieldProps, handleSubmit } = useFormValidation({
     schema: userSchema
   });
   ```

## Configuration

### Internationalization
```typescript
import i18n from 'i18next';

const createI18nSchema = (t: typeof i18n.t) => z.object({
  email: z.string()
    .email(t('validation.email.invalid'))
    .min(1, t('validation.email.required')),
  // ... other fields
});
```

### Custom Validation Rules
```typescript
// Phone number validation
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/;

const phoneSchema = z.string().regex(phoneRegex, 'Invalid phone number format');

// Credit card validation
const creditCardSchema = z.string().refine((val) => {
  // Luhn algorithm implementation
  return isValidCreditCard(val);
}, 'Invalid credit card number');

// Date range validation
const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date()
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate']
});
```

## Example

### Complete Form Validation Flow
```typescript
// 1. Define schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// 2. Create form component
function LoginForm() {
  const form = useFormValidation({ schema: loginSchema });

  return (
    <form onSubmit={form.handleSubmit(onLogin)}>
      <input {...form.getFieldProps('email')} />
      {form.errors.email && <span>{form.errors.email.message}</span>}
      
      <input {...form.getFieldProps('password')} type="password" />
      {form.errors.password && <span>{form.errors.password.message}</span>}
      
      <button disabled={!form.isValid}>Login</button>
    </form>
  );
}

// 3. Handle API validation
app.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const user = await authenticate(req.body);
    res.json({ success: true, user });
  } catch (error) {
    ApiErrorResponse.unauthorized(res, 'Invalid credentials');
  }
});
```