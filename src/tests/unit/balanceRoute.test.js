const request = require("supertest");
const express = require("express");
const balanceRoutes = require("../../routes/balance.routes");
const httpStatus = require("http-status");

jest.mock("../../service/balance.service", () => ({
  saveAmount: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/balance", balanceRoutes);

describe("Deposit amount by user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return NOT_FOUND if userId is missing or invalid", async () => {
    await request(app)
      .post("/balance/deposit/")
      .send({ amount: 100 })
      .expect(httpStatus.NOT_FOUND);
  });

  it("should return UNAUTHORIZED if userId is invalid", async () => {
    await request(app)
      .post("/balance/deposit/1234")
      .send({ amount: 100 })
      .expect(httpStatus.UNAUTHORIZED);
  });

  it("should return BAD_REQUEST if amount is missing or invalid", async () => {
    await request(app)
      .post("/balance/deposit/user123")
      .send({})
      .expect(httpStatus.BAD_REQUEST);

    await request(app)
      .post("/balance/deposit/user123")
      .send({ amount: "abc" })
      .expect(httpStatus.BAD_REQUEST);
  });

});
