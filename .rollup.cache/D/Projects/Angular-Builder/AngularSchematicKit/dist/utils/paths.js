"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = exports.getModuleNameFromPath = exports.getModulePath = exports.findModuleParentPath = exports.findIndexFileParentPath = exports.recreateTreeFolderStructure = exports.relativePathToWorkspaceRoot = void 0;
const core_1 = require("@angular-devkit/core");
const folderPath_interface_1 = require("./interfaces/folderPath.interface");
function relativePathToWorkspaceRoot(projectRoot) {
    const normalizedPath = (0, core_1.split)((0, core_1.normalize)(projectRoot || ''));
    if (normalizedPath.length === 0 || !normalizedPath[0]) {
        return '.';
    }
    else {
        return normalizedPath.map(() => '..').join('/');
    }
}
exports.relativePathToWorkspaceRoot = relativePathToWorkspaceRoot;
function recreateTreeFolderStructure(structures, path) {
    structures = structures.map((structure) => {
        structure.path = new folderPath_interface_1.FolderPath(structure.name, path.getPath(), path);
        structure = makeStructurePaths(structure);
        return structure;
    });
    return structures;
}
exports.recreateTreeFolderStructure = recreateTreeFolderStructure;
function makeStructurePaths(structure) {
    if (structure.hasShortPath) {
        if (structure.path) {
            structure.path.shortPath = `@${structure.name}`;
        }
    }
    if (!structure.children || structure.children.length === 0) {
        return structure;
    }
    structure.children.map((structureChild) => {
        structureChild.parent = structure;
        structureChild.path = new folderPath_interface_1.FolderPath(structureChild.name, structure.path?.getPath() || '', structure.path);
        return makeStructurePaths(structureChild);
    });
    return structure;
}
function findIndexFileParentPath(structure) {
    if (structure.hasShortPath) {
        return `${structure.path?.getPath()}index.ts`;
    }
    if (!structure.parent) {
        return undefined;
    }
    return findIndexFileParentPath(structure.parent);
}
exports.findIndexFileParentPath = findIndexFileParentPath;
function findModuleParentPath(structure) {
    if (!structure) {
        return undefined;
    }
    if (structure.hasModule) {
        return `${structure.path?.getPath()}${structure.name}.module.ts`;
    }
    return findModuleParentPath(structure.parent);
}
exports.findModuleParentPath = findModuleParentPath;
function getModulePath(structure, type = 'absolute', folderName) {
    return `${structure.path?.getPath(type, folderName)}${structure.name}.module`;
}
exports.getModulePath = getModulePath;
function getModuleNameFromPath(path) {
    const pathSplit = path.split('/');
    return pathSplit[pathSplit.length - 1].split('.')[0];
}
exports.getModuleNameFromPath = getModuleNameFromPath;
function normalizePath(path) {
    return path.charAt(path.length - 1) === '/' ? path : path + '/';
}
exports.normalizePath = normalizePath;
