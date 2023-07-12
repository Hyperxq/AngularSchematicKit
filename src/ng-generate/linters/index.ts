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
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export function addLinters(options: LintersOptions): Rule {
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
        addDependency('prettier', options.prettierVersion),
        addDependency('eslint', options.eslintVersion),
        installPackageJsonDependencies(),
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

function installPackageJsonDependencies(): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    context.logger.log('info', `🔍 Installing packages...`);
    return host;
  };
}