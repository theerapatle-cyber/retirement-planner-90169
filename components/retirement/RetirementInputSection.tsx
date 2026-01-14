import React from "react";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/NumericInput";
import { FormState, InsurancePlan } from "@/types/retirement";
import { User, Briefcase, Home, Plus, Minus, User as UserIcon, ChevronDown, ChevronUp, Table as TableIcon, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface RetirementInputSectionProps {
    form: FormState;
    handleChange: (field: keyof FormState) => (e: any) => void;
    changeBy: (field: keyof FormState, delta: number) => () => void;
    gender: "male" | "female";
    setGender: (g: "male" | "female") => void;
    addInsurancePlan: () => void;
    removeInsurancePlan: (id: string) => void;
    updateInsurancePlan: (index: number, key: keyof InsurancePlan, value: any) => void;
    onViewTable: () => void;
    savingMode: "flat" | "step5";
    setSavingMode: (mode: "flat" | "step5") => void;
}

export const RetirementInputSection: React.FC<RetirementInputSectionProps> = ({
    form,
    handleChange,
    changeBy,
    gender,
    setGender,
    addInsurancePlan,
    removeInsurancePlan,
    updateInsurancePlan,
    onViewTable,
    savingMode,
    setSavingMode
}) => {
    // Local state for UI toggle only (Saving Mode is now lifted to props)
    const [isStatusExpanded, setIsStatusExpanded] = React.useState(true);

    return (
        <div className="space-y-4">
            {/* SECTION 1: BASIC INFO */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                <div className="relative z-10">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100/50 flex items-center justify-center text-indigo-600">
                            <UserIcon size={18} />
                        </div>
                        ข้อมูลส่วนตัว
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${gender === "male" ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" : "border-slate-100 hover:border-slate-200 text-slate-500"}`}>
                            <input type="radio" name="gender" className="hidden" checked={gender === "male"} onChange={() => setGender("male")} />
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl">👨</div>
                            <span className="font-bold text-sm">ชาย</span>
                        </label>
                        <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${gender === "female" ? "border-pink-500 bg-pink-50/50 text-pink-700" : "border-slate-100 hover:border-slate-200 text-slate-500"}`}>
                            <input type="radio" name="gender" className="hidden" checked={gender === "female"} onChange={() => setGender("female")} />
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl">👩</div>
                            <span className="font-bold text-sm">หญิง</span>
                        </label>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-slate-600 font-medium">อายุปัจจุบัน</Label>
                                <span className="text-xs text-slate-400 font-medium">ปี</span>
                            </div>
                            <NumericInput
                                value={form.currentAge}
                                onChange={handleChange("currentAge")}
                                className="text-right text-lg font-bold text-slate-800 bg-slate-50 border-slate-200 focus:border-indigo-500 transition-all rounded-xl h-12"
                                min={0}
                                max={100}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium text-xs">เกษียณอายุ</Label>
                                <NumericInput
                                    value={form.retireAge}
                                    onChange={handleChange("retireAge")}
                                    className="text-right font-bold bg-slate-50 border-slate-200 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium text-xs">อายุขัย</Label>
                                <NumericInput
                                    value={form.lifeExpectancy}
                                    onChange={handleChange("lifeExpectancy")}
                                    className="text-right font-bold bg-slate-50 border-slate-200 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: CURRENT STATUS & INSURANCE */}
            <div className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-200 transition-all duration-300 ${isStatusExpanded ? '' : 'h-20 overflow-hidden'}`}>
                <div className="flex justify-between items-center mb-6 cursor-pointer" onClick={() => setIsStatusExpanded(!isStatusExpanded)}>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100/50 flex items-center justify-center text-emerald-600">
                            <Briefcase size={18} />
                        </div>
                        สถานะปัจจุบัน
                    </h3>
                    {isStatusExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </div>

                <div className="space-y-6">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-slate-600 font-medium">เงินออมที่มีแล้ว</Label>
                            <NumericInput
                                value={form.currentSavings}
                                onChange={handleChange("currentSavings")}
                                className="text-right text-lg font-bold text-emerald-700 bg-emerald-50/30 border-emerald-100 focus:border-emerald-500 rounded-xl h-12"
                            />
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-lg">💰</div>
                                <div className="flex-1">
                                    <Label className="font-bold text-slate-700">การออมปัจจุบัน</Label>
                                    <p className="text-xs text-slate-500">รูปแบบการออม</p>
                                </div>
                                <div className="flex bg-slate-200/50 p-1 rounded-lg">
                                    <button onClick={() => setSavingMode("flat")} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${savingMode === "flat" ? "bg-white shadow-sm text-slate-800" : "text-slate-400"}`}>คงที่</button>
                                    <button onClick={() => setSavingMode("step5")} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${savingMode === "step5" ? "bg-white shadow-sm text-slate-800" : "text-slate-400"}`}>ขั้นบันได</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">ออมต่อเดือน</Label>
                                    <NumericInput value={form.monthlySaving} onChange={handleChange("monthlySaving")} className="text-right font-bold bg-white rounded-xl" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">เพิ่มขึ้นปีละ %</Label>
                                    <div className="relative">
                                        <NumericInput value={form.savingAt35} onChange={handleChange("savingAt35")} className="text-right font-bold bg-white rounded-xl pr-6" />
                                        <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium text-xs">ผลตอบแทนเดิม %</Label>
                                <div className="flex items-center gap-2">
                                    <button onClick={changeBy("expectedReturn", -1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold">-</button>
                                    <NumericInput value={form.expectedReturn} onChange={handleChange("expectedReturn")} className="text-center font-bold bg-slate-50 border-none rounded-xl" />
                                    <button onClick={changeBy("expectedReturn", 1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold">+</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium text-xs">เงินเฟ้อ %</Label>
                                <div className="flex items-center gap-2">
                                    <button onClick={changeBy("inflation", -1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold">-</button>
                                    <NumericInput value={form.inflation} onChange={handleChange("inflation")} className="text-center font-bold bg-slate-50 border-none rounded-xl" />
                                    <button onClick={changeBy("inflation", 1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold">+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INSURANCE SECTION: RESTORED & ENHANCED */}
                    <div className="border-t border-slate-100 pt-6">
                        <Label className="text-slate-700 font-bold text-base mb-4 block">ประกันชีวิต</Label>

                        <div className="space-y-4">
                            {/* Insurance Plan Cards */}
                            {form.insurancePlans.map((plan, index) => (
                                <div key={plan.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative group transition-all hover:shadow-md">
                                    {/* Card Header */}
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-slate-800 text-sm">จัดการแผน</h4>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateInsurancePlan(index, "expanded", !plan.expanded)}
                                                className="text-xs font-semibold text-slate-500 underline hover:text-slate-800"
                                            >
                                                {plan.expanded === false ? 'ขยาย' : 'ย่อ'}
                                            </button>
                                            <Button size="sm" variant="ghost" className="h-7 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={addInsurancePlan}>
                                                <Plus className="w-4 h-4 mr-1" />
                                                เพิ่มประกัน
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {plan.expanded !== false && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                            {/* Plan Name */}
                                            <div className="space-y-1">
                                                <Label className="text-xs text-slate-500">ชื่อแผน</Label>
                                                <input
                                                    type="text"
                                                    value={plan.planName}
                                                    onChange={(e) => updateInsurancePlan(index, "planName", e.target.value)}
                                                    className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none transition-all"
                                                    placeholder="ชื่อแผนประกัน..."
                                                />
                                            </div>

                                            {/* Plan Type */}
                                            <div className="space-y-1">
                                                <Label className="text-xs text-slate-500">ประเภท</Label>
                                                <div className="relative">
                                                    <select
                                                        value={plan.type}
                                                        onChange={(e) => updateInsurancePlan(index, "type", e.target.value)}
                                                        className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white appearance-none focus:border-indigo-400 outline-none"
                                                    >
                                                        <option value="ตลอดชีพ">ตลอดชีพ</option>
                                                        <option value="สะสมทรัพย์">สะสมทรัพย์</option>
                                                        <option value="บำนาญ">บำนาญ</option>
                                                        <option value="Unit Linked">Unit Linked</option>
                                                        <option value="ชั่วระยะเวลา">ประกันชั่วระยะเวลา</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>

                                            {/* Common Fields: Coverage & Sum Assured */}
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">คุ้มครองถึงอายุ</Label>
                                                    <div className="flex gap-2">
                                                        <NumericInput
                                                            value={plan.coverageAge}
                                                            onChange={(val) => updateInsurancePlan(index, "coverageAge", val)}
                                                            className="flex-1 text-sm font-medium border border-slate-200 rounded-lg px-3 py-2"
                                                        />
                                                        <button onClick={() => updateInsurancePlan(index, "coverageAge", Number(String(plan.coverageAge).replace(/,/g, '')) - 1)} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">-</button>
                                                        <button onClick={() => updateInsurancePlan(index, "coverageAge", Number(String(plan.coverageAge).replace(/,/g, '')) + 1)} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">+</button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">ทุนประกัน</Label>
                                                    <div className="flex gap-2">
                                                        <NumericInput
                                                            value={plan.sumAssured}
                                                            onChange={(val) => updateInsurancePlan(index, "sumAssured", val)}
                                                            className="flex-1 text-sm font-medium border border-slate-200 rounded-lg px-3 py-2"
                                                        />
                                                        <button onClick={() => updateInsurancePlan(index, "sumAssured", Math.max(0, Number(String(plan.sumAssured).replace(/,/g, '')) - 10000))} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">-</button>
                                                        <button onClick={() => updateInsurancePlan(index, "sumAssured", Number(String(plan.sumAssured).replace(/,/g, '')) + 10000)} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">+</button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Surrender Checkbox */}
                                            <label className="flex items-center gap-2 cursor-pointer py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={plan.useSurrender}
                                                    onChange={(e) => updateInsurancePlan(index, "useSurrender", e.target.checked)}
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-slate-700 font-medium">เวนคืนประกัน</span>
                                            </label>
                                            {plan.useSurrender && (
                                                <div className="space-y-1 pl-6">
                                                    <Label className="text-xs text-slate-500">เวนคืนตอนอายุ</Label>
                                                    <NumericInput
                                                        value={plan.surrenderAge}
                                                        onChange={(val) => updateInsurancePlan(index, "surrenderAge", val)}
                                                        className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2"
                                                    />
                                                </div>
                                            )}

                                            {/* Conditional Fields based on Type */}
                                            {plan.type === "สะสมทรัพย์" && (
                                                <div className="space-y-3 pt-3 border-t border-slate-50">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-slate-500">ผลประโยชน์เมื่อครบกำหนด (Maturity)</Label>
                                                        <div className="flex gap-2">
                                                            <NumericInput
                                                                value={plan.maturityAmount}
                                                                onChange={(val) => updateInsurancePlan(index, "maturityAmount", val)}
                                                                className="flex-1 text-sm font-medium border border-slate-200 rounded-lg px-3 py-2"
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Cashback Section */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-slate-500">เงินคืน (Cashback)</Label>
                                                            <NumericInput
                                                                value={plan.cashBackAmount}
                                                                onChange={(val) => updateInsurancePlan(index, "cashBackAmount", val)}
                                                                className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-slate-500">คืนทุกๆ (ปี)</Label>
                                                            <input
                                                                type="number"
                                                                value={plan.cashBackFrequency}
                                                                onChange={(e) => updateInsurancePlan(index, "cashBackFrequency", e.target.value)}
                                                                className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white outline-none"
                                                                placeholder="1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {plan.type === "บำนาญ" && (
                                                <div className="space-y-3 pt-3 border-t border-slate-50">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-slate-500">ผลประโยชน์เมื่อเสียชีวิต (ก่อนอายุรับบำนาญ)</Label>
                                                        <div className="flex gap-2">
                                                            <NumericInput
                                                                value={plan.deathBenefitPrePension}
                                                                onChange={(val) => updateInsurancePlan(index, "deathBenefitPrePension", val)}
                                                                className="flex-1 text-sm font-medium border border-slate-200 rounded-lg px-3 py-2"
                                                            />
                                                        </div>
                                                    </div>

                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={plan.unequalPension}
                                                            onChange={(e) => updateInsurancePlan(index, "unequalPension", e.target.checked)}
                                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                                                        />
                                                        <span className="text-sm text-slate-700">ได้รับเงินเป็นช่วงไม่เท่ากัน</span>
                                                    </label>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-slate-500">เริ่มรับบำนาญ</Label>
                                                            <NumericInput
                                                                value={plan.pensionStartAge}
                                                                onChange={(val) => updateInsurancePlan(index, "pensionStartAge", val)}
                                                                className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-slate-500">รับถึงอายุ</Label>
                                                            <NumericInput
                                                                value={plan.pensionEndAge}
                                                                onChange={(val) => updateInsurancePlan(index, "pensionEndAge", val)}
                                                                className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-slate-500">บำนาญ (% ทุน)</Label>
                                                            <NumericInput
                                                                value={plan.pensionPercent}
                                                                onChange={(val) => updateInsurancePlan(index, "pensionPercent", val)}
                                                                className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-slate-500">หรือระบุ (บาท/ปี)</Label>
                                                            <NumericInput
                                                                value={plan.pensionAmount}
                                                                onChange={(val) => updateInsurancePlan(index, "pensionAmount", val)}
                                                                className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer Actions */}
                                            <div className="flex justify-between items-center pt-4 mt-2">
                                                <button
                                                    onClick={() => removeInsurancePlan(plan.id)}
                                                    className="px-4 py-1.5 rounded-lg bg-pink-50 text-pink-600 text-xs font-bold hover:bg-pink-100 transition-colors flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> ลบ
                                                </button>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => updateInsurancePlan(index, "expanded", false)}
                                                        className="px-4 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-bold hover:bg-yellow-100 transition-colors"
                                                    >
                                                        ย่อ
                                                    </button>
                                                    <button
                                                        onClick={onViewTable}
                                                        className="px-4 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                                                    >
                                                        <TableIcon className="w-3.5 h-3.5" /> ดูตาราง
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Collapsed State Summary */}
                                    {plan.expanded === false && (
                                        <div className="text-xs text-slate-500 mt-2 flex justify-between items-center" onClick={() => updateInsurancePlan(index, "expanded", true)}>
                                            <span>{plan.type} | ทุน ฿{Number(String(plan.sumAssured).replace(/,/g, '')).toLocaleString()}</span>
                                            <span className="text-indigo-600 cursor-pointer">แก้ไข</span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {form.insurancePlans.length === 0 && (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <p className="text-slate-400 text-sm mb-2">ยังไม่มีแผนประกัน</p>
                                    <Button variant="outline" onClick={addInsurancePlan} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                                        + เริ่มต้นเพิ่มแผนประกัน
                                    </Button>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>

            {/* SECTION 3: GOALS (Keep as is) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100/50 flex items-center justify-center text-cyan-600">
                        <Home size={18} />
                    </div>
                    เป้าหมายเกษียณ
                </h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-600 font-medium">รายรับหลังเกษียณ (ต่อเดือน)</Label>
                        <NumericInput
                            value={form.retireMonthlyIncome}
                            onChange={handleChange("retireMonthlyIncome")}
                            className="text-right text-lg font-bold text-cyan-700 bg-cyan-50/30 border-cyan-100 focus:border-cyan-500 rounded-xl h-12"
                        />
                        <p className="text-xs text-slate-400 text-right">ไม่รวมเงินเฟ้อ (มูลค่าปัจจุบัน)</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium text-xs">ผลตอบแทนหลังเกษียณ %</Label>
                                <div className="flex items-center gap-2">
                                    <button onClick={changeBy("retireReturnAfter", -1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold">-</button>
                                    <NumericInput value={form.retireReturnAfter} onChange={handleChange("retireReturnAfter")} className="text-center font-bold bg-white rounded-xl" />
                                    <button onClick={changeBy("retireReturnAfter", 1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold">+</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium text-xs">มรดกที่อยากมอบให้</Label>
                                <NumericInput value={form.legacyFund} onChange={handleChange("legacyFund")} className="text-right font-bold bg-white rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-slate-200/50">
                            <Label className="text-slate-600 font-medium text-xs">เงินได้อื่นๆ หลังเกษียณ (กบข/กองทุน)</Label>
                            <NumericInput value={form.retireFundOther} onChange={handleChange("retireFundOther")} className="text-right font-bold bg-white rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
