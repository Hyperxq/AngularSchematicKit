import {FolderPath} from '@utils/interfaces/folderPath.interface';

/**
 * Interface for folder structure schema.json options
 * @interface ScaffoldOptions
 * @public
 */
export interface ScaffoldOptions {
  custom: 'CFS' | 'ATOMIC-DESIGN' | 'CUSTOM';
  customFilePath?: string;
  project?: string;
  deleteFile: boolean;
}

/**
 * Interface use to recreate the folder project tree.
 * The first parent is always app folder.
 * You can go from the end or from the begin of the tree with parent or children attribute
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
}