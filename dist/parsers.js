"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parserByEncoding = exports.DateParser = exports.Base64Parser = exports.parserByContentType = exports.PassThroughParser = exports.JSONParser = exports.Parser = void 0;
const constants_1 = __importDefault(require("./constants"));
const validation_1 = require("./event/validation");
class Parser {
}
exports.Parser = Parser;
class JSONParser {
    constructor(decorator) {
        this.decorator = decorator;
    }
    /**
     * Parses the payload with an optional decorator
     * @param {object|string} payload the JSON payload
     * @return {object} the parsed JSON payload.
     */
    parse(payload) {
        if (this.decorator) {
            payload = this.decorator.parse(payload);
        }
        validation_1.isDefinedOrThrow(payload, new validation_1.ValidationError("null or undefined payload"));
        validation_1.isStringOrObjectOrThrow(payload, new validation_1.ValidationError("invalid payload type, allowed are: string or object"));
        const parseJSON = (v) => (validation_1.isString(v) ? JSON.parse(v) : v);
        return parseJSON(payload);
    }
}
exports.JSONParser = JSONParser;
class PassThroughParser extends Parser {
    parse(payload) {
        return payload;
    }
}
exports.PassThroughParser = PassThroughParser;
const jsonParser = new JSONParser();
exports.parserByContentType = {
    [constants_1.default.MIME_JSON]: jsonParser,
    [constants_1.default.MIME_CE_JSON]: jsonParser,
    [constants_1.default.DEFAULT_CONTENT_TYPE]: jsonParser,
    [constants_1.default.DEFAULT_CE_CONTENT_TYPE]: jsonParser,
    [constants_1.default.MIME_OCTET_STREAM]: new PassThroughParser(),
};
class Base64Parser {
    constructor(decorator) {
        this.decorator = decorator;
    }
    parse(payload) {
        let payloadToParse = payload;
        if (this.decorator) {
            payloadToParse = this.decorator.parse(payload);
        }
        return Buffer.from(payloadToParse, "base64").toString();
    }
}
exports.Base64Parser = Base64Parser;
class DateParser extends Parser {
    parse(payload) {
        let date = new Date(Date.parse(payload));
        if (date.toString() === "Invalid Date") {
            date = new Date();
        }
        return date.toISOString();
    }
}
exports.DateParser = DateParser;
exports.parserByEncoding = {
    base64: {
        [constants_1.default.MIME_CE_JSON]: new JSONParser(new Base64Parser()),
        [constants_1.default.MIME_OCTET_STREAM]: new PassThroughParser(),
    },
};