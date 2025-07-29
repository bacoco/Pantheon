import React, { useState, useEffect } from 'react';
import { ChatInterface, ProjectExplorer, TaskProgress } from './components';
import { useSocketConnection } from './hooks/useSocketConnection';
import { usePantheonStore } from './lib/store';

export function App() {
  const { isConnected, error } = useSocketConnection();
  const currentProject = usePantheonStore((state) => state.currentProject);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-80 border-r border-border bg-muted/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold">Pantheon Assistant</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {currentProject && (
          <>
            <div className="flex-1 overflow-hidden">
              <ProjectExplorer projectId={currentProject.id} />
            </div>
            <div className="border-t border-border p-4">
              <TaskProgress />
            </div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 border-b border-destructive/20">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;