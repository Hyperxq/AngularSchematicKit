import {chain, Rule, SchematicContext, SchematicsException, Tree,} from '@angular-devkit/schematics';
import {getJsonFile, getProject, readWorkspace} from '../../utils';
// import {WorkspaceStructure} from './build.interfaces';
import {
  FolderStructure,
  IParentSettings,
  ISchematic,
  ISchematicSettings,
  SchematicStructure,
  Structure,
  WorkspaceStructure,
} from './build.interfaces';
import {externalSchematic} from '@angular-devkit/schematics/src/rules/schematic';

/*
 * Steps
 * * Create projects if they don't exist || this last thing to do.
 * * Extract global settings, projects, schematics.
 * * Iterate over all projects.
 * * Extract project settings if it exists.
 * * Recursively, go through all the project's structure.
 * * When detect schematic, check it and process.
 * * Extract schematic's settings if it exists.
 * * Check if exist the property instances.
 * * Execute schematic/schematics.
 * */
//executeWorkspaceSchematics
//getSchematicSettingsByAlias
//processStructure
//executeGlobalSchematicRules

export function executeWorkspaceSchematics(): Rule {
  // { customFilePath }: { customFilePath: string }
  return async (tree: Tree, _context: SchematicContext) => {
    const calls: Rule[] = [];
    const workspace = await readWorkspace(tree);
    const { $schema, settings, projects, ...schematics } = getJsonFile<WorkspaceStructure>(
      tree,
      './project-structure.json'
    );
    const projectKeys = Object.keys(projects);

    calls.push(...executeGlobalSchematicRules(_context, schematics, settings ?? {}));

    projectKeys.forEach((projectName) => {
      let project = getProject(workspace, projectName);
      const path = project?.root;
      const { type, settings: projectSettings, ...structures } = projects[projectName];
      Object.entries(structures)
        .map<Structure>((structure) => ({ [structure[0]]: structure[1] } as Structure))
        .forEach((structure: Structure) => {
          _context.logger.log('info', `Folder structure: ${JSON.stringify(structure)}`);
          calls.push(
            ...processStructure(
              path ?? '',
              {
                globalSettings: settings ?? {},
                projectSettings: projectSettings ?? {},
              },
              structure,
              [],
              _context
            )
          );
        });
      // Path, projectSettings, structure
    });
    return chain(calls);
  };
}

//TODO: try to test what happen when the alias are in many places.
/**
 * Retrieves the last occurrence of schematic settings based on the provided alias.
 *
 * @param _context - The schematic context.
 * @param alias - The alias to search for.
 * @param settings - The collections of schematics settings.
 * @returns The schematic settings if found, otherwise undefined.
 */
function getSchematicSettingsByAlias(
  _context: SchematicContext,
  alias: string,
  settings?: //collections
  {
    //schematics
    [key: string]: { [prop: string]: { alias: string } & { [prop: string]: any } };
  }
): ISchematicSettings | undefined {
  if (!settings) return undefined;
  //TODO: refactor this.
  let schematicSetting: ISchematicSettings;

  for (const [collection, schematicObject] of Object.entries(settings).reverse()) {
    for (const [schematicName, schematicDetails] of Object.entries(schematicObject).reverse()) {
      const { alias: schematicAlias, ...schematicSettings } = schematicDetails;
      if (schematicAlias === alias) {
        schematicSetting = {
          collection,
          schematicName,
          settings: schematicSettings,
        };
        return schematicSetting as ISchematicSettings;
      }
    }
  }

  return undefined;
}

