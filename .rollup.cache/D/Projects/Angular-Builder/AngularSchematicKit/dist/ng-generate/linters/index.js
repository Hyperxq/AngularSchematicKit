"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLinters = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const utils_1 = require("../../utils");
function addLinters(options) {
    return (tree, context) => {
        context.logger.info(`🎉 Add-linters Schematic Start!`);
        if (!tree.exists(`.prettierrc.template`)) {
            const sourceTemplate = (0, schematics_1.url)('./files');
            const sourceParametrizeTemplate = (0, schematics_1.apply)(sourceTemplate, [
                (0, schematics_1.filter)((pathModule) => pathModule.endsWith('/.prettierrc.template') ||
                    pathModule.endsWith('/.prettierignore.template') ||
                    pathModule.endsWith('/.eslintrc.template') ||
                    pathModule.endsWith('/.eslintignore.template')),
                (0, schematics_1.template)({
                    ...schematics_1.strings,
                    ...options,
                }),
                (0, schematics_1.renameTemplateFiles)(),
                (0, schematics_1.move)('./'),
            ]);
            return (0, schematics_1.chain)([
                (0, schematics_1.mergeWith)(sourceParametrizeTemplate),
                addDependency('prettier', options.prettierVersion),
                addDependency('eslint', options.eslintVersion),
                installPackageJsonDependencies(),
            ]);
        }
    };
}
exports.addLinters = addLinters;
function addDependency(name, version) {
    return (host, context) => {
        context.logger.log('info', `Adding ${name}`);
        const dependency = {
            type: utils_1.NodeDependencyType.Default,
            version: version,
            name: name,
        };
        (0, utils_1.addPackageJsonDependency)(host, dependency);
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
