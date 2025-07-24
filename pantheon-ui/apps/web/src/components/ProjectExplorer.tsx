import React, { useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileCode,
  FileText,
  FileJson,
  FileImage,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { ScrollArea } from './ScrollArea';
import { useBacoStore } from '../lib/store';
import { socket } from '../lib/socket';

interface ProjectExplorerProps {
  projectId: string;
}

interface FileNodeProps {
  node: {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNodeProps['node'][];
  };
  level: number;
}

export function ProjectExplorer({ projectId }: ProjectExplorerProps) {
  const { 
    currentProject, 
    expandedFolders, 
    selectedFile,
    toggleFolder,
    selectFile 
  } = useBacoStore();

  useEffect(() => {
    // Request project files when component mounts
    // Use the actual project path if available, otherwise use projectId
    const projectPath = currentProject?.path || projectId;
    
    // Only emit if socket is connected
    if (socket.connected) {
      console.log('Requesting project files for:', projectPath);
      socket.emit('getProjectFiles', projectPath);
    } else {
      // Wait for connection and then request
      const handleConnect = () => {
        console.log('Socket connected, requesting project files for:', projectPath);
        socket.emit('getProjectFiles', projectPath);
      };
      
      socket.once('connect', handleConnect);
      
      // Cleanup
      return () => {
        socket.off('connect', handleConnect);
      };
    }
  }, [projectId, currentProject?.path]);

  if (!currentProject) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Explorer
        </h3>
        <p className="text-sm font-medium mt-1">{currentProject.name}</p>
      </div>
      
      <ScrollArea className="flex-1 px-2">
        <div className="py-2">
          {currentProject.files.map((node) => (
            <FileNode key={node.path} node={node} level={0} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function FileNode({ node, level }: FileNodeProps) {
  const { expandedFolders, selectedFile, toggleFolder, selectFile } = useBacoStore();
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedFile === node.path;

  const handleClick = () => {
    if (node.type === 'directory') {
      toggleFolder(node.path);
    } else {
      selectFile(node.path);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <FileCode className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-yellow-500" />;
      case 'md':
      case 'txt':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <FileImage className="w-4 h-4 text-green-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <>
      <div
        className={`
          flex items-center gap-1 px-2 py-1 rounded cursor-pointer select-none
          hover:bg-accent hover:text-accent-foreground
          ${isSelected ? 'bg-accent text-accent-foreground' : ''}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'directory' && (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )
        )}
        
        {node.type === 'directory' ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-blue-400" />
          ) : (
            <Folder className="w-4 h-4 text-blue-400" />
          )
        ) : (
          getFileIcon(node.name)
        )}
        
        <span className="text-sm truncate">{node.name}</span>
      </div>
      
      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileNode key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </>
  );
}