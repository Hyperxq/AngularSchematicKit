import { normalize, strings } from '@angular-devkit/core';
import {
  apply,
  filter,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { getSourceNodes } from './ast-utils';
import { applyToUpdateRecorder, InsertChange } from './change';
import { getBuildTarget, getMainModulePath, getProject, getSourceFile } from './file-utils';
import { JSONFile } from './json-file';
import { getModuleNameFromPath } from './paths';
import { readWorkspace } from './workspace';
import { FolderStructure, ScaffoldOptions } from '../ng-generate/scaffolding/scaffold.interfaces';

export function createIndexFile(
  options: ScaffoldOptions,
  path: string,
  exportPaths: string[]
): Rule {
  return (tree: Tree) => {
    if (!tree.exists(`${path}index.ts`)) {
      const sourceTemplate = url('./files');
      const sourceParametrizeTemplate = apply(sourceTemplate, [
        filter((pathModule) => pathModule.endsWith('/index.ts.template')),
        template({
          ...strings,
          ...options,
          name: './',
          exportPaths: exportPaths,
        }),
        renameTemplateFiles(),
        move(normalize(path)),
      ]);

      return mergeWith(sourceParametrizeTemplate);
    }
  };
}

export function addExportToIndexFile(filePath: string, exportPath: string): Rule {
  return (tree: Tree) => {
    const file = getSourceFile(tree, filePath);
    const nodes = getSourceNodes(file);
    const change = `export * from '${exportPath}';\n`;
    if (
      nodes.find(
        (node) =>
          node.getText() === change || node.getText().includes(change.slice(0, change.length - 3))
      )
    ) {
      return tree;
    }
    let position = 0;
    if (nodes.length > 0) {
      position = nodes
        .map((node) => node.getEnd())
        .reduce((biggest, current) => (Math.max(biggest, current) === biggest ? biggest : current));
    }

    const toInsert = new InsertChange(filePath, position, change);
    const recorder = tree.beginUpdate(filePath);
    applyToUpdateRecorder(recorder, [toInsert]);
    tree.commitUpdate(recorder);
  };
}

export function addShortPath(shortPath: { packageName: string; paths: string[] }): Rule {
  return (host: Tree) => {
    if (!host.exists('tsconfig.json')) {
      return host;
    }
    shortPath.paths = shortPath.paths.map((path) => normalizeShortPath(path));
    const file = new JSONFile(host, 'tsconfig.json');
    const jsonPath = ['compilerOptions', 'paths', shortPath.packageName.toLowerCase()];
    const value: string[] | undefined = file.get(jsonPath) as string[];
    // TODO: check if that case is right
    let pathsFiltered: string[] = [];
    if (value) {
      pathsFiltered = shortPath.paths?.filter((item) => !value.some((path) => path === item));
    }

    file.modify(jsonPath, Array.isArray(value) ? [...value, ...pathsFiltered] : shortPath.paths);
  };
}

function normalizeShortPath(string: string) {
  return string.slice(string.length - 1, string.length) === '/'
    ? string.slice(0, string.length - 1)
    : string;
}

export function findStructureWithShortPath(
  structure: FolderStructure,
  moduleNameToAdd: string
): FolderStructure | undefined {
  if (structure.hasShortPath) {
    if (moduleNameToAdd !== structure.name) {
      return structure;
    } else {
      return undefined;
    }
  }
  if (!structure.parent) {
    return undefined;
  }
  return findStructureWithShortPath(structure.parent, moduleNameToAdd);
}

export function findShortPath(
  structure: FolderStructure,
  moduleNameToAdd: string
): string | undefined {
  return findStructureWithShortPath(structure, moduleNameToAdd)?.path?.shortPath;
}

//TODO: Allow export many paths
export function addExportsToNearestIndex(
  options: ScaffoldOptions,
  structure: FolderStructure,
  type: string
) {
  return async (tree: Tree) => {
    const workspace = await readWorkspace(tree);
    const project = getProject(workspace, options.project || '');
    const clientBuildTarget = getBuildTarget(project!);
    const bootstrapModulePath = getMainModulePath(
      tree,
      clientBuildTarget,
      project?.sourceRoot || '',
      structure.parent
    );
    const foundStructure = findStructureWithShortPath(
      structure,
      getModuleNameFromPath(bootstrapModulePath)
    );
    if (foundStructure !== undefined) {
      const exportPath = makeExportPath(structure, type, foundStructure?.name);
      return addExportToIndexFile(`${foundStructure.path?.getPath()}index.ts`, exportPath);
    }
  };
}

export function makeExportPath(
  structure: FolderStructure,
  type: string,
  folderName: string
): string {
  return `${structure.path?.getRelativePath(folderName)}${structure.name}.${type}`;
}
