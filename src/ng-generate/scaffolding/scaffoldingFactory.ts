import { FolderStructure, ScaffoldOptions } from './scaffold.interfaces';
import { chain, Rule, SchematicsException } from '@angular-devkit/schematics';
import {
  addEmptyFolderState,
  addModuleState,
  addRoutingState,
  addShortPathState,
  NodeFactory,
  State,
} from './stateNodeMachine';

export function scaffoldFoldersFactory(
  structures: FolderStructure[],
  options: ScaffoldOptions
): Rule {
  return () => {
    return chain(structures.map((structure) => createBranch(structure, options)));
  };
}

// Rename to createBranch
function createBranch(
  structure: FolderStructure,
  options: ScaffoldOptions,
  calls: Rule[] = []
): Rule {
  if (!structure.name) {
    throw new SchematicsException(`Name is mandatory`);
  }

  calls.push(createNode(structure, options));

  if (!structure.children || structure.children.length === 0) {
    return chain(calls);
  }
  structure.children.map((structureChild) => {
    createBranch(structureChild, options, calls);
  });
  return chain(calls);
}

function createNode(structure: FolderStructure, options: ScaffoldOptions): Rule {
  let states: State[] = [];
  if (structure.hasModule) states.push(addModuleState);
  // if (structure.addComponent) states.push(addComponentState);
  if (structure.hasRouting) states.push(addRoutingState);
  states.push(addShortPathState);
  if (!structure.hasShortPath && !structure.hasRouting && !structure.hasModule)
    states.push(addEmptyFolderState);

  const factory = new NodeFactory(states);
  return chain(factory.execute(structure, options));
}



