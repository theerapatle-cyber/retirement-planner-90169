
import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/NumericInput";
import { FormState, InsurancePlan, Allocation } from "@/types/retirement";
import { User, Briefcase, Home, Plus, Minus, Camera, Calculator, X, ChevronDown, ChevronUp, Trash2, RotateCcw, PenLine, ShieldCheck, TrendingUp, DollarSign, Settings2, ArrowRight, ArrowLeft, Check, Table as TableIcon } from "lucide-react";
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
    onViewTable: (planId?: string) => void;
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
    // Local state for spending mode just for UI toggling as per screenshot
    const [spendingMode, setSpendingMode] = useState<"flat" | "curve">("flat");

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

    const changeInsuranceBy = (index: number, field: keyof InsurancePlan, delta: number) => () => {
        const currentValueStr = String(form.insurancePlans[index][field] || "0");
        const currentVal = parseInt(currentValueStr.replace(/,/g, "")) || 0;
        const newVal = Math.max(0, currentVal + delta);
        updateInsurancePlan(index, field, newVal.toString());
    };

    const changeAllocationBy = (id: number, field: keyof Allocation, delta: number) => () => {
        const allocation = allocations.find(a => a.id === id);
        if (!allocation) return;
        const currentVal = parseFloat(String(allocation[field]).replace(/,/g, "")) || 0;
        const newVal = Math.max(0, currentVal + delta);
        // Create a synthetic event to reuse updateAllocation
        updateAllocation(id, field)({ target: { value: newVal } });
    };

    // --- Modern Unified Input Control ---
    const InputControl = ({
        label, value, field, suffix, disabled = false, icon: Icon, subLabel, badge
    }: {
        label: string, value: any, field?: keyof FormState, suffix?: string, disabled?: boolean, icon?: any, subLabel?: string, badge?: React.ReactNode
    }) => {
        return (
            <div className="group space-y-2">
                <div className="flex justify-between items-center">
                    <Label className="text-slate-600 font-semibold text-sm flex items-center gap-2">
                        {Icon && <div className="p-1 rounded bg-blue-50 text-blue-600"><Icon size={14} /></div>}
                        {label}
                        {badge}
                    </Label>
                    {subLabel && <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full">{subLabel}</span>}
                </div>

                <div className="relative flex items-center gap-2">
                    <button
                        type="button"
                        onClick={field ? changeBy(field, -1) : undefined}
                        disabled={disabled}
                        className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 shadow-sm group-hover:border-slate-300"
                    >
                        <Minus size={18} strokeWidth={2.5} />
                    </button>

                    <div className={`flex-1 relative bg-white border border-slate-200 rounded-xl h-11 flex items-center px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 shadow-sm ${disabled ? 'bg-slate-50' : ''}`}>
                        <NumericInput
                            value={value}
                            onChange={field ? handleChange(field) : undefined}
                            disabled={disabled}
                            className={`w-full h-full text-lg font-bold bg-transparent border-none p-0 focus:ring-0 text-center text-slate-700 ${disabled ? 'text-slate-400' : ''}`}
                        />
                        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">{suffix}</span>}
                    </div>

                    <button
                        type="button"
                        onClick={field ? changeBy(field, 1) : undefined}
                        disabled={disabled}
                        className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 shadow-sm group-hover:border-slate-300"
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
        <div
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-all duration-300 ${selected ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-100' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        >
            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-white' : 'border-slate-300'}`}>
                {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <span className={`text-xs font-bold leading-none ${selected ? 'text-white' : 'text-slate-500'}`}>{label}</span>
        </div>
    );

    // --- Steps ---

    const PersonalStep = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center justify-center gap-6 py-4">
                <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className={`w-32 h-32 rounded-full border-4 border-white shadow-2xl shadow-slate-200 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 ${gender === 'male' ? 'bg-indigo-50' : 'bg-pink-50'}`}>
                        {avatarImage ? (
                            <img src={avatarImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-5xl select-none filter drop-shadow-sm">{gender === 'male' ? '👨🏻' : '👩🏻'}</span>
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-slate-800 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-transform group-hover:rotate-12">
                        <Camera size={16} />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
                    <button
                        onClick={() => setGender('male')}
                        className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${gender === 'male' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        ชาย
                    </button>
                    <button
                        onClick={() => setGender('female')}
                        className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${gender === 'female' ? 'bg-white text-pink-500 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        หญิง
                    </button>
                </div>
            </div>

            <div className="grid gap-6 px-4">
                <InputControl label="อายุปัจจุบัน" value={form.currentAge} field="currentAge" suffix="ปี" icon={User} />
                <InputControl label="ต้องการเกษียณอายุ" value={form.retireAge} field="retireAge" suffix="ปี" icon={Settings2} />
                <InputControl label="คาดว่าจะมีอายุถึง" value={form.lifeExpectancy} field="lifeExpectancy" subLabel="Life Expectancy" suffix="ปี" icon={RotateCcw} />
            </div>
        </div>
    );

    const FinancialStep = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center pb-2">
                <h2 className="text-xl font-bold text-slate-800">สถานะการเงิน</h2>
                <p className="text-xs text-slate-400 font-medium mt-1">ระบุข้อมูลการเงินปัจจุบันของคุณ</p>
            </div>

            <div className="space-y-6 px-1">
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
                    <InputControl label="เงินออมที่มีอยู่แล้ว" value={form.currentSavings} field="currentSavings" suffix="บาท" icon={Briefcase} />

                    <div className="pt-2 border-t border-slate-100/50">
                        <InputControl label="ออมเพิ่มต่อเดือน" value={form.monthlySaving} field="monthlySaving" suffix="บาท/เดือน" icon={Plus} />
                        <div className="flex gap-3 mt-4">
                            <RadioOption label="ออมคงที่" selected={savingMode === "flat"} onClick={() => setSavingMode("flat")} />
                            <RadioOption label="Step-up" selected={savingMode === "step5"} onClick={() => setSavingMode("step5")} />
                        </div>

                        {/* PREMIUM PLAN: Step-Up Savings */}
                        {savingMode === "step5" && (
                            <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 fade-in">
                                <span className="bg-blue-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded inline-block mb-2">Premium Plan</span>
                                <InputControl label="อายุ 35 (ออมต่อเดือน)" value={form.savingAt35} field="savingAt35" suffix="บาท" />
                                <InputControl label="อายุ 40 (ออมต่อเดือน)" value={form.savingAt40} field="savingAt40" suffix="บาท" />
                                <InputControl label="อายุ 45 (ออมต่อเดือน)" value={form.savingAt45} field="savingAt45" suffix="บาท" />
                                <InputControl label="อายุ 50 (ออมต่อเดือน)" value={form.savingAt50} field="savingAt50" suffix="บาท" />
                                <InputControl label="อายุ 55 (ออมต่อเดือน)" value={form.savingAt55} field="savingAt55" suffix="บาท" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4">
                        <InputControl label="ผลตอบแทนคาดหวัง" value={form.expectedReturn} field="expectedReturn" suffix="%" icon={TrendingUp} />
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-slate-400 font-bold">โหมดผลตอบแทน</span>
                            </div>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                <button onClick={() => setReturnMode("avg")} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${returnMode === 'avg' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>เฉลี่ยรวม</button>
                                <button onClick={() => setReturnMode("custom")} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${returnMode === 'custom' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>จัดสรรเอง</button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-start">
                        <InputControl label="อัตราเงินเฟ้อ" value={form.inflation} field="inflation" suffix="%" icon={TrendingUp} />
                    </div>
                </div>

                {/* PREMIUM PLAN: Asset Allocation */}
                {returnMode === "custom" && (
                    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm animate-in slide-in-from-top-4 fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                การจัดสรรเงินลงทุน (%)
                                <span className="bg-indigo-500 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">Premium Plan</span>
                            </h3>
                            <Button onClick={addAllocation} variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50 font-bold text-xs">+ เพิ่มสินทรัพย์</Button>
                        </div>

                        <div className="space-y-4">
                            {allocations.map((alloc) => (
                                <div key={alloc.id} className="border border-slate-100/80 bg-slate-50/50 rounded-2xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <Label className="text-xs font-bold text-slate-500">ชื่อสินทรัพย์</Label>
                                        <button onClick={() => removeAllocation(alloc.id)} className="text-slate-300 hover:text-red-500"><X size={16} /></button>
                                    </div>
                                    <input
                                        type="text"
                                        value={alloc.name}
                                        onChange={updateAllocation(alloc.id, "name")}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                        placeholder="เช่น หุ้น, พันธบัตร"
                                    />

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <Label className="text-[9px] text-slate-400 font-bold block mb-1">สัดส่วน (%)</Label>
                                            <NumericInput
                                                value={alloc.weight}
                                                onChange={updateAllocation(alloc.id, "weight")}
                                                className="w-full bg-white border border-slate-200 rounded-lg h-9 px-2 text-center text-sm font-bold text-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[9px] text-slate-400 font-bold block mb-1">ผลตอบแทน (%)</Label>
                                            <NumericInput
                                                value={alloc.expectedReturn}
                                                onChange={updateAllocation(alloc.id, "expectedReturn")}
                                                className="w-full bg-white border border-slate-200 rounded-lg h-9 px-2 text-center text-sm font-bold text-slate-700"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Label className="text-[9px] text-slate-400 font-bold block mb-1 flex justify-between">
                                                ผันผวน (%)
                                                <span className="bg-purple-400 text-white px-1 rounded text-[8px]">Pro</span>
                                            </Label>
                                            <NumericInput
                                                value={alloc.volatility}
                                                onChange={updateAllocation(alloc.id, "volatility")}
                                                className="w-full bg-white border border-slate-200 rounded-lg h-9 px-2 text-center text-sm font-bold text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Insurance Section - Detailed List (Screenshot Match) */}
            <div className="pt-6 mt-6 border-t border-slate-100">
                <h3 className="font-bold text-slate-700 text-lg mb-4 pl-2">ประกันชีวิต</h3>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Card Header */}
                    <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 text-base">จัดการแผน</h4>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => form.insurancePlans.forEach((_, i) => updateInsurancePlan(i, "expanded", !form.insurancePlans[0]?.expanded))}
                                className="text-sm underline text-slate-500 hover:text-slate-800 font-medium"
                            >
                                ย่อ
                            </button>
                            <Button
                                onClick={addInsurancePlan}
                                className="bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs font-bold px-3 h-8 rounded-lg flex items-center gap-1"
                            >
                                <Plus size={14} strokeWidth={3} /> เพิ่มประกัน
                            </Button>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {form.insurancePlans.map((plan, index) => {
                            const isExpanded = plan.expanded ?? true;

                            return (
                                <div key={plan.id} className={`p-4 transition-all ${!isExpanded ? 'bg-slate-50/50' : 'bg-white'}`}>
                                    {/* Minimized Header */}
                                    {!isExpanded && (
                                        <div className="flex justify-between items-center cursor-pointer" onClick={() => updateInsurancePlan(index, "expanded", true)}>
                                            <div className="flex gap-3 items-center">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs border border-blue-100">
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700 text-sm">{plan.planName}</p>
                                                    <p className="text-[10px] text-slate-400">{plan.type}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-slate-200">
                                                <ChevronDown size={16} className="text-slate-400" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                            {/* Plan Name */}
                                            <div className="space-y-1">
                                                <Label className="text-slate-500 text-xs font-bold">ชื่อแผน</Label>
                                                <input
                                                    type="text"
                                                    value={plan.planName}
                                                    onChange={(e) => updateInsurancePlan(index, "planName", e.target.value)}
                                                    className="w-full text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg h-10 px-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder-slate-300"
                                                    placeholder="เช่น เมืองไทย Smile..."
                                                />
                                            </div>

                                            {/* Type */}
                                            <div className="space-y-1">
                                                <Label className="text-slate-500 text-xs font-bold">ประเภท</Label>
                                                <div className="relative">
                                                    <select
                                                        value={plan.type}
                                                        onChange={(e) => updateInsurancePlan(index, "type", e.target.value)}
                                                        className="w-full appearance-none bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg h-10 px-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer text-sm"
                                                    >
                                                        <option value="ตลอดชีพ">ตลอดชีพ</option>
                                                        <option value="สะสมทรัพย์">สะสมทรัพย์</option>
                                                        <option value="บำนาญ">บำนาญ</option>
                                                        <option value="ประกันชั่วระยะเวลา">ประกันชั่วระยะเวลา</option>
                                                        <option value="Unit Linked">Unit Linked</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>

                                            {/* Common Fields: Age & Sum */}
                                            <div className="space-y-1">
                                                <Label className="text-slate-500 text-xs font-bold">คุ้มครองถึงอายุ</Label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3">
                                                        <NumericInput
                                                            value={plan.coverageAge || 85}
                                                            onChange={(v) => updateInsurancePlan(index, "coverageAge", v)}
                                                            className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 text-sm"
                                                        />
                                                    </div>
                                                    <button onClick={() => updateInsurancePlan(index, "coverageAge", (Number(plan.coverageAge) || 85) - 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Minus size={16} strokeWidth={2.5} /></button>
                                                    <button onClick={() => updateInsurancePlan(index, "coverageAge", (Number(plan.coverageAge) || 85) + 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Plus size={16} strokeWidth={2.5} /></button>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-slate-500 text-xs font-bold">ทุนประกัน</Label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3">
                                                        <NumericInput
                                                            value={plan.sumAssured}
                                                            onChange={(v) => updateInsurancePlan(index, "sumAssured", v)}
                                                            className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 text-sm"
                                                        />
                                                    </div>
                                                    <button onClick={() => changeInsuranceBy(index, 'sumAssured', -10000)()} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Minus size={16} strokeWidth={2.5} /></button>
                                                    <button onClick={() => changeInsuranceBy(index, 'sumAssured', 10000)()} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Plus size={16} strokeWidth={2.5} /></button>
                                                </div>
                                            </div>

                                            {/* CONDITIONAL: Surrender Checkbox & Configuration */}
                                            {plan.type !== 'ประกันชั่วระยะเวลา' && (
                                                <div className="pt-2 space-y-3">
                                                    <label className="flex items-center gap-3 cursor-pointer select-none group/chk">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${plan.useSurrender ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white group-hover/chk:border-indigo-400'}`}>
                                                            {plan.useSurrender && <Check size={12} className="text-white" />}
                                                        </div>
                                                        <input type="checkbox" checked={plan.useSurrender} onChange={(e) => updateInsurancePlan(index, "useSurrender", e.target.checked)} className="hidden" />
                                                        <span className={`text-sm font-bold ${plan.useSurrender ? 'text-indigo-600' : 'text-slate-600'}`}>เวนคืนประกัน</span>
                                                    </label>

                                                    {/* Surrender Details Panel */}
                                                    {plan.useSurrender && (
                                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                                                            {/* Mode Selection */}
                                                            <div className="space-y-2">
                                                                <Label className="text-slate-500 text-xs font-bold">รูปแบบมูลค่าเวนคืน</Label>
                                                                <div className="flex items-center gap-4">
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            checked={plan.surrenderMode !== 'table'}
                                                                            onChange={() => updateInsurancePlan(index, "surrenderMode", 'single')}
                                                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                                        />
                                                                        <span className="text-sm font-bold text-slate-700">กรอกค่าเดียว</span>
                                                                    </label>
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            checked={plan.surrenderMode === 'table'}
                                                                            onChange={() => updateInsurancePlan(index, "surrenderMode", 'table')}
                                                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                                        />
                                                                        <span className="text-sm font-bold text-slate-700">กรอกตารางเวนคืน</span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {/* Surrender Age */}
                                                            <div className="space-y-1">
                                                                <Label className="text-slate-500 text-xs font-bold">อายุที่เวนคืน</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1 bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3">
                                                                        <NumericInput
                                                                            value={plan.surrenderAge || 55}
                                                                            onChange={(v) => updateInsurancePlan(index, "surrenderAge", v)}
                                                                            className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 text-sm"
                                                                        />
                                                                    </div>
                                                                    <button onClick={() => updateInsurancePlan(index, "surrenderAge", (Number(plan.surrenderAge) || 55) - 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Minus size={16} strokeWidth={2.5} /></button>
                                                                    <button onClick={() => updateInsurancePlan(index, "surrenderAge", (Number(plan.surrenderAge) || 55) + 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Plus size={16} strokeWidth={2.5} /></button>
                                                                </div>
                                                            </div>

                                                            {/* Single Value Input */}
                                                            {plan.surrenderMode !== 'table' && (
                                                                <div className="space-y-1 animate-in fade-in">
                                                                    <Label className="text-slate-500 text-xs font-bold">มูลค่าที่เวนคืน</Label>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1 bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3">
                                                                            <NumericInput
                                                                                value={plan.surrenderValue || 0}
                                                                                onChange={(v) => updateInsurancePlan(index, "surrenderValue", v)}
                                                                                className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 text-sm"
                                                                            />
                                                                        </div>
                                                                        <button onClick={() => changeInsuranceBy(index, 'surrenderValue', -10000)()} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Minus size={16} strokeWidth={2.5} /></button>
                                                                        <button onClick={() => changeInsuranceBy(index, 'surrenderValue', 10000)()} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Plus size={16} strokeWidth={2.5} /></button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Table Mode Button */}
                                                            {plan.surrenderMode === 'table' && (
                                                                <div className="pt-1 animate-in fade-in">
                                                                    <Label className="text-slate-500 text-xs font-bold block mb-2">ตารางเวนคืน</Label>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="w-full justify-center gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-all font-bold"
                                                                        onClick={() => onViewTable(plan.id)}
                                                                    >
                                                                        <TableIcon size={16} />
                                                                        เปิดตารางเวนคืน (Open Table)
                                                                    </Button>
                                                                    <p className="text-[10px] text-slate-400 mt-2 text-center">คลิกเพื่อกรอกมูลค่าเวนคืนในแต่ละปี</p>
                                                                </div>
                                                            )}


                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* CONDITIONAL: Endowment Fields */}
                                            {plan.type === 'สะสมทรัพย์' && (
                                                <div className="space-y-1 pt-2 animate-in fade-in slide-in-from-top-2">
                                                    <Label className="text-slate-500 text-xs font-bold">ผลประโยชน์เมื่อครบกำหนด</Label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3">
                                                            <NumericInput value={plan.maturityAmount || 0} onChange={(v) => updateInsurancePlan(index, "maturityAmount", v)} className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 text-sm" />
                                                        </div>
                                                        <button onClick={() => changeInsuranceBy(index, 'maturityAmount', -10000)()} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Minus size={16} strokeWidth={2.5} /></button>
                                                        <button onClick={() => changeInsuranceBy(index, 'maturityAmount', 10000)()} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Plus size={16} strokeWidth={2.5} /></button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* CONDITIONAL: Pension Fields */}
                                            {plan.type === 'บำนาญ' && (
                                                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 border-t border-slate-100 mt-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-slate-500 text-xs font-bold">ผลประโยชน์เมื่อเสียชีวิต (ก่อนอายุรับบำนาญ)</Label>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3">
                                                                <NumericInput value={plan.deathBenefitPrePension || 0} onChange={(v) => updateInsurancePlan(index, "deathBenefitPrePension", v)} className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 text-sm" />
                                                            </div>
                                                            <button onClick={() => changeInsuranceBy(index, 'deathBenefitPrePension', -10000)()} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Minus size={16} strokeWidth={2.5} /></button>
                                                            <button onClick={() => changeInsuranceBy(index, 'deathBenefitPrePension', 10000)()} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Plus size={16} strokeWidth={2.5} /></button>
                                                        </div>
                                                    </div>

                                                    <label className="flex items-center gap-3 cursor-pointer select-none group/chk">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${plan.unequalPension ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white group-hover/chk:border-indigo-400'}`}>
                                                            {plan.unequalPension && <Check size={12} className="text-white" />}
                                                        </div>
                                                        <input type="checkbox" checked={plan.unequalPension} onChange={(e) => updateInsurancePlan(index, "unequalPension", e.target.checked)} className="hidden" />
                                                        <span className="text-sm font-bold text-slate-600">ได้รับเงินเป็นช่วงไม่เท่ากัน</span>
                                                    </label>

                                                    <div className="space-y-1">
                                                        <Label className="text-slate-500 text-xs font-bold">เริ่มรับบำนาญ</Label>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3">
                                                                <NumericInput value={plan.pensionStartAge || 60} onChange={(v) => updateInsurancePlan(index, "pensionStartAge", v)} className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 text-sm" />
                                                            </div>
                                                            <button onClick={() => updateInsurancePlan(index, "pensionStartAge", (Number(plan.pensionStartAge) || 60) - 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Minus size={16} strokeWidth={2.5} /></button>
                                                            <button onClick={() => updateInsurancePlan(index, "pensionStartAge", (Number(plan.pensionStartAge) || 60) + 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Plus size={16} strokeWidth={2.5} /></button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <Label className="text-slate-500 text-xs font-bold">บำนาญ % ของเงินทุน</Label>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3">
                                                                <NumericInput value={plan.pensionPercent || 0} onChange={(v) => updateInsurancePlan(index, "pensionPercent", v)} className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 text-sm" />
                                                            </div>
                                                            <button onClick={() => updateInsurancePlan(index, "pensionPercent", (Number(plan.pensionPercent) || 0) - 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Minus size={16} strokeWidth={2.5} /></button>
                                                            <button onClick={() => updateInsurancePlan(index, "pensionPercent", (Number(plan.pensionPercent) || 0) + 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"><Plus size={16} strokeWidth={2.5} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Footer */}
                                            <div className="flex justify-between items-center pt-4 mt-2">
                                                <Button
                                                    onClick={() => removeInsurancePlan(plan.id)}
                                                    variant="ghost"
                                                    className="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 font-bold text-xs h-9 px-4 rounded-lg"
                                                >
                                                    ลบ
                                                </Button>

                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => updateInsurancePlan(index, "expanded", false)}
                                                        className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 font-bold text-xs h-9 px-4 rounded-lg"
                                                    >
                                                        ย่อ
                                                    </Button>
                                                    <Button
                                                        onClick={() => onViewTable(plan.id)}
                                                        className="bg-blue-100 text-blue-600 hover:bg-blue-200 font-bold text-xs h-9 px-4 rounded-lg"
                                                    >
                                                        ดูตาราง
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    }
                                </div>
                            );
                        })}

                        {form.insurancePlans.length === 0 && (
                            <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                    <ShieldCheck size={24} className="text-slate-300" />
                                </div>
                                <span className="font-bold text-sm">ยังไม่มีแผนประกัน</span>
                                <Button onClick={addInsurancePlan} variant="outline" size="sm" className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                                    + เพิ่มเลย
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );

    const GoalStep = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center pb-2">
                <h2 className="text-xl font-bold text-slate-800">เป้าหมายเกษียณ</h2>
                <p className="text-xs text-slate-400 font-medium mt-1">กำหนดไลฟ์สไตล์ที่คุณต้องการ</p>
            </div>

            <div className="grid gap-6 px-1">
                <InputControl label="เงินก้อนตอนเกษียณ (บำเหน็จ)" value={form.retireFundOther} field="retireFundOther" suffix="บาท" icon={DollarSign} />
                <InputControl label="รายรับที่จะได้หลังเกษียณ" value={form.retirePension} field="retirePension" suffix="บาท/เดือน" icon={DollarSign} />
                <InputControl label="ผลตอบแทนพอร์ตหลังเกษียณ" value={form.retireReturnAfter} field="retireReturnAfter" suffix="%" icon={TrendingUp} />

                <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50 space-y-4">
                    <InputControl label="ค่าใช้จ่ายหลังเกษียณ" value={form.retireExtraExpense} field="retireExtraExpense" suffix="บาท/เดือน" icon={Home} subLabel="PV (ราคาวันนี้)" />
                    <p className="text-[10px] text-amber-600/60 text-center font-medium bg-amber-100/50 py-1 rounded-lg">ระบบจะคำนวณเงินเฟ้อให้อัตโนมัติ</p>
                </div>

                <div className="space-y-3">
                    <Label className="text-slate-600 font-bold text-sm ml-1 block">แนวโน้มการใช้จ่าย (Spending Rate)</Label>
                    <div className="flex gap-4">
                        <RadioOption label="คงที่ (ตามเงินเฟ้อ)" selected={spendingMode === "flat"} onClick={() => setSpendingMode("flat")} />
                        <RadioOption label="ปรับตามอายุทุกปีที่ 5" selected={spendingMode === "curve"} onClick={() => setSpendingMode("curve")} />
                    </div>

                    {/* PREMIUM PLAN: Spending Trend */}
                    {spendingMode === "curve" && (
                        <div className="mt-4 space-y-4 animate-in slide-in-from-top-4 fade-in bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <span className="bg-blue-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded inline-block mb-1">Premium Plan</span>

                            <h4 className="text-xs font-bold text-slate-500 mb-2">ระบุค่าใช้จ่ายแต่ละช่วงอายุ (ไม่คิดเงินเฟ้อ)</h4>

                            {/* NOTE: These fields (retireExpenseAt65 etc) are simulated placeholders as they are not yet in FormState type. 
                                In a real scenario, we would map these to state or json within 'note' or a new field. */}
                            <InputControl label="อายุ 65 (ต่อเดือน)" value={60000} field={undefined} suffix="บาท" disabled />
                            <InputControl label="อายุ 70 (ต่อเดือน)" value={60000} field={undefined} suffix="บาท" disabled />
                            <InputControl label="อายุ 75 (ต่อเดือน)" value={60000} field={undefined} suffix="บาท" disabled />
                            <InputControl label="อายุ 80 (ต่อเดือน)" value={60000} field={undefined} suffix="บาท" disabled />

                            <p className="text-[10px] text-slate-400 text-center">*ฟีเจอร์นี้อยู่ในระหว่างการพัฒนา (Demo)</p>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <InputControl label="มรดกที่ต้องการส่งต่อ" value={form.legacyFund} field="legacyFund" suffix="บาท" icon={Home} />
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <button onClick={() => setShowMonteCarlo(!showMonteCarlo)} className="flex items-center justify-between w-full text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-wide transition-colors">
                        <span className="flex items-center gap-2"><Settings2 size={14} /> การตั้งค่าขั้นสูง (Monte Carlo)</span>
                        <ChevronDown size={14} className={`transform transition-transform duration-300 ${showMonteCarlo ? 'rotate-180' : ''}`} />
                    </button>
                    {showMonteCarlo && (
                        <div className="mt-5 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 pt-2 border-t border-slate-200/50">
                            <InputControl label="ความผันผวน (%)" value={form.monteCarloVolatility} field="monteCarloVolatility" />
                            <InputControl label="จำนวนจำลอง" value={form.monteCarloSimulations} field="monteCarloSimulations" />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-600 font-bold text-sm ml-1 flex items-center gap-2"><PenLine size={14} /> บันทึกเพิ่มเติม</Label>
                    <textarea
                        className="w-full h-24 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none resize-none transition-all hover:border-blue-200 placeholder-slate-300"
                        placeholder="เขียนเป้าหมาย หรือรายละเอียดเพิ่มเติมที่นี่..."
                        value={form.note}
                        onChange={(e) => handleChange("note")(e.target.value)}
                    ></textarea>
                </div>
            </div>
        </div>
    );


    // --- MAIN RENDER ---
    return (
        <div className="w-full max-w-2xl mx-auto pb-12 font-sans relative">

            {/* Ambient Background Effects (Restored) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-slate-200/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse"></div>
                <div className="absolute top-[20%] right-[10%] w-80 h-80 bg-gray-100/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-pulse delay-700"></div>
                <div className="absolute bottom-[10%] left-[20%] w-80 h-80 bg-slate-100/60 rounded-full mix-blend-multiply filter blur-[80px] opacity-50 animate-pulse delay-1000"></div>
            </div>

            {/* MODERN STEP INDICATOR */}
            <div className="mb-8 p-1.5 bg-slate-50/80 rounded-full border border-slate-200/60 backdrop-blur-sm sticky top-4 z-30 shadow-sm mx-4">
                <div className="relative flex justify-between">
                    {/* Active Background Pill */}
                    <div
                        className="absolute top-0 bottom-0 bg-white rounded-full shadow-sm border border-slate-200 transition-all duration-500 ease-out"
                        style={{
                            left: `${((step - 1) * 33.33) + 0.5}%`, // Approximate positioning
                            width: '32%'
                        }}
                    ></div>

                    {[1, 2, 3].map((s) => (
                        <button
                            key={s}
                            onClick={() => goToStep(s)}
                            className={`relative flex-1 py-2.5 rounded-full text-xs font-bold transition-all duration-300 z-10 flex items-center justify-center gap-2 ${step === s ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] transition-all ${step === s ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-transparent border-slate-300 text-slate-400'}`}>
                                {s}
                            </div>
                            <span className="hidden sm:inline">{s === 1 ? 'ข้อมูลส่วนตัว' : s === 2 ? 'สถานะการเงิน' : 'เป้าหมาย'}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN CARD */}
            <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 min-h-[600px] flex flex-col relative overflow-hidden mx-2">

                {/* Content */}
                <div className="flex-1 relative z-10 pb-8">
                    {step === 1 && <PersonalStep />}
                    {step === 2 && <FinancialStep />}
                    {step === 3 && <GoalStep />}
                </div>

                {/* Footer Actions */}
                <div className="pt-6 border-t border-slate-50 flex gap-4 relative z-10 items-center">
                    {step > 1 && (
                        <Button type="button" onClick={prevStep} variant="ghost" className="h-14 w-14 rounded-full border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex-shrink-0">
                            <ArrowLeft size={20} />
                        </Button>
                    )}

                    {step < 3 ? (
                        <Button type="button" onClick={nextStep} className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-200 transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2">
                            ถัดไป <ArrowRight size={20} />
                        </Button>
                    ) : (
                        <Button type="button" onClick={onCalculate} className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-xl shadow-blue-200 transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2">
                            <Calculator size={20} /> คำนวณแผน
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
