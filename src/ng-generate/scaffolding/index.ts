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
import { ATOMIC_DESIGN } from './files/defaultScaffolders/atomic-design';
import { CFS } from './files/defaultScaffolders/core-feature-shared';

export function scaffolding(options: ScaffoldOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.info(`🎉 Scaffolding Schematic Start!`);
    const workspace = await readWorkspace(tree);
    let rules: Rule[] = [];

    //TODO: move because this happens after schematic start.
    if (options.kindArchitecture === 'CUSTOM') {
      context.logger.info(`You have the following projects:`);
      const projectsName: string[] = getProjectNames(workspace);
      projectsName.forEach((projectName: string) => {
        context.logger.info(`⚓ ${projectName}`);
      });
      context.logger.info(`🤓 Please check if you custom json has the right project's name`);
    }

    const patternArchitectureFile = getPatternArchitecture(tree, options);
    if (patternArchitectureFile.projects && !Array.isArray(patternArchitectureFile.projects)) {
      throw new SchematicsException(`Projects need to be an array`);
    }
    patternArchitectureFile.projects.forEach((p: Project) => {
      const projectName = p.name.includes('default') ? getDefaultProjectName(workspace) : p.name;
      let project = getProject(workspace, projectName);
      const basePath = new FolderPath(project?.prefix ?? '', `${project?.sourceRoot}/`);

      const structures: FolderStructure[] = recreateTreeFolderStructure(p.structure, basePath);
      rules.push(
        scaffoldFoldersFactory(project!, patternArchitectureFile.globalSettings ?? {}, structures, {
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
  switch (options.kindArchitecture) {
    case 'CFS':
      return CFS as WorkspaceStructure;
    case 'ATOMIC-DESIGN':
      return ATOMIC_DESIGN as WorkspaceStructure;
    case 'CUSTOM':
      return getJsonFile<WorkspaceStructure>(tree, options.customFilePath);
  }
}
