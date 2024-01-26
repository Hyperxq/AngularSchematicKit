"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettierFactory = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const prettier_messages_1 = require("./prettier.messages");
const child_process_1 = require("child_process");
const spinner_1 = require("../../utils/spinner");
function prettierFactory(options) {
    return () => {
        const { version, ...prettierOptions } = options;
        console.log(prettier_messages_1.MESSAGES.WELCOME);
        console.log(prettier_messages_1.MESSAGES.TASK_TO_BE_DONE);
        return (0, schematics_1.chain)([addPrettierFiles(prettierOptions), installPrettier(version)]);
    };
}
exports.prettierFactory = prettierFactory;
function installPrettier(version) {
    return () => {
        const spinner = new spinner_1.Spinner('prettier installation');
        try {
            spinner.start('Installing prettier');
            (0, child_process_1.execSync)(`npm install --save-dev --save-exact prettier${version ? `@${version}` : ''}`, {
                stdio: 'pipe',
            });
            spinner.succeed('Prettier was installed successfully');
        }
        catch (e) {
            spinner.stop();
        }
    };
}
function addPrettierFiles(options) {
    const urlTemplates = ['.prettierrc.template', '.prettierignore.template'];
    const template = (0, schematics_1.apply)((0, schematics_1.url)('./files'), [
        (0, schematics_1.filter)((path) => urlTemplates.some((template) => path.includes(template))),
        (0, schematics_1.applyTemplates)({
            ...schematics_1.strings,
            options,
        }),
        (0, schematics_1.renameTemplateFiles)(),
        (0, schematics_1.move)('./'),
    ]);
    return (0, schematics_1.mergeWith)(template, schematics_1.MergeStrategy.Overwrite);
}
