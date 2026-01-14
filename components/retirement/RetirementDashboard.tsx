import React from "react";
import { ProjectionChart } from "./DashboardCharts";
import {
    InsuranceTableModal,
    ProjectedModal,
    TargetModal,
    ExpenseModal,
    MonteCarloDetailsModal,
    useInsuranceLogic
} from "./DashboardModals";
import { AllocationWidget, MonteCarloWidget } from "./DashboardWidgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/NumericInput";
import { formatNumber, formatNumber2, formatInputDisplay } from "@/lib/utils";
import {
    FormState,
    RetirementInputs,
    CalculationResult,
    MonteCarloResult,
    InsurancePlan,
} from "@/types/retirement";
import { Plus, X as CloseIcon, Table as TableIcon } from "lucide-react";

interface RetirementDashboardProps {
    user: { name: string } | null;
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    inputs: RetirementInputs;
    result: CalculationResult;
    mcResult: MonteCarloResult;
    planType: "individual" | "family" | null;
    syncCurrentToFamily: () => void;
    setShowFamilyResult: (show: boolean) => void;
    handleExportCSV: () => void;
    handlePrint: () => void;
    addInsurancePlan: () => void;
    removeInsurancePlan: (id: string) => void;
    updateInsurancePlan: (index: number, field: keyof InsurancePlan, value: any) => void;
    updateSurrenderTable: (planIndex: number, age: number, value: string) => void;
    setRetireSpendMode: React.Dispatch<React.SetStateAction<"flat" | "step5">>;
    retireSpendMode: "flat" | "step5";
    setMcVolatility: React.Dispatch<React.SetStateAction<number>>;
    mcVolatility: number;
    setMcSimulations: React.Dispatch<React.SetStateAction<number>>;
    mcSimulations: number;
}

