interface IWorkspaceStructure {
  globalSettings?: { [key: string]: { [prop: string]: string } };
  projects: { [key: string]: { [prop: string]: { [prop: string]: any } } };
}

export type WorkspaceStructure = IWorkspaceStructure & { [key: string]: { [prop: string]: any } };

export type ISchematicSettings = {
  schematicName?: string;
  collection?: string;
  settings: { [key: string]: { [prop: string]: any } };
};
export type ISchematic = ISchematicSettings & {
  instances?: { [key: string]: { [prop: string]: { [prop: string]: any } } };
};

export interface IParentSettings {
  globalSettings?: ISchematicSettings;
  projectSettings?: ISchematicSettings;
}

export type SchematicStructure = {
  type: 'schematic';
  instances?: { [key: string]: any };
} & { [key: string]: any };

export type Structure = {
  type: 'folder' | 'schematic';
} & (FolderStructure | SchematicStructure);

export type FolderStructure = {
  type: 'folder';
  [key: string]: FolderStructure | SchematicStructure | string;
};
