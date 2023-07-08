import { normalizePath } from '../paths';

interface IFolderPath {
    nameFolder?: string;
    sourceRoot?: string;
    parent?: IFolderPath;
    getPath: (type: 'absolute' | 'relative', folderName: string) => string;
    getRelativePath: (folderName: string) => string;
    makeRelativePath: (folderName: string, path: FolderPath) => string;
}

/**
 * This class represent everything about the current folder path.
 * and you can see the relative or absolute path of the current folder.
 * @implements IFolderPath
 * @category Class
 */
export class FolderPath implements IFolderPath {
    constructor(
        public nameFolder: string,
        public sourceRoot: string,
        public parent?: FolderPath,
        public shortPath?: string
    ) {}

    getPath(type: 'absolute' | 'relative' = 'absolute', folderName?: string): string {
        return type === 'absolute'
            ? normalizePath(`${this.sourceRoot}${this.nameFolder}`)
            : this.getRelativePath(folderName ?? '');
    }

    getRelativePath(folderName: string): string {
        if (!folderName) {
            throw new Error("to get the relative path  it's needed the folder name");
        }
        return normalizePath(this.makeRelativePath(folderName));
    }

    makeRelativePath(folderName: string, path: FolderPath = this): string {
        if (!path.parent) {
            return `./`;
        }
        if (path.parent.nameFolder === folderName) {
            return `./${path.nameFolder}`;
        }
        return this.makeRelativePath(folderName, path.parent) + '/' + path.nameFolder + '/';
    }
}