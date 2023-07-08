import { normalize, split } from '@angular-devkit/core';
import { FolderStructure } from '../ng-generate/scaffolding/scaffold.interfaces';
import { FolderPath } from './interfaces/folderPath.interface';

export function relativePathToWorkspaceRoot(projectRoot: string | undefined): string {
  const normalizedPath = split(normalize(projectRoot || ''));

  if (normalizedPath.length === 0 || !normalizedPath[0]) {
    return '.';
  } else {
    return normalizedPath.map(() => '..').join('/');
  }
}

export function setStructurePaths(
  structures: FolderStructure[],
  path: FolderPath
): FolderStructure[] {
  structures = structures.map((structure) => {
    structure.path = new FolderPath(structure.name, path.getPath(), path);
    structure = makeStructurePaths(structure);
    return structure;
  });
  return structures;
}

function makeStructurePaths(structure: FolderStructure): FolderStructure {
  if (structure.hasShortPath) {
    if (structure.path) {
      structure.path.shortPath = `@${structure.name}`;
    }
  }

  if (!structure.children || structure.children.length === 0) {
    return structure;
  }

  structure.children.map((structureChild) => {
    structureChild.path = new FolderPath(
      structureChild.name,
      structure.path?.getPath() || '',
      structure.path
    );
    return makeStructurePaths(structureChild);
  });
  return structure;
}

export function findIndexFileParentPath(structure: FolderStructure): string | undefined {
  if (structure.hasShortPath) {
    return `${structure.path?.getPath()}index.ts`;
  }
  if (!structure.parent) {
    return undefined;
  }
  return findIndexFileParentPath(structure.parent);
}

export function findModuleParentPath(structure: FolderStructure | undefined): string | undefined {
  if (!structure) {
    return undefined;
  }
  if (structure.hasModule) {
    return `${structure.path?.getPath()}${structure.name}.module.ts`;
  }

  return findModuleParentPath(structure.parent);
}

export function getModulePath(
  structure: FolderStructure,
  type: 'absolute' | 'relative' = 'absolute',
  folderName?: string
): string {
  return `${structure.path?.getPath(type, folderName)}${structure.name}.module`;
}

export function getModuleNameFromPath(path: string): string {
  const pathSplit = path.split('/');
  return pathSplit[pathSplit.length - 1].split('.')[0];
}

export function normalizePath(path: string): string {
  return path.charAt(path.length - 1) === '/' ? path : path + '/';
}