
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
    onEditProfile?: () => void;
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
    onLogout,
    onEditProfile
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
                        <p className="text-xs text-slate-500 font-medium">วางแผนการเงิน</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={onEditProfile} className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-1.5 rounded-full border border-slate-100 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-2 border-white shadow-sm font-bold text-xs overflow-hidden">
                            {(user as any)?.avatar ? (
                                <img src={(user as any).avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.substring(0, 2).toUpperCase() || "U"
                            )}
                        </div>
                        <span className="text-sm font-bold text-slate-700 pr-2">{user?.name || "Guest User"}</span>
                    </button>
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
                                    <div className="flex flex-col h-full justify-between relative z-10">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <p className="text-lg font-bold text-slate-800 tracking-tight">เงินออมที่มีตอนอายุเกษียณ</p>
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-800">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                                                </div>
                                            </div>
                                            <h4 className="text-3xl md:text-3xl font-black text-emerald-600 leading-none tracking-tight mb-2">
                                                ฿{formatNumber(result.projectedFund)}
                                            </h4>
                                            <div className="flex items-center gap-1">
                                                <p className="text-sm text-slate-400">จากการออมและการลงทุน</p>
                                                <button onClick={() => setShowProjectedModal(true)} className="text-slate-300 hover:text-slate-500 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: Target Fund */}
                                <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(59,130,246,0.15)]">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-200/40 transition-colors duration-700"></div>
                                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl opacity-60"></div>
                                    <div className="flex flex-col h-full justify-between relative z-10">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-lg font-bold text-slate-800 tracking-tight">เงินที่ต้องการก่อนเกษียณ</p>
                                                    <button onClick={() => setShowTargetModal(true)} className="text-slate-300 hover:text-slate-500 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                                    </button>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-slate-800 font-serif font-black text-xl">
                                                    $
                                                </div>
                                            </div>
                                            <h4 className="text-3xl md:text-3xl font-black text-blue-600 leading-none tracking-tight mb-2">
                                                ฿{formatNumber(result.targetFund)}
                                            </h4>
                                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                                สำหรับ {result.yearsInRetirement} ปีหลังเกษียณ (โดยไม่สร้างผลตอบแทนเพิ่มเลย) <br className="hidden md:block" /> หรือออมขั้นต่ำคร่าวๆ ฿{formatNumber(result.monthlyNeeded)} ต่อเดือน <button onClick={() => setShowTargetModal(true)} className="inline-block text-slate-300 hover:text-slate-500 align-middle"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg></button>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3: Monthly Expense */}
                                <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(168,85,247,0.15)]">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-purple-200/40 transition-colors duration-700"></div>
                                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-50/50 rounded-full blur-2xl opacity-60"></div>
                                    <div className="flex flex-col h-full justify-between relative z-10">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-lg font-bold text-slate-800 tracking-tight">ค่าใช้จ่าย/เดือน (ปีแรก)</p>
                                                    <button onClick={() => setShowExpenseModal(true)} className="text-slate-300 hover:text-slate-500 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                                    </button>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-slate-800">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                                </div>
                                            </div>
                                            <h4 className="text-3xl md:text-3xl font-black text-purple-600 leading-none tracking-tight mb-2">
                                                ฿{formatNumber(result.fvExpenseMonthly)}
                                            </h4>
                                            <div className="flex justify-between items-end">
                                                <p className="text-sm font-medium text-slate-500">
                                                    หลังเกษียณ (รวมเงินเฟ้อ) <br /> รวม ฿{formatNumber(result.totalLifetimeExpense)}
                                                </p>
                                                <button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-1 text-slate-400 hover:text-purple-600 transition-colors text-xs font-bold">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                                    รายละเอียด
                                                </button>
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
                                            <div className="flex justify-between items-start mb-4">
                                                <p className="text-lg font-bold text-slate-800 tracking-tight">สถานะแผน</p>
                                                <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-emerald-500">
                                                    {result.status === 'enough' ?
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                                                        :
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="17" y1="7" x2="7" y2="17"></line></svg>
                                                    }
                                                </div>
                                            </div>
                                            <h4 className={`text-3xl md:text-3xl font-black leading-none tracking-tight mb-2 ${result.status === 'enough' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {result.status === 'enough' ? "เพียงพอ" : "ไม่เพียงพอ"}
                                            </h4>
                                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-1">
                                                {result.status === 'enough' ? "แผนการออมเพียงพอสำหรับเกษียณ" : "แผนการออมยังไม่ครอบคลุมเกษียณ"}
                                            </p>
                                            <p className={`text-sm font-bold ${result.status === 'enough' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {result.status === 'enough' ? "อิสรภาพทางการเงิน" : "ควรเริ่มวางแผนเพิ่มเติม"}
                                            </p>
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
                                        <button className="px-5 py-2.5 text-sm font-bold text-blue-600 bg-white hover:bg-blue-50 rounded-xl border-2 border-blue-600 flex items-center gap-2 transition-all hover:-translate-y-0.5" onClick={handleExportCSV}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                            Export Excel
                                        </button>
                                        <button className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5" onClick={handlePrint}>
                                            Print
                                        </button>
                                    </div>
                                </div>
                                <div id="printable-chart" className="w-full relative h-[500px] bg-gradient-to-b from-white to-slate-50/50 rounded-2xl border border-slate-100 p-4">
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
