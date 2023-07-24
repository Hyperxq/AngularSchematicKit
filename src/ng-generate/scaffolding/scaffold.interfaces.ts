import {FolderPath} from '../../utils';

/**
 * Interface for folder structure schema.json options
 * @interface ScaffoldOptions
 * @public
 */
export interface ScaffoldOptions {
  kindArchitecture: 'CFS' | 'ATOMIC-DESIGN' | 'CUSTOM';
  customFilePath: string;
  project?: string;
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
export type IFolderStructure = Partial<{
  children?: FolderStructure[];
  hasModule?: boolean;
  hasShortPath?: boolean;
  hasRouting?: boolean;
  parent?: FolderStructure;
  path?: FolderPath;
}>;

export type externalSchematics = Partial<IFolderStructure> & {
  [prop: string]:
    | string
    | boolean
    | FolderPath
    | FolderStructure
    | FolderStructure[]
    | { [prop: string]: string }
    | {
        [prop: string]: string;
      }[];
};

export type FolderStructure = { name: string } & IFolderStructure & externalSchematics;

export interface Project {
  name: string;
  structure: FolderStructure[];
}

export type GlobalSettings = {
  [option: string]: { [prop: string]: string };
};

export interface WorkspaceStructure {
  globalSettings?: { [key: string]: { [prop: string]: string } };
  projects: Project[];
  readLocalSettings?: boolean;
}