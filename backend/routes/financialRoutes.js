//financeRoutes.js
import express from "express";
import { uploadFinancialData, getRiskAssessment,testUpload } from "../controllers/financialController.js";
import { isAuthorized } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/uploadFinancialData", isAuthorized, uploadFinancialData);
router.get("/getRiskAssessment", isAuthorized, getRiskAssessment);
router.post("/testUpload",isAuthorized,testUpload);

export default router;
