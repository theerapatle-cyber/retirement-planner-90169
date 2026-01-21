import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/NumericInput";
import { formatNumber, formatNumber2, formatInputDisplay } from "@/lib/utils";
import { Plus, X as CloseIcon, ChevronDown, Check } from "lucide-react";
import { ExpenseChart } from "./DashboardCharts";
import { PensionTiersManager } from "./PensionTiersManager";
import { FormState, InsurancePlan, CalculationResult, MonteCarloResult, RetirementInputs } from "@/types/retirement";

// --- Props Interfaces ---

interface InsuranceTableModalProps {
    show: boolean;
    onClose: () => void;
    form: FormState;
    addInsurancePlan: () => void;
    removeInsurancePlan: (id: string) => void;
    updateInsurancePlan: (index: number, field: keyof InsurancePlan, value: any) => void;
    updateSurrenderTable: (planIndex: number, age: number, value: string) => void;
}

interface ProjectedModalProps {
    show: boolean;
    onClose: () => void;
    form: FormState;
    result: CalculationResult;
    initialTab?: "details" | "formula";
}

interface TargetModalProps {
    show: boolean;
    onClose: () => void;
    result: CalculationResult;
    form: FormState;
}

interface ExpenseModalProps {
    show: boolean;
    onClose: () => void;
    form: FormState;
    result: CalculationResult;
    initialTab?: "details" | "formula";
}

interface MonteCarloDetailsModalProps {
    show: boolean;
    onClose: () => void;
    mcResult: MonteCarloResult;
    mcSimulations: number;
}

// --- Hooks ---

export const useInsuranceLogic = (form: FormState) => {
    const calculateDeathBenefitAtAge = React.useCallback((plan: InsurancePlan, age: number) => {
        const sumAssured = Number(String(plan.sumAssured || 0).replace(/,/g, ""));
        const coverageAge = Number(plan.coverageAge);
        if (age > coverageAge) return 0;
        if (plan.useSurrender && plan.surrenderAge && age > Number(plan.surrenderAge)) return 0;
        if (plan.type === "บำนาญ") {
            const dbPre = Number(String(plan.deathBenefitPrePension || 0).replace(/,/g, ""));
            let currentDB = sumAssured;
            if (age < Number(plan.pensionStartAge) && dbPre > 0) currentDB = dbPre;
            let accumulatedPension = 0;
            let startAge = Number(plan.pensionStartAge);
            if (plan.unequalPension && plan.pensionTiers?.length > 0) {
                const minTierStart = Math.min(...plan.pensionTiers.map(t => Number(t.startAge)));
                startAge = minTierStart;
            }
            if (age >= startAge) {
                for (let pastAge = startAge; pastAge < age; pastAge++) {
                    let pastAmount = 0;
                    if (plan.unequalPension && plan.pensionTiers) {
                        const tier = plan.pensionTiers.find(t => pastAge >= Number(t.startAge) && pastAge <= Number(t.endAge));
                        pastAmount = tier ? Number(String(tier.amount || 0).replace(/,/g, "")) : 0;
                    } else {
                        if (pastAge >= Number(plan.pensionStartAge) && pastAge <= (Number(plan.pensionEndAge) || 100)) {
                            let pAmt = Number(String(plan.pensionAmount || 0).replace(/,/g, ""));
                            if (Number(plan.pensionPercent) > 0) pAmt = (sumAssured * Number(plan.pensionPercent)) / 100;
                            pastAmount = pAmt;
                        }
                    }
                    accumulatedPension += pastAmount;
                }
                currentDB = Math.max(0, currentDB - accumulatedPension);
            }
            return currentDB;
        }
        return sumAssured;
    }, []);

    const insuranceChartData = React.useMemo(() => {
        if (!form.insurancePlans || form.insurancePlans.length === 0) return null;
        const currentAge = Number(String(form.currentAge || 0).replace(/,/g, ""));
        let maxAge = Number(String(form.lifeExpectancy || 85).replace(/,/g, ""));
        form.insurancePlans.forEach(p => {
            if (p.active) maxAge = Math.max(maxAge, Number(p.coverageAge));
        });
        const endAge = maxAge;
        const labels: number[] = [];
        const deathBenefit: number[] = [];
        const cashFlow: number[] = [];
        const cashValue: (number | null)[] = [];
        for (let age = currentAge; age <= endAge; age++) {
            labels.push(age);
            let totalDeathBenefit = 0;
            let totalFlow = 0;
            let totalCashValue = 0;
            let hasCashValue = false;
            form.insurancePlans.forEach(plan => {
                if (!plan.active) return;
                totalDeathBenefit += calculateDeathBenefitAtAge(plan, age);
                if (plan.type === "สะสมทรัพย์") {
                    const maturity = Number(String(plan.maturityAmount || 0).replace(/,/g, ""));
                    const cashBack = Number(String(plan.cashBackAmount || 0).replace(/,/g, ""));
                    const freq = Number(plan.cashBackFrequency) || 1;
                    const coverageAge = Number(plan.coverageAge);
                    if (age === coverageAge) totalFlow += maturity;
                    const policyYear = age - currentAge;
                    if (policyYear > 0 && policyYear % freq === 0 && age <= coverageAge) totalFlow += cashBack;
                }
                if (plan.type === "บำนาญ") {
                    const sumAssured = Number(String(plan.sumAssured || 0).replace(/,/g, ""));
                    if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                        for (const tier of plan.pensionTiers) {
                            if (age >= Number(tier.startAge) && age <= Number(tier.endAge)) {
                                totalFlow += Number(String(tier.amount || 0).replace(/,/g, ""));
                            }
                        }
                    } else {
                        const percent = Number(plan.pensionPercent);
                        let pension = Number(String(plan.pensionAmount || 0).replace(/,/g, ""));
                        if (percent > 0) pension = (sumAssured * percent) / 100;
                        const start = Number(plan.pensionStartAge);
                        const end = Number(plan.pensionEndAge) || 100;
                        if (age >= start && age <= end) totalFlow += pension;
                    }
                }
                if (plan.useSurrender && plan.surrenderAge && age === Number(plan.surrenderAge)) {
                    const sv = Number(String(plan.surrenderValue || 0).replace(/,/g, ""));
                    totalCashValue += sv;
                    hasCashValue = true;
                    // Add surrender value to total cash flow so it shows in the tooltip
                    totalFlow += sv;
                }
            });
            deathBenefit.push(totalDeathBenefit);
            cashFlow.push(totalFlow);
            cashValue.push(hasCashValue ? totalCashValue : null);
        }
        return {
            labels,
            datasets: [
                { label: "ผลประโยชน์กรณีเสียชีวิต", data: deathBenefit, borderColor: "#2970FF", backgroundColor: "rgba(41, 112, 255, 0.1)", fill: true, tension: 0.3, order: 2 },
                { label: "เงินคืน / บำนาญ", data: cashFlow, borderColor: "#00B5A3", backgroundColor: "rgba(0, 181, 163, 0.5)", type: "bar" as const, barThickness: 8, borderRadius: 4, order: 1 },
                { label: "มูลค่าเวนคืน", data: cashValue, borderColor: "#FF9900", backgroundColor: "#FF9900", pointRadius: 6, pointHoverRadius: 8, showLine: false, order: 0 },
            ],
        };
    }, [form, calculateDeathBenefitAtAge]);

    return { insuranceChartData, calculateDeathBenefitAtAge };
};

