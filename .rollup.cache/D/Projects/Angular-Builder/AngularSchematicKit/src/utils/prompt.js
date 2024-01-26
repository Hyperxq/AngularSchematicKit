"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askChoices = exports.askQuestion = exports.askConfirmation = void 0;
const tslib_1 = require("tslib");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
async function askConfirmation(message, defaultResponse) {
    const question = {
        type: 'confirm',
        name: 'confirmation',
        prefix: '',
        message,
        default: defaultResponse,
    };
    const { prompt } = inquirer_1.default;
    const answers = await prompt([question]);
    return answers['confirmation'];
}
exports.askConfirmation = askConfirmation;
async function askQuestion(message, choices, defaultResponseIndex) {
    const question = {
        type: 'list',
        name: 'answer',
        prefix: '',
        message,
        choices,
        default: defaultResponseIndex,
    };
    const { prompt } = inquirer_1.default;
    const answers = await prompt([question]);
    return answers['answer'];
}
exports.askQuestion = askQuestion;
async function askChoices(message, choices, defaultValue) {
    const question = {
        type: 'checkbox',
        name: 'answer',
        prefix: '',
        message,
        choices,
        default: defaultValue,
    };
    const { prompt } = inquirer_1.default;
    const answers = await prompt([question]);
    return answers['answer'];
}
exports.askChoices = askChoices;
