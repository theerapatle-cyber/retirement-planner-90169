
import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/NumericInput";
import { FormState, InsurancePlan, Allocation } from "@/types/retirement";
import { User, Briefcase, Home, Plus, Minus, Camera, Calculator, X, ChevronDown, ChevronUp, Trash2, RotateCcw, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RetirementInputSectionProps {
    user: { name: string } | null;
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
    returnMode: "avg" | "custom";
    setReturnMode: (mode: "avg" | "custom") => void;
    allocations: Allocation[];
    addAllocation: () => void;
    removeAllocation: (id: number) => void;
    updateAllocation: (id: number, field: keyof Allocation) => (e: any) => void;
    onCalculate: () => void;
}

export const RetirementInputSection: React.FC<RetirementInputSectionProps> = ({
    user,
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
    setSavingMode,
    returnMode,
    setReturnMode,
    allocations,
    addAllocation,
    removeAllocation,
    updateAllocation,
    onCalculate
}) => {
    const [step, setStep] = useState(1);
    const [avatarImage, setAvatarImage] = useState<string | null>(null);
    const [showMonteCarlo, setShowMonteCarlo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
    const goToStep = (s: number) => setStep(s);

    // --- Helper Components ---

    const InputControl = ({
        label, value, field, suffix, disabled = false
    }: {
        label: string, value: any, field: keyof FormState, suffix?: string, disabled?: boolean
    }) => {
        return (
            <div className="mb-4">
                <Label className="text-slate-700 font-medium text-sm mb-1.5 block">{label}</Label>
                <div className="flex items-center gap-3">
                    <div className={`flex-1 relative bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3 focus-within:ring-2 focus-within:ring-blue-100 transition-all ${disabled ? 'bg-slate-100' : ''}`}>
                        <NumericInput
                            value={value}
                            onChange={handleChange(field)}
                            disabled={disabled}
                            className={`w-full h-full text-base font-medium bg-transparent border-none p-0 focus:ring-0 text-slate-900 ${disabled ? 'text-slate-400' : ''}`}
                        />
                        {suffix && <span className="text-slate-400 text-xs ml-2 pointer-events-none">{suffix}</span>}
                    </div>

                    <button
                        type="button"
                        onClick={changeBy(field, -1)}
                        disabled={disabled}
                        className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors active:scale-95 flex-shrink-0"
                    >
                        <Minus size={18} strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={changeBy(field, 1)}
                        disabled={disabled}
                        className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors active:scale-95 flex-shrink-0"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        );
    };

    const RadioOption = ({
        selected, onClick, label
    }: {
        selected: boolean, onClick: () => void, label: string
    }) => (
        <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected ? 'border-blue-500' : 'border-slate-300 group-hover:border-slate-400'}`}>
                {selected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
            </div>
            <span className={`text-sm ${selected ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{label}</span>
            <input type="radio" checked={selected} onChange={onClick} className="hidden" />
        </label>
    );

    // --- Steps ---

    const PersonalStep = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header Area */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 text-slate-600">
                    <User size={24} />
                    <h2 className="text-xl font-bold text-slate-700">อายุ</h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-full h-full rounded-full border border-slate-200 overflow-hidden">
                            {avatarImage ? (
                                <img src={avatarImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-lg">{gender === 'male' ? '👨🏻' : '👩🏻'}</div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow border border-slate-100">
                            <PenLine size={10} className="text-slate-500" />
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <div className="flex bg-slate-100 rounded-full p-1">
                        <button
                            onClick={() => setGender('male')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${gender === 'male' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            ชาย
                        </button>
                        <button
                            onClick={() => setGender('female')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${gender === 'female' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            หญิง
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <InputControl label="อายุปัจจุบัน (ปี)" value={form.currentAge} field="currentAge" />
                <InputControl label="อายุที่ต้องการเกษียณ (ปี)" value={form.retireAge} field="retireAge" />
                <InputControl label="จะอยู่ถึงอายุ (ปี)" value={form.lifeExpectancy} field="lifeExpectancy" />
            </div>
        </div>
    );

    const FinancialStep = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 text-slate-600 pb-4 border-b border-slate-100">
                <Briefcase size={24} />
                <h2 className="text-xl font-bold text-slate-700">ปัจจุบัน</h2>
            </div>

            <div className="pt-2 space-y-6">
                <InputControl label="เงินออมปัจจุบัน (บาท)" value={form.currentSavings} field="currentSavings" />

                <div>
                    <InputControl label="การออมต่อเดือน (บาท)" value={form.monthlySaving} field="monthlySaving" />
                    <div className="flex gap-4 mt-2">
                        <RadioOption label="ออมเท่าเดิมทุกปี" selected={savingMode === "flat"} onClick={() => setSavingMode("flat")} />
                        <RadioOption label="ปรับตามอายุทุกปีที่ 5" selected={savingMode === "step5"} onClick={() => setSavingMode("step5")} />
                    </div>
                </div>

                <div>
                    <InputControl label="ผลตอบแทนที่คาดหวัง (% ต่อปี)" value={form.expectedReturn} field="expectedReturn" />
                    <div className="flex gap-4 mt-2">
                        <RadioOption label="เฉลี่ยรวม" selected={returnMode === "avg"} onClick={() => setReturnMode("avg")} />
                        <RadioOption label="จัดสรรเงินลงทุนเอง" selected={returnMode === "custom"} onClick={() => setReturnMode("custom")} />
                    </div>
                </div>

                <InputControl label="อัตราเงินเฟ้อ (% ต่อปี)" value={form.inflation} field="inflation" />

                {/* Insurance Section in Style */}
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-700 font-bold">ประกันชีวิต</span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                            <span className="font-bold text-sm text-slate-800">จัดการแผน</span>
                            <button onClick={addInsurancePlan} className="text-xs bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 transition-colors flex items-center gap-1">
                                + เพิ่มประกัน
                            </button>
                        </div>

                        <div className="space-y-4">
                            {form.insurancePlans.map((plan, index) => (
                                <div key={plan.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                                    <div>
                                        <Label className="text-xs text-slate-500 mb-1 block">ชื่อแผน</Label>
                                        <input type="text" value={plan.planName} onChange={(e) => updateInsurancePlan(index, "planName", e.target.value)} className="w-full h-9 rounded border border-slate-300 px-2 text-sm" />
                                    </div>

                                    <div>
                                        <Label className="text-xs text-slate-500 mb-1 block">ประเภท</Label>
                                        <select value={plan.type} onChange={(e) => updateInsurancePlan(index, "type", e.target.value)} className="w-full h-9 rounded border border-slate-300 px-2 text-sm bg-white">
                                            <option value="ตลอดชีพ">ตลอดชีพ</option>
                                            <option value="สะสมทรัพย์">สะสมทรัพย์</option>
                                            <option value="บำนาญ">บำนาญ</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <Label className="text-xs text-slate-500 mb-1 block">คุ้มครองถึงอายุ</Label>
                                                <input type="text" value="85" disabled className="w-full h-9 rounded border border-slate-300 px-2 text-sm bg-white text-center" />
                                            </div>
                                            <div className="flex flex-col gap-1 mt-5">
                                                <button className="w-6 h-6 rounded-full border bg-white flex items-center justify-center"><Minus size={12} /></button>
                                                <button className="w-6 h-6 rounded-full border bg-white flex items-center justify-center"><Plus size={12} /></button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <Label className="text-xs text-slate-500 mb-1 block">ทุนประกัน</Label>
                                                <input type="text" value={plan.sumAssured} onChange={(e) => updateInsurancePlan(index, "sumAssured", e.target.value)} className="w-full h-9 rounded border border-slate-300 px-2 text-sm bg-white text-right" />
                                            </div>
                                            <div className="flex flex-col gap-1 mt-5">
                                                <button className="w-6 h-6 rounded-full border bg-white flex items-center justify-center"><Minus size={12} /></button>
                                                <button className="w-6 h-6 rounded-full border bg-white flex items-center justify-center"><Plus size={12} /></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <input type="checkbox" checked={plan.useSurrender} onChange={(e) => updateInsurancePlan(index, "useSurrender", e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm font-bold text-slate-700">เวนคืนประกัน</span>
                                    </div>

                                    <div className="flex gap-2 pt-2 justify-end">
                                        <button onClick={() => removeInsurancePlan(plan.id)} className="px-3 py-1 bg-red-50 text-red-500 text-xs rounded hover:bg-red-100 font-bold">ลบ</button>
                                        <button className="px-3 py-1 bg-yellow-50 text-yellow-600 text-xs rounded hover:bg-yellow-100 font-bold">ย่อ</button>
                                        <button onClick={onViewTable} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100 font-bold">ดูตาราง</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const GoalStep = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 text-slate-600 pb-4 border-b border-slate-100">
                <Home size={24} />
                <h2 className="text-xl font-bold text-slate-700">เกษียณ</h2>
            </div>

            <div className="pt-2 space-y-6">
                <InputControl label="เงินก้อนตอนเกษียณ (เช่น กบข., บำเหน็จ)" value={form.retireFundOther} field="retireFundOther" />
                <InputControl label="เงินเดือนหลังเกษียณ (ต่อเดือน)" value={form.retirePension} field="retirePension" />

                <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded inline-block mb-2">Premium Plan</div>
                <div className="opacity-50 pointer-events-none grayscale">
                    <InputControl label="ผลตอบแทนหลังเกษียณ (% ต่อปี)" value={form.retireReturnAfter} field="retireReturnAfter" />
                </div>

                <div>
                    <Label className="text-slate-700 font-medium text-sm mb-1.5 block">ค่าใช้จ่ายหลังเกษียณ (ต่อเดือน ไม่คิดเงินเฟ้อ) โดยทั่วไปมักเป็น 80% ของค่าใช้จ่ายปัจจุบัน</Label>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 relative bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3">
                            <NumericInput value={form.retireExtraExpense} onChange={handleChange("retireExtraExpense")} className="w-full h-full text-base font-medium bg-transparent border-none p-0 focus:ring-0 text-slate-900" />
                        </div>
                        <button onClick={changeBy("retireExtraExpense", -1)} className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"><Minus size={18} /></button>
                        <button onClick={changeBy("retireExtraExpense", 1)} className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"><Plus size={18} /></button>
                    </div>
                </div>

                <div>
                    <Label className="text-slate-700 font-medium text-sm mb-2 block">แนวโน้มการใช้จ่าย</Label>
                    <div className="flex gap-4 mb-4">
                        <RadioOption label="ปรับเปอร์เซนต์การใช้จ่ายต่อปี" selected={true} onClick={() => { }} />
                        <RadioOption label="ปรับตามอายุทุกปีที่ 5" selected={false} onClick={() => { }} />
                    </div>
                    <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded inline-block mb-2">Premium Plan</div>
                    <InputControl label="แนวโน้มการใช้จ่าย % ต่อปี (ติดลบคือค่าใช้จ่ายลดลง)" value="0" field="retireSpendingTrend" disabled />
                </div>

                <div className="border border-slate-200 rounded-lg p-4 relative">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-slate-800">รายจ่ายพิเศษประจำปีช่วงเกษียณ</span>
                        <button className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded font-bold">จัดการ</button>
                    </div>
                    <div className="text-xs text-slate-400 italic">ไม่มีรายจ่ายพิเศษ<br />(ตัวอย่าง: ค่ารักษาพยาบาล, ค่าเดินทาง, ค่าซ่อมแซมที่พัก)</div>
                </div>

                <InputControl label="มรดก" value={form.legacyFund} field="legacyFund" />

                <div>
                    <button onClick={() => setShowMonteCarlo(!showMonteCarlo)} className="flex items-center gap-1 text-slate-700 font-bold text-sm mb-2 hover:text-blue-600">
                        <ChevronDown size={16} className={`transform transition-transform ${showMonteCarlo ? 'rotate-180' : ''}`} /> Monte carlo
                    </button>
                    {showMonteCarlo && (
                        <div className="pl-4 border-l-2 border-slate-200 space-y-4 pt-2">
                            <InputControl label="Volatility (%)" value={form.monteCarloVolatility} field="monteCarloVolatility" />
                            <InputControl label="Simulations" value={form.monteCarloSimulations} field="monteCarloSimulations" />
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-slate-700 font-bold text-sm mb-2 block">Note</Label>
                    <textarea
                        className="w-full h-24 rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none resize-none"
                        placeholder="เขียนโน้ตเพิ่มเติม..."
                    ></textarea>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-3xl shadow-xl shadow-slate-100 border border-slate-50 min-h-[600px] flex flex-col">
            <div className="flex-1">
                {step === 1 && <PersonalStep />}
                {step === 2 && <FinancialStep />}
                {step === 3 && <GoalStep />}
            </div>

            <div className="pt-8 mt-4 border-t border-slate-50 flex flex-col gap-4">
                <div className="flex gap-3">
                    {step > 1 ? (
                        <Button onClick={prevStep} variant="outline" className="flex-1 h-12 rounded-xl text-slate-600 font-bold border-slate-200 hover:bg-slate-50">
                            ย้อนกลับ
                        </Button>
                    ) : <div className="flex-1"></div>}

                    {step < 3 ? (
                        <Button onClick={nextStep} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200">
                            ถัดไป
                        </Button>
                    ) : (
                        <Button onClick={onCalculate} className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200">
                            <Calculator className="mr-2" size={18} /> คำนวณ
                        </Button>
                    )}
                </div>

                {step === 3 && (
                    <button className="bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-sm w-20 mx-auto block hover:bg-slate-300">
                        รีเซ็ต
                    </button>
                )}
            </div>
        </div>
    );
};
