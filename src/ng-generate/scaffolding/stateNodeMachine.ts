import {FolderStructure, ScaffoldOptions} from './scaffold.interfaces';
import {noop, Rule} from '@angular-devkit/schematics';
import {
  addExportToNearbyIndexFile,
  createEmptyFolder,
  createIndexFile,
  createModuleFolder,
  createRoutingFile,
} from '../../utils';

// import { externalSchematic } from '@angular-devkit/schematics/src/rules/schematic';

export type State = (structure: FolderStructure, options: ScaffoldOptions) => Rule[];

export class NodeFactory {
  private states: State[];

  constructor(states: State[]) {
    this.states = states;
  }

  public execute(structure: FolderStructure, options: ScaffoldOptions): Rule[] {
    return this.states.map((state) => state(structure, options)).flat();
  }
}

export const addModuleState: State = (structure: FolderStructure, options: ScaffoldOptions) => [
  createModuleFolder(structure, options),
];

export const addEmptyFolderState: State = (
  structure: FolderStructure,
  _options: ScaffoldOptions
) => [createEmptyFolder(structure.path?.getPath() || '')];

// export const addComponentState: State = (structure: FolderStructure, _options: ScaffoldOptions) => {
//   return [externalSchematic('@schematics/angular', 'component', structure.addComponent)];
// };
export const addRoutingState: State = (structure: FolderStructure, options: ScaffoldOptions) => [
  createRoutingFile(structure, options),
];
export const addShortPathState: State = (structure: FolderStructure, options: ScaffoldOptions) => {
  const exportsPaths: string[] = [];

  if (structure.hasShortPath) {
    if (structure.hasModule) exportsPaths.push(`./${structure.name}.module`);
    if (structure.hasRouting) exportsPaths.push(`./${structure.name}.routing`);
    return [createIndexFile(options, structure.path?.getPath() || '', exportsPaths)];
  } else {
    return [
      structure.hasModule ? addExportToNearbyIndexFile(options, structure, 'routing') : noop(),
      structure.hasShortPath ? addExportToNearbyIndexFile(options, structure, 'module') : noop(),
    ];
  }
};

