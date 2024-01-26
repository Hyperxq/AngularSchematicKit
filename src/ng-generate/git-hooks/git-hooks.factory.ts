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
  strings,
  url,
} from '@angular-devkit/schematics';
import { MESSAGES } from './git-hooks.messages';
import { execSync } from 'child_process';
import { Spinner } from '../../utils/spinner';

export function gitHooksFactory() {
  return () => {
    console.log(MESSAGES.TASK_TO_BE_DONE);
    return chain([addHuskyFiles(), addLintStagedFiles(), installDevs()]);
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
  const urlTemplates = ['pre-commit.template', 'pre-push.template'];
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
