const { Actor, HttpAgent, IDL } = require("@dfinity/agent");
const crypto = require("isomorphic-webcrypto");
const fetch = require("node-fetch");
const protobuf = require("protobufjs");
const extendProtobuf = require("../lib").default;
const root = protobuf.Root.fromJSON(require("./bundle.json"));

global.window = global;
global.fetch = fetch;
global.crypto = crypto;

const agent = new HttpAgent({ host: "https://ic0.app" });

const getCycles = async () => {
  const cm = Actor.createActor(() => IDL.Service({}), {
    agent,
    canisterId: "rkp4c-7iaaa-aaaaa-aaaca-cai",
  });
  const cmService = root.lookupService("CyclesMinting");
  extendProtobuf(cm, cmService);

  const totalSupply = await cm.total_cycles_minted({});
  console.log("totalSupply:", totalSupply.value);
};

const showRegistry = async () => {
  const registry = Actor.createActor(() => IDL.Service({}), {
    agent,
    canisterId: "rwlgt-iiaaa-aaaaa-aaaaa-cai",
  });
  extendProtobuf(registry, root.lookupService("Registry"));

  const { deltas } = await registry.get_changes_since({});
  console.log(deltas[0]);
  // console.log(await registry.get_certified_changes_since({ version: 1 }));
  // console.log(
  //   await registry.get_value({
  //     key: "subnet_list",
  //   })
  // );
  console.log(await registry.get_latest_version({}));
  console.log(await registry.get_certified_latest_version({}));
};

getCycles();
showRegistry();
