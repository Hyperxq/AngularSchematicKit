/* eslint-disable no-console */
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
  strings,
  url,
} from '@angular-devkit/schematics';
import { MESSAGES } from './prettier.messages';
import { PrettierConfig } from './prettier.interfaces';
import { Spinner } from '../../utils/spinner';
import { addScriptToPackageJson, spawnAsync } from '../../utils';

export function prettierFactory(options: PrettierConfig) {
  return () => {
    const { version, gitHooks, defaultOptions, packageManager, ...prettierOptions } = options;
    console.log(packageManager);
    console.log(MESSAGES.WELCOME);
    console.log(MESSAGES.TASK_TO_BE_DONE);

    return chain([
      addPrettierFiles(defaultOptions ? {} : prettierOptions),
      installPrettier(version),
      gitHooks ? schematic('git-hooks', { packageManager }) : noop(),
      addScriptToPackageJson('format', 'prettier --write .'),
    ]);
  };
}

function installPrettier(version?: string, packageManager = 'npm'): Rule {
  return async () => {
    const spinner = new Spinner('prettier installation');
    const packageManagerCommands = {
      npm: 'install',
      yarn: 'add',
      pnpm: 'add',
      cnpm: 'install',
      bun: 'add',
    };
    try {
      spinner.start('Installing prettier');
      await spawnAsync(
        packageManager,
        [
          packageManagerCommands[packageManager],
          `--save-dev --save-exact prettier${version ? `@${version}` : ''}`,
        ],
        {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true,
        }
      );
      // execSync(
      //   `${packageManager} ${
      //     packageManagerCommands[packageManager]
      //   } --save-dev --save-exact prettier${version ? `@${version}` : ''}`,
      //   {
      //     stdio: 'pipe',
      //   }
      // );
      spinner.succeed('Prettier was installed successfully');
    } catch (e) {
      spinner.stop();
    }
  };
}

function addPrettierFiles(
  options: Omit<PrettierConfig, 'version' | 'gitHooks' | 'defaultOptions' | 'packageManager'>
): Rule {
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
