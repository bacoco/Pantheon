import { useEffect, useCallback } from 'react';
import { socket, connectSocket, disconnectSocket } from '../lib/socket';
import { useBacoStore } from '../lib/store';
import type { CommandExecution, Agent, Workflow, WorkflowTask } from '@baco-ui/types';

export function useSocketConnection() {
  const {
    isConnected,
    connectionError,
    setConnected,
    setConnectionError,
    updateCommandExecution,
    updateAgent,
    updateWorkflow,
    updateWorkflowTask,
    updateProjectFiles,
    addMessage,
    setStreaming,
    updateLastMessage,
  } = useBacoStore();

  const handleConnect = useCallback(() => {
    console.log('[Socket] Connected');
    setConnected(true);
    setConnectionError(null);
  }, [setConnected, setConnectionError]);

  const handleDisconnect = useCallback(() => {
    console.log('[Socket] Disconnected');
    setConnected(false);
  }, [setConnected]);

  const handleError = useCallback((error: Error) => {
    console.error('[Socket] Error:', error);
    setConnectionError(error.message);
  }, [setConnectionError]);

  const handleCommandExecuted = useCallback((data: { execution: CommandExecution }) => {
    console.log('[Socket] Command executed:', data);
    const { execution } = data;
    
    // Add response as assistant message
    if (execution.output) {
      addMessage({
        role: 'assistant',
        content: execution.output,
      });
    }
    
    // Show error if any
    if (execution.error) {
      addMessage({
        role: 'system',
        content: `Error: ${execution.error}`,
      });
    }
    
    updateCommandExecution(execution.id, execution);
  }, [updateCommandExecution, addMessage]);

  const handleCommandOutput = useCallback(({ executionId, output }: { executionId: string; output: string }) => {
    console.log('[Socket] Command output:', executionId, output);
    
    // Add output as assistant message
    addMessage({
      role: 'assistant',
      content: output,
      commandExecution: { id: executionId } as CommandExecution,
    });
    
    // Update execution status
    updateCommandExecution(executionId, {
      output,
      status: 'completed',
      completedAt: new Date(),
    });
  }, [addMessage, updateCommandExecution]);

  const handleCommandError = useCallback(({ executionId, error }: { executionId: string; error: string }) => {
    console.error('[Socket] Command error:', executionId, error);
    
    // Add error as system message
    addMessage({
      role: 'system',
      content: `Error: ${error}`,
      commandExecution: { id: executionId } as CommandExecution,
    });
    
    // Update execution status
    updateCommandExecution(executionId, {
      error,
      status: 'failed',
      completedAt: new Date(),
    });
  }, [addMessage, updateCommandExecution]);

  const handleAgentUpdate = useCallback((agent: Agent) => {
    console.log('[Socket] Agent update:', agent);
    updateAgent(agent.id, agent);
  }, [updateAgent]);

  const handleWorkflowUpdate = useCallback((workflow: Workflow) => {
    console.log('[Socket] Workflow update:', workflow);
    updateWorkflow(workflow.id, workflow);
  }, [updateWorkflow]);

  const handleTaskUpdate = useCallback((task: WorkflowTask) => {
    console.log('[Socket] Task update:', task);
    // We need to find the workflow and phase that contains this task
    // This is a simplified version - in a real app, you'd have more context
    const workflows = useBacoStore.getState().workflows;
    for (const workflow of workflows) {
      for (const phase of workflow.phases) {
        const taskIndex = phase.tasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
          updateWorkflowTask(workflow.id, phase.id, task.id, task);
          break;
        }
      }
    }
  }, [updateWorkflowTask]);

  const handleProjectFileChange = useCallback(({ path, type }: { path: string; type: 'added' | 'modified' | 'deleted' }) => {
    console.log('[Socket] Project file change:', path, type);
    // In a real implementation, you would update the file tree
    // For now, we'll trigger a refresh
    const currentProject = useBacoStore.getState().currentProject;
    if (currentProject) {
      socket.emit('getProjectFiles', currentProject.id);
    }
  }, []);

  const handleStreamMessage = useCallback(({ channel, message }: { channel: string; message: any }) => {
    console.log('[Socket] Stream message:', channel, message);
    
    if (channel === 'assistant') {
      const messages = useBacoStore.getState().messages;
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.role === 'assistant' && useBacoStore.getState().isStreaming) {
        // Append to existing message
        updateLastMessage(lastMessage.content + message);
      } else {
        // Create new message
        setStreaming(true);
        addMessage({
          role: 'assistant',
          content: message,
        });
      }
    }
  }, [addMessage, setStreaming, updateLastMessage]);
  
  const handleChatResponse = useCallback((data: { message: string; command?: string; success: boolean; error?: string }) => {
    console.log('[Socket] Chat response:', data);
    
    if (data.success && data.message) {
      addMessage({
        role: 'assistant',
        content: data.command ? `Executing: ${data.command}\n\n${data.message}` : data.message,
      });
    } else if (data.error) {
      addMessage({
        role: 'system',
        content: `Error: ${data.error}`,
      });
    }
  }, [addMessage]);

  const handleProjectFiles = useCallback((data: any) => {
    console.log('[Socket] Project files received:', data);
    
    // Update the current project with real files
    const setCurrentProject = useBacoStore.getState().setCurrentProject;
    setCurrentProject({
      id: data.id,
      name: data.name,
      path: data.path,
      files: data.files
    });
  }, []);

  useEffect(() => {
    // Set up event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);
    socket.on('commandExecuted', handleCommandExecuted);
    socket.on('commandOutput', handleCommandOutput);
    socket.on('commandError', handleCommandError);
    socket.on('agentUpdate', handleAgentUpdate);
    socket.on('workflowUpdate', handleWorkflowUpdate);
    socket.on('taskUpdate', handleTaskUpdate);
    socket.on('projectFileChange', handleProjectFileChange);
    socket.on('streamMessage', handleStreamMessage);
    socket.on('chat-response', handleChatResponse);
    socket.on('projectFiles', handleProjectFiles);

    // Connect on mount
    connectSocket();

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
      socket.off('commandExecuted', handleCommandExecuted);
      socket.off('commandOutput', handleCommandOutput);
      socket.off('commandError', handleCommandError);
      socket.off('agentUpdate', handleAgentUpdate);
      socket.off('workflowUpdate', handleWorkflowUpdate);
      socket.off('taskUpdate', handleTaskUpdate);
      socket.off('projectFileChange', handleProjectFileChange);
      socket.off('streamMessage', handleStreamMessage);
      socket.off('chat-response', handleChatResponse);
      socket.off('projectFiles', handleProjectFiles);
      disconnectSocket();
    };
  }, [
    handleConnect,
    handleDisconnect,
    handleError,
    handleCommandExecuted,
    handleCommandOutput,
    handleCommandError,
    handleAgentUpdate,
    handleWorkflowUpdate,
    handleTaskUpdate,
    handleProjectFileChange,
    handleStreamMessage,
    handleChatResponse,
    handleProjectFiles,
  ]);

  return {
    isConnected,
    error: connectionError,
    socket,
  };
}