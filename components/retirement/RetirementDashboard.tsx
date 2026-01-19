
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

import { buildProjectionSeries } from "@/lib/retirement-calculation";

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
    onBack?: () => void;
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
    onEditProfile,
    onBack
}: RetirementDashboardProps) => {

    const [showSumAssured, setShowSumAssured] = React.useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [showActualSavings, setShowActualSavings] = React.useState(true);
    const [showInsuranceTable, setShowInsuranceTable] = React.useState(false);
    const [showProjectedModal, setShowProjectedModal] = React.useState(false);
    const [showTargetModal, setShowTargetModal] = React.useState(false);
    const [showExpenseModal, setShowExpenseModal] = React.useState(false);
    const [showMonteCarloDetails, setShowMonteCarloDetails] = React.useState(false);
    const [isMonteCarloOpen, setIsMonteCarloOpen] = React.useState(false);
    const [chartTickInterval, setChartTickInterval] = React.useState<number>(5);

    // Scroll to results on mobile/tablet when entering dashboard
    React.useEffect(() => {
        if (window.innerWidth < 1024) {
            const resultsElement = document.getElementById("results-section");
            if (resultsElement) {
                setTimeout(() => {
                    resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
            }
        }
    }, []);

    const { insuranceChartData } = useInsuranceLogic(form);

    // Compute data for Print Table
    const printData = React.useMemo(() => {
        // Use 'principalStats' for print table, keeping 'actualHistory' for graph
        const { labels, actual, required, principalStats } = buildProjectionSeries(inputs, result) as any;
        return labels.map((label: string, i: number) => {
            const age = Number(label);
            const savings = actual[i];
            const principal = principalStats ? principalStats[i] : 0;
            const target = Number(label) <= Number(inputs.retireAge) ? required[i] : 0;

            // Get Sum Assured for this age
            let sumAssured = 0;
            if (insuranceChartData) {
                const idx = insuranceChartData.labels.indexOf(age);
                if (idx !== -1) sumAssured = (insuranceChartData.datasets[0].data[idx] as number) || 0;
            }

            return { age, savings, principal, target, sumAssured };
        });
    }, [inputs, result, insuranceChartData]);

    const mcSimulations = Number(form.monteCarloSimulations) || 1500;

    return (
        <div className="min-h-screen bg-white pb-20 font-sans overflow-x-hidden relative print:overflow-visible print:bg-white print-no-padding print-reset-height">
            {/* Print Styles */}
            <style type="text/css" media="print">
                {`
                @page { size: landscape; margin: 4mm; }
                body { 
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact; 
                    background: white;
                }
                
                /* Reset Main Layout for Print */
                .print-no-padding { padding: 0 !important; margin: 0 !important; }
                .print-reset-height { min-height: 0 !important; height: auto !important; overflow: visible !important; }
                
                /* Layout Grid for Single Page */
                .print-layout-container {
                    display: grid;
                    grid-template-rows: auto 1fr auto;
                    height: 98vh; /* Fit within page */
                    width: 100%;
                    gap: 10px;
                }

                /* Chart Specifics */
                #printable-chart { 
                    height: 250px !important; 
                    border: 1px solid #000 !important;
                    box-shadow: none !important;
                    border-radius: 8px !important;
                    break-inside: avoid;
                }
                
                /* Data Table Specifics */
                #print-data-table { 
                    display: block !important; 
                    margin-top: 10px !important;
                    font-size: 9px;
                }
                
                /* Hide everything else */
                .print-hidden, header, nav, footer, .fixed, .sticky { display: none !important; }
                `}
            </style>

            {/* Background Grid Pattern - Hide on Print */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0 print:hidden">
                <div className="absolute inset-0 opacity-[0.2]"
                    style={{
                        backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90" />
            </div>
            {/* TOP NAVIGATION BAR - Hide on Print */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm flex items-center justify-between mb-8 print:hidden">
                {/* ... existing header content ... */}
                <div className="flex items-center gap-3">

                    {onBack ? (
                        <button
                            onClick={onBack}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                    )}
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

            <div className="w-full px-4 md:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10 print:px-0 print:space-y-4">

                {/* Print Only Header */}
                <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase">Retirement Plan Report</h1>
                            <p className="text-slate-500 text-sm mt-1 font-medium">รายงานวางแผนเกษียณอายุสำหรับ: {user?.name || "Guest User"}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</div>
                            <div className="text-lg font-bold text-slate-900">{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                    </div>
                </div>

                {/* Header (Original - hide on print) */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 break-inside-avoid px-1 print:hidden">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">สรุปผลลัพธ์ทางการเงิน</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">วางแผนการรับมือเกษียณด้วยเครื่องมือแบบเห็นภาพ</p>
                    </div>
                    {/* ... buttons ... */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant={isSidebarOpen ? "secondary" : "default"}
                            size="sm"
                            className={`h-9 px-4 rounded-xl font-bold text-xs shadow-sm transition-all gap-2 ${isSidebarOpen ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'}`}
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? (
                                <>
                                    <PanelLeftClose className="w-4 h-4" />
                                    ดูผลลัพธ์ (View Result)
                                </>
                            ) : (
                                <>
                                    <PanelLeftOpen className="w-4 h-4" />
                                    ปรับแผน (Adjust Plan)
                                </>
                            )}
                        </Button>

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



                {/* Main Content Flex Container */}
                <div className="flex items-start gap-0 relative xl:h-[calc(100vh-80px)] xl:overflow-hidden">

                    {/* LEFT AREA: Sidebar (Fixed Width, Height 100%) */}
                    <div className={`
                        shrink-0 transition-all duration-300 ease-in-out border-r border-slate-200 bg-white/50 backdrop-blur-sm
                        ${isSidebarOpen
                            ? 'w-[360px] opacity-100 translate-x-0 mr-8'
                            : 'w-0 opacity-0 -translate-x-4 border-none mr-0 overflow-hidden'}
                        hidden xl:block xl:h-full xl:overflow-y-auto pr-1
                        print:hidden
                        [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
                    `}>
                        <div className="pb-10 pl-1">
                            {/* Inputs Component */}
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

                    {/* LEFT AREA: Mobile/Tablet Stacked (Only visible when sidebar open on small screens) */}
                    <div className={`xl:hidden space-y-6 mb-8 ${isSidebarOpen ? 'block' : 'hidden'} print:hidden`}>
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

                    {/* RIGHT AREA: Charts & Metrics (Flex Grow, Scrollable) */}
                    <div id="results-section" className={`flex-1 min-w-0 space-y-8 transition-all duration-300 xl:h-full xl:overflow-y-auto xl:overflow-x-hidden xl:pr-4 custom-scrollbar pb-20 ${isSidebarOpen ? 'max-w-[100vw] xl:max-w-none' : ''}`}>
                        {/* Hero Summary Card (Redesigned) */}
                        <div className={`relative rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 xl:p-10 overflow-hidden font-sans shadow-xl lg:shadow-2xl transition-all duration-500 group print:hidden ${result.status === 'enough' ? 'bg-gradient-to-br from-[#065f46] via-[#059669] to-[#10b981] shadow-emerald-900/40' : 'bg-gradient-to-br from-[#991b1b] via-[#dc2626] to-[#ef4444] shadow-red-900/40'}`}>
                            {/* Decorative Background Patterns */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none mix-blend-overlay animate-pulse duration-3000"></div>
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

                            {/* Content Container */}
                            <div className={`relative z-10 flex flex-col ${isSidebarOpen ? '2xl:flex-row' : 'xl:flex-row'} xl:items-center justify-between gap-8 lg:gap-10`}>
                                {/* Left Side: Status & Message */}
                                <div className="flex-1 space-y-4 lg:space-y-6">
                                    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full border backdrop-blur-md shadow-sm ${result.status === 'enough' ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-50' : 'bg-red-500/20 border-red-400/30 text-red-50'}`}>
                                        <span className={`relative flex h-2.5 w-2.5 lg:h-3 lg:w-3`}>
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${result.status === 'enough' ? 'bg-emerald-300' : 'bg-red-300'}`}></span>
                                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 lg:h-3 lg:w-3 ${result.status === 'enough' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                        </span>
                                        <span className="text-xs lg:text-sm font-bold tracking-wide uppercase">{result.status === 'enough' ? 'สถานะ : เป้าหมายสำเร็จ' : 'สถานะ : ต้องปรับปรุงแผน'}</span>
                                    </div>

                                    <div className="space-y-2 lg:space-y-3">
                                        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                                            {result.status === 'enough' ? 'แผนการเงินมั่นคง' : 'แผนการเงินยังมีความเสี่ยง'}
                                        </h1>
                                        <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-white/90">
                                            {result.status === 'enough' ? 'พร้อมเกษียณอย่างสบายตามที่ตั้งใจ' : 'ควรเริ่มวางแผนเก็บออมเพิ่มเติมทันที'}
                                        </h2>
                                    </div>

                                    <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm max-w-xl">
                                        <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed flex items-start gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 mt-0.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                            {result.status === 'enough'
                                                ? 'ยินดีด้วย! สินทรัพย์ของคุณเพียงพอสำหรับการเกษียณ คุณมีอิสรภาพทางการเงินแล้ว'
                                                : `คุณยังขาดเงินเกษียณอีก ฿${formatNumber(Math.abs(result.gap))} ลองเพิ่มเงินออมหรือปรับเปลี่ยนแผนการลงทุน`}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Side: Summary Stats Card */}
                                <div className="shrink-0 relative group/stats cursor-default w-full lg:w-auto">
                                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-[24px] lg:rounded-[32px] transform rotate-1 lg:rotate-3 group-hover/stats:rotate-2 lg:group-hover/stats:rotate-6 transition-transform duration-500"></div>
                                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 min-w-[280px] lg:min-w-[320px] shadow-2xl overflow-hidden">
                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/stats:translate-x-[100%] transition-transform duration-1000"></div>

                                        <div className="flex flex-row lg:flex-col justify-between lg:justify-start gap-4 lg:gap-6">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-[10px] lg:text-[11px] font-bold text-white/70 uppercase tracking-widest">เงินออมที่จะมี (Projected)</p>
                                                    <div className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]"></div>
                                                </div>
                                                <p className="text-2xl lg:text-4xl xl:text-[42px] font-black tracking-tighter text-white drop-shadow-sm leading-none">
                                                    ฿{formatNumber(result.projectedFund)}
                                                </p>
                                            </div>

                                            <div className="hidden lg:block h-px bg-gradient-to-r from-transparent via-white/30 to-transparent w-full"></div>
                                            <div className="block lg:hidden w-px bg-gradient-to-b from-transparent via-white/30 to-transparent h-full mx-2"></div>

                                            <div className="flex-1 text-right lg:text-left">
                                                <div className="flex justify-end lg:justify-between items-center mb-1">
                                                    <p className="text-[10px] lg:text-[11px] font-bold text-white/60 uppercase tracking-widest">เงินต้นที่ควรมี (Target)</p>
                                                    <div className="hidden lg:block w-2 h-2 rounded-full bg-blue-200/50"></div>
                                                </div>
                                                <p className="text-xl lg:text-2xl font-bold tracking-tight text-white/90">
                                                    ฿{formatNumber(result.targetFund)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics Grid (Redesigned) */}
                        <div className="relative print:hidden">
                            {/* Grid Background Decoration */}
                            <div className="absolute inset-0 -m-8 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>

                            <div className={`grid grid-cols-1 gap-4 lg:gap-6 relative z-10 ${isSidebarOpen ? 'xl:grid-cols-1 2xl:grid-cols-2' : 'md:grid-cols-2'}`}>
                                {/* Card 1: Projected Savings */}
                                <div
                                    onClick={() => setShowProjectedModal(true)}
                                    className="bg-white rounded-[24px] lg:rounded-[28px] p-5 lg:p-7 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group cursor-pointer hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.15)] hover:border-emerald-100 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
                                >
                                    <div className="absolute -right-8 -top-8 text-emerald-100/50 group-hover:text-emerald-200/50 transition-colors pointer-events-none z-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 -rotate-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 0.6-3.8 1.5l-2.5 2.5a3.5 3.5 0 0 1-4.9-5.0L10.3 1.5" /><path d="M19 5a3 5 0 0 1 0 6h-6.7" /><path d="M12 11l-3 3" /><circle cx="5" cy="18" r="4" /><path d="M9 18l6-6" /></svg>
                                    </div>
                                    <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-emerald-50 rounded-full blur-2xl -mr-8 -mt-8 lg:-mr-10 lg:-mt-10 transition-colors group-hover:bg-emerald-100/80 -z-10"></div>
                                    <div className="relative flex flex-col h-full justify-between">
                                        <div className="flex justify-between items-start mb-3 lg:mb-4">
                                            <div>
                                                <p className="text-sm lg:text-base font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">เงินออมที่มีอายุเกษียณ</p>
                                                <span className="text-[9px] lg:text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Projected Wealth</span>
                                            </div>
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-emerald-100/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 0.6-3.8 1.5l-2.5 2.5a3.5 3.5 0 0 1-4.9-5.0L10.3 1.5" /><path d="M19 5a3 5 0 0 1 0 6h-6.7" /><path d="M12 11l-3 3" /><circle cx="5" cy="18" r="4" /><path d="M9 18l6-6" /></svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-2xl lg:text-3xl xl:text-[40px] font-black text-slate-900 tracking-tight leading-none mb-1 lg:mb-2 group-hover:text-emerald-600 transition-colors">
                                                ฿{formatNumber2(result.projectedFund)}
                                            </h4>
                                            <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                                จากการออมและการลงทุน
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: Target Fund */}
                                <div
                                    onClick={() => setShowTargetModal(true)}
                                    className="bg-white rounded-[24px] lg:rounded-[28px] p-5 lg:p-7 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group cursor-pointer hover:shadow-[0_20px_50px_-15px_rgba(59,130,246,0.15)] hover:border-blue-100 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
                                >
                                    <div className="absolute -right-8 -top-8 text-blue-100/50 group-hover:text-blue-200/50 transition-colors pointer-events-none z-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 -rotate-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                                    </div>
                                    <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-blue-50 rounded-full blur-2xl -mr-8 -mt-8 lg:-mr-10 lg:-mt-10 transition-colors group-hover:bg-blue-100/80 -z-10"></div>
                                    <div className="relative flex flex-col h-full justify-between">
                                        <div className="flex justify-between items-start mb-3 lg:mb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm lg:text-base font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">เงินที่ต้องการก่อนเกษียณ</p>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300 mb-1"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                                </div>
                                                <span className="text-[9px] lg:text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Retirement Goal</span>
                                            </div>
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-[-3deg] transition-transform duration-300 shadow-sm border border-blue-100/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                                            </div>
                                        </div>
                                        <div>
                                            <div>
                                                <h4 className="text-2xl lg:text-3xl xl:text-[40px] font-black text-slate-900 tracking-tight leading-none mb-2 group-hover:text-blue-600 transition-colors">
                                                    ฿{formatNumber2(result.targetFund)}
                                                </h4>

                                                <div className="flex flex-col gap-1">
                                                    <p className="text-xs font-medium text-slate-400 group-hover:text-slate-500 transition-colors line-clamp-1">
                                                        สำหรับ {result.yearsInRetirement} ปีหลังเกษียณ (โดยไม่สร้างผลตอบแทนเพิ่มเลย)
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
                                                        <span>หรือออมขั้นต่ำคร่าวๆ ฿{formatNumber2(result.monthlyNeeded)} ต่อเดือน</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3: Monthly Expense */}
                                <div
                                    onClick={() => setShowExpenseModal(true)}
                                    className="bg-white rounded-[24px] lg:rounded-[28px] p-5 lg:p-7 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group cursor-pointer hover:shadow-[0_20px_50px_-15px_rgba(168,85,247,0.15)] hover:border-purple-100 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
                                >
                                    <div className="absolute -right-8 -top-8 text-purple-100/50 group-hover:text-purple-200/50 transition-colors pointer-events-none z-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 -rotate-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    </div>
                                    <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-purple-50 rounded-full blur-2xl -mr-8 -mt-8 lg:-mr-10 lg:-mt-10 transition-colors group-hover:bg-purple-100/80 -z-10"></div>
                                    <div className="relative flex flex-col h-full justify-between">
                                        <div className="flex justify-between items-start mb-3 lg:mb-4">
                                            <div>
                                                <p className="text-sm lg:text-base font-bold text-slate-800 mb-1 group-hover:text-purple-700 transition-colors">ค่าใช้จ่าย/เดือน (ปีแรก)</p>
                                                <span className="text-[9px] lg:text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Future Expense</span>
                                            </div>
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-purple-100/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-2xl lg:text-3xl xl:text-[40px] font-black text-slate-900 tracking-tight leading-none mb-1 lg:mb-2 group-hover:text-purple-600 transition-colors">
                                                ฿{formatNumber2(result.fvExpenseMonthly)}
                                            </h4>
                                            <p className="text-xs font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
                                                รวมเงินเฟ้อแล้ว (ทั้งชีวิต ฿{formatNumber2(result.totalLifetimeExpense)})
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 4: Status */}
                                <div
                                    className={`bg-white rounded-[24px] lg:rounded-[28px] p-5 lg:p-7 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group cursor-default transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] ${result.status === 'enough' ? 'hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.15)] hover:border-emerald-100' : 'hover:shadow-[0_20px_50px_-15px_rgba(244,63,94,0.15)] hover:border-rose-100'}`}
                                >
                                    <div className={`absolute -right-8 -top-8 transition-colors pointer-events-none z-0 ${result.status === 'enough' ? 'text-emerald-100/50 group-hover:text-emerald-200/50' : 'text-rose-100/50 group-hover:text-rose-200/50'}`}>
                                        {result.status === 'enough' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 -rotate-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 -rotate-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        )}
                                    </div>
                                    <div className={`absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 rounded-full blur-2xl -mr-8 -mt-8 lg:-mr-10 lg:-mt-10 transition-colors -z-10 ${result.status === 'enough' ? 'bg-emerald-50 group-hover:bg-emerald-100/80' : 'bg-rose-50 group-hover:bg-rose-100/80'}`}></div>
                                    <div className="relative flex flex-col h-full justify-between">
                                        <div className="flex justify-between items-start mb-3 lg:mb-4">
                                            <div>
                                                <p className={`text-sm lg:text-base font-bold mb-1 transition-colors ${result.status === 'enough' ? 'text-slate-800 group-hover:text-emerald-700' : 'text-slate-800 group-hover:text-rose-700'}`}>สถานะแผน</p>
                                                <span className={`text-[9px] lg:text-[10px] px-2 py-0.5 rounded-full font-bold ${result.status === 'enough' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    Result Status
                                                </span>
                                            </div>
                                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border ${result.status === 'enough' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-rose-50 text-rose-600 border-rose-100/50'}`}>
                                                {result.status === 'enough' ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className={`text-2xl lg:text-3xl xl:text-[40px] font-black tracking-tight leading-none mb-1 lg:mb-2 transition-colors ${result.status === 'enough' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {result.status === 'enough' ? "เพียงพอ" : "ไม่พอ"}
                                            </h4>
                                            <p className="text-xs font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
                                                {result.status === 'enough' ? "คุณทำได้ดีมาก แผนการออมยั่งยืน" : "สินทรัพย์ไม่เพียงพอ ต้องปรับแผนด่วน"}
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
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-50/50 via-transparent to-transparent opacity-60 pointer-events-none -mr-20 -mt-20 rounded-full blur-3xl print:hidden"></div>
                                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-6 print:hidden">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">กราฟการเงินออม</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium pl-4.5">Wealth Projection & Goal Analysis</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner mr-2">
                                            {[1, 5, 10].map((interval) => (
                                                <button
                                                    key={interval}
                                                    onClick={() => setChartTickInterval(interval)}
                                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${chartTickInterval === interval
                                                        ? "bg-white text-indigo-600 shadow-sm hover:shadow-md scale-105"
                                                        : "text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50"
                                                        }`}
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
                                <div id="printable-chart" className="w-full relative h-[500px] print:h-[250px] bg-gradient-to-b from-white to-slate-50/50 rounded-2xl border border-slate-100 p-4">
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
                                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 pt-6 border-t border-slate-100 print:hidden">
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

                            {/* PRINT ONLY: Chart Data Table */}
                            <div id="print-data-table" className="hidden print:block mt-6 font-mono text-black">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 border-b border-black pb-1 inline-block">DATA TABLE (YEARLY ANALYSIS)</h3>
                                <div className="grid grid-cols-3 gap-4 text-[8px] leading-tight">
                                    {/* Generate 3 Columns */}
                                    {Array.from({ length: 3 }).map((_, colIndex) => {
                                        const chunkSize = Math.ceil(printData.length / 3);
                                        const start = colIndex * chunkSize;
                                        const end = start + chunkSize;
                                        const dataSlice = printData.slice(start, end);

                                        return (
                                            <div key={colIndex} className="border border-black">
                                                <table className="w-full text-left table-fixed">
                                                    <thead className="bg-gray-100 print:bg-gray-100 font-bold border-b border-black">
                                                        <tr>
                                                            <th className="py-1 px-1 text-center border-r border-black uppercase w-[15%]">Age</th>
                                                            <th className="py-1 px-1 text-right border-r border-black uppercase w-[25%]">Principal</th>
                                                            <th className="py-1 px-1 text-right border-r border-black uppercase w-[25%]">Savings</th>
                                                            <th className="py-1 px-1 text-right uppercase w-[35%]">Target</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-black">
                                                        {dataSlice.map((row: any) => (
                                                            <tr key={row.age} className="border-b border-black last:border-0">
                                                                <td className="py-0.5 px-1 text-center font-bold border-r border-black">{row.age}</td>
                                                                <td className="py-0.5 px-1 text-right border-r border-black">{formatNumber(row.principal)}</td>
                                                                <td className="py-0.5 px-1 text-right font-bold border-r border-black">{formatNumber(row.savings)}</td>
                                                                <td className="py-0.5 px-1 text-right">{row.target > 0 ? formatNumber(row.target) : "-"}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="text-[8px] mt-2 flex justify-between items-center border-t border-black pt-2 uppercase font-medium">
                                    <div className="flex gap-4">
                                        <span>* Principal: เงินต้นสะสม</span>
                                        <span>* Savings: เงินออมรวม</span>
                                        <span>* Target: เป้าหมาย</span>
                                    </div>
                                    <span>Generated by Financial Planner App</span>
                                </div>
                            </div>



                            {/* Side Column Widgets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:hidden">
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
