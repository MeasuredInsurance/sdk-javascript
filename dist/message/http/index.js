"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserialize = exports.isEvent = exports.structured = exports.binary = void 0;
const __1 = require("../..");
const headers_1 = require("./headers");
const validation_1 = require("../../event/validation");
const parsers_1 = require("../../parsers");
// implements Serializer
function binary(event) {
    const contentType = { [__1.CONSTANTS.HEADER_CONTENT_TYPE]: __1.CONSTANTS.DEFAULT_CONTENT_TYPE };
    const headers = Object.assign(Object.assign({}, contentType), headers_1.headersFor(event));
    let body = event.data;
    if (typeof event.data === "object" && !(event.data instanceof Uint32Array)) {
        // we'll stringify objects, but not binary data
        body = JSON.stringify(event.data);
    }
    return {
        headers,
        body,
    };
}
exports.binary = binary;
// implements Serializer
function structured(event) {
    if (event.data_base64) {
        // The event's data is binary - delete it
        event = event.cloneWith({ data: undefined });
    }
    return {
        headers: {
            [__1.CONSTANTS.HEADER_CONTENT_TYPE]: __1.CONSTANTS.DEFAULT_CE_CONTENT_TYPE,
        },
        body: event.toString(),
    };
}
exports.structured = structured;
// implements Detector
// TODO: this could probably be optimized
function isEvent(message) {
    try {
        deserialize(message);
        return true;
    }
    catch (err) {
        return false;
    }
}
exports.isEvent = isEvent;
/**
 * Converts a Message to a CloudEvent
 *
 * @param {Message} message the incoming message
 * @return {CloudEvent} A new {CloudEvent} instance
 */
function deserialize(message) {
    const cleanHeaders = headers_1.sanitize(message.headers);
    const mode = getMode(cleanHeaders);
    let version = getVersion(mode, cleanHeaders, message.body);
    if (version !== "0.3" /* V03 */ && version !== "1.0" /* V1 */) {
        console.error(`Unknown spec version ${version}. Default to ${"1.0" /* V1 */}`);
        version = "1.0" /* V1 */;
    }
    switch (mode) {
        case __1.Mode.BINARY:
            return parseBinary(message, version);
        case __1.Mode.STRUCTURED:
            return parseStructured(message, version);
        default:
            throw new validation_1.ValidationError("Unknown Message mode");
    }
}
exports.deserialize = deserialize;
/**
 * Determines the HTTP transport mode (binary or structured) based
 * on the incoming HTTP headers.
 * @param {Headers} headers the incoming HTTP headers
 * @returns {Mode} the transport mode
 */
function getMode(headers) {
    const contentType = headers[__1.CONSTANTS.HEADER_CONTENT_TYPE];
    if (contentType && contentType.startsWith(__1.CONSTANTS.MIME_CE)) {
        return __1.Mode.STRUCTURED;
    }
    if (headers[__1.CONSTANTS.CE_HEADERS.ID]) {
        return __1.Mode.BINARY;
    }
    throw new validation_1.ValidationError("no cloud event detected");
}
/**
 * Determines the version of an incoming CloudEvent based on the
 * HTTP headers or HTTP body, depending on transport mode.
 * @param {Mode} mode the HTTP transport mode
 * @param {Headers} headers the incoming HTTP headers
 * @param {Record<string, unknown>} body the HTTP request body
 * @returns {Version} the CloudEvent specification version
 */
function getVersion(mode, headers, body) {
    if (mode === __1.Mode.BINARY) {
        // Check the headers for the version
        const versionHeader = headers[__1.CONSTANTS.CE_HEADERS.SPEC_VERSION];
        if (versionHeader) {
            return versionHeader;
        }
    }
    else {
        // structured mode - the version is in the body
        return typeof body === "string" ? JSON.parse(body).specversion : body.specversion;
    }
    return "1.0" /* V1 */;
}
/**
 * Parses an incoming HTTP Message, converting it to a {CloudEvent}
 * instance if it conforms to the Cloud Event specification for this receiver.
 *
 * @param {Message} message the incoming HTTP Message
 * @param {Version} version the spec version of the incoming event
 * @returns {CloudEvent} an instance of CloudEvent representing the incoming request
 * @throws {ValidationError} of the event does not conform to the spec
 */
