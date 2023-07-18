import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { FolderStructure, ScaffoldOptions } from '../scaffold.interfaces';
import { scaffoldFoldersFactory } from '../scaffoldingFactory';
import {
  FolderPath,
  getDefaultProjectName,
  getJsonFile,
  getProject,
  readWorkspace,
  recreateTreeFolderStructure,
} from '../../../utils';

export function customScaffolding(options: ScaffoldOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      context.logger.log('info', JSON.stringify(options));
      const workspace = await readWorkspace(tree);
      options.project = options.project || getDefaultProjectName(workspace);

      const project = getProject(workspace, options.project);
      const path = new FolderPath(project.prefix ?? '', `${project.sourceRoot}/`);

      const structures: FolderStructure[] = recreateTreeFolderStructure(
        getJsonFile<FolderStructure[]>(tree, options.customFilePath),
        path
      );

      return chain([
        scaffoldFoldersFactory(structures, options),
        options.deleteFile ? deleteFile(options) : noop(),
      ]);
    } catch (err) {
      context.logger.log('error', err);
    }
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