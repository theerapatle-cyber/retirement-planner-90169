
export type InsurancePlan = {
    id: string;
    active: boolean;
    expanded?: boolean;
    planName: string;
    type: string;
    coverageAge: string;
    sumAssured: string;
    useSurrender: boolean;
    surrenderAge: string;
    surrenderValue: string;
    pensionAmount: string;
    pensionStartAge: string;
    pensionEndAge: string;
    maturityAmount: string;
    cashBackAmount: string;
    cashBackFrequency: string;
    assumedReturn: string;
    pensionPercent: string;
    unequalPension: boolean;
    deathBenefitPrePension: string;
    pensionTiers: { startAge: string; endAge: string; amount: string }[];
    surrenderMode?: "single" | "table";
    surrenderTableData?: { age: number; amount: string }[];
    showTable?: boolean;
};

export type FormState = {
    currentAge: string;
    retireAge: string;
    lifeExpectancy: string;

    currentSavings: string;
    monthlySaving: string;
    expectedReturn: string;
    inflation: string;
    savingAt35: string;
    savingAt40: string;
    savingAt45: string;
    savingAt50: string;
    savingAt55: string;

    retireFundOther: string;
    retireMonthlyIncome: string;
    retireReturnAfter: string;
    retireExtraExpense: string;
    retireSpendTrendPercent: string;
    retireSpecialAnnual: string;
    legacyFund: string;
    retireNote: string;

    insurancePlans: InsurancePlan[];
    selectedPlanId: string | null;

    planName: string;
};

export type Allocation = {
    id: number;
    name: string;
    weight: string;
    expectedReturn: string;
    volatility: string;
};

export type InsurancePlanInput = {
    id: string;
    active: boolean;
    name: string;
    type: string;
    coverageAge: number;
    sumAssured: number;
    useSurrender: boolean;
    surrenderAge: number;
    surrenderValue: number;
    pensionAmount: number;
    pensionStartAge: number;
    pensionEndAge: number;
    maturityAmount: number;
    cashBackAmount: number;
    cashBackFrequency: number;
    assumedReturn: number;
    pensionPercent: number;
    unequalPension: boolean;
    deathBenefitPrePension: number;
    pensionTiers: { startAge: number; endAge: number; amount: number }[];
    surrenderMode?: "single" | "table";
    surrenderTableData?: { age: number; amount: string }[];
};

export type RetirementInputs = {
    gender: "male" | "female";
    currentAge: number;
    retireAge: number;
    lifeExpectancy: number;
    currentSavings: number;
    monthlySaving: number;
    expectedReturn: number;
    inflation: number;
    savingMode: "flat" | "step5";
    stepIncrements: { age: number; monthlySaving: number }[];
    retireFundOther: number;
    retireMonthlyIncome: number;
    retireReturnAfter: number;
    retireExtraExpense: number;
    retireSpendTrendPercent: number;
    retireSpecialAnnual: number;
    legacyFund: number;
    returnMode: "avg" | "custom";
    allocations: {
        name: string;
        weight: number;
        expectedReturn: number;
        volatility: number;
    }[];
    insurancePlans: InsurancePlanInput[];
};

export type ExpenseRow = {
    age: number;
    monthly: number;
    yearly: number;
};

export type CalculationResult = {
    targetFund: number;
    projectedFund: number;
    gap: number;
    yearsToRetire: number;
    yearsInRetirement: number;
    fvExpenseMonthly: number;
    totalLifetimeExpense: number;
    nominalReturnPre: number;
    nominalReturnPost: number;
    successProbability: number;
    status: "enough" | "short";
    monthlyNeeded: number;
    moneyOutAge: number;
    expenseSchedule: ExpenseRow[];
    fvLumpSum: number;
    fvAnnuity: number;
    insuranceCashInflow: number;
};

export type MonteCarloResult = {
    probability: number;
    p5: number;
    p50: number;
    p95: number;
    finalBalances: { balance: number; pass: boolean }[];
    p5Series: number[];
    p50Series: number[];
    p95Series: number[];
};

export type MemberProfile = {
    id: string;
    name: string;
    relation: "self" | "spouse" | "child" | "father" | "mother" | "relative";
    form: FormState;
    gender: "male" | "female";
    savingMode: "flat" | "step5";
    returnMode: "avg" | "custom";
    retireSpendMode: "flat" | "step5";
    allocations: Allocation[];
};
