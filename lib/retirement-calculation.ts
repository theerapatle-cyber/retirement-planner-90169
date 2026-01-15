
import {
    FormState,
    RetirementInputs,
    Allocation,
    InsurancePlanInput,
    CalculationResult,
    ExpenseRow,
    MonteCarloResult
} from "@/types/retirement";

/* ---------- ค่าเริ่มต้น ---------- */
export const initialForm: FormState = {
    currentAge: "30",
    retireAge: "60",
    lifeExpectancy: "85",

    currentSavings: "334,000",
    monthlySaving: "10,000",
    expectedReturn: "7",
    inflation: "3",

    savingAt35: "0",
    savingAt40: "0",
    savingAt45: "0",
    savingAt50: "0",
    savingAt55: "0",

    retireFundOther: "0",
    retireMonthlyIncome: "0",
    retireReturnAfter: "0",
    retireExtraExpense: "12,000",
    retireSpendTrendPercent: "0",
    retireSpecialAnnual: "0",
    retirePension: "6,000",
    retireSpendingMode: "inflation_adjusted",
    retireSpendingTrend: "0",
    legacyFund: "0",
    retireNote: "",
    note: "",

    monteCarloVolatility: "6",
    monteCarloSimulations: "5",

    insurancePlans: [],
    selectedPlanId: null,

    planName: "แผนเกษียณของฉัน",
};

/* ---------- Logic Builder ---------- */
export function buildRetirementInputs(opts: {
    form: FormState;
    gender: "male" | "female";
    savingMode: "flat" | "step5";
    returnMode: "avg" | "custom";
    allocations: Allocation[];
}): RetirementInputs {
    const { form, gender, savingMode, returnMode, allocations } = opts;
    const num = (v: string) => {
        const val = Number(String(v || "").replace(/,/g, ""));
        return isNaN(val) ? 0 : val;
    };

    const stepIncrements =
        savingMode === "step5"
            ? [
                { age: 35, monthlySaving: num(form.savingAt35) },
                { age: 40, monthlySaving: num(form.savingAt40) },
                { age: 45, monthlySaving: num(form.savingAt45) },
                { age: 50, monthlySaving: num(form.savingAt50) },
                { age: 55, monthlySaving: num(form.savingAt55) },
            ]
            : [];

    const allocs =
        returnMode === "custom"
            ? allocations.map((a) => ({
                name: a.name,
                weight: Number(a.weight || 0),
                expectedReturn: Number(a.expectedReturn || 0),
                volatility: Number(a.volatility || 0),
            }))
            : [];

    const insurancePlans = form.insurancePlans.map(p => ({
        id: p.id,
        active: p.active,
        name: p.planName,
        type: p.type,
        coverageAge: num(p.coverageAge),
        sumAssured: num(p.sumAssured),
        useSurrender: p.type === "ชั่วระยะเวลา" ? false : p.useSurrender,
        surrenderAge: num(p.surrenderAge),
        surrenderValue: num(p.surrenderValue),
        pensionAmount: num(p.pensionAmount),
        pensionStartAge: num(p.pensionStartAge),
        pensionEndAge: num(p.pensionEndAge),
        maturityAmount: num(p.maturityAmount),
        cashBackAmount: num(p.cashBackAmount),
        cashBackFrequency: num(p.cashBackFrequency) || 1,
        assumedReturn: p.type === "Unit Linked" ? 0 : num(p.assumedReturn),
        pensionPercent: num(p.pensionPercent),
        unequalPension: p.unequalPension,
        deathBenefitPrePension: num(p.deathBenefitPrePension),
        pensionTiers: (p.pensionTiers || []).map(t => ({
            startAge: num(t.startAge),
            endAge: num(t.endAge),
            amount: num(t.amount)
        })),
        surrenderMode: p.surrenderMode || "single",
        surrenderTableData: p.surrenderTableData || [],
    }));

    return {
        gender,
        currentAge: num(form.currentAge),
        retireAge: num(form.retireAge),
        lifeExpectancy: num(form.lifeExpectancy),
        currentSavings: num(form.currentSavings),
        monthlySaving: num(form.monthlySaving),
        expectedReturn: num(form.expectedReturn),
        inflation: num(form.inflation),
        savingMode,
        stepIncrements,
        retireFundOther: num(form.retireFundOther),

        // Correct Mapping:
        retireMonthlyIncome: num(form.retirePension), // Logic Income = Form Pension
        retireExtraExpense: num(form.retireExtraExpense), // Logic Expense = Form Expense

        retireReturnAfter: num(form.retireReturnAfter),
        retireSpendTrendPercent: num(form.retireSpendingTrend), // Use the new trend field
        retireSpecialAnnual: num(form.retireSpecialAnnual),
        legacyFund: num(form.legacyFund),
        returnMode,
        allocations: allocs,
        insurancePlans,
    };
}

