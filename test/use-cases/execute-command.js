var assert = require("assert");
import DataSourceFactory from "@module-federation/aegis/lib/datasources";
import ObserverFactory from "@module-federation/aegis/lib/models/observer";
import ModelFactory from "@module-federation/aegis/lib/models/model-factory";
import checkAcl from "@module-federation/aegis/lib/lib/check-acl";

const {
  default: executeCommand,
} = require("@module-federation/aegis/lib/use-cases/execute-command");

describe("executeCommand()", function () {
  it("should add new model", async function () {
    const spec = {
      modelName: "test",
      endpoint: "tests",
      factory: () => ({ decrypt: () => console.log("decrypted") }),
      commands: {
        decrypt: {
          command: "decrypt",
          acl: "read",
        },
      },
    };

    ModelFactory.registerModel(spec);

    var m = await ModelFactory.createModel(
      ObserverFactory.getInstance(),
      DataSourceFactory.getDataSource("TEST"),
      "TEST",
      [1, 2, 3]
    );
    //checkAcl(spec.commands[query.command].acl, permission)
    console.log(m);
    await executeCommand(ModelFactory, m, { command: "decrypt" }, "*");
  });
});
