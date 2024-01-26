"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientBuild = exports.getJsonFile = exports.createEmptyFolder = exports.getMainModulePath = exports.makeModulePath = exports.addRoutingToModule = exports.createRoutingFile = exports.addDependencyToModule = exports.getBuildTarget = exports.getProjectsIterator = exports.getProjectNames = exports.getDefaultProjectName = exports.getProject = exports.getSourceFile = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ts = tslib_1.__importStar(require("typescript"));
const ast_utils_1 = require("./ast-utils");
const change_1 = require("./change");
const ng_ast_utils_1 = require("./ng-ast-utils");
const workspace_1 = require("./workspace");
const paths_1 = require("./paths");
function getSourceFile(host, path) {
    const buffer = host.read(path);
    if (!buffer) {
        throw new schematics_1.SchematicsException(`Could not find ${path}.`);
    }
    const content = buffer.toString();
    return ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
}
exports.getSourceFile = getSourceFile;
function getProject(workspace, projectName) {
    return workspace.projects.get(projectName);
}
exports.getProject = getProject;
function getDefaultProjectName(workspace) {
    const projectName = workspace.projects.keys().next().value;
    if (!projectName) {
        throw new schematics_1.SchematicsException(`You don't have any project in your workspace`);
    }
    return projectName;
}
exports.getDefaultProjectName = getDefaultProjectName;
function getProjectNames(workspace) {
    return Array.from(workspace.projects.entries(), ([key]) => key);
}
exports.getProjectNames = getProjectNames;
function getProjectsIterator(workspace) {
    return workspace.projects.entries();
}
exports.getProjectsIterator = getProjectsIterator;
function getBuildTarget(project) {
    const buildTarget = project?.targets.get('build');
    if (!buildTarget) {
        throw new schematics_1.SchematicsException(`Project target "build" not found.`);
    }
    return buildTarget;
}
exports.getBuildTarget = getBuildTarget;
function addDependencyToModule(tree, bootstrapModuleDestinyPath, dependencyPath, dependencyName, addToMetadataField = true) {
    if (!(0, ast_utils_1.isImported)(getSourceFile(tree, bootstrapModuleDestinyPath), dependencyName, dependencyPath)) {
        const changes = (0, ast_utils_1.addImportToModule)(getSourceFile(tree, bootstrapModuleDestinyPath), bootstrapModuleDestinyPath, dependencyName, dependencyPath, addToMetadataField);
        const recorder = tree.beginUpdate(bootstrapModuleDestinyPath);
        (0, change_1.applyToUpdateRecorder)(recorder, changes);
        tree.commitUpdate(recorder);
    }
}
exports.addDependencyToModule = addDependencyToModule;
function createRoutingFile(structure, options) {
    return (tree) => {
        const pathFile = `${structure.path?.getPath()}${structure.name}.routing`;
        if (!tree.exists(`${pathFile}.ts`)) {
            const sourceTemplate = (0, schematics_1.url)('./files');
            const sourceParametrizeTemplate = (0, schematics_1.apply)(sourceTemplate, [
                (0, schematics_1.filter)((pathModule) => pathModule.endsWith('/__name@dasherize__.routing.ts.template')),
                (0, schematics_1.template)({
                    ...core_1.strings,
                    ...options,
                    name: structure.name.toUpperCase(),
                }),
                (0, schematics_1.renameTemplateFiles)(),
                (0, schematics_1.move)(structure.path?.sourceRoot ?? ''),
            ]);
            const modulePathParent = (0, paths_1.findModuleParentPath)(structure);
            addDependencyToModule(tree, modulePathParent ?? '', '@angular/router', 'RouterModule');
            addDependencyToModule(tree, modulePathParent || '', structure.hasShortPath ? structure.path?.shortPath ?? '' : `./${structure.name}.routing`, `${structure.name.toUpperCase()}ROUTES`, false);
            return (0, schematics_1.chain)([
                (0, schematics_1.mergeWith)(sourceParametrizeTemplate),
                addRoutingToModule(options, structure, `${structure.name.toUpperCase()}ROUTES`),
            ]);
        }
    };
}
exports.createRoutingFile = createRoutingFile;
function addRoutingToModule(options, structure, exportName) {
    return async (tree) => {
        const workspace = await (0, workspace_1.readWorkspace)(tree);
        const project = getProject(workspace, options.project ?? '');
        const clientBuildTarget = getBuildTarget(project);
        const bootstrapModulePath = getMainModulePath(tree, clientBuildTarget, project?.sourceRoot ?? '', structure);
        const moduleFile = getSourceFile(tree, bootstrapModulePath);
        addRoutesToModule(tree, moduleFile, exportName, bootstrapModulePath);
    };
}
exports.addRoutingToModule = addRoutingToModule;
function addRoutesToModule(tree, file, exportName, modulePath) {
    const nodes = (0, ast_utils_1.getSourceNodes)(file);
    let change = '';
    let position = 0;
    const forRootNode = nodes.find((node) => node.getText().includes('RouterModule.forRoot(['));
    const importsNode = nodes.find((node) => node.getText() === 'imports');
    if (!importsNode) {
        throw new schematics_1.SchematicsException(`module doesn't have imports sections`);
    }
    const importsArrayNode = importsNode?.parent.getChildren()[2];
    const text = importsArrayNode?.getText();
    if (forRootNode) {
        change = `...${exportName},`;
        position =
            importsArrayNode.getStart() +
                text.indexOf('RouterModule.forRoot([') +
                'RouterModule.forRoot(['.length;
    }
    else {
        change = `.forRoot([...${exportName}])`;
        position = importsArrayNode.getStart() + text.indexOf('RouterModule') + 'RouterModule'.length;
    }
    if (position > 0 && change) {
        const toInsert = new change_1.InsertChange(modulePath, position ?? 0, change);
        const recorder = tree.beginUpdate(modulePath);
        (0, change_1.applyToUpdateRecorder)(recorder, [toInsert]);
        tree.commitUpdate(recorder);
    }
}
function makeModulePath(structure) {
    return (0, core_1.normalize)(`${structure.path?.getPath()}${structure.name}.module`);
}
exports.makeModulePath = makeModulePath;
function getMainModulePath(tree, clientBuildTarget, sourceRoot, structure) {
    let bootstrapModulePath;
    const modulePathParent = (0, paths_1.findModuleParentPath)(structure);
    if (modulePathParent) {
        bootstrapModulePath = modulePathParent;
    }
    else {
        const bootstrapModuleRelativePath = (0, ng_ast_utils_1.findBootstrapModulePath)(tree, clientBuildTarget.options?.main);
        bootstrapModulePath = (0, core_1.normalize)(`/${sourceRoot}/${bootstrapModuleRelativePath}.ts`);
    }
    return bootstrapModulePath;
}
exports.getMainModulePath = getMainModulePath;
function createEmptyFolder(path) {
    return (tree) => {
        if (!tree.exists(`${path}/.gitkeep`)) {
            tree.create((0, core_1.normalize)(`${path}/.gitkeep`), '');
        }
        return tree;
    };
}
exports.createEmptyFolder = createEmptyFolder;
function getJsonFile(tree, path) {
    const buffer = tree.read(path);
    if (!buffer) {
        throw new schematics_1.SchematicsException(`Could not find ${path}.`);
    }
    const content = buffer.toString();
    return JSON.parse(content);
}
exports.getJsonFile = getJsonFile;
async function getClientBuild(tree, projectName) {
    const workspace = await (0, workspace_1.readWorkspace)(tree);
    const project = getProject(workspace, projectName);
    return getBuildTarget(project);
}
exports.getClientBuild = getClientBuild;