/* ========================
   (CORE CALCULATION LOGIC)
   ======================== */
export function calculateRetirement(inputs: RetirementInputs & { retirePension?: number }): CalculationResult {
    const {
        currentAge,
        retireAge,
        lifeExpectancy,
        currentSavings,
        monthlySaving,
        expectedReturn,
        inflation,
        savingMode,
        stepIncrements,
        retireFundOther,
        retireMonthlyIncome, // This acts as INCOME (Pension)
        retireReturnAfter,
        retireExtraExpense, // This acts as EXPENSE (Lifestyle)
        legacyFund,
        insurancePlans
    } = inputs;


    const yearsToRetire = Math.max(0, retireAge - currentAge);
    const yearsInRetirement = Math.max(0, lifeExpectancy - retireAge);

    const r_inf = inflation / 100;
    const r_pre_nominal = expectedReturn / 100;
    const r_post_nominal = retireReturnAfter / 100;

    // Logic: เงินไหลเข้าจากประกัน (เวนคืน)
    let insuranceCashInflow = 0;

    // 1. Projected Fund (เงินออมสะสมฝั่ง Wealth)
    let wealth = currentSavings;
    for (let i = 0; i < yearsToRetire; i++) {
        const age = currentAge + i;
        let currentMonthlySaving = monthlySaving;
        if (savingMode === "step5") {
            for (const step of stepIncrements) {
                if (age >= step.age && step.monthlySaving > 0) {
                    currentMonthlySaving = step.monthlySaving;
                }
            }
        }
        const annualSaving = currentMonthlySaving * 12;
        const investmentReturn = wealth * r_pre_nominal;

        // Check Insurance Inflow (Pre-Retirement)
        let extraInflow = 0;
        insurancePlans.forEach((plan: InsurancePlanInput) => {
            if (!plan.active) return;

            // 1. Surrender Logic
            if (plan.useSurrender) {
                if (plan.surrenderMode === "table" && plan.surrenderTableData) {
                    const entry = plan.surrenderTableData.find(d => d.age === age);
                    if (entry) extraInflow += Number(String(entry.amount).replace(/,/g, ""));
                } else if (age === plan.surrenderAge && plan.surrenderValue > 0) {
                    extraInflow += plan.surrenderValue;
                }
            }

            // 2. Maturity (Endowment)
            if (plan.type === "สะสมทรัพย์" && age === plan.coverageAge) {
                extraInflow += plan.maturityAmount;
            }

            // 3. Cash Back (Endowment)
            if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
                const policyYear = age - currentAge;
                if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && age <= plan.coverageAge) {
                    extraInflow += plan.cashBackAmount;
                }
            }

            // 4. Pension (Annuity)
            if (plan.type === "บำนาญ") {
                if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                    for (const tier of plan.pensionTiers) {
                        if (age >= tier.startAge && age <= tier.endAge) {
                            extraInflow += tier.amount;
                        }
                    }
                } else {
                    let pensionAmt = plan.pensionAmount;
                    if (plan.pensionPercent > 0) {
                        pensionAmt = (plan.sumAssured * plan.pensionPercent) / 100;
                    }
                    if (age >= plan.pensionStartAge && age <= plan.pensionEndAge) {
                        extraInflow += pensionAmt;
                    }
                }
            }
        });

        if (extraInflow > 0) {
            insuranceCashInflow += extraInflow;
        }

        wealth = wealth + investmentReturn + annualSaving + extraInflow;
    }

    // Check Insurance Inflow (At Retirement Exact Year)
    let retireYearInflow = 0;
    insurancePlans.forEach((plan: InsurancePlanInput) => {
        if (!plan.active) return;

        if (plan.useSurrender) {
            if (plan.surrenderMode === "table" && plan.surrenderTableData) {
                const entry = plan.surrenderTableData.find(d => d.age === retireAge);
                if (entry) retireYearInflow += Number(String(entry.amount).replace(/,/g, ""));
            } else if (retireAge === plan.surrenderAge && plan.surrenderValue > 0) {
                retireYearInflow += plan.surrenderValue;
            }
        }

        if (plan.type === "สะสมทรัพย์" && retireAge === plan.coverageAge) {
            retireYearInflow += plan.maturityAmount;
        }
        if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
            const policyYear = retireAge - currentAge;
            if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && retireAge <= plan.coverageAge) {
                retireYearInflow += plan.cashBackAmount;
            }
        }
        if (plan.type === "บำนาญ") {
            if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                for (const tier of plan.pensionTiers) {
                    if (retireAge >= tier.startAge && retireAge <= tier.endAge) {
                        retireYearInflow += tier.amount;
                    }
                }
            } else {
                let pensionAmt = plan.pensionAmount;
                if (plan.pensionPercent > 0) {
                    pensionAmt = (plan.sumAssured * plan.pensionPercent) / 100;
                }
                if (retireAge >= plan.pensionStartAge && retireAge <= plan.pensionEndAge) {
                    retireYearInflow += pensionAmt;
                }
            }
        }
    });

    if (retireYearInflow > 0) {
        wealth += retireYearInflow;
        insuranceCashInflow += retireYearInflow;
    }

    wealth += (retireFundOther || 0);
    const projectedFund = wealth;

    const fvLumpSum = currentSavings * Math.pow(1 + r_pre_nominal, yearsToRetire);
    const annualPmt = monthlySaving * 12;
    let fvAnnuity = 0;
    if (Math.abs(r_pre_nominal) < 1e-9) {
        fvAnnuity = annualPmt * yearsToRetire;
    } else {
        fvAnnuity = annualPmt * ((Math.pow(1 + r_pre_nominal, yearsToRetire) - 1) / r_pre_nominal);
    }

    // 2. Expense Schedule
    // Use Helper or define local if simple. The original code has rounding.
    const round2 = (num: number) => Math.round(num * 100) / 100;

    let valAtRetire = retireExtraExpense * Math.pow(1 + r_inf, yearsToRetire);
    let runningExpenseMonthly = round2(valAtRetire);

    const expenseSchedule: ExpenseRow[] = [];

    for (let i = 0; i <= yearsInRetirement; i++) {
        const yearlyExp = round2(runningExpenseMonthly * 12);
        expenseSchedule.push({
            age: retireAge + i,
            monthly: runningExpenseMonthly,
            yearly: yearlyExp
        });
        const nextVal = runningExpenseMonthly * (1 + r_inf);
        runningExpenseMonthly = round2(nextVal);
    }

    const totalLifetimeExpense = expenseSchedule.reduce((sum, item) => sum + item.yearly, 0);

    // 3. Target Fund (Backward Calculation)
    let neededCapital = legacyFund;

    for (let i = expenseSchedule.length - 1; i >= 0; i--) {
        const age = expenseSchedule[i].age;
        const expenseThisYear = expenseSchedule[i].yearly;
        const incomeThisYear = retireMonthlyIncome * 12;

        // Check Insurance Inflow (Post-Retirement)
        let extraInflow = 0;
        insurancePlans.forEach((plan: InsurancePlanInput) => {
            if (!plan.active) return;

            if (plan.useSurrender) {
                if (plan.surrenderMode === "table" && plan.surrenderTableData) {
                    const entry = plan.surrenderTableData.find(d => d.age === age);
                    if (entry) extraInflow += Number(String(entry.amount).replace(/,/g, ""));
                } else if (age === plan.surrenderAge && plan.surrenderValue > 0) {
                    extraInflow += plan.surrenderValue;
                }
            }

            if (plan.type === "สะสมทรัพย์" && age === plan.coverageAge) {
                extraInflow += plan.maturityAmount;
            }
            if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
                const policyYear = age - currentAge;
                if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && age <= plan.coverageAge) {
                    extraInflow += plan.cashBackAmount;
                }
            }
            if (plan.type === "บำนาญ") {
                if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                    for (const tier of plan.pensionTiers) {
                        if (age >= tier.startAge && age <= tier.endAge) {
                            extraInflow += tier.amount;
                        }
                    }
                } else {
                    let pensionAmt = plan.pensionAmount;
                    if (plan.pensionPercent > 0) {
                        pensionAmt = (plan.sumAssured * plan.pensionPercent) / 100;
                    }
                    if (age >= plan.pensionStartAge && age <= plan.pensionEndAge) {
                        extraInflow += pensionAmt;
                    }
                }
            }
        });

        if (extraInflow > 0) {
            insuranceCashInflow += extraInflow;
        }

        const netFlow = expenseThisYear - incomeThisYear - extraInflow;
        neededCapital = (neededCapital + netFlow) / (1 + r_post_nominal);
    }
    const targetFund = neededCapital;

    // 4. Monthly Needed
    let monthlyNeeded = 0;
    if (yearsToRetire > 0) {
        const n = yearsToRetire;
        const r = r_pre_nominal;
        const fvCurrentSavings = currentSavings * Math.pow(1 + r, n);

        let fvInsurancePreRetire = 0;

        insurancePlans.forEach(plan => {
            if (!plan.active) return;
            // Surrender before retirement
            if (plan.useSurrender && plan.surrenderValue > 0 && plan.surrenderAge < retireAge) {
                const yearsToGrow = retireAge - plan.surrenderAge;
                fvInsurancePreRetire += plan.surrenderValue * Math.pow(1 + r, yearsToGrow);
            }
            // Maturity before retirement
            if (plan.type === "สะสมทรัพย์" && plan.coverageAge < retireAge) {
                const yearsToGrow = retireAge - plan.coverageAge;
                fvInsurancePreRetire += plan.maturityAmount * Math.pow(1 + r, yearsToGrow);
            }
            // Cash Back before retirement
            if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
                // Iterate years
                for (let a = currentAge; a < retireAge; a++) {
                    const policyYear = a - currentAge;
                    if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && a <= plan.coverageAge) {
                        const yearsToGrow = retireAge - a;
                        fvInsurancePreRetire += plan.cashBackAmount * Math.pow(1 + r, yearsToGrow);
                    }
                }
            }
            // Pension before retirement? (Unlikely but possible if pension starts early)
            if (plan.type === "บำนาญ" && plan.pensionStartAge < retireAge) {
                // ... similar logic
            }
        });

        const shortfall = targetFund - (fvCurrentSavings + fvInsurancePreRetire);

        if (shortfall > 0) {
            if (Math.abs(r) < 1e-9) {
                monthlyNeeded = shortfall / (n * 12);
            } else {
                const annuityFactor = (Math.pow(1 + r, n) - 1) / r;
                const annualSavingNeeded = shortfall / annuityFactor;
                monthlyNeeded = annualSavingNeeded / 12;
            }
        }
    }
    monthlyNeeded = Math.max(0, monthlyNeeded);

    const gap = projectedFund - targetFund;
    const status: "enough" | "short" = gap >= -1 ? "enough" : "short";
    const successProbability = targetFund <= 0 ? 100 : Math.min(100, (projectedFund / targetFund) * 100);
    const fvExpenseMonthly = expenseSchedule.length > 0 ? expenseSchedule[0].monthly : 0;

    // 5. Money Out Age Calculation (Forward Simulation in Retirement)
    let currentWealth = projectedFund;
    let moneyOutAge = inputs.lifeExpectancy;
    let ranOut = false;

    for (let i = 0; i < expenseSchedule.length; i++) {
        const age = expenseSchedule[i].age;
        const expenseThisYear = expenseSchedule[i].yearly;
        const incomeThisYear = retireMonthlyIncome * 12;

        // Check Insurance Inflow (Post-Retirement)
        let postRetireInflow = 0;
        insurancePlans.forEach((plan: InsurancePlanInput) => {
            if (!plan.active) return;
            if (plan.useSurrender && plan.surrenderValue > 0 && age === plan.surrenderAge) postRetireInflow += plan.surrenderValue;
            if (plan.type === "สะสมทรัพย์" && age === plan.coverageAge) postRetireInflow += plan.maturityAmount;
            if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
                const policyYear = age - currentAge;
                if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && age <= plan.coverageAge) postRetireInflow += plan.cashBackAmount;
            }
            if (plan.type === "บำนาญ") {
                if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                    for (const tier of plan.pensionTiers) {
                        if (age >= tier.startAge && age <= tier.endAge) postRetireInflow += tier.amount;
                    }
                } else {
                    let pensionAmt = plan.pensionAmount;
                    if (plan.pensionPercent > 0) pensionAmt = (plan.sumAssured * plan.pensionPercent) / 100;
                    if (age >= plan.pensionStartAge && age <= plan.pensionEndAge) postRetireInflow += pensionAmt;
                }
            }
        });

        const netOutflow = expenseThisYear - incomeThisYear - postRetireInflow;
        currentWealth = currentWealth * (1 + r_post_nominal) - netOutflow;
        if (currentWealth < 0 && !ranOut) {
            moneyOutAge = age;
            ranOut = true;
        }
    }

    return {
        targetFund,
        projectedFund,
        gap,
        yearsToRetire,
        yearsInRetirement,
        fvExpenseMonthly,
        totalLifetimeExpense,
        nominalReturnPre: r_pre_nominal,
        nominalReturnPost: r_post_nominal,
        successProbability,
        status,
        monthlyNeeded,
        expenseSchedule,
        fvLumpSum,
        fvAnnuity,
        insuranceCashInflow,
        moneyOutAge
    };
}

