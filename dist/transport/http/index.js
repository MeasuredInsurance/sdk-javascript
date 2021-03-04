"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosEmitter = void 0;
const axios_1 = __importDefault(require("axios"));
function axiosEmitter(sink) {
    return function (message, options) {
        options = Object.assign({}, options);
        const headers = Object.assign(Object.assign({}, message.headers), options.headers);
        delete options.headers;
        return axios_1.default.post(sink, message.body, Object.assign({ headers: headers }, options));
    };
}
exports.axiosEmitter = axiosEmitter;
