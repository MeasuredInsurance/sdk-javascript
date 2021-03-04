"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP = exports.Mode = void 0;
const http_1 = require("./http");
/**
 * An enum representing the two transport modes, binary and structured
 */
var Mode;
(function (Mode) {
    Mode["BINARY"] = "binary";
    Mode["STRUCTURED"] = "structured";
})(Mode = exports.Mode || (exports.Mode = {}));
// HTTP Message capabilities
exports.HTTP = {
    binary: http_1.binary,
    structured: http_1.structured,
    toEvent: http_1.deserialize,
    isEvent: http_1.isEvent,
};