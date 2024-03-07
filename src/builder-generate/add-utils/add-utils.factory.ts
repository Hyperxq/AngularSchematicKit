import {
  Rule,
  Tree,
  apply,
  filter,
  renameTemplateFiles,
  strings,
  url,
  applyTemplates,
  move,
  mergeWith,
  MergeStrategy,
  chain,
} from '@angular-devkit/schematics';
import { NodeDependencyType, addPackageJsonDependency } from '../../utils';

export function addUtilsFactory() {
  return (tree: Tree) => {
    return chain([addUtilsFiles(tree), addGeneralFiles()]);
  };
}

function addUtilsFiles(tree: Tree): Rule {
  // Install dependecies
  addUtilsDependencies(tree);
  // Add files
  const urlTemplates = [
    'color.ts.template',
    'index.ts.template',
    'logger.ts.template',
    'spinner.ts.template',
    'prompt.ts.template',
    'dependencies.ts.template',
    'eol.ts.template',
    'json-file.ts.template',
    'package-json.ts.template',
    'commands.ts.template',
  ];
  const template = apply(url('./files/utils'), [
    filter((path) => urlTemplates.some((template) => path.includes(template))),
    applyTemplates({
      ...strings,
    }),
    renameTemplateFiles(),
    move('./src/utils'),
  ]);
  return mergeWith(template, MergeStrategy.Overwrite);
}

function addUtilsDependencies(tree: Tree) {
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'ora',
    version: '5.4.1',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'inquirer',
    version: '8.2.6',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'node-emoji',
    version: '2.1.0',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'ansi-colors',
    version: '4.1.3',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'winston',
    version: '3.11.0',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'winston-console-format',
    version: '1.0.8',
    overwrite: true,
  });
}

function addGeneralFiles(): Rule {
  const urlTemplates = ['.nvmrc.template', '.editorconfig.template'];
  const template = apply(url('./files'), [
    filter((path) => urlTemplates.some((urlTemplate) => path.includes(urlTemplate))),
    applyTemplates({
      ...strings,
    }),
    renameTemplateFiles(),
    move('./'),
  ]);
  return mergeWith(template, MergeStrategy.Overwrite);
}
