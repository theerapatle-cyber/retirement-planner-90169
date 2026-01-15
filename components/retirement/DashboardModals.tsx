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
}

interface TargetModalProps {
    show: boolean;
    onClose: () => void;
    result: CalculationResult;
}

interface ExpenseModalProps {
    show: boolean;
    onClose: () => void;
    form: FormState;
    result: CalculationResult;
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
                    totalCashValue += Number(String(plan.surrenderValue || 0).replace(/,/g, ""));
                    hasCashValue = true;
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

export const ProjectedModal: React.FC<ProjectedModalProps> = ({ show, onClose, form, result }) => {
    const [tab, setTab] = React.useState<"details" | "formula">("details");

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
                                    {["เริ่มต้นจากเงินสะสมที่มีอยู่ในปัจจุบัน", "คำนวณผลตอบแทนจากเงินสะสมทั้งหมดของปีนั้น (ผลตอบแทนเฉลี่ยต่อปี)", "เพิ่มเงินออมประจำปีเข้าไปในยอดสะสม", "หากมีเงินเพิ่มเติมจากแหล่งอื่น เช่น เงินคืนประกัน ก็จะนำมาบวกกับยอดสะสมของปีนั้นด้วย", "ทำซ้ำขั้นตอนทั้งหมดจนถึงปีเกษียณ → จะได้ยอดสะสมสุดท้าย"].map((step, idx) => (
                                        <div key={idx} className="flex gap-4 text-sm text-slate-600 group">
                                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs shadow-sm ring-1 ring-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors">{idx + 1}</div>
                                            <div className="pt-1.5 leading-relaxed font-medium">{step}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 border border-amber-100/50 flex gap-4 items-start shadow-sm">
                                    <span className="text-amber-500 text-2xl mt-0.5">💡</span>
                                    <div className="text-sm text-slate-700 pt-1"><span className="font-bold text-slate-900 block mb-1 text-base">Key Takeaway</span>หัวใจสำคัญคือ <span className="font-bold text-amber-700">"พลังของดอกเบี้ยทบต้น"</span> (Compound Interest) ยิ่งออมเร็ว เงินยิ่งทบต้นได้นานขึ้น</div>
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

export const TargetModal: React.FC<TargetModalProps> = ({ show, onClose, result }) => {
    const [tab, setTab] = React.useState<"details" | "formula">("details");

    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 transition-all duration-500">
            <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-black/5">
                <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600 text-lg">🎯</span> เป้าหมายเกษียณ (Target Fund)</h3>
                        <p className="text-sm text-slate-500 mt-1 ml-10">คำนวณเงินทุนที่ต้องมีเพื่อให้พอใช้</p>
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
                                <p className="text-sm text-slate-600 leading-relaxed bg-white p-6 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden"><span className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></span><span className="font-bold text-slate-900 block mb-2 text-base">นิยาม (Simple Definition)</span>คือจำนวนเงินก้อนที่คุณ <b>"ต้องมี"</b> ณ วันสุดท้ายของการทำงาน เพื่อให้สามารถถอนออกมาใช้จ่ายได้ทุกเดือนไปจนถึงวันสุดท้ายของชีวิต โดยไม่เดือดร้อน</p>
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-4">
                                    <div className="text-base font-bold text-slate-900">ขั้นตอนการคิด (Step-by-Step):</div>
                                    <ol className="list-none space-y-3">
                                        {["ประมาณการรายจ่ายต่อเดือน หลังเกษียณ (ปรับเงินเฟ้อแล้ว)", "หักลบรายได้อื่นๆ ที่จะมีแน่นอน เช่น บำนาญ, เบี้ยยังชีพ", "คำนวณว่าต้องมีเงินก้อนเท่าไหร่ ที่จะถอนมาใช้ได้พอดีตามระยะเวลาที่คาดการณ์", "บวกเงินมรดกที่ต้องการส่งต่อ (ถ้ามี)", "ผลลัพธ์คือ เป้าหมายทางการเงิน (Target Fund)"].map((item, idx) => (
                                            <li key={idx} className="flex gap-4 items-center p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"><div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{idx + 1}</div><span className="text-sm text-slate-700 font-medium">{item}</span></li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        )}
                        {tab === "formula" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-4">
                                    <div className="text-base font-bold text-slate-900 flex items-center gap-2"><span className="w-1 h-6 bg-blue-500 rounded-full"></span> สูตรหาเงินออมที่ต้องเก็บ (PMT for Goal)</div>
                                    <p className="text-sm text-slate-500 leading-relaxed pl-3 border-l-2 border-slate-100">คำนวณย้อนกลับว่า ต้องเก็บเงินเพิ่มปีละเท่าไหร่ จึงจะไปถึงเป้าหมาย โดยคำนึงถึงผลตอบแทนทบต้น</p>
                                    <div className="rounded-2xl bg-slate-900 p-6 overflow-x-auto shadow-inner relative group"><div className="absolute top-3 right-3 text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">Math</div><div className="font-mono text-sm text-blue-400 whitespace-nowrap">PMT = (Target - Current × (1+r)^n) / [((1+r)^n - 1) / r]</div></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-sm font-bold text-slate-900">สรุปการคำนวณจริง (Result):</div>
                                    <div className="rounded-3xl bg-white border border-slate-200 p-6 overflow-hidden shadow-sm relative">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
                                        <div className="relative z-10 space-y-4">
                                            <div className="flex justify-between items-center border-b border-slate-100 pb-3"><span className="text-sm text-slate-600">เป้าหมายทั้งหมดที่ต้องมี</span><span className="font-bold text-lg text-slate-800">฿ {formatNumber(result.targetFund)}</span></div>
                                            <div className="flex justify-between items-center border-b border-slate-100 pb-3"><span className="text-sm text-slate-600">เงินที่มีและจะโตไปในอนาคต</span><span className="font-bold text-lg text-slate-500">฿ {formatNumber(result.fvLumpSum + result.insuranceCashInflow)}</span></div>
                                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                                <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-blue-600 uppercase tracking-wide">ต้องออมเพิ่มต่อปี</span><span className="font-mono text-base font-bold text-blue-700">฿ {formatNumber2(result.monthlyNeeded * 12, 0)}</span></div>
                                                <div className="flex justify-between items-center"><span className="text-sm font-black text-slate-800">เฉลี่ยต่อเดือน</span><span className="font-mono text-2xl font-black text-blue-600">฿ {formatNumber2(result.monthlyNeeded, 0)}</span></div>
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

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ show, onClose, form, result }) => {
    const [tab, setTab] = React.useState<"details" | "formula">("details");

    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 transition-all duration-500">
            <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-black/5">
                <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-purple-100/50 flex items-center justify-center text-purple-600 text-lg">💸</span> ค่าใช้จ่ายหลังเกษียณ (Future Expense)</h3>
                        <p className="text-sm text-slate-500 mt-1 ml-10">ประมาณการเงินเฟ้อและค่าครองชีพ</p>
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
                                                <tr><th className="p-4 w-1/4">อายุ (ปี)</th><th className="p-4 text-right w-1/3">รายเดือน (อนาคต)</th><th className="p-4 text-right">รายปี (อนาคต)</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {result.expenseSchedule.map((row, idx) => (
                                                    <tr key={row.age} className={`hover:bg-purple-50/30 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}><td className="p-4 text-slate-800 font-bold">{row.age}</td><td className="p-4 text-right font-medium text-purple-600">฿{formatNumber(row.monthly)}</td><td className="p-4 text-right text-slate-600">฿{formatNumber(row.yearly)}</td></tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-slate-900 text-white font-semibold"><tr><td className="p-4 rounded-bl-xl">รวมทั้งหมดตลอดอายุขัย</td><td className="p-4 text-right">-</td><td className="p-4 text-right text-purple-300 text-lg rounded-br-xl">฿{formatNumber(result.totalLifetimeExpense)}</td></tr></tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        {tab === "formula" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-4">
                                    <div className="text-base font-bold text-slate-900">การคิดค่าเงินเฟ้อ (Inflation Calc)</div>
                                    <p className="text-sm text-slate-500 leading-relaxed pl-3 border-l-2 border-slate-100">เงินในอนาคตจะมีค่าน้อยลง เราจึงต้องคำนวณว่า "จำนวนเงินที่เราต้องใช้" จะเพิ่มขึ้นเป็นเท่าไหร่</p>
                                    <div className="rounded-2xl bg-slate-900 p-6 text-sm text-purple-300 border border-slate-800 leading-relaxed font-mono shadow-inner">FutureExpense = CurrentExpense × (1 + InflationRate) ^ Years</div>
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
