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
export function readJSON(): Rule {
  // { customFilePath }: { customFilePath: string }
  return async (tree: Tree, _context: SchematicContext) => {
    const calls: Rule[] = [];
    const workspace = await readWorkspace(tree);
    const { $schema, settings, projects, ...schematics } = getJsonFile<WorkspaceStructure>(
      tree,
      './project-structure.json'
    );
    const projectKeys = Object.keys(projects);

    calls.push(...executeGlobalSchematics(_context, schematics, settings ?? {}));

    projectKeys.forEach((projectName) => {
      _context.logger.log('info', `ProjectName: ${JSON.stringify(projectName)}`);
      let project = getProject(workspace, projectName);
      const path = project?.root;
      const { type, settings: projectSettings, ...structures } = projects[projectName];
      Object.entries(structures)
        .map<Structure>((structure) => ({ [structure[0]]: structure[1] } as Structure))
        .forEach((structure: Structure) => {
          _context.logger.log('info', `Folder structure: ${JSON.stringify(structure)}`);
          calls.push(
            ...readStructure(
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

// function buildJSON(): Rule {
//   return (_tree: Tree, _context: SchematicContext) => {};
//   // for each project, prepare all the stuff.
// }
//
function readStructure(
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
  _context.logger.log('info', `Path: ${JSON.stringify(path)}`);
  const { type, ...content } = structure;

  // const schematics = Object.keys(content).filter(
  //   (key) => (content[key] as FolderStructure | SchematicStructure).type === 'Schematic'
  // );
  //
  // schematics.forEach((schematicName) => {
  //   const globalSettings = findSettingsByAlias(
  //     _context,
  //     schematicName,
  //     parentsSettings.globalSettings
  //   );
  //
  //   const projectSettings = findSettingsByAlias(
  //     _context,
  //     schematicName,
  //     parentsSettings.projectSettings
  //   );
  //
  //   const { type, ...schematicSettings } = content[schematicName] as SchematicStructure;
  //
  //   const [collectionName, schematic] = schematicName.split(':', 2);
  //
  //   calls.push(
  //     ...executeExternalSchematics(
  //       { globalSettings, projectSettings },
  //       {
  //         collection:
  //           collectionName && schematic
  //             ? collectionName
  //             : globalSettings?.collection ?? projectSettings?.collection,
  //         schematicName:
  //           schematic ??
  //           globalSettings?.schematicName ??
  //           projectSettings?.schematicName ??
  //           schematicName,
  //         settings: schematicSettings,
  //       },
  //       path,
  //       _context
  //     )
  //   );
  // });

  const folderNames = Object.entries(content)
    .filter((item) => (item[1] as FolderStructure | SchematicStructure).type === 'Folder')
    .map((folder) => folder[0]);

  _context.logger.log('info', `FolderNames: ${JSON.stringify(folderNames)}`);

  folderNames.forEach((folderName) => {
    calls.push(
      ...readStructure(
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

//TODO: try to test what happen when the alias are in many places.
function findSettingsByAlias(
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
  const collections = Object.entries(settings).reverse();
  let schematicSetting: Partial<ISchematicSettings> = {};

  collections.forEach(([collection, schematicObject]) => {
    const schematics = Object.entries(schematicObject);
    schematics.forEach(([schematicName, settings]) => {
      const { alias: schematicAlias, ...schematicSettings } = settings;
      if (
        Object.keys(schematicSetting).length === 0 &&
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

  return schematicSetting as ISchematicSettings;
}

function executeGlobalSchematics(
  _context: SchematicContext,
  schematics: { [key: string]: { [prop: string]: any } },
  globalSettings?: { [key: string]: { [prop: string]: any } }
): Rule[] {
  const calls: Rule[] = [];
  Object.entries(schematics).forEach(([schematicName, content]) => {
    const globalSetting = findSettingsByAlias(_context, schematicName, globalSettings);
    const { instances, settings } = content;
    _context.logger.log('info', JSON.stringify(content));
    //what happen if it doesn't find.
    const [collectionName, schematic] = schematicName.split(':', 2);
    calls.push(
      ...executeExternalSchematics(
        { globalSettings: globalSetting },
        {
          collection: collectionName && schematic ? collectionName : globalSetting?.collection,
          schematicName: schematic ?? globalSetting?.schematicName ?? schematicName,
          instances,
          settings: settings,
        },
        '/',
        _context
      )
    );
  });
  return calls;
}

function executeExternalSchematics(
  //These settings are filtered by the schematic and collection needed.
  parentsSettings: IParentSettings,
  schematic: ISchematic,
  path: string,
  _context: SchematicContext
): Rule[] {
  const calls: Rule[] = [];
  // const {collection:}
  const settings = {
    ...schematic.settings,
    ...(parentsSettings.projectSettings?.settings ?? {}),
    ...(parentsSettings.globalSettings?.settings ?? {}),
  };

  _context.logger.log(
    'info',
    JSON.stringify({
      schematicName: schematic.schematicName,
      collection: schematic.collection,
      options: {
        path,
        ...settings,
      },
    })
  );

  if (!schematic.instances) {
    _context.logger.log('info', 'without instances');
    _context.logger.log(
      'info',
      // If schematic.collection doesn't exit, check the other settings but if they don't have it show an error.
      JSON.stringify({
        collection: schematic.collection,
        schematicName: schematic.schematicName,
        path,
        ...settings,
      })
    );
    if (!schematic.collection) {
      throw new SchematicsException(`You need to define a collection`);
    }
    if (!schematic.schematicName) {
      throw new SchematicsException(`You need to define a schematic name`);
    }
    calls.push(
      externalSchematic(schematic.collection, schematic.schematicName, {
        path,
        ...settings,
      })
    );
  } else {
    const instances = Object.entries(schematic.instances);
    _context.logger.log('info', 'with instances');

    // _context.logger.log(
    //   'info',
    //   // If schematic.collection doesn't exit, check the other settings but if they don't have it show an error.
    //   JSON.stringify({
    //     collection: schematic.collection,
    //     schematicName: schematic.schematicName,
    //     path,
    //     ...settings,
    //   })
    // );

    instances.forEach((instance) => {
      const [name, instanceSettings] = instance;
      const schematicSettings = {
        ...settings,
        ...instanceSettings,
      };
      _context.logger.log(
        'info',
        JSON.stringify({
          schematicName: schematic.schematicName,
          collection: schematic.collection,
          options: {
            name,
            path,
            ...schematicSettings,
          },
        })
      );
      if (!schematic.collection) {
        throw new SchematicsException(`You need to define a collection`);
      }

      if (!schematic.schematicName) {
        throw new SchematicsException(`You need to define a schematic name`);
      }

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
