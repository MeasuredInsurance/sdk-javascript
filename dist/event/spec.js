"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCloudEvent = void 0;
const ajv_1 = __importDefault(require("ajv"));
const validation_1 = require("./validation");
const schemas_1 = require("./schemas");
const constants_1 = __importDefault(require("../constants"));
const ajv = new ajv_1.default({ extendRefs: true });
// handle date-time format specially because a user could pass
// Date().toString(), which is not spec compliant date-time format
ajv.addFormat("js-date-time", function (dateTimeString) {
    const date = new Date(Date.parse(dateTimeString));
    return date.toString() !== "Invalid Date";
});
const isValidAgainstSchemaV1 = ajv.compile(schemas_1.schemaV1);
const isValidAgainstSchemaV03 = ajv.compile(schemas_1.schemaV03);
function validateCloudEvent(event) {
    if (event.specversion === "1.0" /* V1 */) {
        if (!isValidAgainstSchemaV1(event)) {
            throw new validation_1.ValidationError("invalid payload", isValidAgainstSchemaV1.errors);
        }
        return true;
    }
    else if (event.specversion === "0.3" /* V03 */) {
        if (!isValidAgainstSchemaV03(event)) {
            throw new validation_1.ValidationError("invalid payload", isValidAgainstSchemaV03.errors);
        }
        return checkDataContentEncoding(event);
    }
    return false;
}
exports.validateCloudEvent = validateCloudEvent;
function checkDataContentEncoding(event) {
    if (event.datacontentencoding) {
        // we only support base64
        const encoding = event.datacontentencoding.toLocaleLowerCase();
        if (encoding !== constants_1.default.ENCODING_BASE64) {
            throw new validation_1.ValidationError("invalid payload", [`Unsupported content encoding: ${encoding}`]);
        }
        else {
            if (!validation_1.isBase64(event.data)) {
                throw new validation_1.ValidationError("invalid payload", [`Invalid content encoding of data: ${event.data}`]);
            }
        }
    }
    return true;
}