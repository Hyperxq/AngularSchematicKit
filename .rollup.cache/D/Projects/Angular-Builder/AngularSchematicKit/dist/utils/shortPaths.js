"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.makeExportPath = exports.addExportsToNearestIndex = exports.findShortPath = exports.findStructureWithShortPath = exports.addShortPath = exports.addExportToIndexFile = exports.createIndexFile = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ast_utils_1 = require("./ast-utils");
const change_1 = require("./change");
const file_utils_1 = require("./file-utils");
const json_file_1 = require("./json-file");
const paths_1 = require("./paths");
const workspace_1 = require("./workspace");

function createIndexFile(options, path, exportPaths) {
    return (tree) => {
        if (!tree.exists(`${path}index.ts`)) {
            const sourceTemplate = (0, schematics_1.url)('./files');
            const sourceParametrizeTemplate = (0, schematics_1.apply)(sourceTemplate, [
                (0, schematics_1.filter)((pathModule) => pathModule.endsWith('/utils.ts.template')),
                (0, schematics_1.template)({
                    ...core_1.strings,
                    ...options,
                    name: './',
                    exportPaths: exportPaths,
                }),
                (0, schematics_1.renameTemplateFiles)(),
                (0, schematics_1.move)((0, core_1.normalize)(path)),
            ]);
            return (0, schematics_1.mergeWith)(sourceParametrizeTemplate);
        }
    };
}

exports.createIndexFile = createIndexFile;

function addExportToIndexFile(filePath, exportPath) {
    return (tree) => {
        const file = (0, file_utils_1.getSourceFile)(tree, filePath);
        const nodes = (0, ast_utils_1.getSourceNodes)(file);
        const change = `export * from '${exportPath}';\n`;
        if (nodes.find((node) => node.getText() === change || node.getText().includes(change.slice(0, change.length - 3)))) {
            return tree;
        }
        let position = 0;
        if (nodes.length > 0) {
            position = nodes
                .map((node) => node.getEnd())
                .reduce((biggest, current) => (Math.max(biggest, current) === biggest ? biggest : current));
        }
        const toInsert = new change_1.InsertChange(filePath, position, change);
        const recorder = tree.beginUpdate(filePath);
        (0, change_1.applyToUpdateRecorder)(recorder, [toInsert]);
        tree.commitUpdate(recorder);
    };
}

exports.addExportToIndexFile = addExportToIndexFile;

function addShortPath(shortPath) {
    return (host) => {
        if (!host.exists('tsconfig.json')) {
            return host;
        }
        shortPath.paths = shortPath.paths.map((path) => normalizeShortPath(path));
        const file = new json_file_1.JSONFile(host, 'tsconfig.json');
        const jsonPath = ['compilerOptions', 'paths', shortPath.packageName.toLowerCase()];
        const value = file.get(jsonPath);
        let pathsFiltered = [];
        if (value) {
            pathsFiltered = shortPath.paths?.filter((item) => !value.some((path) => path === item));
        }
        file.modify(jsonPath, Array.isArray(value) ? [...value, ...pathsFiltered] : shortPath.paths);
    };
}

exports.addShortPath = addShortPath;

function normalizeShortPath(string) {
    return string.slice(string.length - 1, string.length) === '/'
        ? string.slice(0, string.length - 1)
        : string;
}

function findStructureWithShortPath(structure, moduleNameToAdd) {
    if (structure.hasShortPath) {
        if (moduleNameToAdd !== structure.name) {
            return structure;
        } else {
            return undefined;
        }
    }
    if (!structure.parent) {
        return undefined;
    }
    return findStructureWithShortPath(structure.parent, moduleNameToAdd);
}

exports.findStructureWithShortPath = findStructureWithShortPath;

function findShortPath(structure, moduleNameToAdd) {
    return findStructureWithShortPath(structure, moduleNameToAdd)?.path?.shortPath;
}

exports.findShortPath = findShortPath;

function addExportsToNearestIndex(options, structure, type) {
    return async (tree) => {
        const workspace = await (0, workspace_1.readWorkspace)(tree);
        const project = (0, file_utils_1.getProject)(workspace, options.project || '');
        const clientBuildTarget = (0, file_utils_1.getBuildTarget)(project);
        const bootstrapModulePath = (0, file_utils_1.getMainModulePath)(tree, clientBuildTarget, project?.sourceRoot || '', structure.parent);
        const foundStructure = findStructureWithShortPath(structure, (0, paths_1.getModuleNameFromPath)(bootstrapModulePath));
        if (foundStructure !== undefined) {
            const exportPath = makeExportPath(structure, type, foundStructure?.name);
            return addExportToIndexFile(`${foundStructure.path?.getPath()}index.ts`, exportPath);
        }
    };
}

exports.addExportsToNearestIndex = addExportsToNearestIndex;

function makeExportPath(structure, type, folderName) {
    return `${structure.path?.getRelativePath(folderName)}${structure.name}.${type}`;
}

exports.makeExportPath = makeExportPath;
