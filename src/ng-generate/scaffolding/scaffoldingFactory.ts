import { FolderStructure, ScaffoldOptions } from './scaffold.interfaces';
import { chain, noop, Rule, SchematicsException } from '@angular-devkit/schematics';
import {
  addExportToNearbyIndexFile,
  addShortPath,
  createEmptyFolder,
  createIndexFile,
  createModuleFolder,
  createRoutingFile,
} from '../../utils';

export function scaffoldFoldersFactory(
  structures: FolderStructure[],
  options: ScaffoldOptions
): Rule {
  return () => {
    return chain(structures.map((structure) => createStructure(structure, options)));
  };
}

function createStructure(
  structure: FolderStructure,
  options: ScaffoldOptions,
  calls: Rule[] = []
): Rule {
  if (!structure.name) {
    throw new SchematicsException(`Name is mandatory`);
  }

  calls.push(createFolder(structure, options));

  if (!structure.children || structure.children.length === 0) {
    return chain(calls);
  }
  structure.children.map((structureChild) => {
    createStructure(structureChild, options, calls);
  });
  return chain(calls);
}

function createFolder(structure: FolderStructure, options: ScaffoldOptions): Rule {
  return async () => {
    const calls = [];

    if (structure.hasShortPath) {
      const exportsPaths: string[] = [];
      if (structure.hasModule) {
        exportsPaths.push(`./${structure.name}.module`);
      }
      if (structure.hasRouting) {
        exportsPaths.push(`./${structure.name}.routing`);
      }
      calls.push(createIndexFile(options, structure.path?.getPath() || '', exportsPaths));
      calls.push(
        addShortPath({
          packageName: `@${structure.name}`,
          paths: [structure.path?.getPath() || ''],
        })
      );
    }

    if (structure.hasModule) {
      calls.push(createModuleFolder(structure, options));
      calls.push(
        !structure.hasShortPath ? addExportToNearbyIndexFile(options, structure, 'module') : noop()
      );
    } else {
      calls.push(createEmptyFolder(structure.path?.getPath() || ''));
    }

    if (structure.hasRouting) {
      calls.push(createRoutingFile(structure, options));
      calls.push(
        !structure.hasShortPath ? addExportToNearbyIndexFile(options, structure, 'routing') : noop()
      );
    }

    return chain(calls);
  };
}