export const RetirementDashboard = ({
    user,
    form,
    setForm,
    inputs,
    result,
    mcResult,
    planType,
    syncCurrentToFamily,
    setShowFamilyResult,
    handleExportCSV,
    handlePrint,
    addInsurancePlan,
    removeInsurancePlan,
    updateInsurancePlan,
    updateSurrenderTable,
    setRetireSpendMode,
    retireSpendMode,
    setMcVolatility,
    mcVolatility,
    setMcSimulations,
    mcSimulations
}: RetirementDashboardProps) => {

    const [showSumAssured, setShowSumAssured] = React.useState(true);
    const [showActualSavings, setShowActualSavings] = React.useState(true);
    const [showInsuranceTable, setShowInsuranceTable] = React.useState(false);
    const [showProjectedModal, setShowProjectedModal] = React.useState(false);
    const [showTargetModal, setShowTargetModal] = React.useState(false);
    const [showExpenseModal, setShowExpenseModal] = React.useState(false);
    const [showMonteCarloDetails, setShowMonteCarloDetails] = React.useState(false);
    const [isMonteCarloOpen, setIsMonteCarloOpen] = React.useState(false);
    // const [showActualSavingsInput, setShowActualSavingsInput] = React.useState(false); // Deprecated or Moved
    const [chartTickInterval, setChartTickInterval] = React.useState<number>(5);

    const { insuranceChartData } = useInsuranceLogic(form);





    return (
        <div className="relative p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Print Summary Section */}
            <div className="hidden print:block mb-4 font-sans">
                <div className="border-b-2 border-slate-900 pb-2 mb-4 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">แผนเกษียณอายุส่วนบุคคล</h1>
                        <p className="text-sm text-slate-600 mt-1">รายงานวิเคราะห์และวางแผนการเงินฉบับสมบูรณ์</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                        <p>จัดทำสำหรับ: <span className="font-semibold text-slate-900">{user?.name || "ผู้ใช้งาน"}</span></p>
                        <p>วันที่: {new Date().toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="mb-4 break-inside-avoid">
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1 mb-2 uppercase tracking-wider">บทสรุปผู้บริหาร</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-sm border border-slate-100">
                            <h3 className="font-semibold text-slate-700 mb-1 text-sm">ข้อมูลส่วนตัว</h3>
                            <div className="grid grid-cols-2 gap-y-1 text-sm">
                                <span className="text-slate-500">อายุปัจจุบัน:</span>
                                <span className="font-medium">{form.currentAge} ปี</span>
                                <span className="text-slate-500">เกษียณอายุ:</span>
                                <span className="font-medium">{form.retireAge} ปี</span>
                                <span className="text-slate-500">อายุขัยคาดการณ์:</span>
                                <span className="font-medium">{form.lifeExpectancy} ปี</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-sm border border-slate-100">
                            <h3 className="font-semibold text-slate-700 mb-1 text-sm">สุขภาพทางการเงิน</h3>
                            <div className="grid grid-cols-2 gap-y-1 text-sm">
                                <span className="text-slate-500">สถานะ:</span>
                                <span className={`font-bold ${result.status === 'enough' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {result.status === 'enough' ? 'เพียงพอ' : 'ต้องปรับปรุง'}
                                </span>
                                <span className="text-slate-500">เงินออมคาดการณ์:</span>
                                <span className="font-medium">฿{formatNumber(result.projectedFund)}</span>
                                <span className="text-slate-500">เป้าหมายเงินออม:</span>
                                <span className="font-medium">฿{formatNumber(result.targetFund)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {form.insurancePlans.length > 0 && (
                    <div className="mb-4 break-inside-avoid">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1 mb-2 uppercase tracking-wider">พอร์ตโฟลิโอประกันชีวิต</h2>
                        <div className="overflow-hidden border border-slate-200 rounded-sm">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ชื่อแผน</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ประเภท</th>
                                        <th scope="col" className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">คุ้มครองถึง</th>
                                        <th scope="col" className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">ทุนประกัน</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {form.insurancePlans.filter(p => p.active).map((plan, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-900">{plan.planName}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{plan.type}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 text-right">{plan.coverageAge}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 text-right font-medium">฿{formatNumber(plan.sumAssured)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50 font-bold">
                                        <td colSpan={3} className="px-4 py-2 text-right text-sm text-slate-700">ทุนประกันรวมทั้งหมด</td>
                                        <td className="px-4 py-2 text-right text-sm text-orange-600">
                                            -
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 break-inside-avoid px-1">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">สรุปผลลัพธ์ทางการเงิน</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">วางแผนการรับมือเกษียณด้วยเครื่องมือแบบเห็นภาพ</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {planType === "family" && (
                        <Button
                            variant="default"
                            size="sm"
                            className="h-9 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-200 transition-all gap-2"
                            onClick={() => {
                                syncCurrentToFamily();
                                setShowFamilyResult(true);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            ดูผลลัพธ์ครอบครัว
                        </Button>
                    )}
                    {form.insurancePlans.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-xl border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all gap-2"
                            onClick={() => {
                                setForm(prev => ({ ...prev, selectedPlanId: null }));
                                setShowInsuranceTable(true);
                            }}
                        >
                            <TableIcon className="w-4 h-4" />
                            พอร์ตประกัน
                        </Button>
                    )}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span>ข้อมูลล่าสุด: {new Date().toLocaleDateString('th-TH')}</span>
                    </div>
                </div>
            </div>

            {/* Hero Summary Card */}
            <div className={`rounded-[32px] p-8 lg:p-12 relative overflow-hidden font-sans mb-10 break-inside-avoid shadow-2xl transition-all duration-500 ${result.status === 'enough' ? 'bg-gradient-to-br from-[#025035] to-[#047556] text-white shadow-emerald-900/30' : 'bg-gradient-to-br from-[#7f1d1d] to-[#991b1b] text-white shadow-red-900/30'}`}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none mix-blend-overlay"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="flex-1 space-y-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${result.status === 'enough' ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${result.status === 'enough' ? 'bg-[#34D399]' : 'bg-red-400'}`}></span>
                            {result.status === 'enough' ? 'สถานะ : เป้าหมายสำเร็จ' : 'สถานะ : ต้องปรับปรุง'}
                        </span>
                        <div className="space-y-3">
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                                {result.status === 'enough' ? 'แผนการเงินมั่นคง' : 'แผนการเงินยังมีความเสี่ยง'}
                            </h1>
                            <h2 className="text-xl lg:text-2xl font-bold text-white/90">
                                {result.status === 'enough' ? 'พร้อมเกษียณอย่างสบาย' : 'ควรเริ่มวางแผนเพิ่มเติมทันที'}
                            </h2>
                        </div>
                        <p className="text-white/80 text-base font-medium max-w-xl leading-relaxed">
                            {result.status === 'enough'
                                ? 'ยินดีด้วย! สินทรัพย์ของคุณเพียงพอสำหรับใช้จ่ายตามไลฟ์สไตล์ที่หวังไว้ตลอดช่วงเกษียณ'
                                : `จากการคำนวณ คุณยังมีส่วนต่างที่ต้องออมเพิ่มอีกประมาณ ฿${formatNumber(Math.abs(result.gap))} เพื่อให้บรรลุเป้าหมาย`}
                        </p>
                    </div>
                    <div className="shrink-0 bg-white/10 backdrop-blur-sm rounded-[24px] p-8 min-w-[340px]">
                        <div className="space-y-8">
                            <div>
                                <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-2">เงินออมที่จะมี (Projected)</p>
                                <p className="text-5xl font-black tracking-tighter text-white drop-shadow-sm">฿{formatNumber(result.projectedFund)}</p>
                            </div>
                            <div className="pt-6 border-t border-white/10 opacity-90">
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">เงินต้นที่ควรมี (Target)</p>
                                <p className={`text-2xl lg:text-3xl font-bold tracking-tight ${result.status === 'enough' ? 'text-white/90' : 'text-rose-200'}`}>฿{formatNumber(result.targetFund)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="relative group/grid">
                <div className="absolute inset-0 -m-4 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 break-inside-avoid px-2 relative z-10">

                    {/* Card 1: Projected Savings */}
                    <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(16,185_129,0.15)]">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-200/40 transition-colors duration-700"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl opacity-60"></div>
                        <div className="absolute top-8 right-8 text-emerald-100/80 group-hover:text-emerald-200/60 transition-colors duration-500 rotate-12 group-hover:rotate-0 transform origin-center transition-transform duration-700">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100 ring-4 ring-emerald-50/50 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                    </div>
                                    <button onClick={() => setShowProjectedModal(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-slate-100 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                    </button>
                                </div>
                                <p className="text-sm font-black text-slate-800 mb-1 tracking-tight">เงินออมที่มีตอนอายุเกษียณ</p>
                                <h4 className="text-5xl lg:text-5xl font-black text-emerald-600 leading-none tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left">
                                    ฿{formatNumber(result.projectedFund)}
                                </h4>
                                <p className="text-sm font-bold text-slate-400 mt-2">จากการออมและการลงทุน</p>
                            </div>
                            <div className="mt-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 shadow-sm group-hover:bg-emerald-100 transition-colors">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Wealth Projection
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Target Fund */}
                    <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(59,130,246,0.15)]">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-200/40 transition-colors duration-700"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl opacity-60"></div>
                        <div className="absolute top-8 right-8 text-blue-100/80 group-hover:text-blue-200/60 transition-colors duration-500 transform group-hover:scale-90 transition-transform duration-700">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                        </div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100 ring-4 ring-blue-50/50 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                                    </div>
                                    <button onClick={() => setShowTargetModal(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                    </button>
                                </div>
                                <p className="text-sm font-black text-slate-800 mb-1 tracking-tight">เงินที่ต้องการก่อนเกษียณ</p>
                                <h4 className="text-5xl lg:text-5xl font-black text-blue-600 leading-none tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left">
                                    ฿{formatNumber(result.targetFund)}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 mt-2 leading-relaxed">
                                    สำหรับ {result.yearsInRetirement} ปีหลังเกษียณ (โดยไม่สร้างผลตอบแทนเพิ่มเติมเลย)<br />
                                    หรือออมขั้นต่ำคร่าวๆ ฿{formatNumber(result.monthlyNeeded)} ต่อเดือน
                                </p>
                            </div>
                            <div className="mt-8 flex items-center justify-between">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 shadow-sm group-hover:bg-blue-100 transition-colors">
                                    Goal
                                </div>
                                <div className="px-3 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-slate-500 group-hover:text-blue-600 group-hover:border-blue-100 transition-all duration-300">
                                    <span className="text-[10px] font-bold tracking-tight opacity-70">~฿{formatNumber(result.monthlyNeeded)}/เดือน</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Monthly Expense */}
                    <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(168,85,247,0.15)]">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-purple-200/40 transition-colors duration-700"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-50/50 rounded-full blur-2xl opacity-60"></div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm border border-purple-100 ring-4 ring-purple-50/50 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                                    </div>
                                    <button onClick={() => setShowExpenseModal(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-slate-100 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                    </button>
                                </div>
                                <p className="text-sm font-black text-slate-800 mb-1 tracking-tight">ค่าใช้จ่าย/เดือน (ปีแรก)</p>
                                <h4 className="text-5xl lg:text-5xl font-black text-purple-600 leading-none tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left">
                                    ฿{formatNumber(result.fvExpenseMonthly)}
                                </h4>
                                <div className="flex justify-between items-end mt-2">
                                    <p className="text-sm font-bold text-slate-400">หลังเกษียณ (รวมเงินเฟ้อ)</p>
                                    <p className="text-xs font-bold text-slate-400">รวม ฿{formatNumber(result.totalLifetimeExpense)}</p>
                                </div>
                            </div>
                            <div className="mt-8 flex items-center justify-between">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-bold border border-purple-100 shadow-sm group-hover:bg-purple-100 transition-colors">
                                    Monthly
                                </div>
                                <div className="px-3 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-slate-500 group-hover:text-purple-600 group-hover:border-purple-100 transition-all duration-300">
                                    <span className="text-[10px] font-bold tracking-tight opacity-70">Total {(result.totalLifetimeExpense / 1000000).toFixed(1)}M</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Status */}
                    <div className={`bg-white/70 backdrop-blur-md rounded-[32px] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 ${result.status === 'enough' ? 'hover:shadow-[0_30px_70px_-20px_rgba(16,185_129,0.15)]' : 'hover:shadow-[0_30px_70px_-20px_rgba(244,63,94,0.15)]'}`}>
                        <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-12 -mt-12 group-hover:opacity-60 transition-colors duration-700 ${result.status === 'enough' ? 'bg-emerald-100/30' : 'bg-rose-100/30'}`}></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-slate-50/50 rounded-full blur-2xl opacity-60"></div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border ring-4 ring-offset-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500 ${result.status === 'enough' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-50/50' : 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-50/50'}`}>
                                        {result.status === 'enough' ?
                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> :
                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        }
                                    </div>
                                </div>
                                <p className="text-sm font-black text-slate-800 mb-1 tracking-tight">สถานะแผน</p>
                                <h4 className={`text-5xl lg:text-5xl font-black leading-none tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left ${result.status === 'enough' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {result.status === 'enough' ? "เพียงพอ" : "ไม่เพียงพอ"}
                                </h4>
                                <div className="mt-2 space-y-0.5">
                                    <p className="text-sm font-bold text-slate-400">
                                        {result.status === 'enough' ? `มีส่วนเกินประมาณ ฿${formatNumber(result.gap)}` : `ขาดอีก ฿${formatNumber(Math.abs(result.gap))}`}
                                    </p>
                                    <p className={`text-sm font-bold ${result.status === 'enough' ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                                        เงินหมดที่อายุ {result.moneyOutAge >= inputs.lifeExpectancy ? inputs.lifeExpectancy + '+' : result.moneyOutAge}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm transition-colors ${result.status === 'enough' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-100'}`}>
                                    {result.status === 'enough' ?
                                        <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Goal Achieved</> :
                                        <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Shortfall -฿{formatNumber(Math.abs(result.gap))}</>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="flex flex-col gap-8 mb-8 break-inside-avoid">
                {/* Main Chart Area */}
                <div className="w-full bg-white rounded-[32px] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-50/50 via-transparent to-transparent opacity-60 pointer-events-none -mr-20 -mt-20 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">กราฟการเงินออม</h3>
                            </div>
                            <p className="text-sm text-slate-500 font-medium pl-4.5">Wealth Projection & Goal Analysis</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 mr-2">
                                {[1, 5, 10].map((interval) => (
                                    <button
                                        key={interval}
                                        onClick={() => setChartTickInterval(interval)}
                                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${chartTickInterval === interval ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"}`}
                                    >
                                        {interval} ปี
                                    </button>
                                ))}
                            </div>
                            <button className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5" onClick={() => { } /* Modal Removed or placeholder */}>
                                บันทึกเงินสะสมจริงตามอายุ
                            </button>
                            <button className="px-5 py-2.5 text-sm font-bold text-blue-600 bg-white hover:bg-blue-50 rounded-xl border-2 border-blue-600 flex items-center gap-2 transition-all hover:-translate-y-0.5" onClick={handleExportCSV}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                Export CSV
                            </button>
                            <button className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5" onClick={handlePrint}>
                                Print
                            </button>
                        </div>
                    </div>
                    <div className="w-full relative h-[500px] bg-gradient-to-b from-white to-slate-50/50 rounded-2xl border border-slate-100 p-4">
                        <ProjectionChart
                            inputs={inputs}
                            result={result}
                            mcResult={mcResult}
                            showSumAssured={showSumAssured}
                            showActualSavings={showActualSavings}
                            insuranceChartData={insuranceChartData}
                            chartTickInterval={chartTickInterval}
                        />
                    </div>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 pt-6 border-t border-slate-100">
                        <label className="flex items-center gap-3 cursor-pointer select-none group/toggle">
                            <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${showSumAssured ? "bg-orange-500 border-orange-500 shadow-sm" : "bg-white border-slate-300 group-hover/toggle:border-slate-400"}`}>
                                {showSumAssured && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                            </div>
                            <input type="checkbox" className="hidden" checked={showSumAssured} onChange={(e) => setShowSumAssured(e.target.checked)} />
                            <span className="text-sm font-bold text-slate-700">แสดงทุนประกัน</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer select-none group/toggle">
                            <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${showActualSavings ? "bg-blue-600 border-blue-600 shadow-sm" : "bg-white border-slate-300 group-hover/toggle:border-slate-400"}`}>
                                {showActualSavings && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                            </div>
                            <input type="checkbox" className="hidden" checked={showActualSavings} onChange={(e) => setShowActualSavings(e.target.checked)} />
                            <span className="text-sm font-bold text-slate-700">แสดงเงินที่เก็บได้จริง</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-4 bg-emerald-100 border border-emerald-200 rounded"></div>
                            <span className="text-sm font-bold text-slate-700">Monte Carlo Simulation P5-P95</span>
                        </div>
                    </div>
                </div>

                {/* Side Column Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AllocationWidget inputs={inputs} />
                    <MonteCarloWidget
                        mcResult={mcResult}
                        mcSimulations={mcSimulations}
                        onClick={() => setShowMonteCarloDetails(true)}
                    />
                </div>

                <div id="modals-placeholder">
                    <InsuranceTableModal
                        show={showInsuranceTable}
                        onClose={() => setShowInsuranceTable(false)}
                        form={form}
                        addInsurancePlan={addInsurancePlan}
                        removeInsurancePlan={removeInsurancePlan}
                        updateInsurancePlan={updateInsurancePlan}
                        updateSurrenderTable={updateSurrenderTable}
                    />
                    <ProjectedModal
                        show={showProjectedModal}
                        onClose={() => setShowProjectedModal(false)}
                        form={form}
                        result={result}
                    />
                    <TargetModal
                        show={showTargetModal}
                        onClose={() => setShowTargetModal(false)}
                        result={result}
                    />
                    <ExpenseModal
                        show={showExpenseModal}
                        onClose={() => setShowExpenseModal(false)}
                        form={form}
                        result={result}
                    />
                    <MonteCarloDetailsModal
                        show={showMonteCarloDetails}
                        onClose={() => setShowMonteCarloDetails(false)}
                        mcResult={mcResult}
                        mcSimulations={mcSimulations}
                    />
                </div>
            </div>
        </div>
    );
};
