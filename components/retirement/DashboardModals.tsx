import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/NumericInput";
import { formatNumber, formatNumber2, formatInputDisplay } from "@/lib/utils";
import { Plus, X as CloseIcon } from "lucide-react";
import { ExpenseChart } from "./DashboardCharts";
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
    show, onClose, form, addInsurancePlan, removeInsurancePlan, updateInsurancePlan, updateSurrenderTable
}) => {
    const { calculateDeathBenefitAtAge } = useInsuranceLogic(form);
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-3xl p-4 transition-all duration-500 animate-in fade-in">
            <div className="w-full max-w-4xl rounded-[32px] bg-[#F8FAFC] shadow-2xl relative max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-white/20 flex flex-col font-sans">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">พอร์ตโฟลิโอประกัน (Insurance Portfolio)</h3>
                            <p className="text-sm text-slate-500 font-medium">จัดการแผนประกันและดูตารางกระแสเงินสดรวม</p>
                        </div>
                    </div>
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"
                        type="button"
                        onClick={onClose}
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-[#F8FAFC]">
                    {/* LEFT PANEL: Plan Inputs */}
                    <div className="w-full lg:w-[450px] bg-slate-50/50 border-b lg:border-r border-slate-200 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar shrink-0">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <span>รายการแผน ({form.insurancePlans.length})</span>
                            </h4>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addInsurancePlan}
                                className="h-9 px-3 rounded-lg bg-blue-600 text-white border-blue-600 hover:bg-blue-700 font-bold text-xs gap-1.5 shadow-sm active:scale-95 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" strokeWidth={3} /> เพิ่มแผน
                            </Button>
                        </div>

                        <div className="space-y-4 pb-12">
                            {form.insurancePlans.map((plan, index) => (
                                <div key={plan.id} className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-4 space-y-4 transition-all relative group hover:border-blue-300 hover:shadow-md">
                                    {/* Header / Delete */}
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] border border-indigo-100 shrink-0">
                                                    {index + 1}
                                                </div>
                                                <Input
                                                    className="h-8 bg-transparent border-transparent hover:bg-slate-50 focus:bg-white focus:border-blue-200 rounded px-2 text-sm font-bold text-slate-900 w-full transition-all"
                                                    value={plan.planName}
                                                    onChange={(e) => updateInsurancePlan(index, "planName", e.target.value)}
                                                    placeholder="ชื่อแผนประกัน..."
                                                />
                                            </div>
                                            <select
                                                className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-100"
                                                value={plan.type}
                                                onChange={(e) => updateInsurancePlan(index, "type", e.target.value)}
                                            >
                                                <option value="สะสมทรัพย์">สะสมทรัพย์</option>
                                                <option value="บำนาญ">บำนาญ</option>
                                                <option value="ตลอดชีพ">ตลอดชีพ</option>
                                                <option value="ชั่วระยะเวลา">ประกันชั่วระยะเวลา</option>
                                                <option value="Unit Linked">Unit Linked</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => removeInsurancePlan(plan.id)}
                                            className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-all self-start"
                                        >
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-slate-400 pl-1">คุ้มครองถึงอายุ</Label>
                                            <NumericInput
                                                className="h-9 w-full bg-slate-50 border-slate-200 rounded-lg px-2 text-xs font-bold text-center"
                                                value={plan.coverageAge}
                                                onChange={(v) => updateInsurancePlan(index, "coverageAge", v)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-slate-400 pl-1">ทุนประกัน</Label>
                                            <NumericInput
                                                className="h-9 w-full bg-slate-50 border-slate-200 rounded-lg px-2 text-xs font-bold text-center"
                                                value={plan.sumAssured}
                                                onChange={(v) => updateInsurancePlan(index, "sumAssured", v)}
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Fields based on Type (Compact) */}
                                    {plan.type === "สะสมทรัพย์" && (
                                        <div className="pt-2 border-t border-slate-50 grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold text-slate-400">เงินครบกำหนด</Label>
                                                <NumericInput className="h-8 w-full bg-emerald-50/50 border-emerald-100 rounded-lg px-2 text-xs text-emerald-700 font-bold" value={plan.maturityAmount} onChange={(v) => updateInsurancePlan(index, "maturityAmount", v)} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold text-slate-400">เงินคืนระหว่างสัญญา</Label>
                                                <NumericInput className="h-8 w-full bg-emerald-50/50 border-emerald-100 rounded-lg px-2 text-xs text-emerald-700 font-bold" value={plan.cashBackAmount} onChange={(v) => updateInsurancePlan(index, "cashBackAmount", v)} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Surrender Section (Compact) */}
                                    {plan.type !== "ชั่วระยะเวลา" && (
                                        <div className="border-t border-slate-100 pt-3">
                                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    checked={plan.useSurrender}
                                                    onChange={(e) => updateInsurancePlan(index, "useSurrender", e.target.checked)}
                                                />
                                                <span className="text-xs font-bold text-slate-600">เวนคืนกรมธรรม์</span>
                                            </label>

                                            {plan.useSurrender && (
                                                <div className="space-y-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                    <div className="flex items-center gap-2 justify-between">
                                                        <Label className="text-[10px] font-bold text-slate-400">เวนคืนตอนอายุ</Label>
                                                        <NumericInput className="h-8 w-16 bg-white border-slate-200 text-center text-xs font-bold rounded-lg" value={plan.surrenderAge} onChange={(v) => updateInsurancePlan(index, "surrenderAge", v)} />
                                                    </div>
                                                    <div className="flex gap-1 p-0.5 bg-white rounded-lg border border-slate-200">
                                                        <button onClick={() => updateInsurancePlan(index, "surrenderMode", "single")} className={`flex-1 py-1 text-[9px] font-bold rounded transition-all ${!plan.surrenderMode || plan.surrenderMode === "single" ? "bg-blue-50 text-blue-600" : "text-slate-400"}`}>ยอดเดียว</button>
                                                        <button onClick={() => updateInsurancePlan(index, "surrenderMode", "table")} className={`flex-1 py-1 text-[9px] font-bold rounded transition-all ${plan.surrenderMode === "table" ? "bg-blue-50 text-blue-600" : "text-slate-400"}`}>ตาราง</button>
                                                    </div>
                                                    {(!plan.surrenderMode || plan.surrenderMode === "single") ? (
                                                        <div className="flex items-center gap-2 justify-between">
                                                            <Label className="text-[10px] font-bold text-slate-400">มูลค่า</Label>
                                                            <NumericInput className="h-8 w-1/2 bg-white border-slate-200 text-right text-xs font-bold rounded-lg px-2" value={plan.surrenderValue} onChange={(v) => updateInsurancePlan(index, "surrenderValue", v)} />
                                                        </div>
                                                    ) : (
                                                        <div className="text-[9px] text-blue-500 font-medium text-center bg-blue-50/50 rounded py-1">กรอกข้อมูลในตารางทางขวา 👉</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Cash Flow Table */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-slate-50/30">
                        <div className="rounded-[24px] border border-slate-200 overflow-hidden shadow-sm bg-white">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] backdrop-blur-sm sticky top-0 z-10">
                                    <tr>
                                        <th className="py-4 px-4 text-left w-[10%] font-bold text-slate-600">อายุ (Age)</th>
                                        <th className="py-4 px-4 text-right w-[20%] text-emerald-600">เวนคืน (Surrender)</th>
                                        <th className="py-4 px-4 text-right w-[20%] font-bold text-slate-600">กระแสเงินสดรับ (Inflow)</th>
                                        <th className="py-4 px-4 text-right w-[20%] font-bold text-slate-600">ทุนประกัน (Death Benefit)</th>
                                        <th className="py-4 px-4 pl-8 text-left w-[30%] font-bold text-slate-600">สถานะ (Status)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {Array.from({ length: 100 - Number(form.currentAge || 0) + 1 }, (_, i) => Number(form.currentAge || 0) + i).map(age => {
                                        let totalCashInflow = 0;
                                        let totalDeathBenefit = 0;
                                        let statusText = "สิ้นสุดความคุ้มครอง";
                                        let isSurrenderYear = false;
                                        let hasActiveCoverage = false;
                                        let isMaturityYear = false;

                                        const targetPlans = form.selectedPlanId ? form.insurancePlans.filter(p => p.id === form.selectedPlanId) : form.insurancePlans.filter(p => p.active);

                                        targetPlans.forEach(plan => {
                                            const sumAssured = Number(String(plan.sumAssured || 0).replace(/,/g, ""));
                                            const coverageAge = Number(plan.coverageAge);
                                            const surrenderAge = Number(plan.surrenderAge);
                                            const useSurrender = plan.useSurrender && plan.type !== "ชั่วระยะเวลา";

                                            const planIsSurrenderYear = useSurrender && age === surrenderAge;
                                            const planIsAfterSurrender = useSurrender && age > surrenderAge;
                                            const planIsWithinCoverage = age <= coverageAge;

                                            // Determine Status Priority
                                            if (planIsSurrenderYear) isSurrenderYear = true;
                                            if (planIsWithinCoverage && !planIsAfterSurrender) hasActiveCoverage = true;
                                            if (age === coverageAge && plan.type === "สะสมทรัพย์" && !planIsAfterSurrender) isMaturityYear = true;

                                            // Cash Flow Calculation
                                            let flow = 0;
                                            if (planIsSurrenderYear) {
                                                let sv = Number(String(plan.surrenderValue || 0).replace(/,/g, ""));
                                                if (plan.surrenderMode === "table" && plan.surrenderTableData) {
                                                    const row = plan.surrenderTableData.find(d => d.age === age);
                                                    if (row) sv = Number(String(row.amount || 0).replace(/,/g, ""));
                                                }
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
                                                    let pensionAmt = Number(String(plan.pensionAmount || 0).replace(/,/g, ""));
                                                    if (Number(plan.pensionPercent) > 0) pensionAmt = (sumAssured * Number(plan.pensionPercent)) / 100;

                                                    if (plan.unequalPension && plan.pensionTiers?.length > 0) {
                                                        const tier = plan.pensionTiers.find(t => age >= Number(t.startAge) && age <= Number(t.endAge));
                                                        if (tier) pensionAmt = Number(String(tier.amount || 0).replace(/,/g, ""));
                                                        else pensionAmt = 0;
                                                    }

                                                    if (age >= Number(plan.pensionStartAge) && age <= (Number(plan.pensionEndAge) || 100)) {
                                                        flow += pensionAmt;
                                                    }
                                                }
                                            }
                                            totalCashInflow += flow;

                                            // Death Benefit Calculation
                                            if (!planIsAfterSurrender && planIsWithinCoverage) {
                                                totalDeathBenefit += calculateDeathBenefitAtAge(plan, age);
                                            }
                                        });

                                        // Row Status & Styling
                                        let deathBenefitDisplay = totalDeathBenefit > 0 ? formatNumber(totalDeathBenefit) : "-";
                                        let cashInflowDisplay = totalCashInflow > 0 ? `+${formatNumber(totalCashInflow)}` : "-";
                                        let rowClass = "hover:bg-indigo-50/30 transition-colors";

                                        if (isSurrenderYear) {
                                            statusText = "มีการเวนคืนกรมธรรม์";
                                            rowClass = "bg-green-50/50 hover:bg-green-50";
                                            deathBenefitDisplay = "-";
                                        } else if (hasActiveCoverage) {
                                            statusText = "คุ้มครองปกติ";
                                            if (totalCashInflow > 0) {
                                                statusText = isMaturityYear ? "ครบกำหนดสัญญา" : "ได้รับเงินคืน / จ่ายบำนาญ";
                                                rowClass = "bg-emerald-50/50 hover:bg-emerald-50";
                                            }
                                        } else {
                                            statusText = "สิ้นสุดความคุ้มครอง";
                                            if (isMaturityYear) statusText = "ครบกำหนดสัญญา";
                                            deathBenefitDisplay = "-";
                                            rowClass = "text-slate-400 bg-slate-50/30";
                                        }

                                        const lifeExpectancy = Number(String(form.lifeExpectancy || 85).replace(/,/g, ""));
                                        if (age === lifeExpectancy) {
                                            statusText = `เสียชีวิตที่อายุ ${age} → ทุนประกัน ${formatNumber(totalDeathBenefit)}`;
                                            rowClass = "bg-red-50 hover:bg-red-100 font-bold border-l-4 border-l-red-500";
                                            deathBenefitDisplay = formatNumber(totalDeathBenefit);
                                        } else if (age > lifeExpectancy) {
                                            statusText = "เสียชีวิตแล้ว";
                                            deathBenefitDisplay = "-";
                                            cashInflowDisplay = "-";
                                            rowClass = "text-slate-300 bg-slate-100/50";
                                        }

                                        const editingThisPlan = form.selectedPlanId === targetPlans[0]?.id && targetPlans[0]?.surrenderMode === "table";
                                        const pIndex = form.insurancePlans.findIndex(p => p.id === targetPlans[0]?.id);
                                        const svTableVal = editingThisPlan && pIndex >= 0 ? (form.insurancePlans[pIndex].surrenderTableData?.find(d => d.age === age)?.amount || "") : "";

                                        return (
                                            <tr key={age} className={rowClass}>
                                                <td className="py-3 px-4 border-b border-slate-100 text-center font-bold text-slate-500">{age}</td>
                                                {editingThisPlan && (
                                                    <td className="py-3 px-4 border-b border-slate-100 text-right">
                                                        <input className="w-full text-right bg-blue-50/50 border-b border-blue-200 focus:outline-none focus:border-blue-500 text-xs py-1.5 px-2 rounded text-blue-700 font-mono" placeholder="-" value={svTableVal} onChange={(e) => updateSurrenderTable(pIndex, age, e.target.value)} onBlur={(e) => updateSurrenderTable(pIndex, age, formatInputDisplay(e.target.value))} />
                                                    </td>
                                                )}
                                                <td className={`py-3 px-4 border-b border-slate-100 text-right font-mono text-base ${totalCashInflow > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>{cashInflowDisplay}</td>
                                                <td className="py-3 px-4 border-b border-slate-100 text-right font-mono">{deathBenefitDisplay}</td>
                                                <td className="py-3 px-4 pl-8 border-b border-slate-100 text-xs font-medium text-slate-500">{statusText}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
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
