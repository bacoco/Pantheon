# Pantheon Code Generation Guide

This guide explains how Pantheon generates actual code files, not just plans and blueprints.

## The Complete Flow

### 1. Project Definition (`/gods init`)
User defines their project interactively. Pantheon creates a `pantheon.md` file.

### 2. Development Plan (`/gods plan`)
Pantheon analyzes requirements and creates a phased implementation plan.

### 3. PRP Generation (`/gods execute`)
Pantheon generates a detailed Product Requirements Prompt with:
- Code templates
- File structures
- Implementation phases
- Validation criteria

### 4. Code Generation (The Missing Piece)
When user chooses "Start implementing immediately", Pantheon:

#### Phase 1: Project Setup
```bash
# Actually runs these commands:
Bash("npx create-next-app@latest ai-image-gen --typescript --tailwind --app --no-git")
Bash("cd ai-image-gen && npm install replicate react-zoom-pan-pinch")

# Shows real progress:
✅ Next.js project created
✅ Dependencies installed (replicate, react-zoom-pan-pinch)
```

#### Phase 2: File Creation
```typescript
# Creates actual TypeScript files:
Write("src/types/index.ts", `
export interface Enhancement {
  axis_name: string;
  enhanced_prompt: string;
  score: number;
  // ... full interface definition
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  // ... full type definitions
}
`)

# Shows progress:
✅ Created src/types/index.ts (45 lines)
```

#### Phase 3: Component Implementation
```typescript
# Creates React components with full implementation:
Write("src/components/PromptInput.tsx", `
'use client';

import React, { useState, useEffect } from 'react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  maxWords: number;
  isLoading: boolean;
}

export function PromptInput({ onSubmit, maxWords, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = prompt.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && wordCount <= maxWords && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-4">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your image..."
          className="w-full min-h-[120px] p-4 text-lg border-2 rounded-lg resize-none"
          disabled={isLoading}
        />
        <div className={`absolute bottom-2 right-2 text-sm ${wordCount > maxWords ? 'text-red-500' : 'text-gray-500'}`}>
          {wordCount}/{maxWords} words
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading || wordCount === 0 || wordCount > maxWords}
        className="mt-4 w-full py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Images'}
      </button>
    </form>
  );
}
`)

# Shows progress:
✅ Created src/components/PromptInput.tsx (52 lines)
```

#### Phase 4: API Implementation
```typescript
# Creates API routes:
Write("src/app/api/enhance-prompt/route.ts", `
import { NextRequest, NextResponse } from 'next/server';
import { enhancePrompt } from '@/lib/promptEnhancer';

export async function POST(request: NextRequest) {
  try {
    const { prompt, userDirective } = await request.json();
    
    // Call the prompt enhancement logic
    const enhancements = await enhancePrompt(prompt, userDirective);
    
    return NextResponse.json({ enhancements });
  } catch (error) {
    console.error('Enhancement error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance prompt' },
      { status: 500 }
    );
  }
}
`)

# Shows progress:
✅ Created src/app/api/enhance-prompt/route.ts (28 lines)
```

## Key Differences from Just Planning

### Before (Planning Only):
- Generates PRP document
- Shows what files "would" be created
- Provides code snippets
- Stops at documentation

### After (Actual Implementation):
- Runs real commands
- Creates actual files
- Writes complete code
- Sets up working project
- Runs validation
- Fixes errors

## Interactive Progress Updates

During implementation, Pantheon shows:
```
📋 Phase 1: Foundation Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%

✅ Created 12 files:
   - package.json
   - tsconfig.json
   - tailwind.config.ts
   - src/app/layout.tsx
   - src/app/page.tsx
   - src/components/PromptInput.tsx
   - src/components/ImageGrid.tsx
   - src/types/index.ts
   - src/lib/promptEnhancer.ts
   - src/hooks/useImageGeneration.ts
   - .env.local.example
   - README.md

Phase 1 Complete! Ready for Phase 2? (y/n):
```

## Validation and Error Handling

After each phase:
```bash
# Run validation
Bash("npm run typecheck")
# If errors, show them and offer to fix:
❌ Type error in src/components/ImageGrid.tsx:45
   Property 'id' does not exist on type 'Image'

Would you like me to:
1. 🔧 Fix the error and continue
2. 📝 Show the problematic code
3. ⏭️ Skip validation (not recommended)
4. ❌ Stop here

Your choice (1-4): 1

Fixing type error...
✅ Fixed! Continuing with implementation...
```

## Complete Working Project

At the end of `/gods execute` with actual implementation:
```
🎉 Implementation Complete!

Created a fully functional AI Image Generator with:
- ✅ 23 source files
- ✅ 1,245 lines of code
- ✅ All TypeScript checks passing
- ✅ Responsive mobile design
- ✅ API integration ready

To run your project:
1. cd ai-image-gen
2. Add your Replicate API key to .env.local
3. npm run dev
4. Open http://localhost:3000

Your project is ready to use! 🚀
```

## Under the Hood

Pantheon uses these Claude Code tools:
- `Write`: Creates new files with content
- `Edit/MultiEdit`: Modifies existing files
- `Bash`: Runs commands (npm, git, etc.)
- `TodoWrite`: Tracks implementation progress
- `Read`: Checks existing code for context

## Benefits

1. **One Command**: From idea to working code
2. **Real Implementation**: Not just documentation
3. **Error Recovery**: Fixes issues automatically
4. **Progress Tracking**: See what's happening
5. **Validation**: Ensures code works
6. **Complete Project**: Ready to run

This is what makes Pantheon truly powerful - it doesn't just plan, it builds.