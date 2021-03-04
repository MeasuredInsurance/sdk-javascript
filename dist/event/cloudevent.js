"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __data;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudEvent = void 0;
const uuid_1 = require("uuid");
const __1 = require("..");
const spec_1 = require("./spec");
const validation_1 = require("./validation");
/**
 * A CloudEvent describes event data in common formats to provide
 * interoperability across services, platforms and systems.
 * @see https://github.com/cloudevents/spec/blob/v1.0/spec.md
 */
class CloudEvent {
    /**
     * Creates a new CloudEvent object with the provided properties. If there is a chance that the event
     * properties will not conform to the CloudEvent specification, you may pass a boolean `false` as a
     * second parameter to bypass event validation.
     *
     * @param {object} event the event properties
     * @param {boolean?} strict whether to perform event validation when creating the object - default: true
     */
    constructor(event, strict = true) {
        __data.set(this, void 0);
        // copy the incoming event so that we can delete properties as we go
        // everything left after we have deleted know properties becomes an extension
        const properties = Object.assign({}, event);
        this.id = properties.id || uuid_1.v4();
        delete properties.id;
        this.time = properties.time || new Date().toISOString();
        delete properties.time;
        this.type = properties.type;
        delete properties.type;
        this.source = properties.source;
        delete properties.source;
        this.specversion = properties.specversion || "1.0" /* V1 */;
        delete properties.specversion;
        this.datacontenttype = properties.datacontenttype;
        delete properties.datacontenttype;
        this.subject = properties.subject;
        delete properties.subject;
        this.datacontentencoding = properties.datacontentencoding;
        delete properties.datacontentencoding;
        this.dataschema = properties.dataschema;
        delete properties.dataschema;
        this.data_base64 = properties.data_base64;
        delete properties.data_base64;
        this.schemaurl = properties.schemaurl;
        delete properties.schemaurl;
        this.data = properties.data;
        delete properties.data;
        // sanity checking
        if (this.specversion === "1.0" /* V1 */ && this.schemaurl) {
            throw new TypeError("cannot set schemaurl on version 1.0 event");
        }
        else if (this.specversion === "0.3" /* V03 */ && this.dataschema) {
            throw new TypeError("cannot set dataschema on version 0.3 event");
        }
        // finally process any remaining properties - these are extensions
        for (const [key, value] of Object.entries(properties)) {
            // Extension names should only allow lowercase a-z and 0-9 in the name
            // names should not exceed 20 characters in length
            if (!key.match(/^[a-z0-9]{1,20}$/) && strict) {
                throw new validation_1.ValidationError(`invalid extension name: ${key}
CloudEvents attribute names MUST consist of lower-case letters ('a' to 'z')
or digits ('0' to '9') from the ASCII character set. Attribute names SHOULD
be descriptive and terse and SHOULD NOT exceed 20 characters in length.`);
            }
            // Value should be spec compliant
            // https://github.com/cloudevents/spec/blob/master/spec.md#type-system
            if (!validation_1.isValidType(value) && strict) {
                throw new validation_1.ValidationError(`invalid extension value: ${value}
Extension values must conform to the CloudEvent type system.
See: https://github.com/cloudevents/spec/blob/v1.0/spec.md#type-system`);
            }
            this[key] = value;
        }
        strict ? this.validate() : undefined;
        Object.freeze(this);
    }
    get data() {
        return __classPrivateFieldGet(this, __data);
    }
    set data(value) {
        if (validation_1.isBinary(value)) {
            this.data_base64 = validation_1.asBase64(value);
        }
        __classPrivateFieldSet(this, __data, value);
    }
    /**
     * Used by JSON.stringify(). The name is confusing, but this method is called by
     * JSON.stringify() when converting this object to JSON.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
     * @return {object} this event as a plain object
     */
    toJSON() {
        const event = Object.assign({}, this);
        event.time = new Date(this.time).toISOString();
        event.data = !validation_1.isBinary(this.data) ? this.data : undefined;
        return event;
    }
    toString() {
        return JSON.stringify(this);
    }
    /**
     * Validates this CloudEvent against the schema
     * @throws if the CloudEvent does not conform to the schema
     * @return {boolean} true if this event is valid
     */
    validate() {
        try {
            return spec_1.validateCloudEvent(this);
        }
        catch (e) {
            if (e instanceof validation_1.ValidationError) {
                throw e;
            }
            else {
                throw new validation_1.ValidationError("invalid payload", e);
            }
        }
    }
    /**
     * Emit this CloudEvent through the application
     *
     * @param {boolean} ensureDelivery fail the promise if one listener fail
     * @return {Promise<CloudEvent>} this
     */
    emit(ensureDelivery = true) {
        return __awaiter(this, void 0, void 0, function* () {
            yield __1.Emitter.emitEvent(this, ensureDelivery);
            return this;
        });
    }
    /**
     * Clone a CloudEvent with new/update attributes
     * @param {object} options attributes to augment the CloudEvent with
     * @param {boolean} strict whether or not to use strict validation when cloning (default: true)
     * @throws if the CloudEvent does not conform to the schema
     * @return {CloudEvent} returns a new CloudEvent
     */
    cloneWith(options, strict = true) {
        return new CloudEvent(Object.assign({}, this.toJSON(), options), strict);
    }
}
exports.CloudEvent = CloudEvent;
__data = new WeakMap();