import {
  apply,
  chain,
  filter,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  strings,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { LintersOptions } from './linters.interface';
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
} from '../../utils/dependecies';

export default function (options: LintersOptions): Rule {
  return (tree: Tree) => {
    if (!tree.exists(`.prettierrc.template`)) {
      const sourceTemplate = url('./files');
      const sourceParametrizeTemplate = apply(sourceTemplate, [
        filter(
          (pathModule) =>
            pathModule.endsWith('/.prettierrc.template') ||
            pathModule.endsWith('/.prettierignore.template') ||
            pathModule.endsWith('/.eslintrc.template') ||
            pathModule.endsWith('/.eslintignore.template')
        ),
        template({
          ...strings,
          ...options,
        }),
        renameTemplateFiles(),
        move('./'),
      ]);

      return chain([
        mergeWith(sourceParametrizeTemplate),
        addDependency('prettier', '^2.7.1'),
        addDependency('eslint', '^8.21.0'),
      ]);
    }
  };
}

function addDependency(name: string, version: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.log('info', `Adding ${name}`);
    const dependency: NodeDependency = {
      type: NodeDependencyType.Default,
      version: version,
      name: name,
    };
    addPackageJsonDependency(host, dependency);
    context.logger.log('info', `✅️ Added "${dependency.name}" into ${dependency.type}`);
    return host;
  };
}