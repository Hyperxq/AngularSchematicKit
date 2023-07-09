import {
  chain,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { FolderStructure, ScaffoldOptions } from '../scaffold.interfaces';
import { scaffoldFoldersFactory } from '../scaffoldingFactory';
import { readWorkspace } from '@utils/workspace';
import { getDefaultProject, getJsonFile, getProject } from '@utils/file-utils';
import { FolderPath } from '@utils/interfaces/folderPath.interface';
import { recreateTreeFolderStructure } from '@utils/paths';

export function customScaffolding(options: ScaffoldOptions): Rule {
  return async (tree: Tree) => {
    const workspace = await readWorkspace(tree);
    options.project = options.project || getDefaultProject(workspace);

    const project = getProject(workspace, options.project);
    const path = new FolderPath(project.prefix ?? '', `${project.sourceRoot}/`);

    if (!options.customFilePath) {
      throw new SchematicsException(`You need to specify the url of the custom file structure`);
    }

    const structures: FolderStructure[] = recreateTreeFolderStructure(
      getJsonFile<FolderStructure[]>(tree, options.customFilePath),
      path
    );
    return chain([scaffoldFoldersFactory(structures, options), deleteFile(options)]);
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