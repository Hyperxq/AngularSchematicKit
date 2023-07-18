import {FolderPath} from '../../utils';

/**
 * Interface for folder structure schema.json options
 * @interface ScaffoldOptions
 * @public
 */
export interface ScaffoldOptions {
  kindArchitecture: 'CFS' | 'ATOMIC-DESIGN' | 'CUSTOM';
  customFilePath: string;
  deleteFile: boolean;
}

/**
 * Interface use to recreate the folder project tree.
 * The first parent is always app folder.
 * You can go from the end or from the beginning of the tree with parent or children attribute
 * @Interface FolderStructure
 * @attribute
 * @category Interface
 */
export interface FolderStructure {
  name: string;
  children?: FolderStructure[];
  hasModule?: boolean;
  hasShortPath?: boolean;
  hasRouting?: boolean;
  parent?: FolderStructure;
  path?: FolderPath;
  addComponent?: { [option: string]: string } | true;
}

export interface Project {
  name: string;
  basePath: string;
  options: { [key: string]: string };
  structure: FolderStructure[];
}

export interface WorkspaceStructure {
  globalSettings: { [key: string]: string };
  projects: Project[];
  readLocalSettings?: boolean;
}