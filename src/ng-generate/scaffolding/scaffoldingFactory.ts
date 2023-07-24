import { FolderStructure, GlobalSettings, ScaffoldOptions } from './scaffold.interfaces';
import { chain, Rule, SchematicsException } from '@angular-devkit/schematics';
import {
  addEmptyFolderState,
  addExternalSchematic,
  addRoutingState,
  addShortPathState,
  emptyState,
  filterNotSchematic,
  NodeFactory,
  State,
} from './stateNodeMachine';
import { ProjectDefinition } from '../../utils';

export function scaffoldFoldersFactory(
  project: ProjectDefinition,
  globalSettings: GlobalSettings,
  structures: FolderStructure[],
  options: ScaffoldOptions
): Rule {
  return () => {
    return chain(
      structures.map((structure) => createBranch(structure, options, globalSettings, project))
    );
  };
}

// Rename to createBranch
function createBranch(
  structure: FolderStructure,
  options: ScaffoldOptions,
  globalSettings: GlobalSettings,
  project: ProjectDefinition,
  calls: Rule[] = []
): Rule {
  if (!structure.name) {
    throw new SchematicsException(`Name is mandatory`);
  }

  calls.push(createNode(structure, options, globalSettings, project));

  if (!structure.children || structure.children.length === 0) {
    return chain(calls);
  }
  structure.children.map((structureChild) => {
    createBranch(structureChild, options, globalSettings, project, calls);
  });
  return chain(calls);
}

function createNode(
  structure: FolderStructure,
  options: ScaffoldOptions,
  globalSettings: GlobalSettings,
  project: ProjectDefinition
): Rule {
  let states: State[] = [];
  // states.push(structure.addComponent ? addComponentState : emptyState);
  states.push(structure.hasRouting ? addRoutingState : emptyState);
  states.push(addShortPathState);
  states.push(addExternalSchematic);
  states.push(
    !structure.hasShortPath &&
      !structure.hasRouting &&
      Object.keys(filterNotSchematic(structure)).length < 1
      ? addEmptyFolderState
      : emptyState
  );

  const factory = new NodeFactory(states);
  return chain(factory.execute(structure, options, project, globalSettings));
}



