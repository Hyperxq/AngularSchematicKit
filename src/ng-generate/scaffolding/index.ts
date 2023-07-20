import {
  chain,
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
  FolderPath,
  getDefaultProjectName,
  getJsonFile,
  getProject,
  getProjectNames,
  readWorkspace,
  recreateTreeFolderStructure,
} from '../../utils';
import { scaffoldFoldersFactory } from './scaffoldingFactory';

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
      let project = getProject(workspace, projectName);
      const basePath = new FolderPath(project.prefix ?? '', `${project.sourceRoot}/`);

      const structures: FolderStructure[] = recreateTreeFolderStructure(p.structure, basePath);
      rules.push(
        scaffoldFoldersFactory(patternArchitectureFile.globalSettings, structures, {
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