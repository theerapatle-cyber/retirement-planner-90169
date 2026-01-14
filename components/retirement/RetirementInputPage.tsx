import React from "react";
import { RetirementInputSection } from "@/components/retirement/RetirementInputSection";
import { FormState, InsurancePlan } from "@/types/retirement";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface RetirementInputPageProps {
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
}

export const RetirementInputPage: React.FC<RetirementInputPageProps> = ({
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
    setSavingMode
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
                />
            </div>

            {/* Calculate Button - Fixed Floating Bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100">
                <div className="max-w-xl mx-auto">
                    <Button
                        className="w-full h-14 text-lg font-bold bg-[#5D5FEF] hover:bg-[#4B4DED] text-white rounded-2xl shadow-xl shadow-indigo-200 transition-all transform active:scale-[0.98]"
                        onClick={() => setShowResult(true)}
                    >
                        คำนวณแผนเกษียณ
                    </Button>
                </div>
            </div>
        </div>
    );
};
