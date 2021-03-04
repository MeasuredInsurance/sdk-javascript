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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emitter = exports.emitterFor = void 0;
const message_1 = require("../message");
const events_1 = require("events");
/**
 * emitterFactory creates and returns an EmitterFunction using the supplied
 * TransportFunction. The returned EmitterFunction will invoke the Binding's
 * `binary` or `structured` function to convert a CloudEvent into a JSON
 * Message based on the Mode provided, and invoke the TransportFunction with
 * the Message and any supplied options.
 *
 * @param {TransportFunction} fn a TransportFunction that can accept an event Message
 * @param { {Binding, Mode} } options network binding and message serialization options
 * @param {Binding} options.binding a transport binding, e.g. HTTP
 * @param {Mode} options.mode the encoding mode (Mode.BINARY or Mode.STRUCTURED)
 * @returns {EmitterFunction} an EmitterFunction to send events with
 */
function emitterFor(fn, options = { binding: message_1.HTTP, mode: message_1.Mode.BINARY }) {
    if (!fn) {
        throw new TypeError("A TransportFunction is required");
    }
    const { binding, mode } = options;
    return function emit(event, opts) {
        opts = opts || {};
        switch (mode) {
            case message_1.Mode.BINARY:
                return fn(binding.binary(event), opts);
            case message_1.Mode.STRUCTURED:
                return fn(binding.structured(event), opts);
            default:
                throw new TypeError(`Unexpected transport mode: ${mode}`);
        }
    };
}
exports.emitterFor = emitterFor;
/**
 * A static class to emit CloudEvents within an application
 */
class Emitter {
    /**
     * Return or create the Emitter singleton
     *
     * @return {Emitter} return Emitter singleton
     */
    static getInstance() {
        if (!Emitter.instance) {
            Emitter.instance = new events_1.EventEmitter();
        }
        return Emitter.instance;
    }
    /**
     * Add a listener for eventing
     *
     * @param {string} event type to listen to
     * @param {Function} listener to call on event
     * @return {void}
     */
    static on(event, listener) {
        Emitter.getInstance().on(event, listener);
    }
    /**
     * Emit an event inside this application
     *
     * @param {CloudEvent} event to emit
     * @param {boolean} ensureDelivery fail the promise if one listener fail
     * @return {void}
     */
    static emitEvent(event, ensureDelivery = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ensureDelivery) {
                // Ensure delivery is disabled so we don't wait for Promise
                Emitter.getInstance().emit("cloudevent", event);
            }
            else {
                // Execute all listeners and wrap them in a Promise
                yield Promise.all(Emitter.getInstance()
                    .listeners("cloudevent")
                    .map((l) => __awaiter(this, void 0, void 0, function* () { return l(event); })));
            }
        });
    }
}
exports.Emitter = Emitter;
/**
 * Singleton store
 */
Emitter.instance = undefined;