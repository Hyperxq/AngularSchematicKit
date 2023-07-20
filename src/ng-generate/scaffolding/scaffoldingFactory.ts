import { FolderStructure, ScaffoldOptions } from './scaffold.interfaces';
import { chain, Rule, SchematicsException } from '@angular-devkit/schematics';
import {
  addComponentState,
  addEmptyFolderState,
  addModuleState,
  addRoutingState,
  addShortPathState,
  emptyState,
  NodeFactory,
  State,
} from './stateNodeMachine';

export function scaffoldFoldersFactory(
  globalSettings: { [key: string]: string },
  structures: FolderStructure[],
  options: ScaffoldOptions
): Rule {
  return () => {
    return chain(structures.map((structure) => createBranch(structure, options, globalSettings)));
  };
}

// Rename to createBranch
function createBranch(
  structure: FolderStructure,
  options: ScaffoldOptions,
  globalSettings: { [key: string]: string },
  calls: Rule[] = []
): Rule {
  if (!structure.name) {
    throw new SchematicsException(`Name is mandatory`);
  }

  calls.push(createNode(structure, options, globalSettings));

  if (!structure.children || structure.children.length === 0) {
    return chain(calls);
  }
  structure.children.map((structureChild) => {
    createBranch(structureChild, options, globalSettings, calls);
  });
  return chain(calls);
}

function createNode(
  structure: FolderStructure,
  options: ScaffoldOptions,
  globalSettings: { [key: string]: string }
): Rule {
  let states: State[] = [];
  states.push(structure.hasModule ? addModuleState : emptyState);
  states.push(structure.addComponent ? addComponentState : emptyState);
  states.push(structure.hasRouting ? addRoutingState : emptyState);
  states.push(addShortPathState);
  states.push(
    !structure.hasShortPath &&
      !structure.hasRouting &&
      !structure.hasModule &&
      !Boolean(structure.addComponent)
      ? addEmptyFolderState
      : emptyState
  );

  const factory = new NodeFactory(states);
  return chain(factory.execute(structure, options, globalSettings));
}



