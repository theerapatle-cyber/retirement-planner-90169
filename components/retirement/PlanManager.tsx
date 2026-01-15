import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Plus, X, Edit2, Trash2, Cloud, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormState, Allocation } from '@/types/retirement';
import { Textarea } from '@/components/ui/textarea';

interface PlanData {
    form: FormState;
    allocations: Allocation[];
    returnMode: "avg" | "custom";
    savingMode: "flat" | "step5";
    gender: "male" | "female";
}

interface SavedPlan {
    id: string;
    name: string;
    date: string;
    note?: string;
    data: PlanData;
}

interface PlanManagerProps {
    currentData: PlanData;
    onLoad: (data: PlanData) => void;
}

// ... existing interfaces ...

export const PlanManager: React.FC<PlanManagerProps> = ({ currentData, onLoad }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [plans, setPlans] = useState<SavedPlan[]>([]);
    const [planName, setPlanName] = useState("");
    const [note, setNote] = useState("");
    const [profileName, setProfileName] = useState("Default");
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('retirementPlans');
        if (saved) {
            try {
                setPlans(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse plans", e);
            }
        }
        const profile = localStorage.getItem('userProfileName');
        if (profile) setProfileName(profile);
    }, []);

    const savePlan = () => {
        if (!planName.trim()) return;

        const newPlan: SavedPlan = {
            id: Date.now().toString(),
            name: planName,
            date: new Date().toLocaleDateString('th-TH'),
            note: note,
            data: currentData
        };

        const updatedPlans = [...plans, newPlan];
        setPlans(updatedPlans);
        localStorage.setItem('retirementPlans', JSON.stringify(updatedPlans));
        setPlanName("");
        setNote("");
    };

    const deletePlan = (id: string) => {
        const updated = plans.filter(p => p.id !== id);
        setPlans(updated);
        localStorage.setItem('retirementPlans', JSON.stringify(updated));
    };

    const loadPlan = (plan: SavedPlan) => {
        onLoad(plan.data);
        setIsOpen(false);
    };

    const saveProfile = () => {
        setIsEditingProfile(false);
        localStorage.setItem('userProfileName', profileName);
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
                title="บันทึก/โหลดแผน"
            >
                {isOpen ? <X size={28} /> : <Save size={28} />}
                <span className="absolute -top-10 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    จัดการแผน
                </span>
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-40 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-6 animate-in slide-in-from-bottom-5 fade-in duration-300 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <Save size={18} className="text-blue-600" /> บันทึกแผน
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">{plans.length} แผนที่บันทึกไว้</span>
                    </div>

                    {/* Profile Section */}
                    <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                        {isEditingProfile ? (
                            <div className="flex gap-2">
                                <Input
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    className="h-8 text-sm bg-white"
                                    autoFocus
                                />
                                <Button size="sm" onClick={saveProfile} className="h-8 px-2 bg-blue-600 hover:bg-blue-700">
                                    <Check size={14} />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">โปรไฟล์: <span className="text-slate-900">{profileName}</span></span>
                                <button onClick={() => setIsEditingProfile(true)} className="text-slate-400 hover:text-blue-600 transition-colors">
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Save Form */}
                    <div className="space-y-3 mb-6">
                        <Input
                            placeholder="ตั้งชื่อแผน..."
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                            className="bg-white"
                        />
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600">Note</Label>
                            <Textarea
                                placeholder="เขียนโน้ตเพิ่มเติม..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="bg-white resize-none min-h-[80px]"
                            />
                        </div>
                        <Button
                            onClick={savePlan}
                            disabled={!planName.trim()}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold"
                        >
                            บันทึกแผนปัจจุบัน
                        </Button>
                    </div>

                    {/* Saved List */}
                    {plans.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">แผนที่บันทึกไว้</Label>
                            {plans.map(plan => (
                                <div key={plan.id} className="group flex flex-col p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all gap-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadPlan(plan)}>
                                            <h4 className="font-bold text-slate-700 text-sm truncate group-hover:text-blue-600">{plan.name}</h4>
                                            <p className="text-[10px] text-slate-400">{plan.date}</p>
                                        </div>
                                        <button
                                            onClick={() => deletePlan(plan.id)}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    {plan.note && (
                                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                                            <p className="text-xs text-slate-500 line-clamp-2 italic">{plan.note}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Pro Badge */}
                </div>
            )}
        </>
    );
};
