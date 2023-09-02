interface IWorkspaceStructure {
  globalSettings?: { [key: string]: { [prop: string]: string } };
  projects: { [key: string]: { [prop: string]: any } };
}

export type WorkspaceStructure = IWorkspaceStructure & { [key: string]: { [prop: string]: any } };

export interface ISchematic {
  schematicName: string;
  collection: string;
  settings: { [key: string]: { [prop: string]: any } };
  instances?: { [key: string]: { [prop: string]: { [prop: string]: any } } };
}

export interface IParentSettings {
  globalSettings?: { [key: string]: { [prop: string]: any } };
  projectSettings?: { [key: string]: { [prop: string]: any } };
}