// --- Components ---

export const InsuranceTableModal: React.FC<InsuranceTableModalProps> = ({
    show, onClose, form, updateSurrenderTable
}) => {
    if (!show) return null;

    // Use selected plan if available, otherwise show all active plans
    const targetPlans = form.selectedPlanId
        ? form.insurancePlans.filter(p => p.id === form.selectedPlanId)
        : form.insurancePlans;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in transition-all duration-300">
            <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20 shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">
                            {targetPlans.length === 1 ? targetPlans[0].planName : "รายละเอียดแผนประกันทั้งหมด (All Plans)"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">โปรดตรวจสอบรายละเอียดความคุ้มครองและตารางเวนคืน (แยกตามแผน)</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content: List of Tables */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50 space-y-8">
                    {targetPlans.map((plan) => (
                        <div key={plan.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            {/* Plan Header */}
                            {targetPlans.length > 1 && (
                                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                    <span className="font-bold text-slate-800 text-sm">{plan.planName}</span>
                                    <span className="text-[10px] text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full">{plan.type}</span>
                                </div>
                            )}

                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-[#F8F9FA] border-b border-slate-200 text-slate-700 font-bold text-xs sticky top-0 z-10">
                                    <tr>
                                        <th className="py-3 px-4 text-left w-[10%]">อายุ</th>
                                        <th className="py-3 px-4 text-right w-[25%]">{plan.surrenderMode === 'table' ? 'มูลค่าเวนคืน (แก้ไขได้)' : 'กระแสเงินสดไหลเข้า'}</th>
                                        <th className="py-3 px-4 text-right w-[25%]">ผลประโยชน์เมื่อเสียชีวิต</th>
                                        <th className="py-3 px-4 text-left pl-8 w-[20%]">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {Array.from({ length: 100 - Number(form.currentAge || 0) + 1 }, (_, i) => Number(form.currentAge || 0) + i).map(age => {
                                        // Calculations for SINGLE Plan
                                        const sumAssured = Number(String(plan.sumAssured || 0).replace(/,/g, ""));
                                        const coverageAge = Number(plan.coverageAge);
                                        const surrenderAge = Number(plan.surrenderAge);
                                        const useSurrender = plan.useSurrender && plan.type !== "ชั่วระยะเวลา";

                                        const planIsSurrenderYear = useSurrender && age === surrenderAge;
                                        const planIsAfterSurrender = useSurrender && age > surrenderAge;
                                        const planIsWithinCoverage = age <= coverageAge;

                                        let isSurrenderYear = false;
                                        let hasActiveCoverage = false;
                                        let isMaturityYear = false;

                                        if (planIsSurrenderYear) isSurrenderYear = true;
                                        if (planIsWithinCoverage && !planIsAfterSurrender) hasActiveCoverage = true;
                                        if (age === coverageAge && plan.type === "สะสมทรัพย์" && !planIsAfterSurrender) isMaturityYear = true;

                                        let flow = 0;
                                        let db = 0;
                                        let sv = 0;

                                        // Surrender Value Logic
                                        let rawSv = Number(String(plan.surrenderValue || 0).replace(/,/g, ""));
                                        if (plan.surrenderMode === "table" && plan.surrenderTableData) {
                                            const row = plan.surrenderTableData.find(d => d.age === age);
                                            if (row) rawSv = Number(String(row.amount || 0).replace(/,/g, ""));
                                        }
                                        sv = rawSv;

                                        // Cash Inflow Logic
                                        if (planIsSurrenderYear) {
                                            flow += sv;
                                        } else if (!planIsAfterSurrender && planIsWithinCoverage) {
                                            if (plan.type === "สะสมทรัพย์") {
                                                const maturity = Number(String(plan.maturityAmount || 0).replace(/,/g, ""));
                                                const cashBack = Number(String(plan.cashBackAmount || 0).replace(/,/g, ""));
                                                const freq = Number(plan.cashBackFrequency) || 1;
                                                const policyYear = age - Number(form.currentAge || 0);
                                                if (age === coverageAge) flow += maturity;
                                                if (policyYear > 0 && policyYear % freq === 0 && age < coverageAge) flow += cashBack;
                                            }
                                            if (plan.type === "บำนาญ") {
                                                // Calculate Current Year Pension
                                                let pAmt = Number(String(plan.pensionAmount || 0).replace(/,/g, ""));
                                                if (Number(plan.pensionPercent) > 0) pAmt = (sumAssured * Number(plan.pensionPercent)) / 100;
                                                if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                                                    const tier = plan.pensionTiers.find(t => age >= Number(t.startAge) && age <= Number(t.endAge));
                                                    if (tier) pAmt = Number(String(tier.amount || 0).replace(/,/g, ""));
                                                    else pAmt = 0;
                                                }

                                                if (age >= Number(plan.pensionStartAge) && age <= (Number(plan.pensionEndAge) || 100)) {
                                                    flow += pAmt;
                                                }
                                            }
                                        }

                                        // Death Benefit Logic
                                        if (!planIsAfterSurrender && planIsWithinCoverage) {
                                            db += sumAssured;
                                            if (plan.type === "บำนาญ") {
                                                if (age < Number(plan.pensionStartAge)) {
                                                    // Before pension starts: Use Pre-Pension DB if available, else Sum Assured
                                                    const prePensionDB = Number(String(plan.deathBenefitPrePension || 0).replace(/,/g, ""));
                                                    db = prePensionDB > 0 ? prePensionDB : sumAssured;
                                                } else {
                                                    // After pension starts: Reducing DB
                                                    // Calculate Cumulative Pension Received UP TO Last Year
                                                    let cumulativePension = 0;
                                                    const startAge = Number(plan.pensionStartAge);
                                                    for (let a = startAge; a < age; a++) {
                                                        let histAmt = Number(String(plan.pensionAmount || 0).replace(/,/g, ""));
                                                        if (Number(plan.pensionPercent) > 0) histAmt = (sumAssured * Number(plan.pensionPercent)) / 100;
                                                        if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                                                            const tier = plan.pensionTiers.find(t => a >= Number(t.startAge) && a <= Number(t.endAge));
                                                            if (tier) histAmt = Number(String(tier.amount || 0).replace(/,/g, ""));
                                                            else histAmt = 0;
                                                        }
                                                        cumulativePension += histAmt;
                                                    }

                                                    // Base DB for reduction
                                                    const baseDB = Number(String(plan.deathBenefitPrePension || 0).replace(/,/g, "")) || sumAssured;
                                                    db = Math.max(0, baseDB - cumulativePension);
                                                }
                                            }
                                        }

                                        // Status & Styling Logic
                                        // Removed exclusion for Pension plans so they can be Red too
                                        const isDeathRow = age === coverageAge && !useSurrender;
                                        const isPostDeathRow = age > coverageAge;

                                        let statusText = "-";
                                        if (isSurrenderYear) statusText = "เวนคืนกรมธรรม์";
                                        else if (isDeathRow) statusText = `เสียชีวิตที่อายุ ${age} → ได้รับเงินประกัน ${formatNumber(db)}`;
                                        else if (hasActiveCoverage) {
                                            statusText = "คุ้มครอง";
                                            if (plan.type === "บำนาญ" && age >= Number(plan.pensionStartAge)) {
                                                statusText = "เงินบำนาญ | คุ้มครอง";
                                            }
                                        }
                                        else if (isMaturityYear) statusText = "ครบสัญญา";
                                        else if (isPostDeathRow) statusText = "ตายแล้ว";
                                        else if (useSurrender && age > surrenderAge) statusText = "เวนคืนไปแล้ว";

                                        // Editable State
                                        const pIndex = form.insurancePlans.findIndex(p => p.id === plan.id);
                                        const isEditable = plan.surrenderMode === 'table';
                                        const svTableVal = isEditable ? (plan.surrenderTableData?.find(d => d.age === age)?.amount || "") : "";

                                        return (
                                            <tr key={age} className={`group transition-colors border-b border-slate-50 
                                                ${isDeathRow ? "bg-rose-100 hover:bg-rose-200" :
                                                    isSurrenderYear ? "bg-amber-50 hover:bg-amber-100" :
                                                        hasActiveCoverage ? "bg-emerald-50 hover:bg-emerald-100" :
                                                            "hover:bg-slate-50"}`}>
                                                <td className={`py-3 px-4 text-left relative font-bold ${isDeathRow ? 'text-rose-900' : 'text-slate-600'}`}>{age}</td>
                                                <td className="py-3 px-4 text-right">
                                                    {(isEditable) ? (
                                                        <input
                                                            className="w-full text-right bg-blue-50/50 border-b border-blue-200 focus:outline-none focus:border-blue-500 text-sm py-1.5 px-2 rounded text-blue-700 font-mono font-bold"
                                                            placeholder="-"
                                                            value={svTableVal}
                                                            onChange={(e) => updateSurrenderTable(pIndex, age, e.target.value)}
                                                            onBlur={(e) => updateSurrenderTable(pIndex, age, formatInputDisplay(e.target.value))}
                                                        />
                                                    ) : (
                                                        <span className={flow > 0 ? "text-emerald-600 font-bold" : "text-slate-400 font-medium"}>
                                                            {flow > 0 ? `+${formatNumber(flow)}` : "-"}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-slate-800 tabular-nums">
                                                    <span className={db > 0 ? (isDeathRow ? "text-rose-700 font-black" : "text-slate-900") : "text-slate-300"}>
                                                        {db > 0 ? formatNumber(db) : "-"}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 pl-8 text-left">
                                                    <span className={`text-[12px] font-medium ${isDeathRow ? 'text-rose-900 font-bold' : isPostDeathRow ? 'text-slate-400' : 'text-slate-600'}`}>
                                                        {statusText}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ))}

                    {targetPlans.length === 0 && (
                        <div className="p-8 text-center text-slate-400">
                            ไม่พบแผนประกันที่เลือก
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ProjectedModal: React.FC<ProjectedModalProps> = ({ show, onClose, form, result, initialTab = "details" }) => {
    const [tab, setTab] = React.useState<"details" | "formula">(initialTab);

    React.useEffect(() => {
        if (show) {
            setTab(initialTab);
        }
    }, [show, initialTab]);

    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 transition-all duration-500">
            <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-black/5">
                <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-emerald-100/50 flex items-center justify-center text-emerald-600 text-lg">💰</span> ที่มาของเงินออม (Projected Savings)</h3>
                        <p className="text-sm text-slate-500 mt-1 ml-10">วิเคราะห์องค์ประกอบของเงินออมในอนาคต</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
                    <div className="flex gap-2 p-1.5 bg-white/80 backdrop-blur border border-slate-200/60 rounded-2xl mx-8 mt-6 mb-4 shadow-sm sticky top-0 z-10">
                        <button className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${tab === 'details' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setTab('details')}>รายละเอียด (Details)</button>
                        <button className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${tab === 'formula' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setTab('formula')}>สูตรคำนวณ (Formula)</button>
                    </div>
                    <div className="px-8 pb-8 pt-2">
                        {tab === "details" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-4">
                                    {["เริ่มต้นจากเงินสะสมที่มีอยู่ในปัจจุบัน", "คำนวณผลตอบแทนจากเงินสะสมทั้งหมดของปีนั้น (ผลตอบแทนเฉลี่ยต่อปี)", "เพิ่มเงินออมประจำปีเข้าไปในยอดสะสม", "หากมีเงินเพิ่มเติมจากแหล่งอื่น เช่น เงินคืนประกัน ก็จะนำมาบวกกับยอดสะสมของปีนั้นด้วย", "ทำซ้ำขั้นตอน 2–4 สำหรับทุกปีจนถึงปีเกษียณ → จะได้ยอดสะสมสุดท้าย"].map((step, idx) => (
                                        <div key={idx} className="flex gap-4 text-sm text-slate-600 group">
                                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs shadow-sm ring-1 ring-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors">{idx + 1}</div>
                                            <div className="pt-1.5 leading-relaxed font-medium">{step}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 border border-amber-100/50 flex gap-4 items-start shadow-sm">
                                    <span className="text-amber-500 text-2xl mt-0.5">💡</span>
                                    <div className="text-sm text-slate-700 pt-1"><span className="font-bold text-slate-900 block mb-1 text-base">สรุป:</span>(เงินต้น + บวกดอกเบี้ย) + เงินออมใหม่ + เงินพิเศษ ทำซ้ำทุกปีจนถึงเกษียณ</div>
                                </div>
                            </div>
                        )}
                        {tab === "formula" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-4">
                                    <div className="text-base font-bold text-slate-900 flex items-center gap-2"><span className="w-1 h-6 bg-indigo-500 rounded-full"></span> สูตรมูลค่าเงินในอนาคต (Future Value)</div>
                                    <p className="text-sm text-slate-500 leading-relaxed pl-3 border-l-2 border-slate-100">คำนวณโดยนำเงิน 2 ส่วนมารวมกัน: <br /> 1. <b>เงินก้อนเดิม</b> ที่เติบโตขึ้นตามผลตอบแทน <br /> 2. <b>เงินออมใหม่</b> ที่เติมเข้ามาทุกปีพร้อมผลตอบแทน</p>
                                    <div className="rounded-2xl bg-slate-900 p-6 overflow-x-auto shadow-inner relative group"><div className="absolute top-3 right-3 text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">Math</div><div className="font-mono text-sm text-emerald-400 whitespace-nowrap">FV = [P₀ × (1 + r)ⁿ] + [PMT × ((1 + r)ⁿ - 1) / r] + Others</div></div>
                                </div>
                                <div className="space-y-4 pt-4">
                                    <div className="text-sm font-bold text-slate-900">ตัวอย่างการคำนวณจริง (Live Calculation):</div>
                                    <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-6 shadow-sm">
                                        <div className="relative pl-4 border-l-2 border-indigo-100"><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ส่วนที่ 1: เงินก้อนเดิมเติบโต</div><div className="font-mono text-xs text-slate-600 break-all bg-slate-50 p-2 rounded-lg">= {formatNumber(form.currentSavings)} × (1 + {Number(form.expectedReturn) / 100})^{result.yearsToRetire}</div><div className="font-mono text-base font-bold text-indigo-600 mt-2">= ฿ {formatNumber(result.fvLumpSum)}</div></div>
                                        <div className="relative pl-4 border-l-2 border-purple-100"><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ส่วนที่ 2: เงินออมใหม่เติบโต</div><div className="font-mono text-xs text-slate-600 break-all bg-slate-50 p-2 rounded-lg">= ({formatNumber(form.monthlySaving)} × 12) × ((1 + {Number(form.expectedReturn) / 100})^{result.yearsToRetire} - 1) / {Number(form.expectedReturn) / 100}</div><div className="font-mono text-base font-bold text-purple-600 mt-2">= ฿ {formatNumber(result.fvAnnuity)}</div></div>
                                        {result.insuranceCashInflow > 0 && (<div className="relative pl-4 border-l-2 border-emerald-100"><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ส่วนที่ 3: เงินคืนจากประกัน</div><div className="font-mono text-base font-bold text-emerald-600 mt-2">+ ฿ {formatNumber(result.insuranceCashInflow)}</div></div>)}
                                        <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-end"><div className="text-sm font-bold text-slate-900">รวมเงินออมทั้งหมด (Total FV)</div><div className="font-mono text-2xl font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">฿ {formatNumber(result.projectedFund)}</div></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TargetModalProps {
    show: boolean;
    onClose: () => void;
    result: CalculationResult;
    form: FormState;
    initialTab?: "details" | "formula";
}

export const TargetModal: React.FC<TargetModalProps> = ({ show, onClose, result, form, initialTab = "details" }) => {
    const [tab, setTab] = React.useState<"details" | "formula">(initialTab);

    // Reset tab when modal opens/changes initialTab
    React.useEffect(() => {
        if (show) {
            setTab(initialTab);
        }
    }, [show, initialTab]);

    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 transition-all duration-500">
            <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-black/5">
                <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">เงินที่ต้องการก่อนเกษียณ</h3>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
                    <div className="flex gap-2 p-1.5 bg-white/80 backdrop-blur border border-slate-200/60 rounded-2xl mx-8 mt-6 mb-4 shadow-sm sticky top-0 z-10">
                        <button className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${tab === 'details' ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setTab('details')}>รายละเอียด (Details)</button>
                        <button className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${tab === 'formula' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setTab('formula')}>สูตรคำนวณ (Formula)</button>
                    </div>
                    <div className="px-8 pb-8 pt-2">
                        {tab === "details" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <p className="text-sm text-slate-600 leading-relaxed bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                                    เป็นจำนวนเงินทั้งหมดที่ต้องเตรียมก่อนเกษียณ เพื่อให้ครอบคลุมค่าใช้จ่ายในช่วงเกษียณ จนถึงเงินมรดกที่ต้องมี (ถ้ามีประกันชีวิตจะครอบคลุมส่วนนี้)
                                </p>
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-4">
                                    <div className="text-base font-bold text-slate-900">ขั้นตอนการคำนวณ:</div>
                                    <ol className="list-decimal list-inside space-y-3 text-sm text-slate-700 font-medium pl-2">
                                        <li className="pl-2">รวมค่าใช้จ่ายสุทธิรายปี (หลังหักรายได้หลังเกษียณ หรือผลตอบแทนหลังเกษียณ) ของทุกปี</li>
                                        <li className="pl-2">หักเงินที่คาดว่าจะได้รับจากสิทธิประโยชน์อื่น ๆ เช่น เงินประกันชีวิต หรือเงินมรดก</li>
                                    </ol>
                                    <div className="mt-4 pt-4 border-t border-slate-100 text-sm font-bold text-slate-900">
                                        ผลรวมค่าใช้จ่ายสุทธิในช่วงเกษียณ + เงินมรดกที่ยังขาด
                                    </div>
                                </div>
                            </div>
                        )}
                        {tab === "formula" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-6">
                                    {/* Original Theory Section */}
                                    <div className="space-y-4 border-b border-slate-100 pb-6">
                                        <div className="text-lg font-bold text-slate-900">สูตรออมขั้นต่ำ</div>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            หากเราต้องการรู้ว่า “จะต้องเก็บเงินเท่าไหร่” หรือ “เงินจะโตเป็นเท่าไหร่” ในอนาคตเมื่อมีผลตอบแทนเฉลี่ยต่อปี เราจะใช้แนวคิดของ <b>ดอกเบี้ยทบต้น (Compound Interest)</b> เพื่อหาค่า <b>มูลค่าในอนาคต (Future Value)</b>
                                        </p>

                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-indigo-500">📘</span>
                                                <span className="font-bold text-slate-900 text-sm">สูตรทั่วไป:</span>
                                            </div>
                                            <div className="font-mono text-sm text-slate-800 text-center py-2 overflow-x-auto">
                                                FV = P₀ × (1 + r)ⁿ + P × ((1 + r)ⁿ - 1) / r
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm font-bold text-slate-900">โดยที่:</div>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 pl-2">
                                                <li><b>FV</b> = มูลค่าในอนาคต (Future Value)</li>
                                                <li><b>P₀</b> = เงินเริ่มต้นที่มีอยู่ตอนนี้</li>
                                                <li><b>P</b> = เงินที่ออมเพิ่มในแต่ละปี</li>
                                                <li><b>r</b> = ผลตอบแทนต่อปี (เช่น 5% = 0.05)</li>
                                                <li><b>n</b> = จำนวนปีที่ลงทุนหรือออม</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* New Live Calculation Section */}
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-emerald-500 font-bold text-lg">💡</span>
                                            <div className="text-lg font-bold text-slate-900">แทนค่าจากแผนของคุณ</div>
                                        </div>

                                        {/* Real Data Variables */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                            <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-2">
                                                <span className="text-indigo-500">📝</span>
                                                <span className="font-bold text-slate-900 text-sm">ตัวแปรของคุณ:</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                <div className="flex justify-between"><span className="text-slate-500">เงินต้น (P₀)</span> <span className="font-bold font-mono text-slate-700">฿{formatNumber(form.currentSavings)}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-500">ผลตอบแทน (r)</span> <span className="font-bold font-mono text-slate-700">{form.expectedReturn}%</span></div>
                                                <div className="flex justify-between"><span className="text-slate-500">ระยะเวลา (n)</span> <span className="font-bold font-mono text-slate-700">{result.yearsToRetire} ปี</span></div>
                                                <div className="flex justify-between"><span className="text-slate-500">เป้าหมาย (FV)</span> <span className="font-bold font-mono text-blue-600">฿{formatNumber(result.targetFund)}</span></div>
                                            </div>
                                        </div>

                                        {/* Substitution View */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-500">🔢</span>
                                                <span className="font-bold text-slate-900 text-sm">แทนค่าในสูตร:</span>
                                            </div>

                                            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-inner overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed">
                                                <div className="mb-2 text-slate-400 opacity-70">
                                                    FV = P₀(1+r)ⁿ + PMT [((1+r)ⁿ - 1) / r]
                                                </div>
                                                <div className="text-emerald-300 whitespace-nowrap">
                                                    {formatNumber(result.targetFund)} = {formatNumber(form.currentSavings)}(1+{Number(form.expectedReturn) / 100})^{result.yearsToRetire} + <span className="text-yellow-300 font-bold">PMT</span> [((1+{Number(form.expectedReturn) / 100})^{result.yearsToRetire} - 1) / {Number(form.expectedReturn) / 100}]
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-500 leading-relaxed pl-2 bg-blue-50 border border-blue-100 p-3 rounded-xl">
                                                <span className="font-bold text-blue-600">PMT คือสิ่งที่เราหา:</span> เมื่อย้ายข้างสมการ จะได้ยอดเงินที่ต้องออมเพิ่มต่อปี (และหาร 12 เป็นต่อเดือน)
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                                <span className="text-sm font-bold text-emerald-800">สรุปต้องออมเพิ่ม (PMT):</span>
                                                <div className="text-right">
                                                    <div className="text-xl font-black text-emerald-600">฿{formatNumber(result.monthlyNeeded)}</div>
                                                    <div className="text-[10px] text-emerald-500 font-bold">ต่อเดือน</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ show, onClose, form, result, initialTab = "details" }) => {
    const [tab, setTab] = React.useState<"details" | "formula">(initialTab);

    React.useEffect(() => {
        if (show) {
            setTab(initialTab);
        }
    }, [show, initialTab]);

    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 transition-all duration-500">
            <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-black/5">
                <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-purple-100/50 flex items-center justify-center text-purple-600 text-lg">💸</span> ค่าใช้จ่ายหลังเกษียณ (Future Expense)</h3>
                        <p className="text-sm text-slate-500 mt-1 ml-10">ประมาณการเงินเฟ้อ ({form.inflation}%) และค่าครองชีพ</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
                    <div className="flex gap-2 p-1.5 bg-white/80 backdrop-blur border border-slate-200/60 rounded-2xl mx-8 mt-6 mb-4 shadow-sm sticky top-0 z-10">
                        <button className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${tab === 'details' ? 'bg-purple-500 text-white shadow-md shadow-purple-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setTab('details')}>รายละเอียด (Details)</button>
                        <button className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${tab === 'formula' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setTab('formula')}>สูตรคำนวณ (Formula)</button>
                    </div>
                    <div className="px-8 pb-8 pt-2">
                        {tab === "details" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="h-[260px] w-full rounded-3xl border border-slate-100 p-6 bg-white shadow-sm flex flex-col">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">กราฟค่าใช้จ่ายสะสม</h4>
                                    <div className="flex-1 min-h-0">
                                        <ExpenseChart result={result} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-base font-bold text-slate-900 flex items-center gap-2"><span className="w-1 h-5 bg-purple-500 rounded-full"></span> ตารางค่าใช้จ่ายรายปี (จนถึงอายุขัย)</div>
                                    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="p-4 w-[15%]">อายุ (ปี)</th>
                                                    <th className="p-4 text-right w-[25%]">เงินต้น (วันนี้)</th>
                                                    <th className="p-4 text-right w-[30%]">รายเดือน (อนาคต)</th>
                                                    <th className="p-4 text-right w-[30%]">รายปี (อนาคต)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {result.expenseSchedule.map((row, idx) => {
                                                    const inflation = Number(form.inflation) / 100;
                                                    const yearsPassed = row.age - Number(form.currentAge);
                                                    const pv = row.monthly / Math.pow(1 + inflation, yearsPassed);

                                                    return (
                                                        <tr key={row.age} className={`hover:bg-purple-50/30 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                                                            <td className="p-4 text-slate-800 font-bold">{row.age}</td>
                                                            <td className="p-4 text-right font-medium text-slate-500">฿{formatNumber(pv)}</td>
                                                            <td className="p-4 text-right font-medium text-purple-600">฿{formatNumber(row.monthly)}</td>
                                                            <td className="p-4 text-right text-slate-600">฿{formatNumber(row.yearly)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot className="bg-slate-900 text-white font-semibold">
                                                <tr>
                                                    <td className="p-4 rounded-bl-xl">รวมทั้งหมดตลอดอายุขัย</td>
                                                    <td className="p-4 text-right text-slate-400">-</td>
                                                    <td className="p-4 text-right text-slate-400">-</td>
                                                    <td className="p-4 text-right text-purple-300 text-lg rounded-br-xl">฿{formatNumber(result.totalLifetimeExpense)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {tab === "formula" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-4">
                                    <div className="text-lg font-bold text-slate-900">ค่าใช้จ่ายเดือนแรกที่เกษียณ</div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        คำนวณจาก:
                                    </p>
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                                        <div className="font-mono text-sm text-slate-800 leading-relaxed">
                                            ค่าใช้จ่ายปีเกษียณ = ค่าใช้จ่ายปัจจุบัน × (1 + อัตราเงินเฟ้อ) ^ จำนวนปีกว่าจะเกษียณ
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed pl-2">
                                        ปรับค่าใช้จ่ายปัจจุบันตามเงินเฟ้อไปจนถึงปีที่เกษียณ
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-3xl p-6 border border-purple-100 space-y-3">
                                    <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">ตัวอย่างวันนี้ vs วันเกษียณ</h4>
                                    <div className="flex items-center justify-between text-sm"><span className="text-slate-600">ค่าใช้จ่ายวันนี้ (บาท/เดือน)</span><span className="font-bold text-slate-900">{formatNumber(form.retireExtraExpense)}</span></div>
                                    <div className="w-full h-px bg-purple-200"></div>
                                    <div className="flex items-center justify-between text-base"><span className="text-purple-800 font-bold">ค่าใช้จ่ายวันเกษียณ (บาท/เดือน)</span><span className="font-black text-purple-700 text-xl">{formatNumber(result.fvExpenseMonthly)}</span></div>
                                    <p className="text-xs text-purple-600/80 mt-2 text-right">*คิดที่เงินเฟ้อ {form.inflation}% เป็นเวลา {result.yearsToRetire} ปี</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MonteCarloDetailsModal: React.FC<MonteCarloDetailsModalProps> = ({ show, onClose, mcResult, mcSimulations }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 transition-all duration-500">
            <div className="w-full max-w-md rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-black/5">
                <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">🔎 ผลจำลอง Monte Carlo</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 bg-[#F8FAFC]">
                    <p className="text-xs text-slate-500 mb-6 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm leading-relaxed"><b>Monte Carlo Simulation</b> คือการจำลองเหตุการณ์การลงทุนกว่า 1,000 ครั้ง โดยใส่ความผันผวน (Volatility 6%) เพื่อดูโอกาสรอดในสถานการณ์ต่างๆ</p>
                    <div className="space-y-3 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm max-h-[400px] overflow-y-auto custom-scrollbar">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 sticky top-0 bg-white z-10 pb-2 border-b border-slate-50">ผลลัพธ์ {mcSimulations} เหตุการณ์</h4>
                        {mcResult.finalBalances.map((run, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                <span className="text-slate-500 font-bold text-xs">Run #{idx + 1}</span>
                                <div className="flex items-center gap-3">
                                    <span className={run.pass ? "text-emerald-600 font-bold font-mono" : "text-rose-600 font-bold font-mono"}>฿{formatNumber(run.balance)}</span>
                                    <span className={`w-2 h-2 rounded-full ring-2 ring-white shadow-sm ${run.pass ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col items-center justify-center bg-slate-900 text-white rounded-3xl p-6 shadow-lg shadow-slate-200">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ความน่าจะเป็นที่จะสำเร็จ</span>
                        <span className="text-4xl font-black tracking-tight">{formatNumber2(mcResult.probability * 100, 0)}%</span>
                        <span className="text-[10px] text-slate-500 mt-2">Success Rate from 1,000+ simulations</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
