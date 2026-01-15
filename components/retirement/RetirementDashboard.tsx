
import React from "react";
import { ProjectionChart } from "./DashboardCharts";
import { RetirementInputSection } from "./RetirementInputSection";
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
    Allocation
} from "@/types/retirement";
import { Plus, X as CloseIcon, Table as TableIcon, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { PlanManager } from "./PlanManager";

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

    // Extended Props for RetirementInputSection compliance
    savingMode: "flat" | "step5";
    setSavingMode: React.Dispatch<React.SetStateAction<"flat" | "step5">>; // or generic dispatch
    returnMode: "avg" | "custom";
    setReturnMode: React.Dispatch<React.SetStateAction<"avg" | "custom">>;
    allocations: Allocation[];
    setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>;
    addAllocation: () => void;
    removeAllocation: (id: number) => void;
    updateAllocation: (id: number, field: keyof Allocation) => (e: any) => void;

    // Handlers for Inputs
    handleChange: (key: keyof FormState) => (e: any) => void;
    changeBy: (key: keyof FormState, delta: number) => () => void;
    setGender: (g: "male" | "female") => void;
    gender: "male" | "female";
    onLogout?: () => void;
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
    savingMode,
    setSavingMode,
    returnMode,
    setReturnMode,
    allocations,
    setAllocations,
    addAllocation,
    removeAllocation,
    updateAllocation,
    handleChange,
    changeBy,
    setGender,
    gender,
    onLogout
}: RetirementDashboardProps) => {

    const [showSumAssured, setShowSumAssured] = React.useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const [showActualSavings, setShowActualSavings] = React.useState(true);
    const [showInsuranceTable, setShowInsuranceTable] = React.useState(false);
    const [showProjectedModal, setShowProjectedModal] = React.useState(false);
    const [showTargetModal, setShowTargetModal] = React.useState(false);
    const [showExpenseModal, setShowExpenseModal] = React.useState(false);
    const [showMonteCarloDetails, setShowMonteCarloDetails] = React.useState(false);
    const [isMonteCarloOpen, setIsMonteCarloOpen] = React.useState(false);
    const [chartTickInterval, setChartTickInterval] = React.useState<number>(5);

    const { insuranceChartData } = useInsuranceLogic(form);

    const mcSimulations = Number(form.monteCarloSimulations) || 1500;

    return (
        <div className="min-h-screen bg-white pb-20 font-sans overflow-x-hidden relative">
            {/* Background Grid Pattern - Softened */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <div className="absolute inset-0 opacity-[0.2]"
                    style={{
                        backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90" />
            </div>
            {/* TOP NAVIGATION BAR */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Financial Planner</h1>
                        <p className="text-xs text-slate-500 font-medium">วางแผนเกษียณและภาษีครบวงจร</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-2 border-white shadow-sm font-bold text-xs">
                            {user?.name?.substring(0, 2).toUpperCase() || "U"}
                        </div>
                        <span className="text-sm font-bold text-slate-700 pr-2">{user?.name || "Guest User"}</span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="ออกจากระบบ"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </button>
                </div>
            </div>

            <div className="w-full px-4 md:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">

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



                {/* Main Content Grid */}
                <div className={`grid grid-cols-1 gap-8 transition-all duration-300 ${isSidebarOpen ? 'lg:grid-cols-[480px_1fr]' : 'lg:grid-cols-1'}`}>

                    {/* LEFT AREA: Inputs (Col 1) */}
                    <div className={`space-y-6 ${isSidebarOpen ? '' : 'hidden'} lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2 custom-scrollbar`}>
                        <div>
                            {/* Header is now inside, or we can keep a small title above if needed, but visually cleaner without double headers */}
                            {/* We'll remove the outer header "ข้อมูลแผนเกษียณ" since the Single Card has its own headers inside */}
                            <RetirementInputSection
                                user={user}
                                form={form}
                                handleChange={handleChange}
                                changeBy={changeBy}
                                gender={gender}
                                setGender={setGender}
                                addInsurancePlan={addInsurancePlan}
                                removeInsurancePlan={removeInsurancePlan}
                                updateInsurancePlan={updateInsurancePlan}
                                onViewTable={() => setShowInsuranceTable(true)}
                                savingMode={savingMode}
                                setSavingMode={setSavingMode}
                                returnMode={returnMode}
                                setReturnMode={setReturnMode}
                                allocations={allocations}
                                addAllocation={addAllocation}
                                removeAllocation={removeAllocation}
                                updateAllocation={updateAllocation}
                                onCalculate={() => { }}
                                isEmbedded={true}
                            />
                        </div>
                    </div>

                    {/* RIGHT AREA: Charts & Metrics (Col 2) */}
                    <div className="space-y-8">
                        {/* Hero Summary Card (Moved here) */}
                        <div className={`rounded-[32px] p-8 lg:p-8 relative overflow-hidden font-sans shadow-2xl transition-all duration-500 ${result.status === 'enough' ? 'bg-gradient-to-br from-[#025035] to-[#047556] text-white shadow-emerald-900/30' : 'bg-gradient-to-br from-[#7f1d1d] to-[#991b1b] text-white shadow-red-900/30'}`}>
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none mix-blend-overlay"></div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                                <div className="flex-1 space-y-4">
                                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${result.status === 'enough' ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                                        <span className={`w-2.5 h-2.5 rounded-full ${result.status === 'enough' ? 'bg-[#34D399]' : 'bg-red-400'}`}></span>
                                        {result.status === 'enough' ? 'สถานะ : เป้าหมายสำเร็จ' : 'สถานะ : ต้องปรับปรุง'}
                                    </span>
                                    <div className="space-y-2">
                                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                                            {result.status === 'enough' ? 'แผนการเงินมั่นคง' : 'แผนการเงินยังมีความเสี่ยง'}
                                        </h1>
                                        <h2 className="text-lg lg:text-xl font-bold text-white/90">
                                            {result.status === 'enough' ? 'พร้อมเกษียณอย่างสบาย' : 'ควรเริ่มวางแผนเพิ่มเติมทันที'}
                                        </h2>
                                    </div>
                                    <p className="text-white/80 text-sm font-medium max-w-xl leading-relaxed">
                                        {result.status === 'enough'
                                            ? 'ยินดีด้วย! สินทรัพย์ของคุณเพียงพอสำหรับการเกษียณ'
                                            : `ขาดเงินเกษียณอีก ฿${formatNumber(Math.abs(result.gap))}`}
                                    </p>
                                </div>
                                <div className="shrink-0 bg-white/10 backdrop-blur-sm rounded-[24px] p-6 min-w-[280px]">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">เงินออมที่จะมี (Projected)</p>
                                            <p className="text-4xl font-black tracking-tighter text-white drop-shadow-sm">฿{formatNumber(result.projectedFund)}</p>
                                        </div>
                                        <div className="pt-4 border-t border-white/10 opacity-90">
                                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">เงินต้นที่ควรมี (Target)</p>
                                            <p className={`text-xl font-bold tracking-tight ${result.status === 'enough' ? 'text-white/90' : 'text-rose-200'}`}>฿{formatNumber(result.targetFund)}</p>
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
                                <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(16,185_129,0.15)]">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-200/40 transition-colors duration-700"></div>
                                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl opacity-60"></div>
                                    <div className="absolute top-6 right-6 text-emerald-100/80 group-hover:text-emerald-200/60 transition-colors duration-500 rotate-12 group-hover:rotate-0 transform origin-center transition-transform duration-700">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    </div>
                                    <div className="flex flex-col h-full justify-between relative z-10">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100 ring-4 ring-emerald-50/50 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                                </div>
                                                <button onClick={() => setShowProjectedModal(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-slate-100 shadow-sm hover:scale-110">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                                </button>
                                            </div>
                                            <p className="text-sm font-black text-slate-600 mb-1 tracking-tight uppercase opacity-80">เงินออมที่จะมี (Projected)</p>
                                            <h4 className="text-4xl md:text-5xl font-black text-emerald-600 leading-none tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left">
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
                                <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(59,130,246,0.15)]">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-200/40 transition-colors duration-700"></div>
                                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl opacity-60"></div>
                                    <div className="absolute top-6 right-6 text-blue-100/80 group-hover:text-blue-200/60 transition-colors duration-500 transform group-hover:scale-90 transition-transform duration-700">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                                    </div>
                                    <div className="flex flex-col h-full justify-between relative z-10">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100 ring-4 ring-blue-50/50 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                                                </div>
                                                <button onClick={() => setShowTargetModal(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100 shadow-sm hover:scale-110">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                                </button>
                                            </div>
                                            <p className="text-sm font-black text-slate-600 mb-1 tracking-tight uppercase opacity-80">เงินที่ต้องการ (Target)</p>
                                            <h4 className="text-4xl md:text-5xl font-black text-blue-600 leading-none tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left">
                                                ฿{formatNumber(result.targetFund)}
                                            </h4>
                                            <p className="text-xs font-bold text-slate-400 mt-2 leading-relaxed">
                                                สำหรับ {result.yearsInRetirement} ปีหลังเกษียณ <br className="hidden md:block" />
                                                (ออมเพิ่ม ฿{formatNumber(result.monthlyNeeded)}/เดือน)
                                            </p>
                                        </div>
                                        <div className="mt-8 flex items-center justify-between">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 shadow-sm group-hover:bg-blue-100 transition-colors">
                                                Target Goal
                                            </div>
                                            <div className="px-3 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-slate-500 group-hover:text-blue-600 group-hover:border-blue-100 transition-all duration-300 transform group-hover:scale-105 shadow-sm">
                                                <span className="text-[10px] font-bold tracking-tight opacity-70">Gap: {formatNumber(Math.abs(result.gap))}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3: Monthly Expense */}
                                <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(168,85,247,0.15)]">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-purple-200/40 transition-colors duration-700"></div>
                                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-50/50 rounded-full blur-2xl opacity-60"></div>
                                    <div className="flex flex-col h-full justify-between relative z-10">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm border border-purple-100 ring-4 ring-purple-50/50 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                                                </div>
                                                <button onClick={() => setShowExpenseModal(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-slate-100 shadow-sm hover:scale-110">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                                </button>
                                            </div>
                                            <p className="text-sm font-black text-slate-600 mb-1 tracking-tight uppercase opacity-80">ค่าใช้จ่าย/เดือน (ปีแรก)</p>
                                            <h4 className="text-4xl md:text-5xl font-black text-purple-600 leading-none tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left">
                                                ฿{formatNumber(result.fvExpenseMonthly)}
                                            </h4>
                                            <div className="flex justify-between items-end mt-2">
                                                <p className="text-sm font-bold text-slate-400">หลังเกษียณ (รวมเงินเฟ้อ)</p>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex items-center justify-between">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-bold border border-purple-100 shadow-sm group-hover:bg-purple-100 transition-colors">
                                                Monthly
                                            </div>
                                            <div className="px-3 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-slate-500 group-hover:text-purple-600 group-hover:border-purple-100 transition-all duration-300 transform group-hover:scale-105 shadow-sm">
                                                <span className="text-[10px] font-bold tracking-tight opacity-70">Total {(result.totalLifetimeExpense / 1000000).toFixed(1)}M</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 4: Status */}
                                <div className={`bg-white/70 backdrop-blur-md rounded-[32px] p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 ${result.status === 'enough' ? 'hover:shadow-[0_30px_70px_-20px_rgba(16,185_129,0.15)]' : 'hover:shadow-[0_30px_70px_-20px_rgba(244,63,94,0.15)]'}`}>
                                    <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-12 -mt-12 group-hover:opacity-60 transition-colors duration-700 ${result.status === 'enough' ? 'bg-emerald-100/30' : 'bg-rose-100/30'}`}></div>
                                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-slate-50/50 rounded-full blur-2xl opacity-60"></div>
                                    <div className="flex flex-col h-full justify-between relative z-10">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ring-4 ring-offset-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500 ${result.status === 'enough' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-50/50' : 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-50/50'}`}>
                                                    {result.status === 'enough' ?
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> :
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                                    }
                                                </div>
                                            </div>
                                            <p className="text-sm font-black text-slate-600 mb-1 tracking-tight uppercase opacity-80">สถานะแผน</p>
                                            <h4 className={`text-4xl md:text-5xl font-black leading-none tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left ${result.status === 'enough' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {result.status === 'enough' ? "เพียงพอ" : "ไม่เพียงพอ"}
                                            </h4>
                                            <div className="mt-2 space-y-0.5">
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

                            {/* Insurance Summary Card */}
                            {form.insurancePlans.filter(p => p.active).length > 0 && (
                                <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {/* Decorative BG */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                    <div className="flex items-center gap-4 z-10 w-full md:w-auto">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm border border-orange-100 shrink-0">
                                            <TableIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg tracking-tight">สรุปพอร์ตโฟลิโอประกัน (Insurance Overview)</h3>
                                            <p className="text-xs text-slate-500 font-medium">ภาพรวมผลประโยชน์และกระแสเงินสดรับตลอดชีพ</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 z-10 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                        <div className="shrink-0 min-w-[100px]">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">กรมธรรม์</p>
                                            <p className="text-2xl font-black text-slate-800">{form.insurancePlans.filter(p => p.active).length} <span className="text-sm font-medium text-slate-400">เล่ม</span></p>
                                        </div>
                                        <div className="w-px h-10 bg-slate-100 hidden md:block"></div>
                                        <div className="shrink-0 min-w-[140px]">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ผลประโยชน์รวม (Inflow)</p>
                                            <p className="text-2xl font-black text-emerald-600">฿{formatNumber(result.insuranceCashInflow)}</p>
                                        </div>
                                        <div className="w-px h-10 bg-slate-100 hidden md:block"></div>
                                        <div className="shrink-0 min-w-[140px]">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ทุนประกันสูงสุด (Max DB)</p>
                                            <p className="text-2xl font-black text-indigo-600">฿{formatNumber(Math.max(0, ...(insuranceChartData?.datasets[0].data as number[] || [0])))}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Side Column Widgets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <AllocationWidget inputs={inputs} />
                                <MonteCarloWidget
                                    mcResult={mcResult}
                                    mcSimulations={mcSimulations}
                                    onClick={() => setShowMonteCarloDetails(true)}
                                />
                            </div>

                        </div>
                        {/* End of xl:col-span-3 */}
                    </div>
                    {/* End of Main Grid */}

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
                            mcSimulations={Number(form.monteCarloSimulations)}
                        />
                        <PlanManager
                            currentData={{
                                form,
                                allocations,
                                returnMode,
                                savingMode,
                                gender
                            }}
                            onLoad={(data) => {
                                setForm(data.form);
                                if (data.allocations) setAllocations(data.allocations);
                                if (data.returnMode) setReturnMode(data.returnMode);
                                if (data.savingMode) setSavingMode(data.savingMode);
                                if (data.gender) setGender(data.gender);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
