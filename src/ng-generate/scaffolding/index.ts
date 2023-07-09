import {
  chain,
  noop,
  Rule,
  schematic,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { ATOMICDESIGN } from './files/defaultScaffolders/atomic-design';
import { CFS } from './files/defaultScaffolders/core-feature-shared';
import { FolderStructure, ScaffoldOptions } from './scaffold.interfaces';
import {
  addExportToNearbyIndexFile,
  addShortPath,
  createEmptyFolder,
  createIndexFile,
  createModuleFolder,
  createRoutingFile,
  FolderPath,
  getDefaultProject,
  getJsonFile,
  getProject,
  readWorkspace,
  recreateTreeFolderStructure,
} from '../../utils';

export function scaffolding(options: ScaffoldOptions): Rule {
  return async (tree: Tree) => {
    /**
     * Basic concepts
     * Workspaces = Angular project root.
     * Project = the default one or the selected one.
     * Instructions to scaffolding
     * 1. Get the workspace.
     * 2. Use the project given or use the default project.
     * 3. Create the base FolderPath.
     * */
    const workspace = await readWorkspace(tree);
    options.project = options.project || getDefaultProject(workspace);

    const project = getProject(workspace, options.project);
    const path = new FolderPath(project.prefix ?? '', `${project.sourceRoot}/`);

    const structures: FolderStructure[] = recreateTreeFolderStructure(
      getPatternArchitecture(tree, options),
      path
    );
    return chain([
      scaffoldFoldersFactory(structures, options),
      deleteFile(options),
      printFinalMessage(),
    ]);
  };
}

function deleteFile(options: ScaffoldOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.custom === 'CUSTOM') {
      tree.delete(options.customFilePath!);
      context.logger.log('info', `The custom file was deleted successfully ✔`);
    }
    return tree;
  };
}

function printFinalMessage(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.logger.info(`🚀 the scaffolding architecture was implemented successfully`);
  };
}

function getPatternArchitecture(tree: Tree, options: ScaffoldOptions): FolderStructure[] {
  switch (options.custom) {
    case 'CFS':
      return CFS;
    case 'ATOMIC-DESIGN':
      return ATOMICDESIGN;
    case 'CUSTOM':
      //TODO: invoke and test the sub-schema here
      if (!options.customFilePath) {
        throw new SchematicsException(`You need to specify the url of the custom file structure`);
      }
      schematic('otherSchematic', options);
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