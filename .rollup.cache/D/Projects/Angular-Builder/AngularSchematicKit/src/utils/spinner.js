"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spinner = void 0;
const tslib_1 = require("tslib");
const ora_1 = tslib_1.__importDefault(require("ora"));
const color_1 = require("./color");
class Spinner {
    constructor(text) {
        this.enabled = true;
        this.spinner = (0, ora_1.default)({
            text,
            hideCursor: false,
            discardStdin: false,
        });
    }
    set text(text) {
        this.spinner.text = text;
    }
    succeed(text) {
        if (this.enabled) {
            this.spinner.succeed(text);
        }
    }
    info(text) {
        this.spinner.info(text);
    }
    fail(text) {
        this.spinner.fail(text && color_1.colors.redBright(text));
    }
    warn(text) {
        this.spinner.warn(text && color_1.colors.yellowBright(text));
    }
    stop() {
        this.spinner.stop();
    }
    start(text) {
        if (this.enabled) {
            this.spinner.start(text);
        }
    }
}
exports.Spinner = Spinner;
