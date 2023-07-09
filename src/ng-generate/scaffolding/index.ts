import { chain, Rule, schematic, SchematicContext, Tree } from '@angular-devkit/schematics';
import { ATOMICDESIGN } from './files/defaultScaffolders/atomic-design';
import { CFS } from './files/defaultScaffolders/core-feature-shared';
import { FolderStructure, ScaffoldOptions } from './scaffold.interfaces';
import {
  FolderPath,
  getDefaultProject,
  getProject,
  readWorkspace,
  recreateTreeFolderStructure,
} from '../../utils';
import { scaffoldFoldersFactory } from './scaffoldingFactory';

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
    // TODO: Move this code to a function, because if you have a custom options it will be repeated
    const workspace = await readWorkspace(tree);
    options.project = options.project || getDefaultProject(workspace);

    const project = getProject(workspace, options.project);
    const path = new FolderPath(project.prefix ?? '', `${project.sourceRoot}/`);

    const structures: FolderStructure[] = recreateTreeFolderStructure(
      getPatternArchitecture(options),
      path
    );
    return chain([
      options.custom !== 'CUSTOM'
        ? scaffoldFoldersFactory(structures, options)
        : schematic('customScaffold', options),
      printFinalMessage(),
    ]);
  };
}

function printFinalMessage(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.logger.info(`🚀 the scaffolding architecture was implemented successfully`);
  };
}

function getPatternArchitecture(options: ScaffoldOptions): FolderStructure[] {
  switch (options.custom) {
    case 'CFS':
      return CFS;
    case 'ATOMIC-DESIGN':
      return ATOMICDESIGN;
    default:
      return ATOMICDESIGN;
  }
}
