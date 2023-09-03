import {chain, Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {getJsonFile} from '../../utils';
// import {WorkspaceStructure} from './build.interfaces';
import {ISchematic, WorkspaceStructure} from './build.interfaces';

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
export function readJSON(): Rule {
  // { customFilePath }: { customFilePath: string }
  return (tree: Tree, _context: SchematicContext) => {
    const calls: Rule[] = [];
    const { $schema, settings, projects, ...schematics } = getJsonFile<WorkspaceStructure>(
      tree,
      './project-structure.json'
    );
    // _context.logger.log('info', JSON.stringify(settings));
    // _context.logger.log('info', JSON.stringify(projects));
    // _context.logger.log('info', JSON.stringify(schematics));
    calls.push(...executeGlobalSchematics(settings ?? {}, schematics, _context));
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
      if (
        Object.keys(schematicSetting).length !== 0 &&
        schematicAlias &&
        schematicAlias === alias
      ) {
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
  schematics: { [key: string]: { [prop: string]: any } },
  _context: SchematicContext
): Rule[] {
  const calls: Rule[] = [];
  Object.entries(schematics).forEach(([schematicName, _settings]) => {
    const schematic = findSettingsByAlias(globalSettings, schematicName);
    _context.logger.log('info', JSON.stringify(schematic));
    // calls.push(
    //   ...executeExternalSchematics(
    //     { globalSettings: schematic.settings },
    //     {
    //       schematicName: schematic.schematicName,
    //       collection: schematic.collection,
    //       settings,
    //     },
    //     './'
    //   )
    // );
  });
  return calls;
}

// function executeExternalSchematics(
//   //These settings are filtered by the schematic and collection needed.
//   parentsSettings: IParentSettings,
//   schematic: ISchematic,
//   path: string
// ): Rule[] {
//   const calls: Rule[] = [];
//   const settings = {
//     ...schematic.settings,
//     ...parentsSettings.projectSettings,
//     ...parentsSettings.globalSettings,
//   };
//
//   if (!schematic.instances) {
//     calls.push(
//       externalSchematic(schematic.collection, schematic.schematicName, {
//         path,
//         ...settings,
//       })
//     );
//   } else {
//     const instances = Object.entries(schematic.instances);
//     instances.forEach((instance) => {
//       const [name, instanceSettings] = instance;
//       const schematicSettings = {
//         ...settings,
//         ...instanceSettings,
//       };
//       calls.push(
//         externalSchematic(schematic.collection, schematic.schematicName, {
//           name,
//           path,
//           ...schematicSettings,
//         })
//       );
//     });
//   }
//
//   return calls;
// }
