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
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
} from '../../utils/dependecies';
import { JSONFile } from '../../utils/json-file';
import { GitHooksOptions } from './git-hooks.interface';

export function addGitHooks(options: GitHooksOptions): Rule {
  return (tree: Tree) => {
    if (!tree.exists(`husky/pre-push`)) {
      const sourceTemplate = url('./files/husky');
      const sourceParametrizeTemplate = apply(sourceTemplate, [
        filter(
          (pathModule) =>
            pathModule.endsWith('/pre-commit.template') || pathModule.endsWith('/pre-push.template')
        ),
        template({
          ...strings,
          ...options,
        }),
        renameTemplateFiles(),
        move('./.husky'),
      ]);

      const sourceParametrizeHuskyTemplate = apply(sourceTemplate, [
        filter(
          (pathModule) =>
            pathModule.endsWith('/.gitignore.template') || pathModule.endsWith('/husky.sh.template')
        ),
        template({
          ...strings,
          ...options,
        }),
        renameTemplateFiles(),
        move('./.husky/_'),
      ]);

      return chain([
        mergeWith(sourceParametrizeTemplate),
        mergeWith(sourceParametrizeHuskyTemplate),
        addPackageJsonScript({
          name: 'prettier:check',
          script:
            'prettier --config .prettierrc --check "src/**/**/*.ts" --ignore-path ./.prettierignore',
        }),
        addPackageJsonScript({
          name: 'lint',
          script: 'eslint . --ext .ts',
        }),
        addDependency('husky', '^8.0.1'),
        addDependency('word-wrap', '^1.2.3'),
      ]);
    }
  };
}

const PKG_JSON_PATH = './package.json';

function addPackageJsonScript(
  content: { name: string; script: string },
  pkgJsonPath = PKG_JSON_PATH
) {
  return (host: Tree) => {
    const json = new JSONFile(host, pkgJsonPath);
    const path = ['scripts', content.name];
    json.modify(path, content.script);
    return host;
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