/* ---------- Monte Carlo (Update Logic) ---------- */
function randomNormal(mean = 0, stdDev = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
}

export function runMonteCarlo(inputs: RetirementInputs, numSimulations = 1500, volatility = 0.06): MonteCarloResult {
    const {
        currentAge,
        retireAge,
        lifeExpectancy,
        currentSavings,
        monthlySaving,
        expectedReturn,
        inflation,
        retireExtraExpense,
        retireMonthlyIncome,
        retireReturnAfter,
        retireFundOther,
        legacyFund,
        insurancePlans
    } = inputs;

    const yearsToRetire = Math.max(0, retireAge - currentAge);
    const totalYears = Math.max(0, lifeExpectancy - currentAge);
    const r_inf = inflation / 100;
    const r_pre = expectedReturn / 100;
    const r_post = retireReturnAfter / 100;

    const sims: number[][] = [];
    const finalBalances: { balance: number; pass: boolean }[] = [];
    let successCount = 0;

    for (let s = 0; s < numSimulations; s++) {
        let balance = currentSavings;
        const series: number[] = [];
        for (let y = 0; y <= totalYears; y++) {
            const age = currentAge + y;
            series.push(balance);

            // Insurance Inflow Logic (Sum of all plans)
            let insuranceInflow = 0;
            insurancePlans.forEach((plan: InsurancePlanInput) => {
                if (!plan.active) return;

                // 1. Surrender Logic
                if (plan.useSurrender && plan.surrenderValue > 0 && age === plan.surrenderAge) {
                    insuranceInflow += plan.surrenderValue;
                }

                // 2. Maturity (Endowment)
                if (plan.type === "สะสมทรัพย์" && age === plan.coverageAge) {
                    insuranceInflow += plan.maturityAmount;
                }

                // 3. Cash Back (Endowment)
                if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
                    const policyYear = age - currentAge; // Assuming policy starts at currentAge
                    if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && age <= plan.coverageAge) {
                        insuranceInflow += plan.cashBackAmount;
                    }
                }

                // 4. Pension (Annuity)
                if (plan.type === "บำนาญ") {
                    if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                        for (const tier of plan.pensionTiers) {
                            if (age >= tier.startAge && age <= tier.endAge) {
                                insuranceInflow += tier.amount;
                            }
                        }
                    } else {
                        let pensionAmt = plan.pensionAmount;
                        if (plan.pensionPercent > 0) {
                            pensionAmt = (plan.sumAssured * plan.pensionPercent) / 100;
                        }
                        if (age >= plan.pensionStartAge && age <= plan.pensionEndAge) {
                            insuranceInflow += pensionAmt;
                        }
                    }
                }
            });

            if (age < retireAge) {
                const ret = randomNormal(r_pre, volatility);
                balance = balance * (1 + ret);
                balance += monthlySaving * 12;
                balance += insuranceInflow;

                // Add lump sum at the very end of accumulation (start of retirement)
                if (age === retireAge - 1) {
                    balance += (retireFundOther || 0);
                }
            } else {
                const ret = randomNormal(r_post, volatility);
                balance = balance * (1 + ret);
                const yearsInRetireSoFar = age - retireAge;
                const expenseThisYear = (retireExtraExpense * 12) * Math.pow(1 + r_inf, yearsToRetire + Math.max(0, yearsInRetireSoFar));
                const incomeThisYear = retireMonthlyIncome * 12;
                const withdraw = Math.max(0, expenseThisYear - incomeThisYear);

                balance += insuranceInflow;
                balance -= withdraw;
            }
            if (!Number.isFinite(balance)) balance = 0;
        }

        const everZeroDuringRetire = series.some((v, idx) => {
            const age = currentAge + idx;
            if (age < retireAge) return false;
            return v <= 0;
        });

        const finalBalance = series[series.length - 1] || 0;
        const passed = !everZeroDuringRetire && finalBalance >= (legacyFund || 0);
        if (passed) successCount++;
        sims.push(series);
        finalBalances.push({ balance: finalBalance, pass: passed });
    }

    const p5Series: number[] = [];
    const p50Series: number[] = [];
    const p95Series: number[] = [];

    for (let y = 0; y <= totalYears; y++) {
        const arr = sims.map((s) => Math.max(0, s[y] || 0)).sort((a, b) => a - b);
        const n = arr.length;
        if (n === 0) {
            p5Series.push(0); p50Series.push(0); p95Series.push(0);
        } else {
            const idx = (p: number) => Math.floor((n - 1) * p);
            p5Series.push(arr[idx(0.05)]);
            p50Series.push(arr[idx(0.5)]);
            p95Series.push(arr[idx(0.95)]);
        }
    }
    const finalIndex = Math.max(0, totalYears);
    return {
        probability: successCount / numSimulations,
        p5: p5Series[finalIndex] || 0,
        p50: p50Series[finalIndex] || 0,
        p95: p95Series[finalIndex] || 0,
        finalBalances,
        p5Series, p50Series, p95Series
    };
}

