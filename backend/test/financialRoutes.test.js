import request from "supertest";
import app from "../app.js";

describe("Financial Data APIs", () => {
    it("should upload financial data", async () => {
        const res = await request(app)
            .post("/api/v1/financial/uploadFinancialData")
            .send({
                data: [{ company_id: "C99999", reporting_period: "2024-Q1", revenue: 10000 }]
            });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
