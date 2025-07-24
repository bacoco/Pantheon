import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, AlertCircle } from 'lucide-react';
import { Button } from '@pantheon-ui/ui';
import { ScrollArea } from './ScrollArea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { usePantheonStore } from '../lib/store';
import { executeCommand, socket } from '../lib/socket';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    messages, 
    isStreaming, 
    activeExecution,
    addMessage,
    setStreaming,
    isConnected 
  } = usePantheonStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !isConnected || isStreaming) return;

    const trimmedInput = input.trim();
    
    // Add user message
    addMessage({
      role: 'user',
      content: trimmedInput,
    });

    // Check if it's a command
    if (trimmedInput.startsWith('/')) {
      const [commandName, ...args] = trimmedInput.slice(1).split(' ');
      const parameters = args.join(' ');
      
      // Execute command via socket
      executeCommand(commandName, { input: parameters });
    } else {
      // Handle natural language input
      socket.emit('chat', { 
        message: trimmedInput,
        context: { projectPath: window.location.pathname }
      }, (response: any) => {
        if (!response.success) {
          addMessage({
            role: 'system',
            content: `Error: ${response.error || 'Failed to process message'}`,
          });
        }
      });
    }

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-lg font-medium mb-2">Welcome to Pantheon Assistant</p>
              <p className="text-sm">
                Start by typing a command. Use "/" to see available commands.
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isStreaming && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Assistant is typing...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? "Type a command or message..." : "Connecting..."}
            disabled={!isConnected || isStreaming}
            className="flex-1 min-h-[60px] max-h-[200px] p-3 rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            rows={1}
          />
          <Button
            type="submit"
            disabled={!input.trim() || !isConnected || isStreaming}
            size="icon"
            className="self-end"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {activeExecution && activeExecution.status === 'running' && (
          <div className="mt-2 text-sm text-muted-foreground">
            Executing: {activeExecution.commandName}...
          </div>
        )}
        
        {/* Test buttons */}
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            onClick={() => {
              console.log('Testing help command...');
              executeCommand('help', {});
            }}
            variant="outline"
            size="sm"
          >
            Test /help
          </Button>
          <Button
            type="button"
            onClick={() => {
              console.log('Testing getProjectFiles...');
              socket.emit('getProjectFiles', '/Users/loic/develop/Pantheon/pantheon-ui');
            }}
            variant="outline"
            size="sm"
          >
            Test File Explorer
          </Button>
        </div>
      </form>
    </div>
  );
}

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  };
}

function MessageBubble({ message }: MessageBubbleProps) {
  const icon = message.role === 'user' ? (
    <User className="w-5 h-5" />
  ) : message.role === 'assistant' ? (
    <Bot className="w-5 h-5" />
  ) : (
    <AlertCircle className="w-5 h-5" />
  );

  const bgColor = message.role === 'user' 
    ? 'bg-primary text-primary-foreground' 
    : message.role === 'assistant'
    ? 'bg-muted'
    : 'bg-destructive/10 text-destructive';

  return (
    <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
      {message.role !== 'user' && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${bgColor}`}>
          {icon}
        </div>
      )}
      
      <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
        <div className={`inline-block p-3 rounded-lg ${bgColor} ${message.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}>
          {message.role === 'assistant' ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
              className="markdown-body"
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
      
      {message.role === 'user' && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${bgColor}`}>
          {icon}
        </div>
      )}
    </div>
  );
}