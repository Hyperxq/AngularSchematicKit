"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
function default_1() {
    return (_host, context) => {
        context.logger.log('info', `You can use these schematics to your project, only copy the name`);
        context.logger.log('info', `✨- initialize-angular-configuration (alias: start)`);
        context.logger.log('info', `✨- add-linters (alias: l)`);
        context.logger.log('info', `✨- add-git-hooks  (alias: gh)`);
        context.logger.log('info', `✨- scaffolding  (alias: s)`);
        return (0, schematics_1.chain)([]);
    };
}
exports.default = default_1;
