---
name: "Dynamic Form Component for Next.js App Router"
description: "TypeScript form component with validation, loading states, and error handling"
category: "forms"
frameworks: ["nextjs", "react", "typescript"]
dependencies: 
  - package: "react-hook-form"
    version: "^7.48.0"
  - package: "zod"
    version: "^3.22.0"
  - package: "@hookform/resolvers"
    version: "^3.3.0"
tags: ["form", "validation", "typescript", "nextjs", "app-router", "server-actions"]
---

## Overview

This template provides a dynamic form component for Next.js App Router with:
- TypeScript support
- Zod schema validation
- React Hook Form integration
- Server Actions for form submission
- Loading and error states
- Accessible form inputs
- Client and server-side validation

## Code

### Form Schema (lib/validations/contact.ts)
```typescript
import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  email: z.string()
    .email('Please enter a valid email address'),
  
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  
  subject: z.enum(['general', 'support', 'sales', 'other'], {
    errorMap: () => ({ message: 'Please select a subject' })
  }),
  
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  
  subscribe: z.boolean().default(false)
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
```

### Server Action (app/actions/contact.ts)
```typescript
'use server';

import { contactFormSchema, type ContactFormData } from '@/lib/validations/contact';
import { revalidatePath } from 'next/cache';

export type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  timestamp?: number;
};

export async function submitContactForm(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  try {
    // Convert FormData to object
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      subscribe: formData.get('subscribe') === 'on'
    };

    // Validate data
    const validatedData = contactFormSchema.parse(rawData);

    // Simulate API call or database operation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Here you would typically:
    // - Save to database
    // - Send email notification
    // - Add to mailing list if subscribed
    // await saveContactForm(validatedData);

    // Revalidate any cached data if needed
    revalidatePath('/contact');

    return {
      success: true,
      message: 'Thank you for your message. We\'ll get back to you soon!',
      timestamp: Date.now()
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Please check the form for errors',
        errors: error.flatten().fieldErrors
      };
    }

    // Handle other errors
    console.error('Form submission error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.'
    };
  }
}
```

### Form Component (components/forms/ContactForm.tsx)
```typescript
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { submitContactForm, type FormState } from '@/app/actions/contact';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg 
                 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-200"
    >
      {pending ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sending...
        </span>
      ) : (
        'Send Message'
      )}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form on successful submission
  useEffect(() => {
    if (state?.success && state.timestamp) {
      formRef.current?.reset();
    }
  }, [state?.success, state?.timestamp]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6 max-w-2xl mx-auto">
      {/* Success Message */}
      {state?.success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{state.message}</p>
        </div>
      )}

      {/* Error Message */}
      {state?.success === false && !state.errors && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{state.message}</p>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-blue-500 focus:border-blue-500 transition-colors"
          aria-describedby={state?.errors?.name ? 'name-error' : undefined}
        />
        {state?.errors?.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-blue-500 focus:border-blue-500 transition-colors"
          aria-describedby={state?.errors?.email ? 'email-error' : undefined}
        />
        {state?.errors?.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone (Optional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-blue-500 focus:border-blue-500 transition-colors"
          aria-describedby={state?.errors?.phone ? 'phone-error' : undefined}
        />
        {state?.errors?.phone && (
          <p id="phone-error" className="mt-1 text-sm text-red-600">
            {state.errors.phone[0]}
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Subject *
        </label>
        <select
          id="subject"
          name="subject"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-blue-500 focus:border-blue-500 transition-colors"
          aria-describedby={state?.errors?.subject ? 'subject-error' : undefined}
        >
          <option value="">Select a subject</option>
          <option value="general">General Inquiry</option>
          <option value="support">Technical Support</option>
          <option value="sales">Sales</option>
          <option value="other">Other</option>
        </select>
        {state?.errors?.subject && (
          <p id="subject-error" className="mt-1 text-sm text-red-600">
            {state.errors.subject[0]}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          aria-describedby={state?.errors?.message ? 'message-error' : undefined}
        />
        {state?.errors?.message && (
          <p id="message-error" className="mt-1 text-sm text-red-600">
            {state.errors.message[0]}
          </p>
        )}
      </div>

      {/* Subscribe Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="subscribe"
          name="subscribe"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="subscribe" className="ml-2 block text-sm text-gray-700">
          Subscribe to our newsletter
        </label>
      </div>

      {/* Submit Button */}
      <SubmitButton />
    </form>
  );
}
```

### Page Component (app/contact/page.tsx)
```typescript
import ContactForm from '@/components/forms/ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with our team'
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
```

### Alternative: With React Hook Form (components/forms/ContactFormHook.tsx)
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactFormData } from '@/lib/validations/contact';
import { useState } from 'react';

export default function ContactFormHook() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Call your API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: 'Message sent successfully!'
        });
        reset();
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: error instanceof Error ? error.message : 'Something went wrong'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      {/* Result messages */}
      {submitResult && (
        <div
          className={`p-4 rounded-lg ${
            submitResult.success
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {submitResult.message}
        </div>
      )}

      {/* Form fields similar to above, but using register */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* ... other fields ... */}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg 
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                   focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

## Usage

1. Install dependencies:
   ```bash
   npm install react-hook-form zod @hookform/resolvers
   ```

2. Create the validation schema in `lib/validations/contact.ts`

3. Create the server action in `app/actions/contact.ts`

4. Add the form component to your page

5. Style with Tailwind CSS or your preferred styling solution

## Configuration

### Environment Variables
```env
# If using email service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

### API Route Alternative (app/api/contact/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validations/contact';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = contactFormSchema.parse(body);

    // Process the form data
    // await sendEmail(validatedData);
    // await saveToDatabase(validatedData);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Example

### Basic Usage
```tsx
import ContactForm from '@/components/forms/ContactForm';

export default function Page() {
  return <ContactForm />;
}
```

### With Custom Styling
```tsx
<div className="custom-form-wrapper">
  <ContactForm />
</div>
```

### Testing
```typescript
// __tests__/ContactForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '@/components/forms/ContactForm';

describe('ContactForm', () => {
  it('displays validation errors', async () => {
    render(<ContactForm />);
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least/i)).toBeInTheDocument();
    });
  });
});
```