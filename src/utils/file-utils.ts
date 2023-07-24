import { normalize, strings } from '@angular-devkit/core';
import { capitalize } from '@angular-devkit/core/src/utils/strings';
import { WorkspaceDefinition } from '@angular-devkit/core/src/workspace';
import {
  apply,
  chain,
  filter,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicsException,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { addImportToModule, getSourceNodes, isImported } from './ast-utils';
import { applyToUpdateRecorder, InsertChange } from './change';
import { findBootstrapModulePath } from './ng-ast-utils';
import { findShortPath } from './shortPaths';
import { ProjectDefinition, readWorkspace, TargetDefinition } from './workspace';
import { FolderStructure, ScaffoldOptions } from '../ng-generate/scaffolding/scaffold.interfaces';
import { findModuleParentPath, getModuleNameFromPath, getModulePath } from './paths';

/**
 *  @param host - the Tree object of the project
 *  @param path - the url of your file
 *  @returns the file by url
 */
export function getSourceFile(host: Tree, path: string): ts.SourceFile {
  const buffer = host.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not find ${path}.`);
  }
  const content = buffer.toString();
  return ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
}

/**
 *  @param workspace
 *  @param projectName
 *  @returns the project by projectName
 */
export function getProject(workspace: WorkspaceDefinition, projectName: string): ProjectDefinition {
  const project = workspace.projects.get(projectName);
  if (!project) {
    throw new SchematicsException(`The project ${projectName} doesn't exist`);
  }
  // if (project.extensions.projectType !== 'application') {
  //   throw new SchematicsException(`It's required that the project type be a "application".`);
  // }
  return project;
}

/**
 * To get the default project when the user doesn't define the project
 *  @param workspace
 *  @returns the default project
 */
export function getDefaultProjectName(workspace: WorkspaceDefinition): string {
  const projectName = workspace.projects.keys().next().value;
  if (!projectName) {
    throw new SchematicsException(`You don't have any project in your workspace`);
  }
  return projectName;
}

/**
 *To get the project's names from the workspace.
 *  @param workspace
 *  @returns the Project's name list.
 */
export function getProjectNames(workspace: WorkspaceDefinition): string[] {
  return Array.from(workspace.projects.entries(), ([key]) => key);
}

/**
 *  @param project
 *  @returns the target definition
 */
export function getBuildTarget(project: ProjectDefinition): TargetDefinition {
  const buildTarget = project?.targets.get('build');
  if (!buildTarget) {
    throw new SchematicsException(`Project target "build" not found.`);
  }
  return buildTarget;
}

/**
 *  add an import to the imports section of a module, if you already has the import it'll be skipped.
 *  @param tree
 *  @param bootstrapModuleDestinyPath - the path of the destiny module, for example: 'src/app/app.module.ts'
 *  @param dependencyPath - the path of the import, for example: `'@angular/common/http'`
 *  @param dependencyName - the name of the import, for example: `HttpClientModule`
 *  @param addToMetadataField - when you don't want to add the import to the imports sections.
 */
export function addDependencyToModule(
  tree: Tree,
  bootstrapModuleDestinyPath: string,
  dependencyPath: string,
  dependencyName: string,
  addToMetadataField = true
): void {
  if (
    !isImported(getSourceFile(tree, bootstrapModuleDestinyPath), dependencyName, dependencyPath)
  ) {
    const changes = addImportToModule(
      getSourceFile(tree, bootstrapModuleDestinyPath),
      bootstrapModuleDestinyPath,
      dependencyName,
      dependencyPath,
      addToMetadataField
    );
    const recorder = tree.beginUpdate(bootstrapModuleDestinyPath);
    applyToUpdateRecorder(recorder, changes);
    tree.commitUpdate(recorder);
  }
}

/**
 * Create an empty and basic Module from a template
 * @param structure - the folder structure of this module
 * @param options
 */
export function createModuleFolder(structure: FolderStructure, options: ScaffoldOptions): Rule {
  return (tree: Tree) => {
    const path = makeModulePathFile(structure);
    if (!tree.exists(path)) {
      const sourceTemplate = url('./files');
      const sourceParametrizeTemplate = apply(sourceTemplate, [
        filter((pathModule) => pathModule.endsWith('/__name@dasherize__.module.ts.template')),
        template({
          ...strings,
          ...options,
          name: capitalize(structure.name),
        }),
        renameTemplateFiles(),
        move(structure.path?.sourceRoot ?? ''),
      ]);
      return chain([
        mergeWith(sourceParametrizeTemplate),
        addImportToAppModule(capitalize(`${structure.name}Module`), structure, options),
      ]);
    }
    return tree;
  };
}

/**
 * Add an basic routing file. It'll be added to the nearest module
 * @param structure
 * @param options
 */
/**
 * It creates a routing file for the folder structure
 * @param {FolderStructure} structure - FolderStructure
 * @param {ScaffoldOptions} options - FolderStructureOptions - this is the options object that
 * we pass to the schematic.
 * @returns A Rule
 */