function parseBinary(message, version) {
    const headers = message.headers;
    let body = message.body;
    if (!headers)
        throw new validation_1.ValidationError("headers is null or undefined");
    if (body) {
        validation_1.isStringOrObjectOrThrow(body, new validation_1.ValidationError("payload must be an object or a string"));
    }
    if (headers[__1.CONSTANTS.CE_HEADERS.SPEC_VERSION] &&
        headers[__1.CONSTANTS.CE_HEADERS.SPEC_VERSION] !== "0.3" /* V03 */ &&
        headers[__1.CONSTANTS.CE_HEADERS.SPEC_VERSION] !== "1.0" /* V1 */) {
        throw new validation_1.ValidationError(`invalid spec version ${headers[__1.CONSTANTS.CE_HEADERS.SPEC_VERSION]}`);
    }
    // Clone and low case all headers names
    const sanitizedHeaders = headers_1.sanitize(headers);
    const eventObj = {};
    const parserMap = version === "1.0" /* V1 */ ? headers_1.v1binaryParsers : headers_1.v1binaryParsers;
    for (const header in parserMap) {
        if (sanitizedHeaders[header]) {
            const mappedParser = parserMap[header];
            eventObj[mappedParser.name] = mappedParser.parser.parse(sanitizedHeaders[header]);
            delete sanitizedHeaders[header];
        }
    }
    // Every unprocessed header can be an extension
    for (const header in sanitizedHeaders) {
        if (header.startsWith(__1.CONSTANTS.EXTENSIONS_PREFIX)) {
            eventObj[header.substring(__1.CONSTANTS.EXTENSIONS_PREFIX.length)] = headers[header];
        }
    }
    const parser = parsers_1.parserByContentType[eventObj.datacontenttype];
    if (parser && body) {
        body = parser.parse(body);
    }
    // At this point, if the datacontenttype is application/json and the datacontentencoding is base64
    // then the data has already been decoded as a string, then parsed as JSON. We don't need to have
    // the datacontentencoding property set - in fact, it's incorrect to do so.
    if (eventObj.datacontenttype === __1.CONSTANTS.MIME_JSON && eventObj.datacontentencoding === __1.CONSTANTS.ENCODING_BASE64) {
        delete eventObj.datacontentencoding;
    }
    return new __1.CloudEvent(Object.assign(Object.assign({}, eventObj), { data: body }), false);
}
/**
 * Creates a new CloudEvent instance based on the provided payload and headers.
 *
 * @param {Message} message the incoming Message
 * @param {Version} version the spec version of this message (v1 or v03)
 * @returns {CloudEvent} a new CloudEvent instance for the provided headers and payload
 * @throws {ValidationError} if the payload and header combination do not conform to the spec
 */
function parseStructured(message, version) {
    const payload = message.body;
    const headers = message.headers;
    if (!payload)
        throw new validation_1.ValidationError("payload is null or undefined");
    if (!headers)
        throw new validation_1.ValidationError("headers is null or undefined");
    validation_1.isStringOrObjectOrThrow(payload, new validation_1.ValidationError("payload must be an object or a string"));
    if (headers[__1.CONSTANTS.CE_HEADERS.SPEC_VERSION] &&
        headers[__1.CONSTANTS.CE_HEADERS.SPEC_VERSION] != "0.3" /* V03 */ &&
        headers[__1.CONSTANTS.CE_HEADERS.SPEC_VERSION] != "1.0" /* V1 */) {
        throw new validation_1.ValidationError(`invalid spec version ${headers[__1.CONSTANTS.CE_HEADERS.SPEC_VERSION]}`);
    }
    // Clone and low case all headers names
    const sanitizedHeaders = headers_1.sanitize(headers);
    const contentType = sanitizedHeaders[__1.CONSTANTS.HEADER_CONTENT_TYPE];
    const parser = contentType ? parsers_1.parserByContentType[contentType] : new parsers_1.JSONParser();
    if (!parser)
        throw new validation_1.ValidationError(`invalid content type ${sanitizedHeaders[__1.CONSTANTS.HEADER_CONTENT_TYPE]}`);
    const incoming = Object.assign({}, parser.parse(payload));
    const eventObj = {};
    const parserMap = version === "1.0" /* V1 */ ? headers_1.v1structuredParsers : headers_1.v03structuredParsers;
    for (const key in parserMap) {
        const property = incoming[key];
        if (property) {
            const parser = parserMap[key];
            eventObj[parser.name] = parser.parser.parse(property);
        }
        delete incoming[key];
    }
    // extensions are what we have left after processing all other properties
    for (const key in incoming) {
        eventObj[key] = incoming[key];
    }
    // data_base64 is a property that only exists on V1 events. For V03 events,
    // there will be a .datacontentencoding property, and the .data property
    // itself will be encoded as base64
    if (eventObj.data_base64 || eventObj.datacontentencoding === __1.CONSTANTS.ENCODING_BASE64) {
        const data = eventObj.data_base64 || eventObj.data;
        eventObj.data = new Uint32Array(Buffer.from(data, "base64"));
        delete eventObj.data_base64;
        delete eventObj.datacontentencoding;
    }
    return new __1.CloudEvent(eventObj, false);
}
