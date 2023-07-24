import { FolderStructure, GlobalSettings, ScaffoldOptions } from './scaffold.interfaces';
import { noop, Rule } from '@angular-devkit/schematics';
import {
  addExportsToNearestIndex,
  addShortPath,
  createEmptyFolder,
  createIndexFile,
  createRoutingFile,
  ProjectDefinition,
} from '../../utils';

import { externalSchematic } from '@angular-devkit/schematics/src/rules/schematic';
import { deepCopy } from '@angular-devkit/core';

export type State = (
  structure: FolderStructure,
  options: ScaffoldOptions,
  project: ProjectDefinition,
  globalSettings?: GlobalSettings
) => Rule[];

export class NodeFactory {
  private states: State[];

  constructor(states: State[]) {
    this.states = states;
  }

  public execute(
    structure: FolderStructure,
    options: ScaffoldOptions,
    project: ProjectDefinition,
    globalSettings?: GlobalSettings
  ): Rule[] {
    return this.states
      .map((state: State) => state(structure, options, project, globalSettings))
      .flat();
  }
}

// export const addModuleState: State = (
//   structure: FolderStructure,
//   options: ScaffoldOptions
// ): Rule[] => [createModuleFolder(structure, options)];

export const addEmptyFolderState: State = (
  structure: FolderStructure,
  _options: ScaffoldOptions
): Rule[] => [createEmptyFolder(structure.path?.getPath() || '')];

// export const addComponentState: State = (
//   structure: FolderStructure,
//   _options: ScaffoldOptions,
//   _project: ProjectDefinition,
//   globalSettings: { [key: string]: string }
// ): Rule[] => {
//   const sourceRoot = structure.path?.sourceRoot;
//   return [
//     externalSchematic('@schematics/angular', 'component', {
//       ...structure.addComponent,
//       ...globalSettings,
//       path: `${sourceRoot?.substring(0, sourceRoot.length - 1)}`,
//       name: structure.name,
//     }),
//   ];
// };
export const addRoutingState: State = (
  structure: FolderStructure,
  options: ScaffoldOptions
): Rule[] => [createRoutingFile(structure, options)];
export const addShortPathState: State = (
  structure: FolderStructure,
  options: ScaffoldOptions
): Rule[] => {
  const calls: Rule[] = [];
  if (structure.hasShortPath) {
    const exportsPaths: string[] = [];
    if (structure.hasModule) exportsPaths.push(`./${structure.name}.module`);
    if (structure.hasRouting) exportsPaths.push(`./${structure.name}.routing`);
    calls.push(createIndexFile(options, structure.path?.getPath() || '', exportsPaths));
    calls.push(
      addShortPath({
        packageName: `@${structure.name}`,
        paths: [structure.path?.getPath() || ''],
      })
    );
  } else {
    calls.push(
      structure.hasModule ? addExportsToNearestIndex(options, structure, 'module') : noop()
    );
    calls.push(
      structure.hasRouting ? addExportsToNearestIndex(options, structure, 'routing') : noop()
    );
  }
  return calls;
};

export const addExternalSchematic: State = (
  structure: FolderStructure,
  _options: ScaffoldOptions,
  _project: ProjectDefinition,
  globalSettings: GlobalSettings
): Rule[] => {
  const calls: Rule[] = [];
  const externalSchematics = Object.entries(filterNotSchematic(structure));

  externalSchematics.forEach((schematic) => {
    const key = schematic[0];
    const value = schematic[1];
    const settings = deepCopy(globalSettings[key]) ?? {};
    const path = structure.path?.getPath();

    let collection = settings?.collection;
    if (settings.collection) delete settings.collection;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        collection = v.collection ?? collection ?? '@schematics/angular';
        calls.push(
          externalSchematic(collection, key, {
            ...settings,
            name: structure.name,
            path: `${path?.substring(0, path.length - 1)}`,
            ...v,
          })
        );
      });
    }

    if (typeof schematic === 'object' && schematic !== null && !Array.isArray(value)) {
      collection =
        (value as { [prop: string]: string })?.collection ?? collection ?? '@schematics/angular';

      calls.push(
        externalSchematic(collection, key, {
          ...settings,
          name: structure.name,
          path: `${path?.substring(0, path.length - 1)}`,
          ...value,
        })
      );
    }
  });

  return calls;
};

const filterNotSchematic = (
  structure: FolderStructure
): {
  [prop: string]: { [prop: string]: string } | { [prop: string]: string }[];
} => {
  let externalSchematics: {
    [prop: string]: { [prop: string]: string } | { [prop: string]: string }[];
  } = {};
  for (let key in structure) {
    // check if the property is not a built-in FolderStructure property
    if (
      ![
        'name',
        'path',
        'parent',
        'children',
        'hasModule',
        'hasShortPath',
        'hasRouting',
        'addComponent',
      ].includes(key)
    ) {
      externalSchematics[key] = structure[key] as
        | { [prop: string]: string }
        | { [prop: string]: string }[];
    }
  }
  return externalSchematics;
};

export const emptyState: State = () => [];