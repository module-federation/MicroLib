const cache = require("./remote-entries-cache");

module.exports = [
  {
    name: "microservices",
    url: "https://api.github.com",
    repo: "microlib-example",
    owner: "module-federation",
    filedir: "dist",
    branch: "new-customer",
    path: __dirname,
    type: "model",
    importRemote: async () => import("microservices/models"),
  },
  {
    name: "adapters",
    url: "https://api.github.com",
    repo: "microlib-example",
    owner: "module-federation",
    filedir: "dist",
    branch: "new-customer",
    path: __dirname,
    type: "adapter",
    importRemote: async () => import("microservices/adapters"),
  },
  {
    name: "services",
    url: "https://api.github.com",
    repo: "microlib-example",
    owner: "module-federation",
    filedir: "dist",
    branch: "new-customer",
    path: __dirname,
    type: "service",
    importRemote: async () => import("microservices/services"),
  },
].concat(cache);
