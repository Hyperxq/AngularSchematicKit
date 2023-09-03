import {chain, Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {getJsonFile} from '../../utils';
import {IParentSettings, ISchematic, WorkspaceStructure} from './build.interfaces';
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
export function readJSON({ customFilePath }: { customFilePath: string }): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const calls: Rule[] = [];
    const json = getJsonFile<WorkspaceStructure>(tree, './project-structure.json');
    _context.logger.info('log', json);
    // const { globalSettings, projects, ...schematics } = getJsonFile<WorkspaceStructure>(
    //   tree,
    //   './project-structure.json' ?? customFilePath
    // );
    // _context.logger.info('log', globalSettings);
    // _context.logger.info('log', projects);
    // _context.logger.info('log', schematics);
    // calls.push(...executeGlobalSchematics(globalSettings ?? {}, schematics));
    // Object.entries(projects).forEach((project) => {});
    return chain(calls);
  };
}

// function buildJSON(): Rule {
//   return (_tree: Tree, _context: SchematicContext) => {};
//   // for each project, prepare all the stuff.
// }
//
// function readStructure(path: string, globalSettings: { [key: string]: { [prop: string]: any } }) {}

//Create projects if they don't exist
// function checkProject(): Rule {
//   return () => {};
// }

function findSettingsByAlias(
  settings: //collections
  {
    [key: string]: //schematics
    { [prop: string]: { alias: string } & { [prop: string]: any } };
  },
  alias: string
): ISchematic {
  let schematicSetting: Partial<ISchematic> = {};
  const collections = Object.entries(settings).reverse();

  collections.forEach(([collection, schematicObject]) => {
    const schematics = Object.entries(schematicObject);
    schematics.forEach(([schematicName, settings]) => {
      const { alias: schematicAlias, ...schematicSettings } = settings;
      if (schematicSettings && schematicAlias === alias && !schematicSetting) {
        schematicSetting = {
          collection,
          schematicName,
          settings: schematicSettings,
        };
      }
    });
  });

  return (schematicSetting as ISchematic) ?? {};
}

function executeGlobalSchematics(
  globalSettings: { [key: string]: { [prop: string]: any } },
  schematics: { [key: string]: { [prop: string]: any } }
): Rule[] {
  const calls: Rule[] = [];
  Object.entries(schematics).forEach(([schematicName, settings]) => {
    const schematic = findSettingsByAlias(globalSettings, schematicName);

    calls.push(
      ...executeExternalSchematics(
        { globalSettings: schematic.settings },
        {
          schematicName: schematic.schematicName,
          collection: schematic.collection,
          settings,
        },
        './'
      )
    );
  });
  return calls;
}

function executeExternalSchematics(
  //These settings are filtered by the schematic and collection needed.
  parentsSettings: IParentSettings,
  schematic: ISchematic,
  path: string
): Rule[] {
  const calls: Rule[] = [];
  const settings = {
    ...schematic.settings,
    ...parentsSettings.projectSettings,
    ...parentsSettings.globalSettings,
  };

  if (!schematic.instances) {
    calls.push(
      externalSchematic(schematic.collection, schematic.schematicName, {
        path,
        ...settings,
      })
    );
  } else {
    const instances = Object.entries(schematic.instances);
    instances.forEach((instance) => {
      const [name, instanceSettings] = instance;
      const schematicSettings = {
        ...settings,
        ...instanceSettings,
      };
      calls.push(
        externalSchematic(schematic.collection, schematic.schematicName, {
          name,
          path,
          ...schematicSettings,
        })
      );
    });
  }

  return calls;
}
