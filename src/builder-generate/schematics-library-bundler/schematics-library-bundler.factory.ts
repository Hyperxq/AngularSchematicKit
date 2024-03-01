import { Rule, Tree, apply, filter, renameTemplateFiles, strings, url, applyTemplates, move, mergeWith, MergeStrategy, chain, noop, SchematicContext } from '@angular-devkit/schematics';
import { NodeDependencyType, addPackageJsonDependency, addScriptToPackageJson, installDependencies, modifyPackageJson } from "../../utils";
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export function schematicsLibraryBundler({bundler}: {bundler: 'rollup' | 'ts' | 'ng-packagr'}) {
    return (tree: Tree, context: SchematicContext) => {

        //TODO: Add watch mode.
        //TODO: Add type: module to the package.json
        const bundlerFactory = {
            'rollup': implementRollup(tree),
            'ts': implementTs(tree),
            'ng-packagr': implementNgPackagr(tree)
        }

        //Add utils
        return chain([
            addUtils(tree),
            bundlerFactory[bundler] ?? noop(),
            installDependencies(context),
            overwriteCollection(),
            modifyPackageJson("schematics", "./collection.json"),
            modifyPackageJson("engines", {"node": ">= 20"}),
            addScriptToPackageJson('publish', 'npm run build && cd dist && npm publish --access=public'),
            addScriptToPackageJson('publish:verdaccio', 'npm run build && cd dist && npm publish --registry http://localhost:4873'),
            overriteTsConfig(),
            addPublicApiFile()
        ]);
    }
}

function addUtils(tree: Tree): Rule {
    // Install dependecies
    addUtilsDependencies(tree);
    // Add files
    const urlTemplates = [
        'color.ts.template', 
        'index.ts.template', 
        'logger.ts.template', 
        'spinner.ts.template', 
        'prompt.ts.template'
    ];
    const template = apply(url('./files/utils'), [
        filter((path) => urlTemplates.some((template) => path.includes(template))),
        applyTemplates({
        ...strings,
        }),
        renameTemplateFiles(),
        move('./src/utils'),
    ]);
    return mergeWith(template, MergeStrategy.Overwrite);
}

function implementRollup(tree: Tree): Rule {
    /**
     * 1. Install dependecies
     * 2. Create files
     * 3. Update package.json
     */
    addRollupDependecies(tree);

    const urlTemplates = ['rollup.config.js.template'];
    const template = apply(url('./files/rollup'), [
        filter((path) => urlTemplates.some((template) => path.includes(template))),
        applyTemplates({
        ...strings,
        }),
        renameTemplateFiles(),
        move('./'),
    ]);

    return chain([
        mergeWith(template, MergeStrategy.Overwrite),
        addScriptToPackageJson('build:watch', 'rollup -c --bundleConfigAsCjs --watch'),
        addScriptToPackageJson('build', 'rollup -c --bundleConfigAsCjs')
    ]);
}

function addPublicApiFile() {
    const urlTemplates = ['public_api.ts.template'];
    const template = apply(url('./files'), [
        filter((path) => urlTemplates.some((template) => path.includes(template))),
        applyTemplates({
        ...strings,
        }),
        renameTemplateFiles(),
        move('./src'),
    ]);

    return mergeWith(template, MergeStrategy.Overwrite);
}

function overriteTsConfig() {
    const urlTemplates = ['tsconfig.json.template'];
    const template = apply(url('./files'), [
        filter((path) => urlTemplates.some((template) => path.includes(template))),
        applyTemplates({
        ...strings,
        }),
        renameTemplateFiles(),
        move('./'),
    ]);

    return mergeWith(template, MergeStrategy.Overwrite);
}


function implementTs(tree: Tree): Rule {
    /**
     * 1. Install dependecies
     * 2. Create files
     * 3. Update package.json
     * 4. Update tsconfig.json
     */
    return () => {}
}

function implementNgPackagr(tree: Tree): Rule {
    /**
     * 1. Install dependecies
     * 2. Create files
     * 3. Update package.json
     * 4. Update tsconfig.json
     */
    return () => {}
}

function addUtilsDependencies(tree: Tree) {
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'ora', version: '5.4.1', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'inquirer', version: '8.2.6', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'node-emoji', version: '2.1.0', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'ansi-colors', version: '4.1.3', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'winston', version: '3.11.0', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'winston-console-format', version: '1.0.8', overwrite: true });
}

function addRollupDependecies(tree: Tree) {
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'glob', version: '^10.3.10', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'rollup', version: '3.29.4', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: '@rollup/plugin-commonjs', version: '^25.0.7', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: '@rollup/plugin-alias', version: '^5.1.0', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: '@rollup/plugin-typescript', version: '^11.1.5', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: '@rollup/plugin-node-resolve', version: '^15.2.3', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: '@rollup/plugin-terser', version: '^0.4.4', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'rollup-plugin-copy', version: '^3.5.0', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'rollup-plugin-cleaner', version: '^1.0.0', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'rollup-plugin-node-globals', version: '^1.4.0', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'rollup-plugin-node-builtins', version: '^2.1.2', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'rollup-plugin-peer-deps-external', version: '^2.2.4', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'rollup-plugin-dts', version: '^6.1.0', overwrite: true });
    addPackageJsonDependency(tree, { type: NodeDependencyType.Dev, name: 'rollup-plugin-typescript-paths', version: '^1.5.0', overwrite: true });
}


function overwriteCollection(): Rule {

    //TODO: move .nvmrc.template and .editorconfig.template to another function
    const urlTemplates = ["collection.json.template", ".nvmrc.template", ".editorconfig.template"];
    const template = apply(url("./files"), [
      filter((path) => urlTemplates.some((urlTemplate) => path.includes(urlTemplate))),
      applyTemplates({
        ...strings,
      }),
      renameTemplateFiles(),
      move("./src"),
    ]);
    return mergeWith(template, MergeStrategy.Overwrite);
}