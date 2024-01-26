"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderPath = void 0;
const paths_1 = require("../paths");
class FolderPath {
    constructor(nameFolder, sourceRoot, parent, shortPath) {
        this.nameFolder = nameFolder;
        this.sourceRoot = sourceRoot;
        this.parent = parent;
        this.shortPath = shortPath;
    }
    getPath(type = 'absolute', folderName) {
        return type === 'absolute'
            ? (0, paths_1.normalizePath)(`${this.sourceRoot}${this.nameFolder}`)
            : this.getRelativePath(folderName ?? '');
    }
    getRelativePath(folderName) {
        if (!folderName) {
            throw new Error("to get the relative path  it's needed the folder name");
        }
        return (0, paths_1.normalizePath)(this.makeRelativePath(folderName));
    }
    makeRelativePath(folderName, path = this) {
        if (!path.parent) {
            return `./`;
        }
        if (path.parent.nameFolder === folderName) {
            return `./${path.nameFolder}`;
        }
        return this.makeRelativePath(folderName, path.parent) + '/' + path.nameFolder + '/';
    }
}
exports.FolderPath = FolderPath;