export function createRoutingFile(structure: FolderStructure, options: ScaffoldOptions): Rule {
  return (tree: Tree) => {
    const pathFile = `${structure.path?.getPath()}${structure.name}.routing`;
    if (!tree.exists(`${pathFile}.ts`)) {
      const sourceTemplate = url('./files');
      const sourceParametrizeTemplate = apply(sourceTemplate, [
        filter((pathModule) => pathModule.endsWith('/__name@dasherize__.routing.ts.template')),
        template({
          ...strings,
          ...options,
          name: structure.name.toUpperCase(),
        }),
        renameTemplateFiles(),
        move(structure.path?.sourceRoot ?? ''),
      ]);

      const modulePathParent = findModuleParentPath(structure);

      addDependencyToModule(tree, modulePathParent ?? '', '@angular/router', 'RouterModule');
      addDependencyToModule(
        tree,
        modulePathParent || '',
        structure.hasShortPath ? structure.path?.shortPath ?? '' : `./${structure.name}.routing`,
        `${structure.name.toUpperCase()}ROUTES`,
        false
      );
      return chain([
        mergeWith(sourceParametrizeTemplate),
        addRoutingToModule(options, structure, `${structure.name.toUpperCase()}ROUTES`),
      ]);
    }
  };
}

export function addRoutingToModule(
  options: ScaffoldOptions,
  structure: FolderStructure,
  exportName: string
): Rule {
  return async (tree: Tree) => {
    const workspace = await readWorkspace(tree);
    const project = getProject(workspace, options.project ?? '');
    const clientBuildTarget = getBuildTarget(project);

    const bootstrapModulePath = getMainModulePath(
      tree,
      clientBuildTarget,
      project.sourceRoot ?? '',
      structure
    );
    const moduleFile = getSourceFile(tree, bootstrapModulePath);
    addRoutesToModule(tree, moduleFile, exportName, bootstrapModulePath);
  };
}

function addRoutesToModule(
  tree: Tree,
  file: ts.SourceFile,
  exportName: string,
  modulePath: string
) {
  const nodes = getSourceNodes(file);
  let change = '';
  let position = 0;
  const forRootNode = nodes.find((node) => node.getText().includes('RouterModule.forRoot(['));
  const importsNode = nodes.find((node) => node.getText() === 'imports');
  if (!importsNode) {
    // TODO if doesn't exist, create it
    throw new SchematicsException(`module doesn't have imports sections`);
  }
  const importsArrayNode = importsNode?.parent.getChildren()[2];
  const text = importsArrayNode?.getText();
  if (forRootNode) {
    change = `...${exportName},`;
    position =
      importsArrayNode.getStart() +
      text.indexOf('RouterModule.forRoot([') +
      'RouterModule.forRoot(['.length;
  } else {
    change = `.forRoot([...${exportName}])`;
    position = importsArrayNode.getStart() + text.indexOf('RouterModule') + 'RouterModule'.length;
  }
  if (position > 0 && change) {
    const toInsert = new InsertChange(modulePath, position ?? 0, change);
    const recorder = tree.beginUpdate(modulePath);
    applyToUpdateRecorder(recorder, [toInsert]);
    tree.commitUpdate(recorder);
  }
}

export function makeModulePath(structure: FolderStructure) {
  return normalize(`${structure.path?.getPath()}${structure.name}.module`);
}

export function makeModulePathFile(structure: FolderStructure) {
  return `${makeModulePath(structure)}.ts`;
}

export function addRelativePath(path: string) {
  return `../${removeCharacters('./', path)}`;
}

export function makeRelativePath(parentFolder: string, childFolder: string) {
  return `./${removeCharacters('./', parentFolder)}/${childFolder}`;
}

function removeCharacters(toRemove: string, string: string): string {
  return string.replace(new RegExp(toRemove), '');
}

export function addImportToAppModule(
  dependencyName: string,
  structure: FolderStructure,
  options: ScaffoldOptions
): Rule {
  return async (tree: Tree) => {
    const workspace = await readWorkspace(tree);
    const project = getProject(workspace, options.project ?? '');
    const clientBuildTarget = getBuildTarget(project);
    const bootstrapModulePath = getMainModulePath(
      tree,
      clientBuildTarget,
      project.sourceRoot ?? '',
      structure.parent
    );
    const path =
      findShortPath(structure, getModuleNameFromPath(bootstrapModulePath)) ??
      getModulePath(structure, 'relative', getModuleNameFromPath(bootstrapModulePath));
    addDependencyToModule(tree, bootstrapModulePath, path, dependencyName);
  };
}

export function getMainModulePath(
  tree: Tree,
  clientBuildTarget: TargetDefinition,
  sourceRoot: string,
  structure?: FolderStructure
): string {
  let bootstrapModulePath;
  const modulePathParent = findModuleParentPath(structure);
  if (modulePathParent) {
    bootstrapModulePath = modulePathParent;
  } else {
    const bootstrapModuleRelativePath = findBootstrapModulePath(
      tree,
      clientBuildTarget.options?.main as string
    );
    bootstrapModulePath = normalize(`/${sourceRoot}/${bootstrapModuleRelativePath}.ts`);
  }
  return bootstrapModulePath;
}

export function createEmptyFolder(path: string): Rule {
  return (tree: Tree) => {
    if (!tree.exists(`${path}/.gitkeep`)) {
      tree.create(normalize(`${path}/.gitkeep`), '');
    }
    return tree;
  };
}

export function getJsonFile<T>(tree: Tree, path: string): T {
  const buffer = tree.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not find ${path}.`);
  }
  const content = buffer.toString();
  return JSON.parse(content);
}

export async function getClientBuild(tree: Tree, projectName: string) {
    const workspace = await readWorkspace(tree);
    const project = getProject(workspace, projectName);
    return getBuildTarget(project);
}