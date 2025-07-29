import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  Loader2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Button } from '@baco-ui/ui';
import { Progress } from './Progress';
import { useBacoStore } from '../lib/store';
import { startWorkflow, pauseWorkflow, resumeWorkflow } from '../lib/socket';
import type { WorkflowStatus, TaskStatus, PhaseStatus } from '@baco-ui/types';

export function TaskProgress() {
  const { activeWorkflow, workflows } = useBacoStore();

  if (!activeWorkflow) {
    return (
      <div className="text-center text-muted-foreground">
        <p className="text-sm">No active workflow</p>
      </div>
    );
  }

  const completedPhases = activeWorkflow.phases.filter(p => p.status === 'completed').length;
  const totalPhases = activeWorkflow.phases.length;
  const progress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  const handleWorkflowAction = () => {
    switch (activeWorkflow.status) {
      case 'ready':
      case 'paused':
        startWorkflow(activeWorkflow.id);
        break;
      case 'running':
        pauseWorkflow(activeWorkflow.id);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Active Workflow</h3>
        {activeWorkflow.status !== 'completed' && activeWorkflow.status !== 'failed' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleWorkflowAction}
          >
            {activeWorkflow.status === 'running' ? (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                {activeWorkflow.status === 'paused' ? 'Resume' : 'Start'}
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{activeWorkflow.name}</span>
          <WorkflowStatusBadge status={activeWorkflow.status} />
        </div>
        
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completedPhases} of {totalPhases} phases completed
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">
          Current Phase
        </h4>
        {activeWorkflow.phases.map((phase) => {
          if (phase.status === 'running' || phase.status === 'ready') {
            return (
              <PhaseItem key={phase.id} phase={phase} isActive={true} />
            );
          }
          return null;
        })}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">
          All Phases
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {activeWorkflow.phases.map((phase) => (
            <PhaseItem key={phase.id} phase={phase} isActive={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PhaseItemProps {
  phase: {
    id: string;
    name: string;
    status: PhaseStatus;
    tasks: Array<{ status: TaskStatus }>;
  };
  isActive: boolean;
}

function PhaseItem({ phase, isActive }: PhaseItemProps) {
  const completedTasks = phase.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = phase.tasks.length;

  const getStatusIcon = () => {
    switch (phase.status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'ready':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={`
      flex items-center gap-2 p-2 rounded text-sm
      ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}
    `}>
      {getStatusIcon()}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{phase.name}</p>
        {totalTasks > 0 && (
          <p className="text-xs text-muted-foreground">
            {completedTasks}/{totalTasks} tasks
          </p>
        )}
      </div>
    </div>
  );
}

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
}

function WorkflowStatusBadge({ status }: WorkflowStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'running':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
      ${getStatusColor()}
    `}>
      {status}
    </span>
  );
}