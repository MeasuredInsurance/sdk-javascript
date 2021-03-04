"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaV03 = exports.schemaV1 = void 0;
exports.schemaV1 = {
    $ref: "#/definitions/event",
    definitions: {
        specversion: {
            type: "string",
            minLength: 1,
            const: "1.0",
        },
        datacontenttype: {
            type: "string",
        },
        data: {
            type: ["object", "string", "array", "number", "boolean", "null"],
        },
        data_base64: {
            type: "string",
        },
        event: {
            properties: {
                specversion: {
                    $ref: "#/definitions/specversion",
                },
                datacontenttype: {
                    $ref: "#/definitions/datacontenttype",
                },
                data: {
                    $ref: "#/definitions/data",
                },
                data_base64: {
                    $ref: "#/definitions/data_base64",
                },
                id: {
                    $ref: "#/definitions/id",
                },
                time: {
                    $ref: "#/definitions/time",
                },
                dataschema: {
                    $ref: "#/definitions/dataschema",
                },
                subject: {
                    $ref: "#/definitions/subject",
                },
                type: {
                    $ref: "#/definitions/type",
                },
                source: {
                    $ref: "#/definitions/source",
                },
            },
            required: ["specversion", "id", "type", "source"],
            type: "object",
        },
        id: {
            type: "string",
            minLength: 1,
        },
        time: {
            format: "js-date-time",
            type: "string",
        },
        dataschema: {
            type: "string",
            format: "uri",
        },
        subject: {
            type: "string",
            minLength: 1,
        },
        type: {
            type: "string",
            minLength: 1,
        },
        source: {
            format: "uri-reference",
            type: "string",
        },
    },
    type: "object",
};
exports.schemaV03 = {
    $ref: "#/definitions/event",
    definitions: {
        specversion: {
            const: "0.3",
        },
        datacontenttype: {
            type: "string",
        },
        data: {
            type: ["object", "string", "array", "number", "boolean", "null"],
        },
        event: {
            properties: {
                specversion: {
                    $ref: "#/definitions/specversion",
                },
                datacontenttype: {
                    $ref: "#/definitions/datacontenttype",
                },
                data: {
                    $ref: "#/definitions/data",
                },
                id: {
                    $ref: "#/definitions/id",
                },
                time: {
                    $ref: "#/definitions/time",
                },
                schemaurl: {
                    $ref: "#/definitions/schemaurl",
                },
                subject: {
                    $ref: "#/definitions/subject",
                },
                type: {
                    $ref: "#/definitions/type",
                },
                source: {
                    $ref: "#/definitions/source",
                },
            },
            required: ["specversion", "id", "type", "source"],
            type: "object",
        },
        id: {
            type: "string",
            minLength: 1,
        },
        time: {
            format: "js-date-time",
            type: "string",
        },
        schemaurl: {
            type: "string",
            format: "uri-reference",
        },
        subject: {
            type: "string",
            minLength: 1,
        },
        type: {
            type: "string",
            minLength: 1,
        },
        source: {
            format: "uri-reference",
            type: "string",
        },
    },
    type: "object",
};
