import { chain, noop, Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { ATOMICDESIGN } from './files/defaultScaffolders/atomic-design';
import { CFS } from './files/defaultScaffolders/core-feature-shared';
import { FolderStructure, ScaffoldOptions } from './scaffold.interfaces';
import {
  createEmptyFolder,
  createModuleFolder,
  createRoutingFile,
  getDefaultProject,
  getJsonFile,
  getProject,
  setParentsStructure,
} from '@utils/file-utils';
import { FolderPath } from '@utils/interfaces/folderPath.interface';
import { addExportToNearbyIndexFile, addShortPath, createIndexFile } from '@utils/shortPaths';
import { setStructurePaths } from '@utils/paths';
import { readWorkspace } from '@utils/workspace';

export function scaffolding(options: ScaffoldOptions): Rule {
  return async (tree: Tree) => {
    const workspace = await readWorkspace(tree);
    options.project = options.project || getDefaultProject(workspace);

    const project = getProject(workspace, options.project);
    const path = new FolderPath(project.prefix ?? '', `${project.sourceRoot}/`);
    let structures: FolderStructure[] = getFileStructure(tree, options);
    structures = setStructurePaths(structures, path);
    structures = structures.map((structure) => setParentsStructure(structure));
    return scaffoldFoldersFactory(structures, options);
  };
}

function getFileStructure(tree: Tree, options: ScaffoldOptions): FolderStructure[] {
  switch (options.custom) {
    case 'CFS':
      return CFS;
    case 'ATOMIC-DESIGN':
      return ATOMICDESIGN;
    case 'CUSTOM':
      if (!options.customFilePath) {
        throw new SchematicsException(`You need to specify the url of the custom file structure`);
      }
      return getJsonFile<FolderStructure[]>(tree, options.customFilePath);
  }
}

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
