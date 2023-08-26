import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getProjectsIterator, readWorkspace } from '../../utils';

export function scanProject(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const json: any = {
      $schema: './node_modules/@test/schematics/lib/schematics/docs/schema.json',
      settings: getSettings(),
      projects: {},
    };

    const projects = Object.entries(await getProjectsPaths(tree, context));

    projects.forEach(([key, path]) => {
      const root = tree.getDir(path);
      const allDirectories = getDirectoriesRecursively(root);
      json.projects[key] = generateNestedStructureFromDirectories(allDirectories);
    });

    const jsonContent = JSON.stringify(json, null, 2);
    if (tree.exists('./project-structure.json')) {
      tree.overwrite('./project-structure.json', jsonContent);
    } else {
      tree.create('./project-structure.json', jsonContent);
    }
    return () => tree;
  };
}

async function getProjectsPaths(tree: Tree, context: SchematicContext) {
  const workspace = await readWorkspace(tree);
  const projects = getProjectsIterator(workspace);
  const paths: { [key: string]: string } = {};
  for (const [string, projectDefinition] of projects) {
    context.logger.log('info', `Project name: ${string}`);
    context.logger.log('info', `Path: ${projectDefinition.root}`);
    paths[string] = projectDefinition.root;
  }
  return paths;
}

function getSettings(): { [key: string]: {} } {
  return {
    '@schematics/angular': {
      component: {
        alias: 'components',
        standalone: true,
        skipTests: true,
        prefix: 'app',
      },
      service: {
        alias: 'services',
      },
      module: {
        alias: 'modules',
      },
      directive: {
        alias: 'directives',
      },
      pipe: {
        alias: 'pipes',
      },
      class: {
        alias: 'classes',
      },
    },
  };
}

function getDirectoriesRecursively(
  dir: DirEntry,
  ignore: string[] = [
    '.idea',
    'node_modules',
    '.angular',
    'dist',
    '.git',
    '.vscode',
    'docs',
    'projects',
  ]
): string[] {
  let directories: string[] = [];

  for (const subDir of dir.subdirs) {
    if (ignore.includes(subDir)) {
      continue;
    }
    const path = dir.path + '/' + subDir;
    directories.push(path.replace('//', '/'));
    const childDir = dir.dir(subDir);
    directories = directories.concat(getDirectoriesRecursively(childDir, ignore));
  }

  return directories;
}

function generateNestedStructureFromDirectories(directories: string[]): { [key: string]: {} } {
  const structure: { [key: string]: {} } = {};

  directories.forEach((directory) => {
    const ignore = [
      '.idea',
      'node_modules',
      '.angular',
      'dist',
      '.git',
      '.vscode',
      'docs',
      'projects',
    ];
    const segments = directory.split('/').filter((segment) => segment); // filter out empty segments
    let currentLevel = structure;

    segments
      .filter((s) => ignore.some((i) => i === s))
      .forEach((segment) => {
        if (!currentLevel[segment]) {
          currentLevel[segment] = {
            type: 'folder',
          };
        }
        currentLevel = currentLevel[segment];
      });
  });

  return structure;
}
