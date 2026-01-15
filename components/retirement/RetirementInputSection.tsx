
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
    isEmbedded?: boolean;
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
    onCalculate,
    isEmbedded = false
}) => {
    const [step, setStep] = useState(1);
    const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({ 1: true, 2: true, 3: true });

    const toggleSection = (section: number) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Scroll to top when step changes
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    const [avatarImage, setAvatarImage] = useState<string | null>(null);
    const [showMonteCarlo, setShowMonteCarlo] = useState(false);
    // Local state for spending mode just for UI toggling as per screenshot


    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-calculate expected return from allocations if in custom mode
    React.useEffect(() => {
        if (returnMode === 'custom') {
            const weightedReturn = allocations.reduce((acc, item) => {
                const w = parseFloat(String(item.weight)) || 0;
                const r = parseFloat(String(item.expectedReturn)) || 0;
                return acc + (w * r / 100);
            }, 0);

            const current = parseFloat(form.expectedReturn) || 0;
            // Update if difference is significant to avoid infinite loops, formatted to 1 decimal
            if (Math.abs(weightedReturn - current) > 0.05) {
                // Mock event to standard handler - or direct state update if possible
                // Using a synthetic event to match the signature expected by handleChange
                const syntheticEvent = { target: { value: weightedReturn.toFixed(1) } };
                handleChange('expectedReturn')(syntheticEvent);
            }
        }
    }, [allocations, returnMode, form.expectedReturn, handleChange]);

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
                    <Label className="text-slate-600 font-semibold text-sm flex items-center gap-2 transition-colors group-hover:text-indigo-600">
                        {Icon && <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shadow-sm"><Icon size={14} /></div>}
                        {label}
                        {badge}
                    </Label>
                    {subLabel && <span className="text-[10px] text-slate-400 font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">{subLabel}</span>}
                </div>

                <div className="relative flex items-center gap-2">
                    <button
                        type="button"
                        onClick={field ? changeBy(field, -1) : undefined}
                        disabled={disabled}
                        className="w-12 h-12 rounded-2xl bg-white/50 border border-slate-200 flex items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 shadow-sm backdrop-blur-sm"
                    >
                        <Minus size={18} strokeWidth={2.5} />
                    </button>

                    <div className={`flex-1 relative bg-white/50 border border-slate-200 rounded-2xl h-12 flex items-center px-4 transition-all duration-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50/50 shadow-sm hover:shadow-md focus-within:bg-white backdrop-blur-sm ${disabled ? 'bg-slate-50/50 opacity-70' : ''}`}>
                        <NumericInput
                            value={value}
                            onChange={field ? handleChange(field) : () => { }}
                            disabled={disabled}
                            className={`flex-1 min-w-0 h-full text-lg font-bold bg-transparent border-none p-0 focus:ring-0 text-center text-slate-700 ${disabled ? 'text-slate-400' : ''}`}
                        />
                        {suffix && <span className="text-xs font-semibold text-slate-400 ml-2 select-none">{suffix}</span>}
                    </div>

                    <button
                        type="button"
                        onClick={field ? changeBy(field, 1) : undefined}
                        disabled={disabled}
                        className="w-12 h-12 rounded-2xl bg-white/50 border border-slate-200 flex items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 shadow-sm backdrop-blur-sm"
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
                <InputControl label="อายุปัจจุบัน (ปี)" value={form.currentAge} field="currentAge" icon={User} />
                <InputControl label="อายุที่ต้องการเกษียณ (ปี)" value={form.retireAge} field="retireAge" icon={Settings2} />
                <InputControl label="จะอยู่ถึงอายุ (ปี)" value={form.lifeExpectancy} field="lifeExpectancy" icon={RotateCcw} />
            </div>
        </div>
    );

    const FinancialStep = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center pb-2 flex items-center justify-center gap-2">
                <Briefcase className="text-slate-800" />
                <h2 className="text-xl font-bold text-slate-800">ปัจจุบัน</h2>
            </div>

            <div className="space-y-6 px-1">
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
                    <InputControl label="เงินออมปัจจุบัน (บาท)" value={form.currentSavings} field="currentSavings" icon={Briefcase} />

                    <div className="pt-2 border-t border-slate-100/50 space-y-4">
                        <InputControl label="การออมต่อเดือน (บาท)" value={form.monthlySaving} field="monthlySaving" icon={Plus} />

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={savingMode === 'flat'}
                                    onChange={() => setSavingMode('flat')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700">ออมเท่าเดิมทุกปี</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={savingMode === 'step5'}
                                    onChange={() => setSavingMode('step5')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700">ปรับตามอายุทุกปีที่ 5</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
                    <div className="space-y-4">
                        <InputControl
                            label="ผลตอบแทนที่คาดหวัง (% ต่อปี)"
                            value={form.expectedReturn}
                            field="expectedReturn"
                            icon={TrendingUp}
                            disabled={returnMode === 'custom'}
                        />

                        {/* Return Mode Selection */}
                        <div className="flex items-center gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={returnMode === 'avg'}
                                    onChange={() => setReturnMode('avg')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700">เฉลี่ยรวม</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={returnMode === 'custom'}
                                    onChange={() => setReturnMode('custom')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700">จัดสรรเงินลงทุนเอง</span>
                            </label>
                        </div>

                        {/* Custom Allocation List */}
                        {returnMode === 'custom' && (
                            <div className="space-y-4 animate-in fade-in pt-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-500 text-xs font-bold">การจัดสรรเงินลงทุน (%)</Label>
                                </div>

                                <div className="space-y-3">
                                    {allocations.map((alloc) => (
                                        <div key={alloc.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-3">
                                            <div className="flex gap-2">
                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-[10px] text-slate-400 font-medium">ชื่อสินทรัพย์</Label>
                                                    <input
                                                        type="text"
                                                        value={alloc.name}
                                                        onChange={updateAllocation(alloc.id, 'name')}
                                                        className="w-full h-8 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
                                                    />
                                                </div>
                                                <button onClick={() => removeAllocation(alloc.id)} className="w-8 h-8 mt-4 bg-red-50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors">
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-slate-400 font-medium">สัดส่วน (%)</Label>
                                                    <div className="bg-slate-50 border border-slate-200 rounded h-8 flex items-center px-2">
                                                        <NumericInput value={alloc.weight} onChange={(v) => {
                                                            const evt = { target: { value: v } };
                                                            updateAllocation(alloc.id, 'weight')(evt);
                                                        }} className="w-full bg-transparent border-none p-0 text-center text-sm font-medium" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-slate-400 font-medium">ผลตอบแทน (%)</Label>
                                                    <div className="bg-slate-50 border border-slate-200 rounded h-8 flex items-center px-2">
                                                        <NumericInput value={alloc.expectedReturn} onChange={(v) => {
                                                            const evt = { target: { value: v } };
                                                            updateAllocation(alloc.id, 'expectedReturn')(evt);
                                                        }} className="w-full bg-transparent border-none p-0 text-center text-sm font-medium" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1 relative">
                                                    <Label className="text-[10px] text-slate-400 font-medium">ผันผวน (%)</Label>
                                                    <div className="bg-slate-50 border border-slate-200 rounded h-8 flex items-center px-2">
                                                        <NumericInput value={alloc.volatility} onChange={(v) => {
                                                            const evt = { target: { value: v } };
                                                            updateAllocation(alloc.id, 'volatility')(evt);
                                                        }} className="w-full bg-transparent border-none p-0 text-center text-sm font-medium" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={addAllocation}
                                    className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-bold border border-blue-200"
                                    size="sm"
                                >
                                    <Plus size={16} className="mr-2" /> เพิ่มสินทรัพย์
                                </Button>

                                {/* Calculation Details */}
                                <div className="mt-4 p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2 text-slate-600 animate-in fade-in">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={14} className="text-blue-500" />
                                        <span className="text-xs font-bold text-slate-700">ที่มาของผลตอบแทน (Weighted Average)</span>
                                    </div>
                                    <ul className="space-y-1 text-[11px] pl-1">
                                        {allocations.map(a => {
                                            const w = parseFloat(String(a.weight)) || 0;
                                            const r = parseFloat(String(a.expectedReturn)) || 0;
                                            const val = (w * r / 100).toFixed(2);
                                            return (
                                                <li key={a.id} className="flex justify-between">
                                                    <span>• {a.name || 'สินทรัพย์'} ({w}%)</span>
                                                    <span className="font-medium opacity-75">{w}% × {r}% = {val}%</span>
                                                </li>
                                            );
                                        })}
                                        <li className="flex justify-between pt-2 mt-1 border-t border-slate-200 font-bold text-slate-800 text-xs">
                                            <span>ผลรวมสุทธิ</span>
                                            <span className="text-blue-600">{form.expectedReturn}%</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t border-slate-100/50">
                        <InputControl label="อัตราเงินเฟ้อ (% ต่อปี)" value={form.inflation} field="inflation" icon={TrendingUp} />
                    </div>
                </div>


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

                                                    <div className="pt-2">
                                                        <label className="flex items-center gap-3 cursor-pointer select-none group/chk mb-3">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${plan.unequalPension ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white group-hover/chk:border-indigo-400'}`}>
                                                                {plan.unequalPension && <Check size={12} className="text-white" />}
                                                            </div>
                                                            <input type="checkbox" checked={plan.unequalPension || false} onChange={(e) => updateInsurancePlan(index, "unequalPension", e.target.checked)} className="hidden" />
                                                            <span className="text-sm font-bold text-slate-600">ได้รับเงินเป็นช่วงไม่เท่ากัน</span>
                                                        </label>

                                                        {plan.unequalPension ? (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                                {(plan.pensionTiers || []).map((tier, tIndex) => (
                                                                    <div key={tIndex} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm space-y-3 relative group">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-slate-700 text-xs font-bold">ช่วงอายุ</Label>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="flex-1 bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3">
                                                                                    <NumericInput
                                                                                        value={tier.startAge || "60"}
                                                                                        onChange={(v) => {
                                                                                            const newTiers = [...(plan.pensionTiers || [])];
                                                                                            newTiers[tIndex] = { ...tier, startAge: String(v) };
                                                                                            updateInsurancePlan(index, "pensionTiers", newTiers);
                                                                                        }}
                                                                                        className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 text-sm text-center"
                                                                                    />
                                                                                </div>
                                                                                <span className="text-slate-400">-</span>
                                                                                <div className="flex-1 bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3">
                                                                                    <NumericInput
                                                                                        value={tier.endAge || "60"}
                                                                                        onChange={(v) => {
                                                                                            const newTiers = [...(plan.pensionTiers || [])];
                                                                                            newTiers[tIndex] = { ...tier, endAge: String(v) };
                                                                                            updateInsurancePlan(index, "pensionTiers", newTiers);
                                                                                        }}
                                                                                        className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 text-sm text-center"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            <Label className="text-slate-700 text-xs font-bold">เงินบำนาญที่ได้รับ (ปีละ)</Label>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="flex-1 bg-white border border-slate-200 rounded-lg h-10 flex items-center px-3">
                                                                                    <NumericInput
                                                                                        value={tier.amount || "0"}
                                                                                        onChange={(v) => {
                                                                                            const newTiers = [...(plan.pensionTiers || [])];
                                                                                            newTiers[tIndex] = { ...tier, amount: String(v) };
                                                                                            updateInsurancePlan(index, "pensionTiers", newTiers);
                                                                                        }}
                                                                                        className="w-full font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 text-sm"
                                                                                    />
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const newTiers = [...(plan.pensionTiers || [])];
                                                                                        newTiers[tIndex] = { ...tier, amount: String(Math.max(0, (Number(tier.amount) || 0) - 10000)) };
                                                                                        updateInsurancePlan(index, "pensionTiers", newTiers);
                                                                                    }}
                                                                                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"
                                                                                >
                                                                                    <Minus size={16} strokeWidth={2.5} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const newTiers = [...(plan.pensionTiers || [])];
                                                                                        newTiers[tIndex] = { ...tier, amount: String((Number(tier.amount) || 0) + 10000) };
                                                                                        updateInsurancePlan(index, "pensionTiers", newTiers);
                                                                                    }}
                                                                                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 bg-white shadow-sm active:scale-95 transition-all"
                                                                                >
                                                                                    <Plus size={16} strokeWidth={2.5} />
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const newTiers = (plan.pensionTiers || []).filter((_, i) => i !== tIndex);
                                                                                    updateInsurancePlan(index, "pensionTiers", newTiers);
                                                                                }}
                                                                                className="px-3 py-1.5 bg-red-50 text-red-500 rounded-md text-sm font-bold hover:bg-red-100 hover:text-red-700 transition-colors"
                                                                            >
                                                                                ลบ
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                <button
                                                                    onClick={() => {
                                                                        const newTiers = [...(plan.pensionTiers || [])];
                                                                        newTiers.push({ startAge: "60", endAge: "65", amount: "0" });
                                                                        updateInsurancePlan(index, "pensionTiers", newTiers);
                                                                    }}
                                                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 hover:text-blue-700 transition-all flex items-center gap-2"
                                                                >
                                                                    <Plus size={16} />
                                                                    เพิ่มช่วง
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4 animate-in fade-in">
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
            <div className="text-center pb-2 flex items-center justify-center gap-2">
                <Home className="text-slate-800" />
                <h2 className="text-xl font-bold text-slate-800">เกษียณ</h2>
            </div>

            <div className="grid gap-6 px-1">
                <InputControl label="เงินก้อนตอนเกษียณ (เช่น กบข., บำเหน็จ)" value={form.retireFundOther} field="retireFundOther" icon={DollarSign} />
                <InputControl
                    label="เงินเดือนหลังเกษียณ (ต่อเดือน)"
                    value={form.retirePension}
                    field="retirePension"
                    icon={DollarSign}
                />
                <InputControl label="ผลตอบแทนหลังเกษียณ (% ต่อปี)" value={form.retireReturnAfter} field="retireReturnAfter" icon={TrendingUp} />

                <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50 space-y-4">
                    <InputControl
                        label="ค่าใช้จ่ายหลังเกษียณ (ต่อเดือน ไม่คิดเงินเฟ้อ) โดยทั่วไปมักเป็น 80% ของค่าใช้จ่ายปัจจุบัน"
                        value={form.retireExtraExpense}
                        field="retireExtraExpense"
                        icon={Home}
                    />
                </div>



                <div className="pt-2 border-t border-slate-100">
                    <InputControl label="มรดก" value={form.legacyFund} field="legacyFund" icon={Home} />
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <button onClick={() => setShowMonteCarlo(!showMonteCarlo)} className="flex items-center justify-between w-full text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors">
                        <span className="flex items-center gap-2"><ChevronDown size={16} className={`transform transition-transform duration-300 ${showMonteCarlo ? '' : '-rotate-90'}`} /> Monte carlo</span>
                    </button>
                    {showMonteCarlo && (
                        <div className="mt-5 grid grid-cols-1 gap-4 animate-in slide-in-from-top-2 pt-2 border-t border-slate-200/50">
                            <InputControl
                                label="ความผันผวนของผลตอบแทน (%)"
                                value={form.monteCarloVolatility}
                                field="monteCarloVolatility"
                            />
                            <InputControl
                                label="จำลองทั้งหมด"
                                value={form.monteCarloSimulations}
                                field="monteCarloSimulations"
                            />
                        </div>
                    )}
                </div>


            </div>
        </div>
    );


    // --- MAIN RENDER ---
    return (
        <div className={`w-full font-sans relative ${isEmbedded ? 'h-full' : 'max-w-2xl mx-auto pb-12'}`}>

            {/* Ambient Background Effects (Conditional) */}
            {!isEmbedded && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full -z-10 pointer-events-none overflow-hidden">
                    <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-slate-200/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse"></div>
                    <div className="absolute top-[20%] right-[10%] w-80 h-80 bg-gray-100/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-pulse delay-700"></div>
                    <div className="absolute bottom-[10%] left-[20%] w-80 h-80 bg-slate-100/60 rounded-full mix-blend-multiply filter blur-[80px] opacity-50 animate-pulse delay-1000"></div>
                </div>
            )}

            {/* STEP INDICATOR (Hidden if embedded) */}
            {!isEmbedded && (
                <div className={`mb-8 p-1.5 bg-slate-50/80 rounded-full border border-slate-200/60 backdrop-blur-sm sticky top-4 z-30 shadow-sm mx-4`}>
                    <div className="relative flex justify-between">
                        {/* Active Background Pill */}
                        <div
                            className={`absolute top-0 bottom-0 bg-white shadow-sm border border-slate-200 transition-all duration-500 ease-out rounded-full`}
                            style={{
                                left: `${((step - 1) * 33.33) + 0.5}%`,
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
            )}

            {/* MAIN CARD */}
            <div className={`bg-white/95 backdrop-blur-xl flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/50 ${isEmbedded ? 'p-5 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100/80 ring-1 ring-white/50' : 'p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 min-h-[600px] mx-2'}`}>

                {/* Content */}
                <div className="flex-1 relative z-10 pb-8 space-y-8">
                    {(isEmbedded || step === 1) && (
                        <div className={isEmbedded ? "border-b border-slate-100 pb-8" : ""}>
                            {isEmbedded ? (
                                <button onClick={() => toggleSection(1)} className="w-full flex items-center justify-between mb-4 group">
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</div>
                                        ข้อมูลส่วนตัว
                                    </h3>
                                    {expandedSections[1] ? <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />}
                                </button>
                            ) : null}
                            <div className={isEmbedded && !expandedSections[1] ? 'hidden' : 'block'}>
                                <PersonalStep />
                            </div>
                        </div>
                    )}
                    {(isEmbedded || step === 2) && (
                        <div className={isEmbedded ? "border-b border-slate-100 pb-8" : ""}>
                            {isEmbedded ? (
                                <button onClick={() => toggleSection(2)} className="w-full flex items-center justify-between mb-4 group">
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</div>
                                        สถานะการเงิน
                                    </h3>
                                    {expandedSections[2] ? <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />}
                                </button>
                            ) : null}
                            <div className={isEmbedded && !expandedSections[2] ? 'hidden' : 'block'}>
                                <FinancialStep />
                            </div>
                        </div>
                    )}
                    {(isEmbedded || step === 3) && (
                        <div>
                            {isEmbedded ? (
                                <button onClick={() => toggleSection(3)} className="w-full flex items-center justify-between mb-4 group">
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3</div>
                                        เป้าหมาย
                                    </h3>
                                    {expandedSections[3] ? <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />}
                                </button>
                            ) : null}
                            <div className={isEmbedded && !expandedSections[3] ? 'hidden' : 'block'}>
                                <GoalStep />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {!isEmbedded && (
                    <div className="pt-6 border-t border-slate-50 flex gap-4 relative z-10 items-center">
                        {step > 1 && (
                            <Button type="button" onClick={prevStep} variant="ghost" className="h-14 w-14 rounded-full border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex-shrink-0">
                                <ArrowLeft size={20} />
                            </Button>
                        )}

                        {step < 3 ? (
                            <Button type="button" onClick={nextStep} className="flex-1 h-14 text-base rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-200 transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2">
                                ถัดไป <ArrowRight size={20} />
                            </Button>
                        ) : (
                            <Button type="button" onClick={onCalculate} className="flex-1 h-14 text-lg rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-xl shadow-blue-200 transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2">
                                <Calculator size={20} /> คำนวณแผน
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
