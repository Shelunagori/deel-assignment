const request = require("supertest");
const express = require("express");
const httpStatus = require("http-status");
const contractRoutes = require("../../routes/contract.routes");
const {fetchContractsById, fetchActiveContracts} = require("../../service/contract.service");

jest.mock("../../service/contract.service", () => ({
    fetchContractsById: jest.fn(),
    fetchActiveContracts: jest.fn(),
}));

const app = express();
app.use("/contracts", contractRoutes);

describe("Contract Route Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Authenticate Client/Contractor with contract and valid param", async () => {
        const mockResponse = {
                "id": 1,
                "terms": "bla bla bla",
                "status": "terminated",
                "createdAt": "2024-04-15T11:46:00.099Z",
                "updatedAt": "2024-04-15T11:46:00.099Z",
                "ContractorId": 5,
                "ClientId": 1
        };
        fetchContractsById.mockResolvedValueOnce(mockResponse);
        const res = await request(app)
            .get("/contracts/1")
            .set('profile_id', '5')
            .expect("Content-Type", /json/)
            .expect(httpStatus.OK);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(mockResponse);
    });

    it("Unauthorized Client/Contractor with valid parameter", async () => {
        const unauthorizedResponse = {
            "code": 401,
            "message": "UNAUTHORIZED Profile"
        };

        fetchContractsById.mockResolvedValueOnce(unauthorizedResponse);
        const res = await request(app)
            .get("/contracts/1")
            .set('profile_id', '1000')
            .expect("Content-Type", /json/)
            .expect(httpStatus.UNAUTHORIZED);

        expect(res.body.success).toBe(false);
        expect(res.body.error).toEqual(unauthorizedResponse); 
    });


    it("Fetch contracts with valid param", async () => {
        const mockResponse = [
            {
                "id": 5,
                "terms": "bla bla bla",
                "status": "new",
                "createdAt": "2024-04-15T11:46:00.099Z",
                "updatedAt": "2024-04-15T11:46:00.099Z",
                "ContractorId": 8,
                "ClientId": 3
            },
            {
                "id": 6,
                "terms": "bla bla bla",
                "status": "in_progress",
                "createdAt": "2024-04-15T11:46:00.099Z",
                "updatedAt": "2024-04-15T11:46:00.099Z",
                "ContractorId": 7,
                "ClientId": 3
            }
        ];
        fetchActiveContracts.mockResolvedValueOnce(mockResponse);
        const res = await request(app)
            .get("/contracts")
            .set('profile_id', '3')           
            .expect("Content-Type", /json/)
            .expect(httpStatus.OK);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(mockResponse);
    });    

    it("Missing Client/Contractor ID", async () => {
        const badRequest = {
            "code": 400,
            "message": "Profile ID is missing"
        };

        fetchActiveContracts.mockResolvedValueOnce(badRequest);
        const res = await request(app)
            .get("/contracts")
            .expect("Content-Type", /json/)
            .expect(httpStatus.BAD_REQUEST);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toEqual(badRequest); 
    });
});

