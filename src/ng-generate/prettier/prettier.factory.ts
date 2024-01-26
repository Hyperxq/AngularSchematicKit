import {
  apply,
  applyTemplates,
  chain,
  filter,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  schematic,
  SchematicContext,
  strings,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { MESSAGES } from './prettier.messages';
import { PrettierConfig } from './prettier.interfaces';
import { execSync } from 'child_process';
import { Spinner } from '../../utils/spinner';

export function prettierFactory(options: PrettierConfig) {
  return (_tree: Tree, context: SchematicContext) => {
    const { version, gitHooks, ...prettierOptions } = options;
    console.log(MESSAGES.WELCOME);
    console.log(MESSAGES.TASK_TO_BE_DONE);

    return chain([
      addPrettierFiles(prettierOptions),
      installPrettier(version),
      gitHooks ? schematic('git-hooks', {}) : noop(),
    ]);
  };
}

function installPrettier(version?: string): Rule {
  return () => {
    const spinner = new Spinner('prettier installation');
    try {
      spinner.start('Installing prettier');
      execSync(`npm install --save-dev --save-exact prettier${version ? `@${version}` : ''}`, {
        stdio: 'pipe',
      });
      spinner.succeed('Prettier was installed successfully');
    } catch (e) {
      spinner.stop();
    }
  };
}

function addPrettierFiles(options: Omit<PrettierConfig, 'version' | 'gitHooks'>): Rule {
  const urlTemplates = ['.prettierrc.template', '.prettierignore.template'];
  const template = apply(url('./files'), [
    filter((path) => urlTemplates.some((template) => path.includes(template))),
    applyTemplates({
      ...strings,
      options,
    }),
    renameTemplateFiles(),
    move('./'),
  ]);
  return mergeWith(template, MergeStrategy.Overwrite);
}
