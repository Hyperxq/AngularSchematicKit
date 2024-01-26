"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGES = void 0;
const color_1 = require("../../utils/color");
exports.MESSAGES = {
    WELCOME: `
________________________________________
${color_1.colors.green('Welcome to')}
${color_1.colors.green(`${color_1.colors.bold('Schematic:')} Prettier`)}
________________________________________
`,
    TASK_TO_BE_DONE: `
${color_1.colors.bold(color_1.colors.blue('Task to be done:'))}
   - Install prettier.
   - Add .prettierrc and .prettierignore files
`,
};
