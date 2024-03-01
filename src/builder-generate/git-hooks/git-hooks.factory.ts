import {
  apply,
  applyTemplates,
  chain,
  filter,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  strings,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { MESSAGES } from './git-hooks.messages';
import { execSync } from 'child_process';
import { Spinner } from '../../utils/spinner';
import { addPackageJsonDependency, addScriptToPackageJson, installDependencies, logger, modifyPackageJson, NodeDependencyType } from 'src/utils';

export function gitHooksFactory() {
  return (tree: Tree, context: SchematicContext) => {
    logger.info(MESSAGES.TASK_TO_BE_DONE);
    addUtilsDependencies(tree);
    return chain([
      addHuskyFiles(), 
      addLintStagedFiles(), 
      addLintFiles(),
      addScriptToPackageJson('prepare', 'husky install'),
      modifyPackageJson("lint-staged", {
        "*.{ts,js,json,md}": [
          "prettier --write",
          "git add"
        ]
      }),
      modifyPackageJson("husky", {
        "hooks": {
          "pre-commit": "lint-staged"
        }
      }),
      installDevs(),
      installDependencies(context),
    ]);
  };
}

function installDevs(): Rule {
  return () => {
    const spinner = new Spinner('husky and lint-staged installation');
    try {
      spinner.start('Installing husky and lint-staged');
      execSync(`npm install --save-dev husky lint-staged`, {
        stdio: 'pipe',
      });
      spinner.succeed('Husky and Lint-staged were installed successfully');
    } catch (e) {
      spinner.stop();
    }
  };
}

function addHuskyFiles(): Rule {
  const urlTemplates = ['husky.sh.template'];
  const template = apply(url('./files/_'), [
    filter((path) => urlTemplates.some((template) => path.includes(template))),
    applyTemplates({
      ...strings,
    }),
    renameTemplateFiles(),
    move('./.git-hooks/_'),
  ]);
  return mergeWith(template, MergeStrategy.Overwrite);
}

function addLintStagedFiles(): Rule {
  const urlTemplates = [
    'pre-commit.template', 
    'pre-push.template'];
  const template = apply(url('./files'), [
    filter((path) => urlTemplates.some((template) => path.includes(template))),
    applyTemplates({
      ...strings,
    }),
    renameTemplateFiles(),
    move('./.git-hooks'),
  ]);
  return mergeWith(template, MergeStrategy.Overwrite);
}

function addLintFiles(): Rule {
  const urlTemplates = [
    '.eslintignore.template', 
    '.lintstagedrc.template', 
    '.eslintrc.json.template'];
  const template = apply(url('./files'), [
    filter((path) => urlTemplates.some((template) => path.includes(template))),
    applyTemplates({
      ...strings,
    }),
    renameTemplateFiles(),
    move('./'),
  ]);
  return mergeWith(template, MergeStrategy.Overwrite);
}


function addUtilsDependencies(tree: Tree) {
  addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'eslint', version: '8.56.0', overwrite: true });
  addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'eslint-config-prettier', version: '9.1.0', overwrite: true });
  addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'eslint-config-standard-with-typescript', version: '43.0.1', overwrite: true });
  addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'eslint-plugin-header', version: '3.1.1', overwrite: true });
  addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'eslint-plugin-import', version: '2.29.1', overwrite: true });
  addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'eslint-plugin-n', version: '16.6.2', overwrite: true });
  addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'eslint-plugin-promise', version: '6.1.1', overwrite: true });
}