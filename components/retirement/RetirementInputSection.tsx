
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/NumericInput";
import { FormState, InsurancePlan, Allocation } from "@/types/retirement";
import { User, Briefcase, Home, Plus, Minus, Camera, Calculator, X, ChevronDown, ChevronUp, Trash2, RotateCcw, PenLine, ShieldCheck, TrendingUp, DollarSign, Settings2, ArrowRight, ArrowLeft, Check, Table as TableIcon, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateRetirement, buildRetirementInputs } from "@/lib/retirement-calculation";

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
    relation?: string;
    setRelation?: (r: string) => void;
}

// --- Portal Tooltip Component (Moved Outside) ---
const PortalTooltip = ({ text, rect, onCheck, onLeave }: { text: string, rect: DOMRect, onCheck: () => void, onLeave: () => void }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const top = rect.top - 10;
    const left = rect.left + rect.width / 2;

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                className="absolute transition-all duration-300 ease-out origin-bottom"
                style={{
                    top: top,
                    left: left,
                    transform: `translate(-50%, -100%) scale(${visible ? 1 : 0.9}) translateY(${visible ? 0 : 10}px)`
                }}
                onMouseEnter={onCheck}
                onMouseLeave={onLeave}
            >
                <div className="w-72 p-4 bg-white/95 backdrop-blur-xl text-slate-600 text-xs leading-relaxed rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200 relative pointer-events-auto">
                    <div className="font-bold text-indigo-600 mb-1 flex items-center gap-2">
                        <Info size={14} />
                        คำแนะนำ
                    </div>
                    {text}
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-white/95 drop-shadow-sm"></div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const TooltipWrapper = ({ text }: { text: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const iconRef = useRef<HTMLDivElement>(null);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const closeTimer = useRef<NodeJS.Timeout | null>(null);

    const handleEnter = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        if (iconRef.current) {
            setRect(iconRef.current.getBoundingClientRect());
            setIsOpen(true);
        }
    };

    const handleLeave = () => {
        closeTimer.current = setTimeout(() => {
            setIsOpen(false);
        }, 150); // 150ms buffer
    };

    useEffect(() => {
        if (!isOpen) return;
        const update = () => {
            if (iconRef.current) setRect(iconRef.current.getBoundingClientRect());
        };
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [isOpen]);

    return (
        <>
            <div
                ref={iconRef}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                onClick={() => isOpen ? handleLeave() : handleEnter()}
                className="relative ml-1.5 cursor-help p-1 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-300"
            >
                <Info size={15} strokeWidth={2.5} className="hover:scale-110 transition-transform" />
                {!isOpen && <span className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping opacity-0 hover:opacity-100 duration-1000"></span>}
            </div>
            {isOpen && rect && <PortalTooltip text={text} rect={rect} onCheck={handleEnter} onLeave={handleLeave} />}
        </>
    );
};

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
    isEmbedded = false,
    relation,
    setRelation
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
    const [showMonteCarlo, setShowMonteCarlo] = useState(true);
    const [isRelationOpen, setIsRelationOpen] = useState(false);
    const [showInsuranceHelp, setShowInsuranceHelp] = useState(false);

    // Validation State
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);

    const handleCalculateCheck = () => {
        // 1. Build Inputs to check the potential result
        const inputs = buildRetirementInputs({
            form,
            gender,
            savingMode,
            returnMode,
            allocations
        });

        // 2. Calculate to see Target Fund
        const result = calculateRetirement(inputs);

        // 3. Validation Logic
        // If Target Fund <= 0, it means either they possess enough (Pension > Expense) OR they forgot to fill expenses/ages
        // The user specifically wants to warn if value is <= 0.
        if (result.targetFund <= 0) {
            const missing: string[] = [];

            // Check Expenses
            const expenseVal = Number(form.retireExtraExpense.replace(/,/g, ""));
            if (!expenseVal || expenseVal <= 0) {
                missing.push("ค่าใช้จ่ายหลังเกษียณ (เช่น 15,000 / เดือน)");
            }

            // Check Ages
            const current = Number(form.currentAge);
            const retire = Number(form.retireAge);
            const life = Number(form.lifeExpectancy);

            if (current >= retire) {
                missing.push("อายุเกษียณ ต้องมากกว่า อายุปัจจุบัน");
            }
            if (retire >= life) {
                missing.push("อายุขัย ต้องมากกว่า อายุเกษียณ");
            }

            // Check if pure missing info caused the zero.
            // If they have expenses but high pension, we might optionally let it pass, 
            // but for now, if target <= 0, let's just show what MIGHT be missing or wrong.
            // If expenses are filled and ages are correct, but target is still 0 (Super Rich), 
            // we might just warn "Target is 0 because Income > Expense".

            if (missing.length > 0) {
                setMissingFields(missing);
                setShowValidationModal(true);
                return; // Stop here
            } else if (result.targetFund <= 0 && expenseVal > 0) {
                // Case: Valid inputs but really rich. 
                // Maybe show a different message? or just let it pass?
                // The user prompt is specific: "If value < 0... popup warning to fill data".
                // This implies "Missing Data" scenario.
                // If data is NOT missing, we should probably let them proceed to see their "Financial Freedom".
                // So if missing.length === 0, we proceed.
            }
        }

        // Proceed if valid
        onCalculate();
    };


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
        updateInsurancePlan(index, field, newVal.toLocaleString());
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
        label, value, field, suffix, disabled = false, icon: Icon, subLabel, badge, step = 1, tooltip
    }: {
        label: string, value: any, field?: keyof FormState, suffix?: string, disabled?: boolean, icon?: any, subLabel?: string, badge?: React.ReactNode, step?: number, tooltip?: string
    }) => {
        return (
            <div className="group space-y-2">
                <div className="flex justify-between items-center">
                    <Label className="text-slate-600 font-semibold text-sm flex items-center gap-2 transition-colors group-hover:text-indigo-600">
                        {Icon && <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shadow-sm"><Icon size={14} /></div>}
                        {label}
                        {badge}
                        {tooltip && <TooltipWrapper text={tooltip} />}
                    </Label>
                    {subLabel && <span className="text-[10px] text-slate-400 font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">{subLabel}</span>}
                </div>

                <div className="relative flex items-center gap-2">
                    <button
                        type="button"
                        onClick={field ? changeBy(field, -step) : undefined}
                        disabled={disabled}
                        className="w-12 h-12 rounded-full bg-white/50 border border-slate-300 flex items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 shadow-sm backdrop-blur-sm"
                    >
                        <Minus size={18} strokeWidth={2.5} />
                    </button>

                    <div className={`flex-1 relative bg-white border border-slate-300 rounded-full h-12 flex items-center px-4 transition-all duration-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50/50 shadow-sm hover:shadow-md focus-within:bg-white backdrop-blur-sm ${disabled ? 'bg-slate-50/50 opacity-70' : ''}`}>
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
                        onClick={field ? changeBy(field, step) : undefined}
                        disabled={disabled}
                        className="w-12 h-12 rounded-full bg-white/50 border border-slate-300 flex items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 shadow-sm backdrop-blur-sm"
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

    const renderPersonalStep = () => (
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

                <div className="flex bg-slate-100/80 p-1.5 rounded-full shadow-inner w-64 relative border border-slate-200/50 backdrop-blur-sm">
                    {/* Sliding Background for animation effect could be added here, but simple conditional formatting works well too */}
                    <button
                        onClick={() => setGender('male')}
                        className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${gender === 'male' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {gender === 'male' && <span className="w-2 h-2 rounded-full bg-indigo-500 absolute left-4 hidden sm:block"></span>}
                        ชาย
                    </button>
                    <button
                        onClick={() => setGender('female')}
                        className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${gender === 'female' ? 'bg-white text-pink-500 shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {gender === 'female' && <span className="w-2 h-2 rounded-full bg-pink-500 absolute left-4 hidden sm:block"></span>}
                        หญิง
                    </button>
                </div>

                {/* Name Input */}
                <div className="w-64 relative z-20">
                    <Label className="text-slate-500 font-bold text-xs mb-1.5 block text-center">ชื่อของคุณ / ชื่อแผน</Label>
                    <div className="relative">
                        <input
                            type="text"
                            value={form.planName || ''}
                            onChange={(e) => handleChange('planName')(e)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-center shadow-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all text-slate-700 font-bold text-sm outline-none placeholder:text-slate-300"
                            placeholder="ระบุชื่อเพื่อระบุตัวตน..."
                        />
                    </div>
                </div>

                {/* Relation Selector (Dropdown Style) - Only for Family Plan */}
                {setRelation && relation && (
                    <div className="w-64 relative z-20">
                        <Label className="text-slate-500 font-bold text-xs mb-1.5 block text-center">ความสัมพันธ์</Label>
                        <div className="relative">
                            <button
                                onClick={() => setIsRelationOpen(!isRelationOpen)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm hover:border-indigo-300 transition-all text-slate-700 font-bold text-sm group"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                        {({
                                            self: "👨‍💼", spouse: "👩‍❤️‍👨", child: "👶",
                                            father: "👴", mother: "👵", relative: "👥"
                                        } as Record<string, string>)[relation || ""] || "👤"}
                                    </span>
                                    <span>
                                        {({
                                            self: "เจ้าของแผน", spouse: "คู่สมรส", child: "บุตร",
                                            father: "บิดา", mother: "มารดา", relative: "ญาติ"
                                        } as Record<string, string>)[relation || ""] || "เลือกความสัมพันธ์"}
                                    </span>
                                </div>
                                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isRelationOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isRelationOpen && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 p-1 z-30">
                                    {[
                                        { id: "self", label: "เจ้าของแผน", icon: "👨‍💼" },
                                        { id: "spouse", label: "คู่สมรส", icon: "👩‍❤️‍👨" },
                                        { id: "child", label: "บุตร", icon: "👶" },
                                        { id: "father", label: "บิดา", icon: "👴" },
                                        { id: "mother", label: "มารดา", icon: "👵" },
                                        { id: "relative", label: "ญาติ", icon: "👥" }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setRelation(opt.id);
                                                setIsRelationOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${relation === opt.id ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}
                                        >
                                            <span className="text-lg">{opt.icon}</span>
                                            {opt.label}
                                            {relation === opt.id && <Check size={14} className="ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid gap-6 px-3">
                <InputControl label="อายุปัจจุบัน (ปี)" value={form.currentAge} field="currentAge" icon={User} />
                <InputControl label="อายุที่ต้องการเกษียณ (ปี)" value={form.retireAge} field="retireAge" icon={Settings2} />
                <InputControl label="จะอยู่ถึงอายุ (ปี)" value={form.lifeExpectancy} field="lifeExpectancy" icon={RotateCcw} />
            </div>
        </div>
    );

    const renderFinancialStep = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center pb-2 flex items-center justify-center gap-2">
                <Briefcase className="text-slate-800" />
                <h2 className="text-xl font-bold text-slate-800">ปัจจุบัน</h2>
            </div>

            <div className="space-y-6 px-3">
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
                    <InputControl
                        label="เงินออมปัจจุบัน (บาท)"
                        value={form.currentSavings}
                        field="currentSavings"
                        icon={Briefcase}
                        step={1000}
                        tooltip="กรอกจำนวนเงินออมทั้งหมดที่คุณมีอยู่ในปัจจุบัน"
                    />

                    <div className="pt-2 border-t border-slate-100/50 space-y-4">
                        <InputControl
                            label="การออมต่อเดือน (บาท)"
                            value={form.monthlySaving}
                            field="monthlySaving"
                            icon={Plus}
                            step={1000}
                            tooltip="กรอกจำนวนเงินที่คุณออมหรือลงทุนเพื่อการเกษียณในแต่ละเดือน (ไม่รวมเงินจากประกันสังคม หรือกองทุนสำรองเลี้ยงชีพนะ)"
                        />

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

                        {savingMode === 'step5' && (
                            <div className="grid gap-4 pt-4 animate-in fade-in slide-in-from-top-2 border-t border-slate-100/50 mt-4">
                                <InputControl label="อายุ 35" value={form.savingAt35} field="savingAt35" step={1000} />
                                <InputControl label="อายุ 40" value={form.savingAt40} field="savingAt40" step={1000} />
                                <InputControl label="อายุ 45" value={form.savingAt45} field="savingAt45" step={1000} />
                                <InputControl label="อายุ 50" value={form.savingAt50} field="savingAt50" step={1000} />
                                <InputControl label="อายุ 55" value={form.savingAt55} field="savingAt55" step={1000} />
                            </div>
                        )}
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
                            tooltip="กรอกอัตราผลตอบแทนเฉลี่ยที่คาดว่าจะได้รับจากการลงทุนเพื่อการเกษียณ ช่วงก่อนเกษียณ"
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
                        <InputControl
                            label="อัตราเงินเฟ้อ (% ต่อปี)"
                            value={form.inflation}
                            field="inflation"
                            icon={TrendingUp}
                            tooltip="กรอกอัตราเงินเฟ้อที่ประมาณการไว้ในอนาคต"
                        />
                    </div>
                </div>


            </div>

            {/* Insurance Section - Detailed List (Screenshot Match) */}
            <div className="pt-6 mt-6 border-t border-slate-100 relative">
                <div className="flex items-center gap-2 mb-4 pl-2">
                    <h3 className="font-bold text-slate-700 text-lg">ประกันชีวิต</h3>
                    <button
                        onClick={() => setShowInsuranceHelp(true)}
                        className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center transition-colors"
                    >
                        <Info size={14} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Insurance Help Modal */}
                {showInsuranceHelp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setShowInsuranceHelp(false)}>
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setShowInsuranceHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Info size={20} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800">คำแนะนำแผนประกัน</h4>
                            </div>

                            <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-medium">
                                <p>
                                    ส่วนนี้ใช้สำหรับกรอกข้อมูลประกันชีวิต ที่มีวัตถุประสงค์เพื่อเป็นเห็นทุนประกันหรือ cash flow ที่ได้มาจากประกัน โดยจะมีรายละเอียดการกรอกที่ซับซ้อนขึ้นอยู่กับประเภทของประกันที่เลือก เช่น:
                                </p>
                                <ul className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <li><strong className="text-slate-800">ทุนประกัน:</strong> จำนวนเงินเอาประกัน</li>
                                    <li><strong className="text-slate-800">อายุที่ต้องการสิ้นสุดความคุ้มครอง:</strong> อายุที่คุณต้องการให้กรมธรรม์สิ้นสุด</li>
                                    <li><strong className="text-slate-800">ประเภท:</strong> ประเภทของประกันเพื่อให้คำนวณตารางต่างกัน</li>
                                    <li><strong className="text-slate-800">มูลค่าเวนคืน:</strong> จำนวนเงินที่ได้เมื่อเวนคืน</li>
                                </ul>
                                <p className="text-blue-600 font-bold bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                                    เมื่อกรอกครบแล้วเราก็จะสามารถกดตารางเพื่อดู cash flow ของแต่ละกรมธรรม์ได้เลย
                                </p>
                            </div>

                            <button
                                onClick={() => setShowInsuranceHelp(false)}
                                className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                เข้าใจแล้ว
                            </button>
                        </div>
                    </div>
                )}

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

                    <div className="space-y-4 p-4">
                        {form.insurancePlans.map((plan, index) => {
                            const isExpanded = plan.expanded ?? true;
                            const accentColor = "bg-blue-600";

                            return (
                                <div key={plan.id} className="bg-white border rounded-lg p-4 mb-4 shadow-sm animate-in fade-in relative">

                                    {/* Expanded Body */}
                                    {isExpanded ? (
                                        <div className="space-y-4">
                                            {/* Plan Name */}
                                            <div className="space-y-1">
                                                <Label className="text-slate-500 font-medium text-sm">ชื่อแผน</Label>
                                                <input
                                                    type="text"
                                                    value={plan.planName}
                                                    onChange={(e) => updateInsurancePlan(index, "planName", e.target.value)}
                                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded text-slate-700 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                                                    placeholder="ชื่อแผน..."
                                                />
                                            </div>

                                            {/* Type */}
                                            <div className="space-y-1">
                                                <Label className="text-slate-500 font-medium text-sm">ประเภท</Label>
                                                <div className="relative">
                                                    <select
                                                        value={plan.type}
                                                        onChange={(e) => updateInsurancePlan(index, "type", e.target.value)}
                                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded text-slate-700 font-medium appearance-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
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

                                            {/* Coverage Age */}
                                            <div className="space-y-1">
                                                <Label className="text-slate-500 font-medium text-sm">คุ้มครองถึงอายุ</Label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-white border border-slate-200 rounded h-10 flex items-center px-3">
                                                        <NumericInput
                                                            value={Number(String(plan.coverageAge || 85).replace(/,/g, "")).toLocaleString()}
                                                            onChange={(v) => updateInsurancePlan(index, "coverageAge", v)}
                                                            className="w-full bg-transparent border-none p-0 font-medium text-slate-700 text-base"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => changeInsuranceBy(index, 'coverageAge', -1)()}
                                                        className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => changeInsuranceBy(index, 'coverageAge', 1)()}
                                                        className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Sum Assured */}
                                            <div className="space-y-1">
                                                <Label className="text-slate-500 font-medium text-sm">ทุนประกัน</Label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-white border border-slate-200 rounded h-10 flex items-center px-3">
                                                        <NumericInput
                                                            value={Number(String(plan.sumAssured || 0).replace(/,/g, "")).toLocaleString()}
                                                            onChange={(v) => updateInsurancePlan(index, "sumAssured", v)}
                                                            className="w-full bg-transparent border-none p-0 font-medium text-slate-700 text-base"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => changeInsuranceBy(index, 'sumAssured', -1000)()}
                                                        className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => changeInsuranceBy(index, 'sumAssured', 1000)()}
                                                        className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Surrender Box (Only allowed for valid types aka not term) */}
                                            {plan.type !== 'ประกันชั่วระยะเวลา' && (
                                                <div className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50/30">

                                                    {/* Checkbox Header */}
                                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${plan.useSurrender ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                                            {plan.useSurrender && <Check size={14} className="text-white" strokeWidth={3} />}
                                                        </div>
                                                        <input type="checkbox" checked={plan.useSurrender} onChange={(e) => updateInsurancePlan(index, "useSurrender", e.target.checked)} className="hidden" />
                                                        <span className="font-bold text-slate-700 text-sm">เวนคืนประกัน</span>
                                                    </label>

                                                    {/* Surrender Content */}
                                                    {plan.useSurrender && (
                                                        <div className="space-y-4 animate-in fade-in">

                                                            <div className="space-y-2">
                                                                <Label className="text-slate-500 font-medium text-sm">รูปแบบมูลค่าเวนคืน</Label>
                                                                <div className="flex items-center gap-4">
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input type="radio" checked={plan.surrenderMode !== 'table'} onChange={() => updateInsurancePlan(index, "surrenderMode", 'single')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                                                        <span className="text-sm text-slate-700">กรอกค่าเดียว</span>
                                                                    </label>
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input type="radio" checked={plan.surrenderMode === 'table'} onChange={() => updateInsurancePlan(index, "surrenderMode", 'table')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                                                        <span className="text-sm text-slate-700">กรอกตารางเวนคืน</span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {plan.surrenderMode !== 'table' ? (
                                                                <>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-slate-500 font-medium text-sm">อายุที่เวนคืน</Label>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex-1 bg-white border border-slate-200 rounded h-10 flex items-center px-3">
                                                                                <NumericInput value={Number(String(plan.surrenderAge || 55).replace(/,/g, "")).toLocaleString()} onChange={(v) => updateInsurancePlan(index, "surrenderAge", v)} className="w-full bg-transparent border-none p-0 font-medium text-slate-700 text-base" />
                                                                            </div>
                                                                            <button onClick={() => changeInsuranceBy(index, 'surrenderAge', -1)()} className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center"><Minus size={16} /></button>
                                                                            <button onClick={() => changeInsuranceBy(index, 'surrenderAge', 1)()} className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center"><Plus size={16} /></button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-slate-500 font-medium text-sm">มูลค่าที่เวนคืน</Label>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex-1 bg-white border border-slate-200 rounded h-10 flex items-center px-3">
                                                                                <NumericInput value={Number(String(plan.surrenderValue || 0).replace(/,/g, "")).toLocaleString()} onChange={(v) => updateInsurancePlan(index, "surrenderValue", v)} className="w-full bg-transparent border-none p-0 font-medium text-slate-700 text-base" />
                                                                            </div>
                                                                            <button onClick={() => changeInsuranceBy(index, 'surrenderValue', -1000)()} className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center"><Minus size={16} /></button>
                                                                            <button onClick={() => changeInsuranceBy(index, 'surrenderValue', 1000)()} className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center"><Plus size={16} /></button>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="p-3 bg-blue-50 text-blue-700 rounded text-sm text-center">
                                                                    ใช้ข้อมูลจากตารางมูลค่าเวนคืน
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Pension / Maturity Fields (Keep simple if needed, adhering to vertical stack) */}
                                            {plan.type === 'บำนาญ' && (
                                                <div className="space-y-4 pt-2 border-t border-slate-100">
                                                    <div className="space-y-1">
                                                        <Label className="text-slate-500 font-medium text-sm">เริ่มรับบำนาญ (อายุ)</Label>
                                                        <div className="bg-white border border-slate-200 rounded h-10 flex items-center px-3">
                                                            <NumericInput value={Number(String(plan.pensionStartAge || 60).replace(/,/g, "")).toLocaleString()} onChange={(v) => updateInsurancePlan(index, "pensionStartAge", v)} className="w-full bg-transparent border-none p-0 font-medium text-slate-700 text-base" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-slate-500 font-medium text-sm">บำนาญปีละ (บาท)</Label>
                                                        <div className="bg-white border border-slate-200 rounded h-10 flex items-center px-3">
                                                            <NumericInput value={Number(String(plan.pensionAmount || 0).replace(/,/g, "")).toLocaleString()} onChange={(v) => updateInsurancePlan(index, "pensionAmount", v)} className="w-full bg-transparent border-none p-0 font-medium text-slate-700 text-base" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {plan.type === 'สะสมทรัพย์' && (
                                                <div className="space-y-1 pt-2 border-t border-slate-100">
                                                    <Label className="text-slate-500 font-medium text-sm">ผลประโยชน์เมื่อครบกำหนด</Label>
                                                    <div className="bg-white border border-slate-200 rounded h-10 flex items-center px-3">
                                                        <NumericInput value={Number(String(plan.maturityAmount || 0).replace(/,/g, "")).toLocaleString()} onChange={(v) => updateInsurancePlan(index, "maturityAmount", v)} className="w-full bg-transparent border-none p-0 font-medium text-slate-700 text-base" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer Buttons */}
                                            <div className="flex items-center justify-between pt-4 mt-2">
                                                <button
                                                    onClick={() => removeInsurancePlan(plan.id)}
                                                    className="bg-red-100/80 hover:bg-red-100 text-red-500 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    ลบ
                                                </button>

                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateInsurancePlan(index, "expanded", false)}
                                                        className="bg-yellow-100/80 hover:bg-yellow-100 text-yellow-600 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        ย่อ
                                                    </button>
                                                    <button
                                                        onClick={() => onViewTable(plan.id)}
                                                        className="bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        ดูตาราง
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    ) : (
                                        // Collapsed Header View
                                        <div
                                            className="flex items-center justify-between cursor-pointer"
                                            onClick={() => updateInsurancePlan(index, "expanded", true)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{plan.planName || 'New Plan'}</span>
                                                <span className="text-xs text-slate-400">{plan.type} • ทุน {typeof plan.sumAssured === 'string' ? plan.sumAssured : Number(plan.sumAssured).toLocaleString()}</span>
                                            </div>
                                            <ChevronDown size={20} className="text-slate-400" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Empty State */}
                        {form.insurancePlans.length === 0 && (
                            <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <ShieldCheck size={24} className="text-slate-300" />
                                </div>
                                <span className="font-bold text-sm">ยังไม่มีแผนประกัน</span>
                                <Button onClick={addInsurancePlan} variant="outline" size="sm" className="mt-1 text-blue-600 border-blue-200 hover:bg-blue-50">
                                    + เพิ่มแผนใหม่
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );

    const renderGoalStep = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center pb-2 flex items-center justify-center gap-2">
                <Home className="text-slate-800" />
                <h2 className="text-xl font-bold text-slate-800">เกษียณ</h2>
            </div>

            <div className="grid gap-6 px-1">
                <InputControl
                    label="เงินก้อนตอนเกษียณ (เช่น กบข., บำเหน็จ)"
                    value={form.retireFundOther}
                    field="retireFundOther"
                    icon={DollarSign}
                    step={1000}
                    tooltip="เงินก้อนที่คุณคาดว่าจะได้รับในวันเกษียณ เช่น บำเหน็จ หรือเงินที่จะถอนมาใช้ช่วงเกษียณที่นอกจากลงทุน"
                />
                <InputControl
                    label="เงินเดือนหลังเกษียณ (ต่อเดือน)"
                    value={form.retirePension}
                    field="retirePension"
                    icon={DollarSign}
                    step={1000}
                    tooltip="รายได้ที่คาดว่าจะได้รับหลังเกษียณที่ไม่ใช่เงินออม เช่น เงินจากประกันสังคม หรือกองทุนบำนาญ (ยกเว้นประกัน) หรือรายได้จากค่าสินทรัพย์อื่นๆ เช่น 6,000 บาท"
                />
                <InputControl
                    label="ผลตอบแทนหลังเกษียณ (% ต่อปี)"
                    value={form.retireReturnAfter}
                    field="retireReturnAfter"
                    icon={TrendingUp}
                    tooltip="Pro,Premium plan อัตราผลตอบแทนที่คาดว่าจะได้รับจากเงินก้อนที่เหลืออยู่หลังเกษียณ เช่น 4%"
                />

                <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50 space-y-4">
                    <InputControl
                        label="ค่าใช้จ่ายหลังเกษียณ (ต่อเดือน ไม่คิดเงินเฟ้อ) โดยทั่วไปมักเป็น 80% ของค่าใช้จ่ายปัจจุบัน"
                        value={form.retireExtraExpense}
                        field="retireExtraExpense"
                        icon={Home}
                        step={1000}
                        tooltip="ประมาณการค่าใช้จ่ายที่ต้องการหลังเกษียณในมูลค่าเงินปัจจุบัน โดยทั่วไปถือเราจะประมาณ 80% ของค่าใช้จ่ายปัจจุบัน เช่น 12,000 บาท"
                    />
                </div>



                <div className="pt-2 border-t border-slate-100">
                    <InputControl
                        label="มรดก"
                        value={form.legacyFund}
                        field="legacyFund"
                        icon={Home}
                        step={1000}
                        tooltip="เงินที่อยากเก็บไว้ให้ลูกหลาน"
                    />
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
            <div className={`bg-white/95 backdrop-blur-xl flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/50 ${isEmbedded ? 'p-5 rounded-3xl shadow-md shadow-slate-300/50 border border-slate-300 ring-1 ring-white/50' : 'p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 min-h-[600px] mx-2'}`}>

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
                                {renderPersonalStep()}
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
                                {renderFinancialStep()}
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
                                {renderGoalStep()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile/Embedded Footer Actions */}
                {isEmbedded && (
                    <div className="pt-6 border-t border-slate-50 relative z-10 pb-4">
                        <Button
                            type="button"
                            onClick={handleCalculateCheck}
                            className="w-full h-12 text-lg rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Calculator size={20} /> คำนวณและดูผลลัพธ์
                        </Button>
                    </div>
                )}

                {/* Footer Actions */}
                {!isEmbedded && (
                    <div className="pt-6 border-t border-slate-50 flex gap-4 relative z-10 items-center">
                        {step > 1 && (
                            <Button type="button" onClick={prevStep} variant="ghost" className="h-14 w-14 rounded-full border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex-shrink-0">
                                <ArrowLeft size={20} />
                            </Button>
                        )}

                        {step < 3 ? (
                            <Button type="button" onClick={nextStep} className="flex-1 h-14 text-base rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-200 transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2">
                                ถัดไป <ArrowRight size={20} />
                            </Button>
                        ) : (
                            <Button type="button" onClick={handleCalculateCheck} className="flex-1 h-14 text-lg rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-xl shadow-blue-200 transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2">
                                <Calculator size={20} /> คำนวณและดูผลลัพธ์
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Validation Modal */}
            {showValidationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <AlertCircle size={32} strokeWidth={2.5} />
                            </div>

                            <h3 className="text-xl font-bold text-slate-800">ข้อมูลยังไม่ครบถ้วน</h3>
                            <p className="text-slate-500 text-sm px-4">
                                เพื่อการคำนวณแผนเกษียณที่แม่นยำ กรุณากรอกข้อมูลสำคัญตามรายการด้านล่างให้ครบถ้วน
                            </p>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 text-left space-y-3">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">สิ่งที่ต้องระบุ</Label>
                                <ul className="space-y-2.5">
                                    {missingFields.map((field, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                                            <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <X size={12} strokeWidth={3} />
                                            </div>
                                            {field}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <Button
                                onClick={() => setShowValidationModal(false)}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl h-12"
                            >
                                ปิด
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowValidationModal(false);
                                    // Logic to possibly jump to missing field could go here
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12 shadow-lg shadow-blue-200/50"
                            >
                                กรอกข้อมูล
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
