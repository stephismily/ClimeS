const { expect } = require("chai");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

// Load ES module (db.js) using dynamic import
let connectDB;

before(async () => {
  connectDB = (await import("../db.js")).connectDB;
});

describe("MongoDB Connection", function () {
  this.timeout(20000);

  let mongoServer;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should connect to the in-memory MongoDB", async () => {
    const db = await connectDB();
    expect(db).to.be.an("object");
  });
});
