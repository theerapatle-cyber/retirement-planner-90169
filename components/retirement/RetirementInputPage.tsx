import React from "react";
import { RetirementInputSection } from "@/components/retirement/RetirementInputSection";
import { FormState, InsurancePlan, Allocation } from "@/types/retirement";
import { Calculator } from "lucide-react";

interface RetirementInputPageProps {
    user: { name: string } | null;
    form: FormState;
    handleChange: (key: keyof FormState) => (e: any) => void;
    changeBy: (key: keyof FormState, delta: number) => () => void;
    gender: "male" | "female";
    setGender: (g: "male" | "female") => void;
    setShowResult: (show: boolean) => void;
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
}

export const RetirementInputPage: React.FC<RetirementInputPageProps> = ({
    user,
    form,
    handleChange,
    changeBy,
    gender,
    setGender,
    setShowResult,
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
    updateAllocation
}) => {
    return (
        <div className="min-h-screen bg-[#F8F9FB] font-['Inter'] pb-32">
            {/* Premium Header - Sticky & Glass */}
            <div className="sticky top-0 z-30 bg-[#F8F9FB]/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
                <div className="max-w-xl mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Calculator size={20} className="stroke-[2.5]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 leading-tight">ข้อมูลแผนเกษียณ</h1>
                        <p className="text-xs text-slate-500">กรอกข้อมูลให้ครบทั้ง 3 ส่วน</p>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
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
                    onViewTable={onViewTable}
                    savingMode={savingMode}
                    setSavingMode={setSavingMode}
                    returnMode={returnMode}
                    setReturnMode={setReturnMode}
                    allocations={allocations}
                    addAllocation={addAllocation}
                    removeAllocation={removeAllocation}
                    updateAllocation={updateAllocation}
                    onCalculate={() => setShowResult(true)}
                />
            </div>
        </div>
    );
};