/* ---------- Projection Series Builder ---------- */
export function buildProjectionSeries(inputs: RetirementInputs, result: any) {
    const {
        currentAge, retireAge, lifeExpectancy, currentSavings, monthlySaving, expectedReturn,
        savingMode, stepIncrements, returnMode, allocations, inflation,
        retireFundOther, retireMonthlyIncome, retireExtraExpense, retireSpecialAnnual, retireReturnAfter,
        insurancePlans
    } = inputs as RetirementInputs & {
        lifeExpectancy: number; inflation: number; retireFundOther: number; legacyFund: number;
        retireMonthlyIncome: number; retireExtraExpense: number; retireSpecialAnnual: number; retireReturnAfter: number;
        savingAt35: any; savingAt40: any; savingAt45: any; savingAt50: any; savingAt55: any;
    };

    const startAge = Math.max(0, Math.floor(Number(currentAge) || 0));
    const endAge = Math.max(startAge, Math.floor(Number(lifeExpectancy) || startAge));
    const totalYears = endAge - startAge;

    let r_pre = expectedReturn / 100;
    if (returnMode === "custom" && allocations.length > 0) {
        const sumW = allocations.reduce((s, a) => s + (a.weight || 0), 0);
        if (sumW > 0) {
            const r = allocations.reduce((s, a) => s + (a.weight || 0) * (a.expectedReturn || 0), 0) / sumW;
            r_pre = r / 100;
        }
    }

    const r_post = retireReturnAfter / 100;
    const r_inf = (inflation || 0) / 100;
    const expenseAnnualAtRetire = (retireExtraExpense * 12) * Math.pow(1 + r_inf, Math.max(0, retireAge - startAge));
    const incomeAnnualAtRetire = (retireMonthlyIncome * 12);
    const specialAnnualAtRetire = (retireSpecialAnnual || 0) * Math.pow(1 + r_inf, Math.max(0, retireAge - startAge));

    const labels: string[] = [];
    const actual: number[] = [];
    const required: number[] = [];

    let balance = currentSavings || 0;
    const targetTotal = result.targetFund || 0;

    for (let y = 0; y <= totalYears; y++) {
        const age = startAge + y;
        labels.push(String(age));

        // Insurance Inflow Check (Sum of all plans)
        let insuranceInflow = 0;
        insurancePlans.forEach((plan: InsurancePlanInput) => {
            if (!plan.active) return;

            // 1. Surrender Logic
            if (plan.useSurrender && plan.surrenderValue > 0 && age === plan.surrenderAge) {
                insuranceInflow += plan.surrenderValue;
            }

            // 2. Maturity (Endowment)
            if (plan.type === "สะสมทรัพย์" && age === plan.coverageAge) {
                insuranceInflow += plan.maturityAmount;
            }

            // 3. Cash Back (Endowment)
            if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
                const policyYear = age - currentAge;
                if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && age <= plan.coverageAge) {
                    insuranceInflow += plan.cashBackAmount;
                }
            }

            // 4. Pension (Annuity)
            if (plan.type === "บำนาญ") {
                if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                    for (const tier of plan.pensionTiers) {
                        if (age >= tier.startAge && age <= tier.endAge) {
                            insuranceInflow += tier.amount;
                        }
                    }
                } else {
                    let pensionAmt = plan.pensionAmount;
                    if (plan.pensionPercent > 0) {
                        pensionAmt = (plan.sumAssured * plan.pensionPercent) / 100;
                    }
                    if (age >= plan.pensionStartAge && age <= plan.pensionEndAge) {
                        insuranceInflow += pensionAmt;
                    }
                }
            }
        });

        if (y > 0) {
            if (age < retireAge) {
                balance = balance * (1 + r_pre);
                let monthly = monthlySaving || 0;
                if (savingMode === "step5" && stepIncrements && stepIncrements.length > 0) {
                    for (const step of stepIncrements) {
                        if (age - 1 >= step.age && step.monthlySaving > 0) {
                            monthly = step.monthlySaving;
                        }
                    }
                }
                balance += monthly * 12;
                balance += insuranceInflow;

                // Lump sum at retirement point (end of year before retireAge)
                if (age === retireAge - 1) {
                    balance += (retireFundOther || 0);
                }
            } else {
                balance = balance * (1 + r_post);
                const yearsInRetireSoFar = age - retireAge;
                const expenseThisYear = expenseAnnualAtRetire * Math.pow(1 + r_inf, Math.max(0, yearsInRetireSoFar));
                const specialThisYear = specialAnnualAtRetire * Math.pow(1 + r_inf, Math.max(0, yearsInRetireSoFar));
                const incomeThisYear = incomeAnnualAtRetire;
                const netWithdrawal = Math.max(0, expenseThisYear + specialThisYear - incomeThisYear);

                balance += insuranceInflow;
                balance -= netWithdrawal;
                if (!Number.isFinite(balance) || balance < 0) balance = Math.max(0, balance);
            }
        } else {
            // Initial year inflow check (e.g. if surrender immediately? unlikely but consistent)
            if (insuranceInflow > 0) {
                balance += insuranceInflow;
            }
        }

        actual.push(Math.max(0, balance));
        required.push(targetTotal);
    }

    const actualHistory: (number | null)[] = new Array(totalYears + 1).fill(null);
    const historyMapping: Record<number, number> = {};
    if (inputs.stepIncrements) {
        inputs.stepIncrements.forEach((item) => {
            historyMapping[item.age] = item.monthlySaving;
        });
    }

    for (let y = 0; y <= totalYears; y++) {
        const age = startAge + y;
        if (historyMapping[age] !== undefined) {
            const val = historyMapping[age];
            if (val > 0) actualHistory[y] = val;
        }
    }

    return { labels, actual, required, actualHistory };
}
