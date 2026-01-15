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
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group flex flex-col justify-center items-center text-center">
                        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 ${summary.totalGap >= 0 ? "bg-emerald-200" : "bg-red-200"}`}></div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-inner ${summary.totalGap >= 0 ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`}>
                            {summary.totalGap >= 0
                                ? <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            }
                        </div>
                        <div className="text-xs font-bold text-slate-400 mb-1">สถานะภาพรวม</div>
                        <div className={`text-xl font-black mb-1 ${summary.totalGap >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {summary.totalGap >= 0 ? "มั่งคั่ง (Wealthy)" : "ต้องปรับปรุง"}
                            {summary.totalGap >= 0 && <span className="ml-1 text-yellow-400">✨</span>}
                        </div>
                        <div className={`text-xs font-medium ${summary.totalGap >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {summary.totalGap >= 0 ? "เงินเพียงพอตลอดชีพ" : "เงินไม่เพียงพอ"}
                        </div>
                    </div>

                    {/* Target Card */}
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[100px] -mr-4 -mt-4"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                <span className="text-xs font-bold text-slate-400">เป้าหมายต้องมี</span>
                            </div>
                            <div className="text-3xl font-black text-slate-800 tracking-tight">฿{formatNumber(summary.totalTarget)}</div>
                            <div className="mt-3">
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">Target Fund</span>
                            </div>
                        </div>
                    </div>

                    {/* Projected Card */}
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[100px] -mr-4 -mt-4"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                <span className="text-xs font-bold text-slate-400">เงินออมรวม</span>
                            </div>
                            <div className="text-3xl font-black text-indigo-600 tracking-tight">฿{formatNumber(summary.totalProjected)}</div>
                            <div className="mt-3">
                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">Projected</span>
                            </div>
                        </div>
                    </div>

                    {/* Gap Card */}
                    <div className={`rounded-[32px] p-6 shadow-lg relative overflow-hidden flex flex-col justify-center ${summary.totalGap >= 0 ? "bg-[#00a991]" : "bg-red-500"}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                <span className="text-xs font-bold text-white/80">ส่วนต่าง (GAP)</span>
                            </div>
                            <div className="text-3xl font-black tracking-tight flex items-baseline gap-1">
                                {summary.totalGap >= 0 ? "+" : ""}{formatNumber(Math.abs(summary.totalGap))}
                            </div>
                            <div className="mt-3">
                                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                                    {summary.totalGap >= 0 ? "เงินส่วนเกิน (Surplus)" : "เงินที่ขาด (Shortfall)"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. AI INSIGHT & PERFORMANCE */}
                <div className="bg-white rounded-[40px] p-6 lg:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shadow-sm ring-4 ring-amber-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>
                        </div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">บทวิเคราะห์จาก AI (AI Insight)</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left: Text */}
                        <div className="space-y-8">
                            <div className="bg-[#fffbeb] p-6 rounded-3xl border border-amber-100/50">
                                <div className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                    บทสรุปผู้บริหาร (EXECUTIVE SUMMARY)
                                </div>
                                <p className="text-sm text-slate-700 leading-7 font-medium">
                                    จากการประเมินแผนการเกษียณของสมาชิกในครอบครัวทั้ง {familyMembers.length} ท่าน พบว่า
                                    {summary.totalGap >= 0
                                        ? " ภาพรวมสถานะทางการเงินมีความแข็งแกร่งมาก (Strong Financial Health) สามารถบรรลุเป้าหมายเกษียณได้ทุกคน โดยมีส่วนเกินทุนสำรองที่เพียงพอ"
                                        : " ภาพรวมยังมีความเสี่ยงที่จะเงินไม่พอใช้หลังเกษียณ (Potential Shortfall) โดยเฉพาะในช่วงปลายของแผน จำเป็นต้องปรับปรุงโครงสร้างการออม"}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="text-sm font-bold text-slate-700">ข้อแนะนำเพิ่มเติม (Action Plan)</div>
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="w-12 h-12 rounded-2xl bg-white text-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-800 text-sm mb-1">จัดการความคุ้มครอง</div>
                                            <div className="text-xs text-slate-500 font-medium">ตรวจสอบสิทธิประโยชน์ทางภาษีและการประกันสุขภาพ</div>
                                        </div>
                                    </div>
                                    {summary.totalMonthlySavingsCurrent < summary.totalMonthlyNeeded && (
                                        <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800 text-sm mb-1">เพิ่มการออมด่วน</div>
                                                <div className="text-xs text-slate-500 font-medium">
                                                    ควรพิจารณาออมเพิ่มรวมกันอีก <span className="font-bold text-amber-500">฿{formatNumber(summary.totalMonthlyNeeded - summary.totalMonthlySavingsCurrent)}</span> ต่อเดือน
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
                                        <span className="text-xs font-bold text-slate-500">ออมจริง</span>
                                        <span className="text-xs font-black text-slate-700">฿{formatNumber(summary.totalMonthlySavingsCurrent)}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.min(100, (summary.totalMonthlySavingsCurrent / summary.totalMonthlyNeeded) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-indigo-500">เป้าหมาย</span>
                                        <span className="text-xs font-black text-indigo-600">฿{formatNumber(summary.totalMonthlyNeeded)}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full w-full opacity-60"></div>
                                    </div>
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
                            รายละเอียดรายบุคคล (Member Breakdown)
                        </h4>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddMember}
                            className="rounded-full border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2 h-9 px-4"
                        >
                            <Plus className="w-4 h-4" />
                            เพิ่มสมาชิกใหม่
                        </Button>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                                <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="py-5 px-8 w-[30%]">สมาชิก (MEMBER)</th>
                                        <th className="py-5 px-6 text-right w-[15%]">อีก (ปี) เกษียณ</th>
                                        <th className="py-5 px-6 text-right w-[20%]">เป้าหมาย</th>
                                        <th className="py-5 px-6 text-left w-[20%] pl-8">ความก้าวหน้า</th>
                                        <th className="py-5 px-8 text-right w-[15%]">สถานะ</th>
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
                                                className="hover:bg-slate-50 transition-colors cursor-pointer group/row"
                                                onClick={() => {
                                                    handleSwitchMember(m.id);
                                                    setShowFamilyResult(false);
                                                }}
                                            >
                                                <td className="py-6 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-black shadow-sm transition-transform group-hover/row:scale-110 ${res.status === "enough" ? "bg-emerald-100 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                                            {m.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 flex items-center gap-2 text-base">
                                                                {m.name}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">{relationMap[m.relation] || m.relation}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6 text-right">
                                                    <span className="font-bold text-slate-700 text-lg">{yearsLeft}</span> <span className="text-xs text-slate-400 font-bold">ปี</span>
                                                </td>
                                                <td className="py-6 px-6 text-right font-black text-slate-800 text-lg">
                                                    ฿{formatNumber(res.targetFund)}
                                                </td>
                                                <td className="py-6 px-6 pl-8">
                                                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1.5 overflow-hidden">
                                                        <div className={`h-full rounded-full ${res.status === "enough" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${prog}%` }}></div>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 text-right">{prog.toFixed(0)}%</div>
                                                </td>
                                                <td className="py-6 px-8 text-right">
                                                    {res.status === "enough"
                                                        ? <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">เพียงพอ</span>
                                                        : <span className="px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100">ขาด {formatNumber(Math.abs(res.gap))}</span>
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
                                                    <span className="text-sm">เพิ่มสมาชิกคนถัดไป (Add next member)</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div >
    );
};

