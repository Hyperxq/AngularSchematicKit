"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colors = exports.removeColor = void 0;
const tslib_1 = require("tslib");
const ansiColors = tslib_1.__importStar(require("ansi-colors"));
const tty_1 = require("tty");
function supportColor() {
    if (process.env.FORCE_COLOR !== undefined) {
        switch (process.env.FORCE_COLOR) {
            case '':
            case 'true':
            case '1':
            case '2':
            case '3':
                return true;
            default:
                return false;
        }
    }
    if (process.stdout instanceof tty_1.WriteStream) {
        return process.stdout.getColorDepth() > 1;
    }
    return false;
}
function removeColor(text) {
    return text.replace(ansiColors.ansiRegex, '');
}
exports.removeColor = removeColor;
const colors = ansiColors.create();
exports.colors = colors;
colors.enabled = supportColor();
