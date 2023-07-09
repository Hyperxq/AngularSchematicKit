import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { FolderStructure, ScaffoldOptions } from '../scaffold.interfaces';
import { scaffoldFoldersFactory } from '../scaffoldingFactory';
import {
  FolderPath,
  getDefaultProject,
  getJsonFile,
  getProject,
  readWorkspace,
  recreateTreeFolderStructure,
} from '../../../utils';

export function customScaffolding(options: ScaffoldOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.log('info', JSON.stringify(options));
    const workspace = await readWorkspace(tree);
    options.project = options.project || getDefaultProject(workspace);

    const project = getProject(workspace, options.project);
    const path = new FolderPath(project.prefix ?? '', `${project.sourceRoot}/`);

    context.logger.log(
      'info',
      JSON.stringify(getJsonFile<FolderStructure[]>(tree, options.customFilePath))
    );

    const structures: FolderStructure[] = recreateTreeFolderStructure(
      getJsonFile<FolderStructure[]>(tree, options.customFilePath),
      path
    );

    return chain([
      scaffoldFoldersFactory(structures, options),
      options.deleteFile ? deleteFile(options) : noop(),
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