function processStructure(
  path: string,
  parentsSettings: {
    globalSettings?: {
      [key: string]: { [prop: string]: { alias: string } & { [prop: string]: any } };
    };
    projectSettings?: {
      [key: string]: { [prop: string]: { alias: string } & { [prop: string]: any } };
    };
  },
  structure: Structure,
  calls: Rule[] = [],
  _context: SchematicContext
) {
  const { type, ...content } = structure;

  const schematics = Object.keys(content).filter(
    (key) => (content[key] as FolderStructure | SchematicStructure).type === 'schematic'
  );

  schematics.forEach((schematicName) => {
    const globalSettings = getSchematicSettingsByAlias(
      _context,
      schematicName,
      parentsSettings.globalSettings
    );

    const projectSettings = getSchematicSettingsByAlias(
      _context,
      schematicName,
      parentsSettings.projectSettings
    );

    const { instances, settings } = content[schematicName] as SchematicStructure;

    const [collectionName, schematic] = schematicName.split(':', 2);
    calls.push(
      ...executeExternalSchematicRules(
        { globalSettings, projectSettings },
        {
          collection:
            collectionName && schematic
              ? collectionName
              : globalSettings?.collection ?? projectSettings?.collection,
          schematicName:
            schematic ??
            globalSettings?.schematicName ??
            projectSettings?.schematicName ??
            schematicName,
          instances,
          settings: settings,
        },
        path,
        _context
      )
    );
  });

  const folderNames = Object.keys(content).filter(
    (folderName) => (content[folderName] as FolderStructure | SchematicStructure).type === 'folder'
  );

  folderNames.forEach((folderName) => {
    calls.push(
      ...processStructure(
        `${path}/${folderName}`,
        parentsSettings,
        content[folderName] as Structure,
        calls,
        _context
      )
    );
  });

  return calls;
}

//Create projects if they don't exist
// function checkProject(): Rule {
//   return () => {};
// }

function executeGlobalSchematicRules(
  _context: SchematicContext,
  schematics: { [key: string]: { [prop: string]: any } },
  globalSettings?: { [key: string]: { [prop: string]: any } }
): Rule[] {
  const calls: Rule[] = [];
  for (const [schematicName, content] of Object.entries(schematics)) {
    const globalSetting = getSchematicSettingsByAlias(_context, schematicName, globalSettings);
    const { instances, settings } = content;
    const [collectionName, schematic] = schematicName.split(':', 2);

    let finalCollectionName = collectionName ?? globalSetting?.collection;
    let finalSchematicName = schematic ?? globalSetting?.schematicName;

    if (!finalSchematicName) {
      throw new Error(
        `Invalid schematic configuration: Unable to determine collection or schematic name for "${schematicName}". Please ensure you are using a valid alias or following the [collection]:[schematic] naming convention.`
      );
    }

    _context.logger.log('info', finalCollectionName);
    _context.logger.log('info', finalSchematicName);
    calls.push(
      ...executeExternalSchematicRules(
        { globalSettings: globalSetting },
        {
          collection: finalCollectionName,
          schematicName: finalSchematicName,
          instances,
          settings,
        },
        '/',
        _context
      )
    );
  }
  return calls;
}

//TODO: Implements a robust error handling.
/**
 * Executes external schematic rules based on the provided settings and schematic details.
 *
 * @param parentsSettings - The parent settings filtered by the schematic and collection needed.
 * @param schematic - The schematic details.
 * @param path - The path where the schematic should be executed.
 * @param _context - The schematic context.
 * @returns An array of rules to be executed.
 */
function executeExternalSchematicRules(
  //These settings are filtered by the schematic and collection needed.
  parentsSettings: IParentSettings,
  schematic: ISchematic,
  path: string,
  _context: SchematicContext
): Rule[] {
  const calls: Rule[] = [];

  // Merge settings from various sources
  const settings = {
    ...schematic.settings,
    ...(parentsSettings.projectSettings?.settings ?? {}),
    ...(parentsSettings.globalSettings?.settings ?? {}),
  };

  // Validate schematic details
  if (!schematic.collection) {
    throw new SchematicsException('Collection is not defined in the schematic.');
  }
  if (!schematic.schematicName) {
    throw new SchematicsException('Schematic name is not defined in the schematic.');
  }

  if (!schematic.instances) {
    calls.push(createExternalSchematicCall(schematic, path, settings));
  } else {
    for (const [name, instanceSettings] of Object.entries(schematic.instances)) {
      calls.push(
        createExternalSchematicCall(schematic, path, { ...settings, ...instanceSettings }, name)
      );
    }
  }

  return calls;
}

/**
 * Creates an external schematic call with the provided settings and options.
 *
 * @param schematic - The schematic details.
 * @param path - The path where the schematic should be executed.
 * @param settings - The merged settings.
 * @param name - The name of the instance (optional).
 * @returns A rule representing the external schematic call.
 */
function createExternalSchematicCall(
  schematic: ISchematic,
  path: string,
  settings: { [key: string]: any },
  name?: string
): Rule {
  return externalSchematic(schematic.collection!, schematic.schematicName!, {
    path,
    ...settings,
    ...(name ? { name } : {}),
  });
}
