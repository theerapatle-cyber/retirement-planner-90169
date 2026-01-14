"use client";

import * as React from "react";
import {
    FormState,
    InsurancePlan,
    MemberProfile,
    Allocation,
} from "@/types/retirement";
import {
    initialForm,
    buildRetirementInputs,
    calculateRetirement,
    runMonteCarlo,
    buildProjectionSeries
} from "@/lib/retirement-calculation";
import { formatInputDisplay, formatNumber } from "@/lib/utils";
import { useInsuranceLogic } from "@/components/retirement/DashboardModals";

export function useRetirementApp() {
    /* ---------- Authentication (mock) ---------- */
    const [user, setUser] = React.useState<{ name: string } | null>(null);
    const [planType, setPlanType] = React.useState<"individual" | "family" | null>(null);

    /* ---------- Family State ---------- */
    const [familyMembers, setFamilyMembers] = React.useState<MemberProfile[]>([]);
    const [currentMemberId, setCurrentMemberId] = React.useState<string>("primary");
    const [showFamilyPanel, setShowFamilyPanel] = React.useState(false);

    /* ---------- Main Form State ---------- */
    const [form, setForm] = React.useState<FormState>(initialForm);
    const [inputStep, setInputStep] = React.useState(1); // 1=Personal, 2=Financial, 3=Goal
    const [showResult, setShowResult] = React.useState(false);
    const [showFamilyResult, setShowFamilyResult] = React.useState(false);

    // Settings & Preferences
    const [gender, setGender] = React.useState<"male" | "female">("male");
    const [relation, setRelation] = React.useState<"self" | "spouse" | "child" | "father" | "mother" | "relative">("self");
    const [savingMode, setSavingMode] = React.useState<"flat" | "step5">("flat");
    const [returnMode, setReturnMode] = React.useState<"avg" | "custom">("avg");
    const [retireSpendMode, setRetireSpendMode] = React.useState<"flat" | "step5">("flat");
    const [allocations, setAllocations] = React.useState<Allocation[]>([
        { id: 1, name: "หุ้น", weight: "70", expectedReturn: "8", volatility: "15" },
        { id: 2, name: "ตราสารหนี้", weight: "25", expectedReturn: "4", volatility: "5" },
        { id: 3, name: "เงินสด/ทอง", weight: "5", expectedReturn: "2", volatility: "2" },
    ]);

    // UI State (Collapsibles)
    const [showSumAssured, setShowSumAssured] = React.useState(true);
    const [showActualSavings, setShowActualSavings] = React.useState(true);
    const [showProfileCard, setShowProfileCard] = React.useState(true);
    const [showAgeCard, setShowAgeCard] = React.useState(true);
    const [showFinancialCard, setShowFinancialCard] = React.useState(true);
    const [showStrategyCard, setShowStrategyCard] = React.useState(true);
    const [showGoalCard, setShowGoalCard] = React.useState(true);
    const [showInsuranceCard, setShowInsuranceCard] = React.useState(true);
    const [isRelationOpen, setIsRelationOpen] = React.useState(false);

    // Modals & Chart Controls
    const [showInsuranceTable, setShowInsuranceTable] = React.useState(false);
    const [showExpenseModal, setShowExpenseModal] = React.useState(false);
    const [showTargetModal, setShowTargetModal] = React.useState(false);
    const [showProjectedModal, setShowProjectedModal] = React.useState(false);
    const [showMonteCarloDetails, setShowMonteCarloDetails] = React.useState(false);
    const [showActualSavingsInput, setShowActualSavingsInput] = React.useState(false);
    const [chartTickInterval, setChartTickInterval] = React.useState<number>(5);

    // Monte Carlo Settings
    const [mcVolatility, setMcVolatility] = React.useState(10);
    const [mcSimulations, setMcSimulations] = React.useState(200);
    const [isMonteCarloOpen, setIsMonteCarloOpen] = React.useState(false);

    // Persistence
    const [planSaved, setPlanSaved] = React.useState(false);
    const [saveMessage, setSaveMessage] = React.useState<string | null>(null);
    const [savedPlans, setSavedPlans] = React.useState<any[]>([]);
    const SAVED_PLANS_KEY = "retirement-saved-plans-v2";
    const FAMILY_KEY = "retirement-family-v1";


    /* ---------- Initialization ---------- */
    React.useEffect(() => {
        // Basic defaults
        const defaultMember: MemberProfile = {
            id: "primary",
            name: "ฉัน",
            relation: "self",
            form: initialForm,
            gender: "male",
            savingMode: "flat",
            returnMode: "avg",
            totalTarget: 0,
            retireSpendMode: "flat",
            allocations: [
                { id: 1, name: "หุ้น", weight: "70", expectedReturn: "8", volatility: "15" },
                { id: 2, name: "ตราสารหนี้", weight: "25", expectedReturn: "4", volatility: "5" },
                { id: 3, name: "เงินสด/ทอง", weight: "5", expectedReturn: "2", volatility: "2" },
            ]
        } as any;

        setFamilyMembers([defaultMember]);
        setCurrentMemberId("primary");
        setForm(initialForm);

        // Load saved plans
        if (typeof window !== "undefined") {
            const stored = window.localStorage.getItem(SAVED_PLANS_KEY);
            if (stored) {
                try {
                    setSavedPlans(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse saved plans", e);
                }
            }
        }
    }, []);

    /* ---------- Formatting Effect ---------- */
    React.useEffect(() => {
        setForm((prev) => {
            const mapping: Partial<FormState> = {};
            const keys: (keyof FormState)[] = [
                "currentSavings", "monthlySaving", "savingAt35", "savingAt40", "savingAt45",
                "savingAt50", "savingAt55", "retireFundOther", "retireMonthlyIncome",
                "retireReturnAfter", "retireExtraExpense", "retireSpendTrendPercent",
                "retireSpecialAnnual", "legacyFund", "currentAge", "retireAge", "lifeExpectancy"
            ];
            let changed = false;
            keys.forEach((k) => {
                const raw = String(prev[k] ?? "");
                const stripped = raw.replace(/,/g, "");
                if (stripped === "") return;
                const num = Number(stripped);
                if (!Number.isNaN(num)) {
                    const formatted = formatInputDisplay(String(num));
                    if (formatted !== raw) {
                        mapping[k] = formatted as any;
                        changed = true;
                    }
                }
            });
            return changed ? { ...prev, ...mapping } : prev;
        });
    }, [form.currentSavings, form.monthlySaving, form.currentAge, form.retireAge, form.lifeExpectancy]); // Reduced dep list for performance, though exhaustive is better


    /* ---------- Calculations ---------- */
    const inputs = React.useMemo(() => buildRetirementInputs({
        form,
        gender,
        savingMode,
        returnMode,
        allocations
    }), [form, gender, savingMode, returnMode, allocations]);

    const result = React.useMemo(() => calculateRetirement(inputs), [inputs]);

    const mcResult = React.useMemo(() => runMonteCarlo(inputs, mcSimulations, mcVolatility), [inputs, mcSimulations, mcVolatility]);

    /* ---------- Handlers ---------- */
    const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement> | string) => {
        let val = "";
        if (typeof e === "string") {
            val = e;
        } else if (e && e.target) {
            val = e.target.value;
        }
        setForm((prev) => ({ ...prev, [field]: val }));
    };

    const changeBy = (field: keyof FormState, delta: number) => () => {
        setForm((prev) => {
            let valStart = Number(String(prev[field] || "0").replace(/,/g, ""));
            if (Number.isNaN(valStart)) valStart = 0;
            // Allow negative values for percentage fields, but use logic to check
            let newVal = valStart + delta;

            // Enforce non-negative for age and amounts EXCEPT percent/inflation if desired 
            const isPercent = ["expectedReturn", "inflation", "retireSpendTrendPercent"].includes(field);
            // Let's assume most fields are non-negative, except percentage trends which can be negative
            if (!isPercent && newVal < 0) newVal = 0;

            return { ...prev, [field]: formatInputDisplay(String(newVal)) };
        });
    };

    const addAllocation = () => {
        setAllocations(prev => [...prev, { id: Date.now(), name: "สินทรัพย์ใหม่", weight: "0", expectedReturn: "5", volatility: "10" }]);
    };

    const removeAllocation = (id: number) => {
        setAllocations(prev => prev.filter(p => p.id !== id));
    };

    const updateAllocation = (id: number, field: keyof Allocation) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setAllocations(prev => prev.map(p => p.id === id ? { ...p, [field]: e.target.value } : p));
    };


    /* ---------- Insurance Handlers ---------- */
    const addInsurancePlan = () => {
        const newId = String(Date.now());
        setForm(prev => ({
            ...prev,
            insurancePlans: [
                ...prev.insurancePlans,
                {
                    id: newId,
                    active: true,
                    expanded: true,
                    planName: `New Plan ${prev.insurancePlans.length + 1}`,
                    type: "ตลอดชีพ",
                    coverageAge: "85",
                    sumAssured: "1000000",
                    useSurrender: false,
                    surrenderAge: "55",
                    surrenderValue: "100000",
                    pensionAmount: "12000",
                    pensionStartAge: "60",
                    pensionEndAge: "85",
                    maturityAmount: "100000",
                    cashBackAmount: "0",
                    cashBackFrequency: "1",
                    assumedReturn: "5",
                    pensionPercent: "0",
                    unequalPension: false,
                    deathBenefitPrePension: "1000000",
                    pensionTiers: [],
                    surrenderMode: "single",
                    surrenderTableData: [],
                }
            ]
        }));
    };

    const removeInsurancePlan = (id: string) => {
        setForm(prev => ({
            ...prev,
            insurancePlans: prev.insurancePlans.filter(p => p.id !== id)
        }));
    };

    const updateInsurancePlan = (index: number, field: keyof InsurancePlan, value: any) => {
        setForm(prev => {
            const newPlans = [...prev.insurancePlans];
            newPlans[index] = { ...newPlans[index], [field]: value };
            return { ...prev, insurancePlans: newPlans };
        });
    };

    const changeInsuranceBy = (index: number, key: keyof InsurancePlan, delta: number) => {
        setForm(prev => {
            const newPlans = [...prev.insurancePlans];
            const plan = newPlans[index];
            const currentVal = Number(String(plan[key] || "0").replace(/,/g, "")) || 0;
            const newVal = Math.max(0, currentVal + delta);
            const isLargeValue = ["sumAssured", "maturityAmount", "cashBackAmount", "pensionAmount", "deathBenefitPrePension", "surrenderValue"].includes(key);
            newPlans[index] = { ...plan, [key]: isLargeValue ? formatInputDisplay(newVal) : String(newVal) };
            return { ...prev, insurancePlans: newPlans };
        });
    };

    const updateSurrenderTable = (planIndex: number, age: number, value: string) => {
        setForm(prev => {
            const newPlans = [...prev.insurancePlans];
            const plan = newPlans[planIndex];
            const currentTable = [...(plan.surrenderTableData || [])];
            const exIndex = currentTable.findIndex(d => d.age === age);
            if (exIndex >= 0) {
                currentTable[exIndex] = { ...currentTable[exIndex], amount: value };
            } else {
                currentTable.push({ age, amount: value });
            }
            newPlans[planIndex] = { ...plan, surrenderTableData: currentTable };
            return { ...prev, insurancePlans: newPlans };
        });
    };


    /* ---------- Family Logic (Handlers) ---------- */
    const syncCurrentToFamily = React.useCallback(() => {
        setFamilyMembers(prev => {
            const idx = prev.findIndex(m => m.id === currentMemberId);
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = {
                ...updated[idx],
                form,
                gender,
                relation,
                savingMode,
                returnMode,
                retireSpendMode,
                allocations,
            };
            if (typeof window !== "undefined") {
                window.localStorage.setItem(FAMILY_KEY, JSON.stringify(updated));
            }
            return updated;
        });
    }, [currentMemberId, form, gender, relation, savingMode, returnMode, retireSpendMode, allocations]);

    const loadMember = (member: MemberProfile) => {
        setForm(member.form);
        setGender(member.gender);
        setRelation(member.relation || "child");
        setSavingMode(member.savingMode);
        setReturnMode(member.returnMode);
        setRetireSpendMode(member.retireSpendMode);
        setAllocations(member.allocations);
        setCurrentMemberId(member.id);
    };

    const handleSwitchMember = (id: string) => {
        if (id === currentMemberId) return;
        const targetMember = familyMembers.find(m => m.id === id);
        if (!targetMember) return;

        // Sync current
        syncCurrentToFamily();

        // Load new (delayed slightly to allow sync? No sync is synchronous)
        // Actually syncCurrentToFamily updates state via setter, so we need to wait or do it manually.
        // The manual approach in page.tsx was better (updating list then loading).
        // Let's copy manual approach logic inside here or use the helper if we trust it.
        // I'll reimplement handleSwitch to be safe as per page.tsx

        // Manual sync:
        const updatedList = familyMembers.map(m => {
            if (m.id === currentMemberId) {
                return {
                    ...m,
                    form, gender, relation, savingMode, returnMode, retireSpendMode, allocations
                };
            }
            return m;
        });
        setFamilyMembers(updatedList);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(FAMILY_KEY, JSON.stringify(updatedList));
        }

        // Load new
        const newM = updatedList.find(m => m.id === id);
        if (newM) loadMember(newM);
    };

    const handleAddMember = () => {
        // Save current first
        const updatedList = familyMembers.map(m => {
            if (m.id === currentMemberId) {
                return {
                    ...m,
                    form, gender, relation, savingMode, returnMode, retireSpendMode, allocations
                };
            }
            return m;
        });

        const newId = String(Date.now());
        const newMember: MemberProfile = {
            id: newId,
            name: `สมาชิกใหม่ ${updatedList.length + 1}`,
            relation: "child",
            form: {
                ...initialForm,
                currentAge: "0",
                retireAge: "60",
                lifeExpectancy: "85",
                currentSavings: "0",
                monthlySaving: "0",
                retireMonthlyIncome: "0",
                retireFundOther: "0",
                legacyFund: "0",
                retireExtraExpense: "0",
                retireSpecialAnnual: "0",
                planName: `แผนของสมาชิก ${updatedList.length + 1}`
            },
            gender: "male",
            savingMode: "flat",
            returnMode: "avg",
            allocations: [
                { id: 1, name: "หุ้น", weight: "70", expectedReturn: "8", volatility: "15" },
                { id: 2, name: "ตราสารหนี้", weight: "25", expectedReturn: "4", volatility: "5" },
                { id: 3, name: "เงินสด/ทอง", weight: "5", expectedReturn: "2", volatility: "2" },
            ],
            retireSpendMode: "flat"
        } as any; // Cast to avoid strict type issues if MemberProfile is slightly diff

        const newList = [...updatedList, newMember];
        setFamilyMembers(newList);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(FAMILY_KEY, JSON.stringify(newList));
        }

        loadMember(newMember);
        setInputStep(1);
        setShowFamilyResult(false);
        setShowResult(false);
    };

    const handleRemoveMember = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (familyMembers.length <= 1) {
            alert("ต้องมีสมาชิกอย่างน้อย 1 คน");
            return;
        }
        if (confirm("ต้องการลบสมาชิกคนนี้ใช่ไหม?")) {
            const newList = familyMembers.filter(m => m.id !== id);
            setFamilyMembers(newList);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(FAMILY_KEY, JSON.stringify(newList));
            }
            if (id === currentMemberId) {
                loadMember(newList[0]);
            }
        }
    };


    /* ---------- Save/Load Plans ---------- */
    const handleSavePlan = () => {
        if (typeof window === "undefined") return;

        const newPlan = {
            id: Date.now(),
            name: form.planName || `แผนที่ ${savedPlans.length + 1}`,
            timestamp: new Date().toISOString(),
            form: JSON.parse(JSON.stringify(form)),
            gender,
            relation,
            savingMode,
            returnMode,
            retireSpendMode,
            allocations: JSON.parse(JSON.stringify(allocations)),
        };

        const updatedPlans = [newPlan, ...savedPlans];
        setSavedPlans(updatedPlans);
        window.localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updatedPlans));

        // Also save family state
        syncCurrentToFamily();

        setPlanSaved(true);
        setSaveMessage("บันทึกแผนเรียบร้อยแล้ว");
        setTimeout(() => setSaveMessage(null), 2500);
    };

    const handleLoadPlan = (plan: any) => {
        if (confirm(`ต้องการโหลดแผน "${plan.name}" ใช่หรือไม่? ข้อมูลปัจจุบันจะถูกแทนที่`)) {
            setForm(plan.form);
            setGender(plan.gender || "male");
            setRelation(plan.relation || "self");
            setSavingMode(plan.savingMode || "flat");
            setReturnMode(plan.returnMode || "avg");
            setRetireSpendMode(plan.retireSpendMode || "flat");
            setAllocations(plan.allocations || []);
            setPlanSaved(true);
        }
    };

    const handleDeletePlan = (id: number) => {
        const updated = savedPlans.filter(p => p.id !== id);
        setSavedPlans(updated);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
        }
    };

    const resetRetirement = () => {
        if (confirm("ต้องการรีเซ็ตข้อมูลทั้งหมดหรือไม่?")) {
            setForm(initialForm);
            setAllocations([
                { id: 1, name: "หุ้น", weight: "70", expectedReturn: "8", volatility: "15" },
                { id: 2, name: "ตราสารหนี้", weight: "25", expectedReturn: "4", volatility: "5" },
                { id: 3, name: "เงินสด/ทอง", weight: "5", expectedReturn: "2", volatility: "2" },
            ]);
            setInputStep(1);
            setShowResult(false);
            setPlanSaved(false);
        }
    };

    /* ---------- Family Summary ---------- */
    const getFamilySummary = () => {
        const relevantMembers = familyMembers;
        let totalTarget = 0;
        let totalProjected = 0;
        let totalGap = 0;
        let totalMonthlySavingsCurrent = 0;
        let totalMonthlyNeeded = 0;
        const memberDetails: { id: string; name: string; target: number; projected: number; isReady: boolean }[] = [];

        relevantMembers.forEach((m) => {
            const isCurrent = String(m.id) === String(currentMemberId);
            const inputs = buildRetirementInputs({
                form: isCurrent ? form : m.form,
                gender: isCurrent ? gender : m.gender,
                savingMode: isCurrent ? savingMode : m.savingMode,
                returnMode: isCurrent ? returnMode : m.returnMode,
                allocations: isCurrent ? allocations : m.allocations
            });
            const res = calculateRetirement(inputs);
            totalTarget += res.targetFund;
            totalProjected += res.projectedFund;
            totalGap += res.gap;
            totalMonthlySavingsCurrent += inputs.monthlySaving;
            totalMonthlyNeeded += res.monthlyNeeded;

            memberDetails.push({
                id: m.id,
                name: m.name,
                target: res.targetFund,
                projected: res.projectedFund,
                isReady: res.status === "enough",
            });
        });

        return {
            totalTarget,
            totalProjected,
            totalGap,
            memberCount: relevantMembers.length,
            totalMonthlySavingsCurrent,
            totalMonthlyNeeded,
            memberDetails,
        };
    };

    /* ---------- Insurance Logic ---------- */
    const { insuranceChartData } = useInsuranceLogic(form);

    /* ---------- Projection Chart ---------- */
    const projectionChart = React.useMemo(() => {
        const { labels, actual, required, actualHistory } = buildProjectionSeries(inputs, result);

        // use series from mcResult
        const p5Series = mcResult.p5Series || labels.map(() => 0);
        const p95Series = mcResult.p95Series || labels.map(() => 0);

        // Sum Assured Series
        const sumAssuredSeries = labels.map(ageStr => {
            const age = Number(ageStr);
            if (!insuranceChartData) return 0;
            const idx = insuranceChartData.labels.indexOf(age);
            if (idx !== -1) {
                return insuranceChartData.datasets[0].data[idx] as number || 0;
            }
            return 0;
        });

        // Compute styling or max ticks if needed (logic can be in component, but data prep here)

        return {
            data: {
                labels,
                datasets: [
                    {
                        label: "P5",
                        data: p5Series,
                        borderColor: "transparent",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        pointRadius: 0,
                        fill: "+1",
                        tension: 0.4,
                        order: 5,
                        hidden: false,
                    },
                    {
                        label: "P95",
                        data: p95Series,
                        borderColor: "transparent",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        pointRadius: 0,
                        fill: false,
                        tension: 0.4,
                        order: 6,
                        hidden: false,
                    },
                    {
                        label: "เงินออมคาดว่าจะมี",
                        data: actual,
                        borderColor: "#10B981",
                        // backgroundColor handled in component (gradient needs ctx) or simplistic string here
                        // We'll pass simplistic string or handle component side. 
                        // Actually, 'backgroundColor' as function implies it needs chart context.
                        // We can't pass a function dependent on 'context' easily if we want pure data here, 
                        // but we can pass the config object.
                        // Ideally we pass DATA here and config in component.
                        backgroundColor: "rgba(16, 185, 129, 0.2)", // Fallback
                        tension: 0.4,
                        fill: true,
                        pointRadius: 6,
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#10B981",
                        pointBorderWidth: 3,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: "#ffffff",
                        pointHoverBorderColor: "#10B981",
                        pointHoverBorderWidth: 4,
                        order: 1,
                        hidden: !showActualSavings,
                    },
                    {
                        label: "เงินที่เก็บได้จริง",
                        data: actualHistory,
                        borderColor: "#2563eb",
                        backgroundColor: "transparent",
                        pointRadius: 6,
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#2563eb",
                        pointBorderWidth: 3,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: "#ffffff",
                        pointHoverBorderColor: "#2563eb",
                        pointHoverBorderWidth: 4,
                        order: 0,
                        showLine: false,
                        hidden: !showActualSavings,
                    },
                    {
                        label: "อิสรภาพทางการเงิน",
                        data: required.map((val, i) => Number(labels[i]) <= Number(inputs.retireAge) - 1 ? val : null),
                        borderColor: "#2563eb",
                        borderDash: [6, 6],
                        backgroundColor: "transparent",
                        pointRadius: 0,
                        borderWidth: 2,
                        fill: false,
                        order: 2,
                        hidden: false,
                    },
                    {
                        label: "ทุนประกัน",
                        data: sumAssuredSeries,
                        borderColor: "#F97316",
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        pointRadius: 6,
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#F97316",
                        pointBorderWidth: 3,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: "#ffffff",
                        pointHoverBorderColor: "#F97316",
                        pointHoverBorderWidth: 4,
                        fill: false,
                        order: 3,
                        hidden: !showSumAssured,
                    },
                ],
            },
            // Options are largely static or depend on 'goalLabelPlugin' which we config in component
            // We'll just return data for now, or minimal options
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        };
    }, [inputs, result, mcResult, showSumAssured, showActualSavings, insuranceChartData]);

    /* ---------- Expense Chart Data ---------- */
    const expenseChart = React.useMemo(() => {
        if (!result.expenseSchedule || result.expenseSchedule.length === 0) return null;

        const labels = result.expenseSchedule.map((r) => String(r.age));
        const dataMonthly = result.expenseSchedule.map((r) => r.monthly);

        return {
            data: {
                labels,
                datasets: [
                    {
                        label: "รายจ่ายต่อเดือน (บาท)",
                        data: dataMonthly,
                        borderColor: "#B05AD9", // Purple
                        backgroundColor: "rgba(176, 90, 217, 0.1)",
                        tension: 0.3,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                    },
                ],
            },
            // Options can be handled in UI
        };
    }, [result.expenseSchedule]);

    const handleLogin = (name: string) => {
        const u = { name };
        setUser(u);
        if (typeof window !== "undefined") {
            window.localStorage.setItem("mock-user", JSON.stringify(u));
        }
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            window.localStorage.clear();
        }
        setUser(null);
        setForm(initialForm);
        setFamilyMembers([]);
        setCurrentMemberId("primary");
        setInputStep(1);
        setShowResult(false);
        setShowFamilyResult(false);
        setPlanType(null);
    };

    const handlePrint = () => {
        if (typeof window !== "undefined") window.print();
    };

    const handleExportCSV = () => {
        const rows = [
            ["Age", "Monthly Expense"],
            ...(result.expenseSchedule || []).map((r) => [r.age, r.monthly])
        ];

        let csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");

        if (typeof window !== "undefined") {
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "retirement_plan.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return {
        state: {
            user, planType, familyMembers, currentMemberId, showFamilyPanel,
            form, inputStep, showResult, showFamilyResult,
            gender, relation, savingMode, returnMode, retireSpendMode, allocations,
            showSumAssured, showActualSavings, showProfileCard, showAgeCard,
            showFinancialCard, showStrategyCard, showGoalCard, showInsuranceCard,
            isRelationOpen, showInsuranceTable, showExpenseModal, showTargetModal,
            showProjectedModal, showMonteCarloDetails, chartTickInterval, showActualSavingsInput,
            mcVolatility, mcSimulations, isMonteCarloOpen,
            planSaved, saveMessage, savedPlans
        },
        setters: {
            setUser, setPlanType, setFamilyMembers, setCurrentMemberId, setShowFamilyPanel,
            setForm, setInputStep, setShowResult, setShowFamilyResult,
            setGender, setRelation, setSavingMode, setReturnMode, setRetireSpendMode, setAllocations,
            setShowSumAssured, setShowActualSavings, setShowProfileCard, setShowAgeCard,
            setShowFinancialCard, setShowStrategyCard, setShowGoalCard, setShowInsuranceCard,
            setIsRelationOpen, setShowInsuranceTable, setShowExpenseModal, setShowTargetModal,
            setShowProjectedModal, setShowMonteCarloDetails, setChartTickInterval, setShowActualSavingsInput,
            setMcVolatility, setMcSimulations, setIsMonteCarloOpen,
            setPlanSaved, setSaveMessage, setSavedPlans
        },
        calculations: {
            inputs, result, mcResult, projectionChart, expenseChart, insuranceChartData
        },
        handlers: {
            handleChange, changeBy, addAllocation, removeAllocation, updateAllocation,
            addInsurancePlan, removeInsurancePlan, updateInsurancePlan, changeInsuranceBy, updateSurrenderTable,
            syncCurrentToFamily, loadMember, handleSwitchMember, handleAddMember, handleRemoveMember, getFamilySummary,
            handleSavePlan, handleLoadPlan, handleDeletePlan, resetRetirement, handleLogin, handleLogout,
            handleExportCSV, handlePrint
        }
    };
}
