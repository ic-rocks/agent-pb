# agent-pb

An extension of [@dfinity/agent](https://www.npmjs.com/package/@dfinity/agent) to support protobufs.

## Services

Service methods should include an `annotation` field set to `query` or `update`.

```protobuf
syntax = "proto3";

import "google/protobuf/empty.proto";
import "google/protobuf/wrappers.proto";

service MyCanister {
  rpc read (google.protobuf.Empty) returns (google.protobuf.UInt64Value) {
    option annotation = query;
  };

  rpc write (google.protobuf.UInt64Value) returns (google.protobuf.Empty) {
    option annotation = update;
  };
}
```

## Usage

First, build protobuf .json files:

```sh
IC_PATH=/ic
npx pbjs -t json -p $IC_PATH/**/*.proto my_canister.proto -o bundle.json --sparse
```

```js
import extendProtobuf from "agent-pb";

const root = protobuf.Root.fromJSON(require("./bundle.json"));
const actor = Actor.createActor(/* regular args */);
extendProtobuf(actor, root.lookupService("MyCanister"));

await actor.read({});
await actor.write(5);
```

A complete example can be found [here](./example/index.js).

## Building

```js
npm run build
```
