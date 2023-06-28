import {FolderPath} from "../../utils/shared.interfaces";

/**
 * Interface use to recreate the folder project tree.
 * The first parent is always app folder.
 * You can go from the end or from the begin of the tree with parent or children attribute
 * @attribute
 * @category Interface
 */
export interface FolderStructure {
    name: string;
    parent?: FolderStructure;
    children?: FolderStructure[];
    path?: FolderPath;
    hasModule?: boolean;
    hasShortPath?: boolean;
    hasRouting?: boolean;
}