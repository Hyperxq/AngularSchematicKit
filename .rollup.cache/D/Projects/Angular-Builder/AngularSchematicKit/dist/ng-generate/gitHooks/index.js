"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGitHooks = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const dependecies_1 = require("../../utils/dependecies");
const json_file_1 = require("../../utils/json-file");
const tasks_1 = require("@angular-devkit/schematics/tasks");
function addGitHooks(options) {
    return (tree, context) => {
        context.logger.info(`🎉 Add-git-hooks Schematic Start!`);
        if (!tree.exists(`husky/pre-push`)) {
            const sourceTemplate = (0, schematics_1.url)('./files/husky');
            const sourceParametrizeTemplate = (0, schematics_1.apply)(sourceTemplate, [
                (0, schematics_1.filter)((pathModule) => pathModule.endsWith('/pre-commit.template') || pathModule.endsWith('/pre-push.template')),
                (0, schematics_1.template)({
                    ...schematics_1.strings,
                    ...options,
                }),
                (0, schematics_1.renameTemplateFiles)(),
                (0, schematics_1.move)('./.husky'),
            ]);
            const sourceParametrizeHuskyTemplate = (0, schematics_1.apply)(sourceTemplate, [
                (0, schematics_1.filter)((pathModule) => pathModule.endsWith('/.gitignore.template') || pathModule.endsWith('/husky.sh.template')),
                (0, schematics_1.template)({
                    ...schematics_1.strings,
                    ...options,
                }),
                (0, schematics_1.renameTemplateFiles)(),
                (0, schematics_1.move)('./.husky/_'),
            ]);
            return (0, schematics_1.chain)([
                (0, schematics_1.mergeWith)(sourceParametrizeTemplate),
                (0, schematics_1.mergeWith)(sourceParametrizeHuskyTemplate),
                addPackageJsonScript({
                    name: 'prettier:check',
                    script: 'prettier --config .prettierrc --check "src/**/**/*.ts" --ignore-path ./.prettierignore',
                }),
                addPackageJsonScript({
                    name: 'lint',
                    script: 'eslint . --ext .ts',
                }),
                addDependency('husky', '^8.0.1'),
                addDependency('word-wrap', '^1.2.3'),
                installPackageJsonDependencies(),
            ]);
        }
    };
}
exports.addGitHooks = addGitHooks;
const PKG_JSON_PATH = './package.json';
function addPackageJsonScript(content, pkgJsonPath = PKG_JSON_PATH) {
    return (host) => {
        const json = new json_file_1.JSONFile(host, pkgJsonPath);
        const path = ['scripts', content.name];
        json.modify(path, content.script);
        return host;
    };
}
function addDependency(name, version) {
    return (host, context) => {
        context.logger.log('info', `Adding ${name}`);
        const dependency = {
            type: dependecies_1.NodeDependencyType.Default,
            version: version,
            name: name,
        };
        (0, dependecies_1.addPackageJsonDependency)(host, dependency);
        context.logger.log('info', `✅️ Added "${dependency.name}" into ${dependency.type}`);
        return host;
    };
}
function installPackageJsonDependencies() {
    return (host, context) => {
        context.addTask(new tasks_1.NodePackageInstallTask());
        context.logger.log('info', `🔍 Installing packages...`);
        return host;
    };
}
