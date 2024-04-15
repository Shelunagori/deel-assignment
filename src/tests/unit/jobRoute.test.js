const request = require("supertest");
const express = require("express");
const httpStatus = require("http-status");
const jobRoutes = require("../../routes/job.routes");

const {unpaidJobs} = require("../../service/job.service");

jest.mock("../../service/job.service", () => ({
    unpaidJobs: jest.fn()
}));

const app = express();
app.use("/jobs", jobRoutes);

describe("Jobs Route Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Fetch unpaid jobs with valid param", async () => {
        const mockResponse = [
            {
                "id": 2,
                "description": "work",
                "price": 201,
                "paid": null,
                "paymentDate": null,
                "createdAt": "2024-04-15T11:46:00.099Z",
                "updatedAt": "2024-04-15T11:46:00.099Z",
                "ContractId": 2,
                "Contract": {
                    "id": 2,
                    "terms": "bla bla bla",
                    "status": "in_progress",
                    "createdAt": "2024-04-15T11:46:00.099Z",
                    "updatedAt": "2024-04-15T11:46:00.099Z",
                    "ContractorId": 6,
                    "ClientId": 1
                }
            }
        ];
        unpaidJobs.mockResolvedValueOnce(mockResponse);
        const res = await request(app)
            .get("/jobs/unpaid")
            .set('profile_id', '1')           
            .expect("Content-Type", /json/)
            .expect(httpStatus.OK);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(mockResponse);
    });


    it("GET Unpaid : Missing Client/Contractor ID", async () => {
        const badRequest = {
            "code": 400,
            "message": "Profile ID is missing"
        };
        unpaidJobs.mockResolvedValueOnce(badRequest);
        const res = await request(app)
            .get("/jobs/unpaid")
            .expect("Content-Type", /json/)
            .expect(httpStatus.BAD_REQUEST);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toEqual(badRequest); 
    });
});