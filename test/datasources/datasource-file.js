"use strict";

var assert = require("assert");
process.env.DATASOURCE_ADAPTER = "DataSourceFile";
const { default: DataSourceFactory } = require("@module-federation/aegis/lib/datasources");

describe("datasources", function () {
    var ds = DataSourceFactory.getDataSource("test");
    ds.load({
        name: "test"
    });
    ds.save(1, "data");
    console.log("record", ds.find(1));
  it("read from file", function () {});
});
