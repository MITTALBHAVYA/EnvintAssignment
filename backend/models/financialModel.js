import mongoose from "mongoose";

const financialSchema = new mongoose.Schema({
    company_id: { type: String, required: true },
    company_name: { type: String, required: true },
    reporting_period: { type: String, required: true },
    industry_sector: { type: String, required: true },
    user_id : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
    },
    total_assets: Number,
    total_liabilities: Number,
    revenue: Number,
    net_profit: Number,
    debt_to_equity_ratio: Number,
    cash_flow: Number,
    operating_margin: Number,
    return_on_equity: Number,
    interest_coverage_ratio: Number,
    z_score: Number,
    risk_score: Number
}, { timestamps: true });

financialSchema.index({ company_id: 1, reporting_period: 1 }, { unique: true });

export default mongoose.model("FinancialData", financialSchema);
