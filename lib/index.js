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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
var agent_1 = require("@dfinity/agent");
function extendProtobuf(actor, pb) {
    pb.methodsArray.forEach(function (method) { return (actor[method.name] = _createActorMethod(actor, method)); });
}
exports.default = extendProtobuf;
var metadataSymbol = Symbol.for("ic-agent-metadata");
var DEFAULT_ACTOR_CONFIG = {
    pollingStrategyFactory: agent_1.polling.strategy.defaultStrategy,
};
var verifyEncode = function (type, arg) {
    if (type) {
        var err = type.verify(arg);
        if (err) {
            throw new Error(err);
        }
        return type.encode(arg).finish();
    }
    else {
        return Buffer.from([]);
    }
};
function _createActorMethod(actor, method) {
    var _this = this;
    var caller;
    if (method.getOption("annotation") !== "update") {
        caller = function (options, args) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, agent, cid, arg, result;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // First, if there's a config transformation, call it.
                        options = Object.assign(Object.assign({}, options), (_b = (_a = actor[metadataSymbol].config).queryTransform) === null ||
                            _b === void 0
                            ? void 0
                            : _b.call(_a, method.name, args, Object.assign(Object.assign({}, actor[metadataSymbol].config), options)));
                        agent = options.agent ||
                            actor[metadataSymbol].config.agent ||
                            agent_1.getDefaultAgent();
                        cid = options.canisterId || actor[metadataSymbol].config.canisterId;
                        arg = verifyEncode(method.root.lookupType(method.requestType), args);
                        return [4 /*yield*/, agent.query(cid, { methodName: method.name, arg: arg })];
                    case 1:
                        result = _c.sent();
                        switch (result.status) {
                            case "rejected" /* Rejected */:
                                throw new Error("Query failed:\n" +
                                    ("  Status: " + result.status + "\n") +
                                    ("  Message: " + result.reject_message + "\n"));
                            case "replied" /* Replied */:
                                return [2 /*return*/, method.root
                                        .lookupType(method.responseType)
                                        .decode(result.reply.arg)
                                        .toJSON()];
                        }
                        return [2 /*return*/];
                }
            });
        }); };
    }
    else {
        caller = function (options, args) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, agent, _c, canisterId, effectiveCanisterId, pollingStrategyFactory, cid, ecid, arg, _d, requestId, response, pollStrategy, responseBytes, retType;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        // First, if there's a config transformation, call it.
                        options = Object.assign(Object.assign({}, options), (_b = (_a = actor[metadataSymbol].config).callTransform) === null ||
                            _b === void 0
                            ? void 0
                            : _b.call(_a, method.name, args, Object.assign(Object.assign({}, actor[metadataSymbol].config), options)));
                        agent = options.agent ||
                            actor[metadataSymbol].config.agent ||
                            agent_1.getDefaultAgent();
                        _c = Object.assign(Object.assign(Object.assign({}, DEFAULT_ACTOR_CONFIG), actor[metadataSymbol].config), options), canisterId = _c.canisterId, effectiveCanisterId = _c.effectiveCanisterId, pollingStrategyFactory = _c.pollingStrategyFactory;
                        cid = agent_1.Principal.from(canisterId);
                        ecid = effectiveCanisterId !== undefined
                            ? agent_1.Principal.from(effectiveCanisterId)
                            : cid;
                        arg = verifyEncode(method.root.lookupType(method.requestType), args);
                        return [4 /*yield*/, agent.call(cid, {
                                methodName: method.name,
                                arg: arg,
                                effectiveCanisterId: ecid,
                            })];
                    case 1:
                        _d = _e.sent(), requestId = _d.requestId, response = _d.response;
                        if (!response.ok) {
                            throw new Error([
                                "Call failed:",
                                "  Method: " + method.name + "(" + args + ")",
                                "  Canister ID: " + cid,
                                "  Request ID: " + agent_1.toHex(requestId),
                                "  HTTP status code: " + response.status,
                                "  HTTP status text: " + response.statusText,
                            ].join("\n"));
                        }
                        pollStrategy = pollingStrategyFactory();
                        return [4 /*yield*/, agent_1.polling.pollForResponse(agent, ecid, requestId, pollStrategy)];
                    case 2:
                        responseBytes = _e.sent();
                        retType = method.root.lookupType(method.responseType);
                        if (responseBytes !== undefined) {
                            return [2 /*return*/, retType.decode(responseBytes).toJSON()];
                        }
                        else if (!retType) {
                            return [2 /*return*/, undefined];
                        }
                        else {
                            throw new Error("Call was returned undefined, but type [" + retType + "].");
                        }
                        return [2 /*return*/];
                }
            });
        }); };
    }
    var handler = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return caller.apply(void 0, __spreadArray([{}], args));
    };
    handler.withOptions =
        function (options) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return caller.apply(void 0, __spreadArray([options], args));
            };
        };
    return handler;
}
//# sourceMappingURL=index.js.map