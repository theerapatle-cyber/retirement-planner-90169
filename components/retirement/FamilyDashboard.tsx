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
                <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setPlanType(null)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <span className="text-indigo-600">ภาพรวม</span> ครอบครัว (Family Overview)
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">ภาพรวมแผนการเงินของครอบครัว ({familyMembers.length} ท่าน)</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                            พิมพ์รายงาน (Print Report)
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-8">

                {/* 1. STATUS HEADER */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* Status Card */}
                    <div className={`col-span-1 md:col-span-1 rounded-[24px] p-6 border shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${summary.totalGap >= 0 ? "bg-white border-emerald-100" : "bg-white border-rose-100"}`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 bg-gradient-to-br opacity-10 ${summary.totalGap >= 0 ? "from-emerald-400 to-teal-500" : "from-rose-400 to-red-500"}`}></div>
                        <div className="relative z-10 flex flex-col h-full justify-between items-center text-center">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${summary.totalGap >= 0 ? "bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50" : "bg-rose-50 text-rose-600 ring-4 ring-rose-50/50"}`}>
                                {summary.totalGap >= 0
                                    ? <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                }
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">สถานะภาพรวม</div>
                                <div className={`text-xl font-black tracking-tight ${summary.totalGap >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                    {summary.totalGap >= 0 ? "มั่งคั่ง (Wealthy) ✨" : "ขาดแคลน (Deficit) ⚠️"}
                                </div>
                                <div className={`text-xs mt-1 font-semibold ${summary.totalGap >= 0 ? "text-emerald-600/70" : "text-rose-600/70"}`}>
                                    {summary.totalGap >= 0 ? "เงินเพียงพอตลอดชีพ" : "เงินไม่พอใช้หลังเกษียณ"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wealth Stats */}
                    <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* Target */}
                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[80px] -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> เป้าหมายต้องมี
                                </div>
                                <div className="text-3xl font-black text-slate-800 tracking-tighter">฿{formatNumber(summary.totalTarget)}</div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">Target Fund</span>
                                </div>
                            </div>
                        </div>

                        {/* Projected */}
                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[80px] -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> เงินออมรวม
                                </div>
                                <div className="text-3xl font-black text-indigo-600 tracking-tighter">฿{formatNumber(summary.totalProjected)}</div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">Projected</span>
                                </div>
                            </div>
                        </div>

                        {/* Gap */}
                        <div className={`p-6 rounded-[24px] border shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${summary.totalGap >= 0 ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-emerald-200" : "bg-gradient-to-br from-rose-500 to-red-600 border-rose-400 text-white shadow-rose-200"}`}>
                            <div className="relative z-10">
                                <div className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span> ส่วนต่าง (GAP)
                                </div>
                                <div className="text-3xl font-black text-white tracking-tighter">
                                    {summary.totalGap >= 0 ? "+" : "-"}{formatNumber(Math.abs(summary.totalGap))}
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                        {summary.totalGap >= 0 ? "เงินส่วนเกิน (Surplus)" : "เงินที่ขาด (Shortfall)"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. AI INSIGHT & PERFORMANCE */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20" /><path d="M2 12h20" /><path d="M2 12h20" /><circle cx="12" cy="12" r="10" /><path d="M12 2v20" /><path d="M12 2v20" /></svg>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800">บทวิเคราะห์จาก AI (AI Insight)</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Left: Text */}
                        <div className="space-y-6">
                            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                                <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                    บทสรุปผู้บริหาร (Executive Summary)
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    จากการประเมินแผนการเกษียณของสมาชิกในครอบครัวทั้ง {familyMembers.length} ท่าน พบว่า
                                    {summary.totalGap >= 0
                                        ? " ภาพรวมสถานะทางการเงินมีความแข็งแกร่งมาก (Strong Financial Health) สามารถบรรลุเป้าหมายเกษียณได้ทุกคน โดยมีส่วนเกินทุนสำรองที่เพียงพอ"
                                        : " ภาพรวมยังมีความเสี่ยงที่จะเงินไม่พอใช้หลังเกษียณ (Potential Shortfall) โดยเฉพาะในช่วงปลายของแผน จำเป็นต้องปรับปรุงโครงสร้างการออม"}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="text-sm font-bold text-slate-700 ml-1">ข้อแนะนำเพิ่มเติม (Action Plan)</div>
                                <ul className="space-y-3">
                                    {summary.totalMonthlySavingsCurrent < summary.totalMonthlyNeeded && (
                                        <li className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm mb-0.5">เพิ่มการออมด่วน</div>
                                                <div className="text-xs text-slate-500">
                                                    ควรพิจารณาออมเพิ่มรวมกันอีก <span className="font-bold text-amber-600">฿{formatNumber(summary.totalMonthlyNeeded - summary.totalMonthlySavingsCurrent)}</span> ต่อเดือน
                                                </div>
                                            </div>
                                        </li>
                                    )}
                                    <li className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                                        <div className="w-10 h-10 rounded-xl bg-white text-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm mb-0.5">จัดการความคุ้มครอง</div>
                                            <div className="text-xs text-slate-500">ตรวจสอบสิทธิประโยชน์ทางภาษีและการประกันสุขภาพ</div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Right: Graphic */}
                        <div className="bg-slate-50 rounded-[24px] p-8 border border-slate-200 flex flex-col justify-center items-center text-center relative overflow-hidden">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm mb-6">คะแนนความสำเร็จ (Success Score)</div>
                            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="50%" cy="50%" r="45%" stroke="#cbd5e1" strokeWidth="12" fill="none" className="opacity-30" />
                                    <circle cx="50%" cy="50%" r="45%" stroke={summary.totalGap >= 0 ? "#10b981" : "#f59e0b"} strokeWidth="12" fill="none"
                                        strokeDasharray="283" strokeDashoffset={283 - (283 * (totalProgress / 100))} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-slate-900 tracking-tighter">{totalProgress.toFixed(0)}%</span>
                                </div>
                            </div>

                            <div className="w-full space-y-4 px-8">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                        <span>ออมจริง</span>
                                        <span>฿{formatNumber(summary.totalMonthlySavingsCurrent)}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.min(100, (summary.totalMonthlySavingsCurrent / summary.totalMonthlyNeeded) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-indigo-500 mb-1">
                                        <span>เป้าหมาย</span>
                                        <span>฿{formatNumber(summary.totalMonthlyNeeded)}</span>
                                    </div>
                                    <div className="h-2 w-full bg-indigo-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full w-full opacity-50"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. MEMBER BREAKDOWN */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span className="text-blue-500 bg-blue-50 p-1.5 rounded-lg border border-blue-100">👥</span>
                            รายละเอียดรายบุคคล (Member Breakdown)
                        </h4>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddMember}
                            className="rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            เพิ่มสมาชิกใหม่
                        </Button>
                    </div>
                    <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-4 px-6 w-[25%]">สมาชิก (Member)</th>
                                    <th className="py-4 px-6 text-right w-[15%]">อีก (ปี) เกษียณ</th>
                                    <th className="py-4 px-6 text-right w-[20%]">เป้าหมาย</th>
                                    <th className="py-4 px-6 text-left w-[25%] pl-8">ความก้าวหน้า</th>
                                    <th className="py-4 px-6 text-right w-[15%]">สถานะ</th>
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
                                    const prog = Math.min(100, (res.projectedFund / (res.targetFund || 1)) * 100);
                                    const yearsLeft = Number(m.form.retireAge) - Number(m.form.currentAge);
                                    const relationMap: Record<string, string> = { self: "ตนเอง", spouse: "คู่สมรส", child: "บุตร", father: "บิดา", mother: "มารดา", relative: "ญาติ" };

                                    return (
                                        <tr
                                            key={m.id}
                                            className="hover:bg-slate-50/50 transition-colors cursor-pointer group/row"
                                            onClick={() => {
                                                handleSwitchMember(m.id);
                                                setShowFamilyResult(false);
                                            }}
                                        >
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover/row:scale-110 ${res.status === "enough" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                                        {m.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                                            {m.name}
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 opacity-0 group-hover/row:opacity-100 transition-all ml-1"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded inline-block">{relationMap[m.relation] || m.relation}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <span className="font-bold text-slate-700">{yearsLeft}</span> <span className="text-xs text-slate-400">ปี</span>
                                            </td>
                                            <td className="py-5 px-6 text-right font-bold text-slate-800">
                                                ฿{formatNumber(res.targetFund)}
                                            </td>
                                            <td className="py-5 px-6 pl-8">
                                                <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                                                    <div className={`h-2 rounded-full ${res.status === "enough" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${prog}%` }}></div>
                                                </div>
                                                <div className="text-[10px] text-slate-400 text-right">{prog.toFixed(0)}%</div>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                {res.status === "enough"
                                                    ? <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">เพียงพอ</span>
                                                    : <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">ขาด {formatNumber(Math.abs(res.gap))}</span>
                                                }
                                            </td>
                                        </tr>
                                    )
                                })}

                                {familyMembers.length < 10 && (
                                    <tr
                                        className="bg-slate-50/30 hover:bg-blue-50/50 transition-colors cursor-pointer border-t border-slate-100 group/add"
                                        onClick={handleAddMember}
                                    >
                                        <td colSpan={5} className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-3 text-slate-400 font-bold group-hover/add:text-blue-600 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-lg group-hover/add:border-blue-200 group-hover/add:bg-blue-50 transition-all shadow-sm">+</div>
                                                <span className="text-sm">เพิ่มสมาชิกคนถัดไป (Add next member)</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div >
    );
};
