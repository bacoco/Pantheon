import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  FileText,
  FileCode,
  FileJson,
  Image,
  GitBranch
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  modified?: Date;
  gitStatus?: 'added' | 'modified' | 'deleted' | 'untracked';
}

interface FileTreeProps {
  nodes: FileNode[];
  onFileSelect?: (file: FileNode) => void;
  selectedPath?: string;
  showGitStatus?: boolean;
}

interface FileTreeNodeProps {
  node: FileNode;
  level: number;
  onFileSelect?: (file: FileNode) => void;
  selectedPath?: string;
  showGitStatus?: boolean;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <FileCode className="w-4 h-4 text-blue-500" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-500" />;
    case 'md':
      return <FileText className="w-4 h-4 text-gray-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <Image className="w-4 h-4 text-green-500" />;
    default:
      return <File className="w-4 h-4 text-gray-400" />;
  }
};

const getGitStatusColor = (status?: string) => {
  switch (status) {
    case 'added':
      return 'text-green-500';
    case 'modified':
      return 'text-yellow-500';
    case 'deleted':
      return 'text-red-500';
    case 'untracked':
      return 'text-gray-500';
    default:
      return '';
  }
};

function FileTreeNode({ 
  node, 
  level, 
  onFileSelect, 
  selectedPath,
  showGitStatus 
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedPath === node.path;
  
  const handleClick = () => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect?.(node);
    }
  };
  
  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 hover:bg-muted cursor-pointer select-none',
          isSelected && 'bg-primary/10'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'directory' && (
          <span className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        )}
        
        <span className="flex items-center gap-2 flex-1">
          {node.type === 'directory' ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-400" />
            ) : (
              <Folder className="w-4 h-4 text-blue-400" />
            )
          ) : (
            getFileIcon(node.name)
          )}
          
          <span className={cn(
            'text-sm',
            showGitStatus && getGitStatusColor(node.gitStatus)
          )}>
            {node.name}
          </span>
        </span>
        
        {showGitStatus && node.gitStatus && (
          <GitBranch className={cn(
            'w-3 h-3',
            getGitStatusColor(node.gitStatus)
          )} />
        )}
      </div>
      
      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedPath={selectedPath}
              showGitStatus={showGitStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ 
  nodes, 
  onFileSelect, 
  selectedPath,
  showGitStatus = true 
}: FileTreeProps) {
  return (
    <div className="text-sm">
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          level={0}
          onFileSelect={onFileSelect}
          selectedPath={selectedPath}
          showGitStatus={showGitStatus}
        />
      ))}
    </div>
  );
}