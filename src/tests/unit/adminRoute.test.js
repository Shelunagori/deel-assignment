const request = require("supertest");
const express = require("express");
const httpStatus = require("http-status");
const adminRoutes = require("../../routes/admin.routes");
const {
  fetchBestProfession,
  fetchHighPayClient,
} = require("../../service/admin.service");

jest.mock("../../service/admin.service", () => ({
  fetchBestProfession: jest.fn(),
  fetchHighPayClient: jest.fn(),
}));

const app = express();
app.use("/admin", adminRoutes);

describe("Admin Route Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 error if start date is missing", async () => {
    const res = await request(app)
      .get("/admin/best-profession?end=2024-04-15")
      .expect("Content-Type", /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(res.body.errors[0].msg).toBe("Start date is required");
  });

  it("should return 400 error if end date is missing", async () => {
    const res = await request(app)
      .get("/admin/best-profession?start=2018-01-01")
      .expect("Content-Type", /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(res.body.errors[0].msg).toBe("End date is required");
  });

  it("should return empty data with valid date params", async () => {
    const mockResponse = [];
    fetchBestProfession.mockResolvedValueOnce(mockResponse);
    const res = await request(app)
      .get("/admin/best-profession?start=2024-01-01&end=2024-04-15")
      .expect("Content-Type", /json/)
      .expect(httpStatus.OK);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockResponse);
  });

  it("should return the best profession with valid date params", async () => {
    const mockResponse = [
      {
        profession: "Programmer",
        earned: 2683,
      },
    ];
    fetchBestProfession.mockResolvedValueOnce(mockResponse);
    const res = await request(app)
      .get("/admin/best-profession?start=2018-01-01&end=2024-04-30")
      .expect("Content-Type", /json/)
      .expect(httpStatus.OK);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockResponse);
  });

  it("best client should return 400 error if start date is missing", async () => {
    const res = await request(app)
      .get("/admin/best-clients?end=2024-04-15")
      .expect("Content-Type", /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(res.body.errors[0].msg).toBe("Start date is required");
  });

  it("best client should return 400 error if end date is missing", async () => {
    const res = await request(app)
      .get("/admin/best-clients?start=2018-01-01")
      .expect("Content-Type", /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(res.body.errors[0].msg).toBe("End date is required");
  });

  it("best client should return empty high paying client data with valid date params", async () => {
    const mockResponse = [];
    fetchHighPayClient.mockResolvedValueOnce(mockResponse);
    const res = await request(app)
      .get("/admin/best-clients?start=2024-01-01&end=2024-04-15")
      .expect("Content-Type", /json/)
      .expect(httpStatus.OK);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockResponse);
  });

  it("best client should return high paying client with valid date params", async () => {
    const mockResponse = [
      {
        id: 1,
        fullName: "Harry Potter",
        paid: 442,
      },
    ];
    fetchHighPayClient.mockResolvedValueOnce(mockResponse);
    const res = await request(app)
      .get("/admin/best-clients?start=2018-01-01&end=2024-04-30")
      .expect("Content-Type", /json/)
      .expect(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockResponse);
  });
});
