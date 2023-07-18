import {
  chain,
  externalSchematic,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  FolderStructure,
  Project,
  ScaffoldOptions,
  WorkspaceStructure,
} from './scaffold.interfaces';
import {
  addExportToNearbyIndexFile,
  addShortPath,
  createEmptyFolder,
  createIndexFile,
  createModuleFolder,
  createRoutingFile,
  FolderPath,
  getDefaultProjectName,
  getJsonFile,
  getProjectNames,
  readWorkspace,
  recreateTreeFolderStructure,
} from '../../utils';

export function scaffolding(options: ScaffoldOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.info(`🎉 Scaffolding Schematic Start!`);
    /**
     * TODO: Re-structure scaffolding schematic
     * */

    /**
     * New Custom structure
     * Requirements
     * 1. TODO: Supports all projects.
     * 2. TODO: Supports global configurations.
     * 3. TODO: Supports standalone components.
     * 4. TODO: Supports create components.
     * */
    const workspace = await readWorkspace(tree);
    let rules: Rule[] = [];

    if (options.kindArchitecture === 'CUSTOM') {
      context.logger.info(`You have the following projects:`);
      const projectsName: string[] = getProjectNames(workspace);
      projectsName.forEach((projectName: string) => {
        context.logger.info(`⚓ ${projectName}`);
      });
      context.logger.info(`🤓 Please check if you custom json has the right project's name`);
    }

    const patternArchitectureFile = getPatternArchitecture(tree, options);
    if (!Array.isArray(patternArchitectureFile.projects)) {
      throw new SchematicsException(`The folder options need to be an array`);
    }
    patternArchitectureFile.projects.forEach((p: Project) => {
      let projectName = '';
      if (p.name.includes('default')) {
        projectName = getDefaultProjectName(workspace);
      } else {
        projectName = p.name;
      }
      let project = workspace.projects.get(projectName)!;
      if (!project) {
        externalSchematic('@schematics/angular', 'app', p.options);
        project = workspace.projects.get(projectName)!;
      }
      const basePath = new FolderPath(project.prefix ?? '', `${project.sourceRoot}/`);

      const structures: FolderStructure[] = recreateTreeFolderStructure(p.structure, basePath);
      rules.push(
        scaffoldFoldersFactory(structures, {
          ...options,
          project: projectName,
        })
      );
    });
    return chain([
      ...rules,
      options.deleteFile ? deleteFile(options) : noop(),
      printFinalMessage(),
    ]);
  };
}

function deleteFile(options: ScaffoldOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.kindArchitecture === 'CUSTOM') {
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

function getPatternArchitecture(tree: Tree, options: ScaffoldOptions): WorkspaceStructure {
  // switch (options.custom) {
  //   case 'CFS':
  //     return CFS;
  //   case 'ATOMIC-DESIGN':
  //     return ATOMICDESIGN;
  //   case 'CUSTOM':
  //     //TODO: invoke and test the sub-schema here
  //     if (!options.customFilePath) {
  //       throw new SchematicsException(`You need to specify the url of the custom file structure`);
  //     }
  //     return getJsonFile<FolderStructure[]>(tree, options.customFilePath);
  // }
  return getJsonFile<WorkspaceStructure>(tree, options.customFilePath);
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