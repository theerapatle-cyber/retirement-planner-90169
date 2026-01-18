import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MemberProfile, FormState, Allocation } from "@/types/retirement";
import { buildRetirementInputs, calculateRetirement } from "@/lib/retirement-calculation";
import { formatNumber } from "@/lib/utils";

interface FamilyDashboardProps {
    familyMembers: MemberProfile[];
    currentMemberId: string;
    form: FormState;
    gender: "male" | "female";
    savingMode: "flat" | "step5";
    returnMode: "avg" | "custom";
    allocations: Allocation[];
    setPlanType: (type: "individual" | "family" | null) => void;
    setShowFamilyResult: (show: boolean) => void;
    handleSwitchMember: (id: string) => void;
    handleAddMember: () => void;
    getFamilySummary: () => {
        totalTarget: number;
        totalProjected: number;
        totalGap: number;
        memberCount: number;
        totalMonthlySavingsCurrent: number;
        totalMonthlyNeeded: number;
    };
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
    familyMembers,
    currentMemberId,
    form,
    gender,
    savingMode,
    returnMode,
    allocations,
    setPlanType,
    setShowFamilyResult,
    handleSwitchMember,
    handleAddMember,
    getFamilySummary
}) => {
    const summary = getFamilySummary();
    const totalProgress = Math.min(100, (summary.totalMonthlySavingsCurrent / (summary.totalMonthlyNeeded || 1)) * 100);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm print:hidden">
                <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => {
                                setPlanType(null);
                                setShowFamilyResult(false);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <div>
                            <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <span className="text-slate-900">ภาพรวม</span> ครอบครัว (Family Overview)
                            </h1>
                            <p className="text-xs text-slate-500 font-medium hidden sm:block">ภาพรวมแผนการเงินของครอบครัว ({familyMembers.length} ท่าน)</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => window.print()} className="px-4 py-2 bg-[#1e293b] text-white text-xs font-bold rounded-full shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                            <span>พิมพ์รายงาน (Print Report)</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-8">

                {/* 1. STATUS HEADER */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Status Card */}
                    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-center items-center text-center">
                        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 ${summary.totalGap >= 0 ? "bg-emerald-400" : "bg-red-400"}`}></div>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-sm ${summary.totalGap >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                            {summary.totalGap >= 0
                                ? <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            }
                        </div>
                        <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">สถานะภาพรวม</div>
                        <div className={`text-lg font-black mb-1 flex items-center gap-1 ${summary.totalGap >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                            {summary.totalGap >= 0 ? "มั่งคั่ง (Wealthy)" : "ต้องปรับปรุง"}
                            {summary.totalGap >= 0 && <span className="text-amber-400">✨</span>}
                        </div>
                        <div className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${summary.totalGap >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                            {summary.totalGap >= 0 ? "เงินเพียงพอตลอดชีพ" : "เงินไม่เพียงพอ"}
                        </div>
                    </div>

                    {/* Target Card */}
                    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[80px] -mr-4 -mt-4"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1.5 h-4 rounded-full bg-blue-500"></div>
                                <span className="text-xs font-bold text-slate-500">เป้าหมายเกษียณรวม</span>
                            </div>
                            <div className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">฿{formatNumber(summary.totalTarget)}</div>
                            <div className="mt-2 text-xs text-slate-400 font-medium">Total Target Fund</div>
                        </div>
                    </div>

                    {/* Projected Card */}
                    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[80px] -mr-4 -mt-4"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1.5 h-4 rounded-full bg-indigo-500"></div>
                                <span className="text-xs font-bold text-slate-500">เงินออมคาดการณ์</span>
                            </div>
                            <div className="text-2xl lg:text-3xl font-black text-indigo-600 tracking-tight">฿{formatNumber(summary.totalProjected)}</div>
                            <div className="mt-2 text-xs text-slate-400 font-medium">Projected Savings</div>
                        </div>
                    </div>

                    {/* Gap Card */}
                    <div className={`rounded-[24px] p-6 shadow-md hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-center ${summary.totalGap >= 0 ? "bg-gradient-to-br from-[#00a991] to-[#009688]" : "bg-gradient-to-br from-red-500 to-red-600"}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1.5 h-4 rounded-full bg-white/80"></div>
                                <span className="text-xs font-bold text-white/90">ส่วนต่างเป้าหมาย</span>
                            </div>
                            <div className="text-2xl lg:text-3xl font-black tracking-tight flex items-baseline gap-1">
                                {summary.totalGap >= 0 ? "+" : ""}{formatNumber(Math.abs(summary.totalGap))}
                            </div>
                            <div className="mt-2 inline-flex">
                                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                                    {summary.totalGap >= 0 ? "เงินส่วนเกิน (Surplus)" : "เงินที่ขาด (Shortfall)"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. AI INSIGHT & PERFORMANCE */}
                <div className="bg-white rounded-[24px] p-6 lg:p-10 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>
                        </div>
                        <h4 className="text-lg font-black text-slate-800 tracking-tight">บทวิเคราะห์จาก AI (AI Insight)</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left: Text */}
                        <div className="space-y-8">
                            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 rounded-l-2xl"></div>
                                <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    สรุปผลวิเคราะห์ (ANALYSIS SUMMARY)
                                </div>
                                <p className="text-sm text-slate-700 leading-7 font-medium">
                                    จากการประเมินแผนการเกษียณของสมาชิกในครอบครัว
                                    {summary.totalGap >= 0
                                        ? " พบว่าภาพรวมสถานะทางการเงินมีความแข็งแกร่ง (Strong Health) สามารถบรรลุเป้าหมายเกษียณได้ทุกคน มีเงินสำรองเพียงพอสำหรับการใช้ชีวิตในระยะยาว"
                                        : " พบความเสี่ยงที่เงินออมอาจไม่เพียงพอในระยะยาว (Shortfall Risk) แนะนำปรับโครงสร้างการออมหรือลดรายจ่ายบางส่วนเพื่อให้ครอบคลุมเป้าหมาย"}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                    คำแนะนำ (Suggestion)
                                </div>
                                <div className="grid gap-3">
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm mb-1">ทบทวนความคุ้มครอง</div>
                                            <div className="text-xs text-slate-500 font-medium leading-relaxed">ควรตรวจสอบสิทธิประโยชน์ทางภาษี ประกันสุขภาพ และโรคร้ายแรงให้ครอบคลุมสมาชิกทุกคน</div>
                                        </div>
                                    </div>
                                    {summary.totalMonthlySavingsCurrent < summary.totalMonthlyNeeded && (
                                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm mb-1">ปรับเพิ่มสัดส่วนการออม</div>
                                                <div className="text-xs text-slate-500 font-medium">
                                                    แนะนำออมเพิ่มรวมกัน <span className="font-bold text-amber-500">฿{formatNumber(summary.totalMonthlyNeeded - summary.totalMonthlySavingsCurrent)}</span> ต่อเดือน เพื่อปิดช่องว่างทางการเงิน
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Graphic */}
                        <div className="bg-[#f8fafc] rounded-[32px] p-8 lg:p-12 border border-slate-100 flex flex-col justify-center items-center text-center relative overflow-hidden h-full min-h-[400px]">
                            <div className="bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm mb-8">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">คะแนนความสำเร็จ (SUCCESS SCORE)</span>
                            </div>

                            <div className="relative w-64 h-64 flex items-center justify-center mb-10">
                                {/* Background Ring */}
                                <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                                    <circle cx="50%" cy="50%" r="42%" stroke="white" strokeWidth="24" fill="none" />
                                    <circle cx="50%" cy="50%" r="42%" stroke="#e2e8f0" strokeWidth="24" fill="none" className="opacity-50" />
                                    <circle cx="50%" cy="50%" r="42%"
                                        stroke={summary.totalGap >= 0 ? "#00c49f" : "#f59e0b"}
                                        strokeWidth="24"
                                        fill="none"
                                        strokeDasharray="300" // Approx circum
                                        strokeDashoffset={300 - (300 * (totalProgress / 100))}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-6xl font-black text-slate-900 tracking-tighter">{totalProgress.toFixed(0)}%</span>
                                </div>
                            </div>

                            <div className="w-full max-w-xs space-y-4">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-slate-500">ออมจริง (ปัจจุบัน)</span>
                                        <span className="text-xs font-black text-slate-700">฿{formatNumber(summary.totalMonthlySavingsCurrent)}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.min(100, (summary.totalMonthlySavingsCurrent / summary.totalMonthlyNeeded) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-indigo-500">เป้าหมาย (ที่ควรทำให้ได้)</span>
                                        <span className="text-xs font-black text-indigo-600">฿{formatNumber(summary.totalMonthlyNeeded)}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full w-full opacity-60"></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-3 text-center font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        ยอดออมต่อเดือนที่แนะนำ เพื่อให้ทุกคนบรรลุเป้าหมายเกษียณ
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. MEMBER BREAKDOWN */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <span className="text-indigo-600 bg-indigo-50 p-2 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            </span>
                            รายละเอียดรายบุคคล
                        </h4>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddMember}
                            className="rounded-full border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2 h-9 px-4"
                        >
                            <Plus className="w-4 h-4" />
                            เพิ่มสมาชิกครอบครัว
                        </Button>
                    </div>

                    <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                                <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-500 font-bold text-xs">
                                    <tr>
                                        <th className="py-5 px-8 w-[30%]">สมาชิกครอบครัว</th>
                                        <th className="py-5 px-6 text-right w-[15%]">เวลาที่เหลือ (ปี)</th>
                                        <th className="py-5 px-6 text-right w-[20%]">เป้าหมายเงินออม</th>
                                        <th className="py-5 px-6 text-left w-[20%] pl-8">ความคืบหน้า</th>
                                        <th className="py-5 px-8 text-right w-[15%]">ผลประเมิน</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {familyMembers.map((m) => {
                                        const isCurrent = String(m.id) === String(currentMemberId);
                                        const inputs = buildRetirementInputs({
                                            form: isCurrent ? form : m.form,
                                            gender: isCurrent ? gender : m.gender,
                                            savingMode: isCurrent ? savingMode : m.savingMode,
                                            returnMode: isCurrent ? returnMode : m.returnMode,
                                            allocations: isCurrent ? allocations : m.allocations
                                        });
                                        const res = calculateRetirement(inputs);
                                        const prog = Math.min(100, (res.projectedFund / (res.targetFund || 1)) * 100);
                                        const yearsLeft = Number(m.form.retireAge) - Number(m.form.currentAge);
                                        const relationMap: Record<string, string> = { self: "ตนเอง", spouse: "คู่สมรส", child: "บุตร", father: "บิดา", mother: "มารดา", relative: "ญาติ" };

                                        return (
                                            <tr
                                                key={m.id}
                                                className="hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer group/row border-b border-slate-50 last:border-0"
                                                onClick={() => {
                                                    handleSwitchMember(m.id);
                                                    setShowFamilyResult(false);
                                                }}
                                            >
                                                <td className="py-5 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-sm transition-transform group-hover/row:scale-110 ${res.status === "enough" ? "bg-emerald-100 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                                            {m.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                                                {m.name}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">{relationMap[m.relation] || m.relation}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <span className="font-bold text-slate-700 text-base">{yearsLeft}</span> <span className="text-xs text-slate-400 font-medium">ปี</span>
                                                </td>
                                                <td className="py-5 px-6 text-right font-black text-slate-800 text-base">
                                                    ฿{formatNumber(res.targetFund)}
                                                </td>
                                                <td className="py-5 px-6 pl-8">
                                                    <div className="w-full bg-slate-100 rounded-full h-2 mb-1 overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-1000 ${res.status === "enough" ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: `${prog}%` }}></div>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 text-right">{prog.toFixed(0)}% ตามแผน</div>
                                                </td>
                                                <td className="py-5 px-8 text-right">
                                                    {res.status === "enough"
                                                        ? <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">เพียงพอ</span>
                                                        : <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">ขาด {formatNumber(Math.abs(res.gap))}</span>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })}

                                    {familyMembers.length < 10 && (
                                        <tr
                                            className="bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer border-t border-slate-100 group/add"
                                            onClick={handleAddMember}
                                        >
                                            <td colSpan={5} className="py-6 px-8">
                                                <div className="flex items-center justify-center gap-3 text-slate-400 font-bold group-hover/add:text-indigo-600 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-lg group-hover/add:border-indigo-200 group-hover/add:bg-indigo-50 transition-all shadow-sm">+</div>
                                                    <span className="text-sm">เพิ่มสมาชิกครอบครัว</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div id="family-print-report" className="hidden print:block bg-white p-8">
                    {/* Print Header */}
                    <div className="flex justify-between items-center border-b-2 border-slate-800 pb-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Family Financial Plan</h1>
                            <p className="text-slate-500 font-medium text-sm mt-1">รายงานสรุปแผนการเงินครอบครัว</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Date</div>
                            <div className="text-xl font-bold text-slate-900">{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="mb-10 bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                            Executive Summary
                        </h2>
                        <div className="flex gap-8">
                            <div className="w-2/3">
                                <p className="text-sm text-slate-700 leading-relaxed text-justify">
                                    จากการประเมินแผนการเกษียณของสมาชิกในครอบครัวทั้งหมด {familyMembers.length} ท่าน พบว่า
                                    {summary.totalGap >= 0
                                        ? " ภาพรวมสถานะทางการเงินมีความแข็งแกร่ง (Strong Financial Health) สามารถบรรลุเป้าหมายเกษียณได้ทุกคน โดยมีส่วนเกินทุนสำรองที่เพียงพอสำหรับการใช้ชีวิตหลังเกษียณอย่างมีคุณภาพ"
                                        : " ภาพรวมยังมีความเสี่ยงที่จะเงินไม่พอใช้หลังเกษียณ (Potential Shortfall) โดยเฉพาะในช่วงปลายของแผน จำเป็นต้องปรับปรุงโครงสร้างการออมหรือลดค่าใช้จ่ายเพื่อให้บรรลุเป้าหมาย"}
                                </p>
                            </div>
                            <div className="w-1/3 border-l border-slate-200 pl-8">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold uppercase">Family Status</div>
                                        <div className={`text-xl font-black ${summary.totalGap >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                            {summary.totalGap >= 0 ? "WEALTHY" : "NEEDS IMPROVEMENT"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold uppercase">Success Score</div>
                                        <div className="text-3xl font-black text-slate-900">{totalProgress.toFixed(0)}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Metrics Grid */}
                    <div className="grid grid-cols-3 gap-6 mb-12">
                        <div className="border border-slate-200 p-4 rounded-lg">
                            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Total Target</div>
                            <div className="text-2xl font-black text-slate-900">฿{formatNumber(summary.totalTarget)}</div>
                        </div>
                        <div className="border border-slate-200 p-4 rounded-lg">
                            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Projected Wealth</div>
                            <div className="text-2xl font-black text-indigo-600">฿{formatNumber(summary.totalProjected)}</div>
                        </div>
                        <div className={`border p-4 rounded-lg ${summary.totalGap >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                            <div className={`text-xs font-bold uppercase mb-1 ${summary.totalGap >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                {summary.totalGap >= 0 ? "Surplus (+)" : "Gap (-)"}
                            </div>
                            <div className={`text-2xl font-black ${summary.totalGap >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                                ฿{formatNumber(Math.abs(summary.totalGap))}
                            </div>
                        </div>
                    </div>

                    {/* Member Breakdown Table */}
                    <div className="mb-8">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Member Analysis</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-slate-800 text-left">
                                    <th className="py-2 font-black text-slate-900 uppercase w-[30%]">Member</th>
                                    <th className="py-2 font-black text-slate-900 uppercase text-right">Age</th>
                                    <th className="py-2 font-black text-slate-900 uppercase text-right">Target</th>
                                    <th className="py-2 font-black text-slate-900 uppercase text-right">Projected</th>
                                    <th className="py-2 font-black text-slate-900 uppercase text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {familyMembers.map((m) => {
                                    const isCurrent = String(m.id) === String(currentMemberId);
                                    const inputs = buildRetirementInputs({
                                        form: isCurrent ? form : m.form,
                                        gender: isCurrent ? gender : m.gender,
                                        savingMode: isCurrent ? savingMode : m.savingMode,
                                        returnMode: isCurrent ? returnMode : m.returnMode,
                                        allocations: isCurrent ? allocations : m.allocations
                                    });
                                    const res = calculateRetirement(inputs);
                                    const relationMap: Record<string, string> = { self: "Self", spouse: "Spouse", child: "Child", father: "Father", mother: "Mother", relative: "Relative" };
                                    return (
                                        <tr key={m.id}>
                                            <td className="py-3">
                                                <div className="font-bold text-slate-900">{m.name}</div>
                                                <div className="text-xs text-slate-500">{relationMap[m.relation] || m.relation}</div>
                                            </td>
                                            <td className="py-3 text-right font-medium">{m.form.currentAge}</td>
                                            <td className="py-3 text-right font-medium">฿{formatNumber(res.targetFund)}</td>
                                            <td className="py-3 text-right font-bold text-indigo-600">฿{formatNumber(res.projectedFund)}</td>
                                            <td className="py-3 text-right">
                                                {res.status === "enough"
                                                    ? <span className="text-emerald-600 font-bold text-xs uppercase">✓ On Track</span>
                                                    : <span className="text-red-500 font-bold text-xs uppercase"> Needs: {formatNumber(Math.abs(res.gap))}</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                        <div>Generated by Financial Planner App</div>
                        <div>Page 1 of 1</div>
                    </div>
                </div>
            </main>
        </div >
    );
};

