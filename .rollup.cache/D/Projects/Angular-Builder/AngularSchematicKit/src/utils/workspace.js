"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allTargetOptions = exports.allWorkspaceTargets = exports.createDefaultPath = exports.buildDefaultPath = exports.writeWorkspace = exports.getWorkspace = exports.readWorkspace = exports.updateWorkspace = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const workspace_models_1 = require("./workspace-models");
const DEFAULT_WORKSPACE_PATH = '/angular.json';
class TreeWorkspaceHost {
    constructor(tree) {
        this.tree = tree;
    }
    async readFile(path) {
        return this.tree.readText(path);
    }
    async writeFile(path, data) {
        if (this.tree.exists(path)) {
            this.tree.overwrite(path, data);
        }
        else {
            this.tree.create(path, data);
        }
    }
    async isDirectory(path) {
        return !this.tree.exists(path) && this.tree.getDir(path).subfiles.length > 0;
    }
    async isFile(path) {
        return this.tree.exists(path);
    }
}
function updateWorkspace(updater) {
    return async (tree) => {
        const host = new TreeWorkspaceHost(tree);
        const { workspace } = await core_1.workspaces.readWorkspace(DEFAULT_WORKSPACE_PATH, host);
        const result = await updater(workspace);
        await core_1.workspaces.writeWorkspace(workspace, host);
        return result || schematics_1.noop;
    };
}
exports.updateWorkspace = updateWorkspace;
async function readWorkspace(tree, path = DEFAULT_WORKSPACE_PATH) {
    const host = new TreeWorkspaceHost(tree);
    const { workspace } = await core_1.workspaces.readWorkspace(path, host);
    if (!workspace) {
        throw new schematics_1.SchematicsException(`Don't find any workspace`);
    }
    return workspace;
}
exports.readWorkspace = readWorkspace;
async function getWorkspace(tree, path = DEFAULT_WORKSPACE_PATH) {
    const host = new TreeWorkspaceHost(tree);
    const { workspace } = await core_1.workspaces.readWorkspace(path, host);
    return workspace;
}
exports.getWorkspace = getWorkspace;
async function writeWorkspace(tree, workspace, path) {
    const host = new TreeWorkspaceHost(tree);
    return core_1.workspaces.writeWorkspace(workspace, host, path);
}
exports.writeWorkspace = writeWorkspace;
function buildDefaultPath(project) {
    const root = project.sourceRoot ? `/${project.sourceRoot}/` : `/${project.root}/src/`;
    const projectDirName = project.extensions['projectType'] === workspace_models_1.ProjectType.Application ? 'app' : 'lib';
    return `${root}${projectDirName}`;
}
exports.buildDefaultPath = buildDefaultPath;
async function createDefaultPath(tree, projectName) {
    const workspace = await readWorkspace(tree);
    const project = workspace.projects.get(projectName);
    if (!project) {
        throw new Error(`Project "${projectName}" does not exist.`);
    }
    return buildDefaultPath(project);
}
exports.createDefaultPath = createDefaultPath;
function* allWorkspaceTargets(workspace) {
    for (const [projectName, project] of workspace.projects) {
        for (const [targetName, target] of project.targets) {
            yield [targetName, target, projectName, project];
        }
    }
}
exports.allWorkspaceTargets = allWorkspaceTargets;
function* allTargetOptions(target, skipBaseOptions = false) {
    if (!skipBaseOptions && target.options) {
        yield [undefined, target.options];
    }
    if (!target.configurations) {
        return;
    }
    for (const [name, options] of Object.entries(target.configurations)) {
        if (options !== undefined) {
            yield [name, options];
        }
    }
}
exports.allTargetOptions = allTargetOptions;
