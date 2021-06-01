import {
  Actor,
  blobFromUint8Array,
  getDefaultAgent,
  polling,
  Principal,
  toHex,
} from "@dfinity/agent";
import protobuf from "protobufjs/light";

export default function extendProtobuf(actor: Actor, pb: protobuf.Service) {
  pb.methodsArray.forEach(
    (method) => (actor[method.name] = _createActorMethod(actor, method))
  );
}

const metadataSymbol = Symbol.for("ic-agent-metadata");
const DEFAULT_ACTOR_CONFIG = {
  pollingStrategyFactory: polling.strategy.defaultStrategy,
};
const verifyEncode = (type: protobuf.Type | null, arg: any) => {
  if (type) {
    const err = type.verify(arg);
    if (err) {
      throw new Error(err);
    }
    return blobFromUint8Array(type.encode(arg).finish());
  } else {
    return Buffer.from([]);
  }
};
function _createActorMethod(actor, method: protobuf.Method) {
  let caller;
  if (method.getOption("annotation") !== "update") {
    caller = async (options, args) => {
      var _a, _b;
      // First, if there's a config transformation, call it.
      options = Object.assign(
        Object.assign({}, options),
        (_b = (_a = actor[metadataSymbol].config).queryTransform) === null ||
          _b === void 0
          ? void 0
          : _b.call(
              _a,
              method.name,
              args,
              Object.assign(
                Object.assign({}, actor[metadataSymbol].config),
                options
              )
            )
      );
      const agent =
        options.agent ||
        actor[metadataSymbol].config.agent ||
        getDefaultAgent();
      const cid = options.canisterId || actor[metadataSymbol].config.canisterId;
      const arg = verifyEncode(
        method.root.lookupType(method.requestType),
        args
      );
      const result = await agent.query(cid, { methodName: method.name, arg });
      switch (result.status) {
        case "rejected" /* Rejected */:
          throw new Error(
            `Query failed:\n` +
              `  Status: ${result.status}\n` +
              `  Message: ${result.reject_message}\n`
          );
        case "replied" /* Replied */:
          return method.root
            .lookupType(method.responseType)
            .decode(result.reply.arg)
            .toJSON();
      }
    };
  } else {
    caller = async (options, args) => {
      var _a, _b;
      // First, if there's a config transformation, call it.
      options = Object.assign(
        Object.assign({}, options),
        (_b = (_a = actor[metadataSymbol].config).callTransform) === null ||
          _b === void 0
          ? void 0
          : _b.call(
              _a,
              method.name,
              args,
              Object.assign(
                Object.assign({}, actor[metadataSymbol].config),
                options
              )
            )
      );
      const agent =
        options.agent ||
        actor[metadataSymbol].config.agent ||
        getDefaultAgent();
      const { canisterId, effectiveCanisterId, pollingStrategyFactory } =
        Object.assign(
          Object.assign(
            Object.assign({}, DEFAULT_ACTOR_CONFIG),
            actor[metadataSymbol].config
          ),
          options
        );
      const cid = Principal.from(canisterId);
      const ecid =
        effectiveCanisterId !== undefined
          ? Principal.from(effectiveCanisterId)
          : cid;
      const arg = verifyEncode(
        method.root.lookupType(method.requestType),
        args
      );
      const { requestId, response } = await agent.call(cid, {
        methodName: method.name,
        arg,
        effectiveCanisterId: ecid,
      });
      if (!response.ok) {
        throw new Error(
          [
            "Call failed:",
            `  Method: ${method.name}(${args})`,
            `  Canister ID: ${cid}`,
            `  Request ID: ${toHex(requestId)}`,
            `  HTTP status code: ${response.status}`,
            `  HTTP status text: ${response.statusText}`,
          ].join("\n")
        );
      }
      const pollStrategy = pollingStrategyFactory();
      const responseBytes = await polling.pollForResponse(
        agent,
        ecid,
        requestId,
        pollStrategy
      );
      const retType = method.root.lookupType(method.responseType);
      if (responseBytes !== undefined) {
        return retType.decode(responseBytes).toJSON();
      } else if (!retType) {
        return undefined;
      } else {
        throw new Error(`Call was returned undefined, but type [${retType}].`);
      }
    };
  }
  const handler = (...args) => caller({}, ...args);
  handler.withOptions =
    (options) =>
    (...args) =>
      caller(options, ...args);
  return handler;
}
