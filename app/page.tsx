"use client";

import * as React from "react";
import Image from "next/image";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/* ---------- Chart.js Register ---------- */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ---------- Helper (formatting) ---------- */
const nfNoDecimal = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });
const nf2 = (value: number, digits = 2) =>
  new Intl.NumberFormat("th-TH", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

const formatNumber = (value: string | number) => {
  const num = typeof value === "string" ? Number(String(value).replace(/,/g, "") || 0) : value;
  return isNaN(num) ? "0" : nfNoDecimal.format(num);
};

const formatNumber2 = (value: number, digits = 2) => {
  return isNaN(value) ? "0" : nf2(value, digits);
};

const round2 = (num: number) => Math.round(num * 100) / 100;

function formatInputDisplay(v: string | number) {
  const num = typeof v === "string" ? Number(String(v).replace(/,/g, "") || 0) : v;
  return isNaN(num) ? "0" : nfNoDecimal.format(num);
}

function parseInputValue(v: string | number) {
  const num = Number(String(v || "").replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
}

/* ---------- Icons ---------- */
const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ChevronUp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const TableIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-7" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);

/* ---------- Types ---------- */
type InsurancePlan = {
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
};

type FormState = {
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

type Allocation = {
  id: number;
  name: string;
  weight: string;
  expectedReturn: string;
  volatility: string;
};

type InsurancePlanInput = {
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

type RetirementInputs = {
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

type ExpenseRow = {
  age: number;
  monthly: number;
  yearly: number;
};

type CalculationResult = {
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
  expenseSchedule: ExpenseRow[];
  fvLumpSum: number;
  fvAnnuity: number;
  insuranceCashInflow: number;
};

type MonteCarloResult = {
  probability: number;
  p5: number;
  p50: number;
  p95: number;
  finalBalances: { balance: number; pass: boolean }[];
  p5Series: number[];
  p50Series: number[];
  p95Series: number[];
};

/* ---------- ค่าเริ่มต้น ---------- */
const initialForm: FormState = {
  currentAge: "30",
  retireAge: "60",
  lifeExpectancy: "85",

  currentSavings: "200,000",
  monthlySaving: "10,000",
  expectedReturn: "7",
  inflation: "3",

  savingAt35: "0",
  savingAt40: "0",
  savingAt45: "0",
  savingAt50: "0",
  savingAt55: "0",

  retireFundOther: "0",
  retireMonthlyIncome: "6,000",
  retireReturnAfter: "0",
  retireExtraExpense: "12,000",
  retireSpendTrendPercent: "0",
  retireSpecialAnnual: "0",
  legacyFund: "0",
  retireNote: "",

  insurancePlans: [],
  selectedPlanId: null,

  planName: "แผนเกษียณของฉัน",
};

/* ---------- Logic Builder ---------- */
function buildRetirementInputs(opts: {
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
    retireMonthlyIncome: num(form.retireMonthlyIncome),
    retireReturnAfter: num(form.retireReturnAfter),
    retireExtraExpense: num(form.retireExtraExpense),
    retireSpendTrendPercent: num(form.retireSpendTrendPercent),
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
export function calculateRetirement(inputs: RetirementInputs): CalculationResult {
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
    retireMonthlyIncome,
    retireReturnAfter,
    retireExtraExpense,
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
      if (plan.useSurrender && plan.surrenderValue > 0 && age === plan.surrenderAge) {
        extraInflow += plan.surrenderValue;
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

    if (plan.useSurrender && plan.surrenderValue > 0 && retireAge === plan.surrenderAge) {
      retireYearInflow += plan.surrenderValue;
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

      if (plan.useSurrender && plan.surrenderValue > 0 && age === plan.surrenderAge) {
        extraInflow += plan.surrenderValue;
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
    // This part is tricky with multiple plans. We need to sum FV of all pre-retire inflows?
    // Or just simplify: The shortfall calculation assumes we need X at retirement.
    // If we have insurance inflows BEFORE retirement, they reduce the needed savings.
    // But we already accounted for them in 'projectedFund' logic?
    // Actually, 'monthlyNeeded' is a separate calculation to tell user "how much MORE to save".
    // It subtracts fvCurrentSavings. It should also subtract FV of any insurance inflows that happen BEFORE retirement.

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
        // For simplicity, let's assume pension starts at or after retirement usually. 
        // If it starts before, it's income.
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
    insuranceCashInflow
  };
}

/* ---------- Monte Carlo (Update Logic) ---------- */
function runMonteCarlo(inputs: RetirementInputs, numSimulations = 1500, volatility = 0.06): MonteCarloResult {
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
      } else if (age === retireAge) {
        const ret = randomNormal(r_pre, volatility);
        balance = balance * (1 + ret);
        balance += (retireFundOther || 0);
        balance += insuranceInflow;
      } else {
        const ret = randomNormal(r_post, volatility);
        balance = balance * (1 + ret);
        const yearsInRetireSoFar = age - retireAge - 1;
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

function randomNormal(mean = 0, stdDev = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

/* ---------- Projection Series Builder ---------- */
function buildProjectionSeries(inputs: RetirementInputs, result: any) {
  const {
    currentAge, retireAge, lifeExpectancy, currentSavings, monthlySaving, expectedReturn,
    savingMode, stepIncrements, returnMode, allocations, inflation,
    retireFundOther, retireMonthlyIncome, retireExtraExpense, retireSpecialAnnual, retireReturnAfter,
    insurancePlans
  } = inputs as RetirementInputs & {
    lifeExpectancy: number; inflation: number; retireFundOther: number; legacyFund: number;
    retireMonthlyIncome: number; retireExtraExpense: number; retireSpecialAnnual: number; retireReturnAfter: number;
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
      if (age <= retireAge) {
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
      } else {
        balance = balance * (1 + r_post);
        const yearsInRetireSoFar = age - retireAge - 1;
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

    if (age === retireAge && y > 0) {
      balance += (retireFundOther || 0);
    }

    actual.push(Math.max(0, balance));
    required.push(targetTotal);
  }

  return { labels, actual, required };
}

/* ---------- Components ---------- */
const SmallStepButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    {...props}
    type="button"
    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all shadow-sm"
  >
    {children}
  </button>
);

// ปุ่มกลมใหญ่ขึ้นนิดนึงสำหรับในฟอร์มประกัน (ตามรูป)
const RoundStepButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    {...props}
    type="button"
    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-base text-muted-foreground hover:bg-secondary hover:text-foreground transition-all shadow-sm"
  >
    {children}
  </button>
);

/* ---------- Family Types ---------- */
type MemberProfile = {
  id: string;
  name: string;
  relation: "self" | "spouse" | "child" | "father" | "mother" | "relative";
  // Store all state relevant to a plan
  form: FormState;
  gender: "male" | "female";
  savingMode: "flat" | "step5";
  returnMode: "avg" | "custom";
  retireSpendMode: "flat" | "step5";
  allocations: Allocation[];
};

/* ---------- Login Screen Component ---------- */
/* ---------- Login Screen Component (Premium Design) ---------- */
const LoginScreen = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [name, setName] = React.useState("User");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/20 blur-[100px] animate-in fade-in zoom-in duration-1000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/20 blur-[100px] animate-in fade-in zoom-in duration-1000 delay-300" />
        <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-emerald-400/10 blur-[80px] animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-6xl h-[85vh] max-h-[800px] grid grid-cols-1 lg:grid-cols-12 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] rounded-[32px] overflow-hidden z-10 bg-white/80 backdrop-blur-2xl ring-1 ring-white/50 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">

        {/* Decorative branding overlay */}
        <div className="absolute top-6 left-8 z-20 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">R</div>
          <span className="font-bold text-slate-800 tracking-tight">Retirement Planner</span>
        </div>

        {/* Left Side: Illustration & Value Prop (7 cols) */}
        <div className="hidden lg:flex lg:col-span-7 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative flex-col justify-between p-16 overflow-hidden">
          {/* Abstract Pattern */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

          {/* Glowing Orbs */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-[64px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[80px] mix-blend-screen"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white shadow-inner ring-1 ring-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M2 12h20" /><path d="m4.93 4.93 14.14 14.14" /><path d="m19.07 4.93-14.14 14.14" /></svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-blue-50">Retirement Planner</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6">
              วางแผนอนาคต<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">เพื่อชีวิตที่คุณเลือกได้</span>
            </h1>
            <p className="text-blue-100/80 text-lg font-light leading-relaxed max-w-lg">
              ไม่ใช่แค่เครื่องมือคำนวณ แต่คือแผนที่นำทางสู่ความมั่นคงทางการเงิน ด้วยระบบจำลองสถานการณ์อัจฉริยะที่เข้าใจง่ายและแม่นยำ
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="relative z-10 grid grid-cols-2 gap-8 mt-12">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-emerald-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
              </div>
              <h3 className="font-semibold text-white">Visual Analytics</h3>
              <p className="text-xs text-blue-200/60 leading-relaxed">เห็นภาพการเติบโตของสินทรัพย์ด้วยกราฟที่เข้าใจง่าย</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-indigo-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M2 12h20" /><path d="m4.93 4.93 14.14 14.14" /><path d="m19.07 4.93-14.14 14.14" /></svg>
              </div>
              <h3 className="font-semibold text-white">Monte Carlo Sim</h3>
              <p className="text-xs text-blue-200/60 leading-relaxed">ประเมินความเสี่ยงด้วยการจำลองสถานการณ์กว่า 1,000 รูปแบบ</p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 flex justify-between items-end">
            <div className="text-[10px] text-blue-300/40 uppercase tracking-widest font-semibold">
              Financial Freedom OS v2.0
            </div>
          </div>
        </div>

        {/* Right Side: Login Form (5 cols) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-center p-10 lg:p-16 bg-white/60 relative">
          <div className="absolute top-0 right-0 p-8 hidden lg:block">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              <div className="w-3 h-3 rounded-full bg-slate-200"></div>
            </div>
          </div>

          <div className="max-w-sm w-full mx-auto">
            <div className="mb-10 text-center lg:text-left">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-4 inline-block">Welcome Back</span>
              <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">เริ่มต้นวางแผน</h2>
              <p className="text-sm text-slate-500">กรอกชื่อของคุณเพื่อเข้าสู่ระบบจำลอง (Demo)</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3 group">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                  <span>ชื่อผู้ใช้งาน</span>
                  <span className="text-[10px] text-slate-400 font-normal group-focus-within:text-blue-500 transition-colors">ระบุอะไรก็ได้</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </div>
                  <input
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                    placeholder="เช่น สมชาย ใจดี"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onLogin(name || "User")}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => onLogin(name || "User")}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>เข้าสู่ระบบ</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </Button>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/60 px-2 text-slate-400">หรือ</span>
                </div>
              </div>

              <div className="text-center">
                <button onClick={() => onLogin("Guest")} className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                  เข้าใช้งานแบบ Guest Mode (ไม่ต้องกรอกชื่อ)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer simple mark */}
      <div className="absolute bottom-4 text-[10px] text-slate-400 font-medium">
        Secure • Private • No Data Leaving Your Browser
      </div>
    </div>
  );
};

/* ---------- Collapsible Section Component ---------- */
const CollapsibleSection = ({
  title,
  icon,
  iconColorClass,
  defaultOpen = false,
  children
}: {
  title: string;
  icon?: React.ReactNode;
  iconColorClass?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-border bg-card/80 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColorClass || "bg-primary/10 text-primary"} shadow-sm ring-1 ring-inset ring-black/5`}>
              {icon}
            </div>
          )}
          <span className="text-sm font-bold text-foreground tracking-tight">{title}</span>
        </div>
        <div className={`transform transition-transform duration-200 text-muted-foreground ${isOpen ? "rotate-180" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </button>

      {isOpen && (
        <div className="p-5 animate-in slide-in-from-top-1 duration-200 border-t border-border/50 bg-background/50 space-y-5">
          {children}
        </div>
      )}
    </div>
  );
};

/* ---------- Main Component ---------- */
export default function HomePage() {
  /* Family State */
  const [familyMembers, setFamilyMembers] = React.useState<MemberProfile[]>([]);
  const [currentMemberId, setCurrentMemberId] = React.useState<string>("primary");
  const [showFamilyPanel, setShowFamilyPanel] = React.useState(false);
  const [showFamilySummaryModal, setShowFamilySummaryModal] = React.useState(false);

  const [form, setForm] = React.useState<FormState>(initialForm);
  const [inputStep, setInputStep] = React.useState(1); // 1=Personal, 2=Financial, 3=Goal
  const [showResult, setShowResult] = React.useState(false);
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

  const hasData = React.useMemo(() => {
    const age = Number(String(form.currentAge).replace(/,/g, ""));
    const retire = Number(String(form.retireAge).replace(/,/g, ""));
    return age > 0 && retire > 0;
  }, [form.currentAge, form.retireAge]);

  const [showSumAssured, setShowSumAssured] = React.useState(true);
  const [showActualSavings, setShowActualSavings] = React.useState(true);


  const [insuranceExpanded, setInsuranceExpanded] = React.useState(false);
  const [showInsuranceTable, setShowInsuranceTable] = React.useState(false);

  // Modals
  const [showExpenseModal, setShowExpenseModal] = React.useState(false);
  const [expenseModalTab, setExpenseModalTab] = React.useState<"details" | "formula">("details");

  const [showTargetModal, setShowTargetModal] = React.useState(false);
  const [targetModalTab, setTargetModalTab] = React.useState<"details" | "formula">("details");

  const [showProjectedModal, setShowProjectedModal] = React.useState(false);
  const [projectedModalTab, setProjectedModalTab] = React.useState<"details" | "formula">("details");

  const [showMonteCarloDetails, setShowMonteCarloDetails] = React.useState(false);

  const [planSaved, setPlanSaved] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);

  const PLAN_KEY = "retirement-plan-default-v2";
  const FAMILY_KEY = "retirement-family-v1";

  /* ---------- Family Logic ---------- */
  // Sync current form to the active member in the family list (call this before switching)
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
      // Save to local storage immediately for persistence
      if (typeof window !== "undefined") {
        window.localStorage.setItem(FAMILY_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, [currentMemberId, form, gender, relation, savingMode, returnMode, retireSpendMode, allocations]);

  // Load a specific member into the form
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

    // We'll do it manually to ensure order:
    const targetMember = familyMembers.find(m => m.id === id);
    if (!targetMember) return;

    // Update the *previous* member in the list
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
    loadMember(targetMember);
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
      form: { ...initialForm, currentAge: "0", planName: `แผนของสมาชิก ${updatedList.length + 1}` },
      gender: "male",
      savingMode: "flat",
      returnMode: "avg",
      allocations: [
        { id: 1, name: "หุ้น", weight: "70", expectedReturn: "8", volatility: "15" },
        { id: 2, name: "ตราสารหนี้", weight: "25", expectedReturn: "4", volatility: "5" },
        { id: 3, name: "เงินสด/ทอง", weight: "5", expectedReturn: "2", volatility: "2" },
      ],
      retireSpendMode: "flat"
    };

    const newList = [...updatedList, newMember];
    setFamilyMembers(newList);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FAMILY_KEY, JSON.stringify(newList));
    }

    // Switch to new member
    loadMember(newMember);
  };

  const handleRemoveMember = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      // If we deleted the current member, switch to the first one
      if (id === currentMemberId) {
        loadMember(newList[0]);
      }
    }
  };

  // Aggregate Family Data
  const getFamilySummary = () => {
    // We need to calculate for ALL members. 
    // WARNING: This is expensive if we run full monte carlo.
    // For summary, we might just run deterministic 'calculateRetirement'.
    // NOTE: 'form' is only the current member. We need to iterate 'familyMembers', 
    // BUT we must make sure the CURRENT member info in 'familyMembers' is up to date 
    // or we merge it on the fly.

    // Use stored state only (update on Save)
    const relevantMembers = familyMembers;

    let totalTarget = 0;
    let totalProjected = 0;
    let totalGap = 0;
    let totalMonthlySavingsCurrent = 0;
    let totalMonthlyNeeded = 0;

    relevantMembers.forEach(m => {
      // Use active state for current member to support live updates
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

      // Accumulate Monthly Data
      totalMonthlySavingsCurrent += inputs.monthlySaving;
      totalMonthlyNeeded += res.monthlyNeeded;
    });

    return {
      totalTarget,
      totalProjected,
      totalGap,
      memberCount: relevantMembers.length,
      totalMonthlySavingsCurrent,
      totalMonthlyNeeded
    };
  };



  /* ---------- Authentication (mock) ---------- */
  const [user, setUser] = React.useState<{ name: string } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("mock-user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });


  React.useEffect(() => {
    // Always initialize with default (empty/zero) values as per requirement
    // to reset values to 0 and not show planning info upon entering the system.

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
    setForm(initialForm); // Ensure form is reset
  }, []);

  const handleSavePlan = () => {
    if (typeof window === "undefined") return;

    // Save Legacy
    const payload = { form, gender, relation, savingMode, returnMode, retireSpendMode, allocations };
    window.localStorage.setItem(PLAN_KEY, JSON.stringify(payload));

    // Save Family
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
    window.localStorage.setItem(FAMILY_KEY, JSON.stringify(updatedList));

    setPlanSaved(true);
    setSaveMessage("บันทึกแผนเรียบร้อยแล้ว");
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const planButtonLabel = planSaved ? "บันทึกแผน (1/1)" : "บันทึกแผน (0/1)";

  /* ---------- input handling ---------- */
  const handleChange =
    (key: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        let value: string | boolean = target instanceof HTMLInputElement && target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
        setForm((prev) => ({ ...prev, [key]: typeof prev[key] === "boolean" ? Boolean(value) : (value as string) }));
      };

  const handleNumericFocus = (key: keyof FormState) => (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = String(form[key] || "");
    setForm((prev) => ({ ...prev, [key]: String(raw).replace(/,/g, "") }));
  };

  const handleNumericBlur = (key: keyof FormState) => (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = String(form[key] || "");
    const num = parseInputValue(raw);
    setForm((prev) => ({ ...prev, [key]: formatInputDisplay(num) }));
  };

  const changeBy = (key: keyof FormState, delta: number) => () => {
    const raw = form[key] ?? "0";
    const current = Number(String(raw).replace(/,/g, "")) || 0;
    const next = Math.max(0, current + delta);
    const isFloat = !Number.isInteger(delta);
    const valStr = isFloat ? String(next.toFixed(1)) : String(Math.round(next));
    setForm((prev) => ({ ...prev, [key]: formatInputDisplay(valStr) }));
  };

  /* allocation handlers */
  const updateAllocation = (id: number, field: keyof Allocation) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAllocations((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const removeAllocation = (id: number) => setAllocations((prev) => prev.filter((a) => a.id !== id));
  const addAllocation = () => {
    const nextId = allocations.length ? Math.max(...allocations.map((a) => a.id)) + 1 : 1;
    setAllocations((prev) => [...prev, { id: nextId, name: "สินทรัพย์ใหม่", weight: "0", expectedReturn: "0", volatility: "0" }]);
  };

  const resetRetirement = () => {
    setForm((prev) => ({
      ...prev,
      currentAge: "0",
      retireAge: "0",
      lifeExpectancy: "0",
      currentSavings: "0",
      monthlySaving: "0",
      expectedReturn: "0",
      inflation: "0",
      savingAt35: "0",
      savingAt40: "0",
      savingAt45: "0",
      savingAt50: "0",
      savingAt55: "0",
      retireFundOther: "0",
      retireMonthlyIncome: "0",
      retireReturnAfter: "0",
      retireExtraExpense: "0",
      retireSpendTrendPercent: "0",
      retireSpecialAnnual: "0",
      legacyFund: "0",
      retireNote: "",
      insurancePlans: [],
    }));
    setRetireSpendMode("flat");
    setSavingMode("flat");
    setReturnMode("avg");
    setAllocations([
      { id: 1, name: "หุ้น", weight: "0", expectedReturn: "0", volatility: "0" },
      { id: 2, name: "ตราสารหนี้", weight: "0", expectedReturn: "0", volatility: "0" },
      { id: 3, name: "เงินสด/ทอง", weight: "0", expectedReturn: "0", volatility: "0" },
    ]);
  };

  // --- Handlers for Insurance ---
  const handleAddInsurance = () => {
    setForm(prev => ({ ...prev, insuranceActive: true }));
    setInsuranceExpanded(true);
  }

  const handleDeleteInsurance = () => {
    setForm(prev => ({
      ...prev,
      insuranceActive: false,
      insuranceUseSurrender: false
    }));
    setInsuranceExpanded(false);
  }

  /* ---------- inputs -> numeric model ---------- */
  const inputs = React.useMemo(
    () =>
      buildRetirementInputs({
        form,
        gender,
        savingMode,
        returnMode,
        allocations,
      }),
    [form, gender, savingMode, returnMode, allocations]
  );

  const result = React.useMemo(() => calculateRetirement(inputs), [inputs]);
  const mcResult = React.useMemo(() => runMonteCarlo(inputs, 5, 0.06), [inputs]);

  /* ---------- Insurance Chart Data (Moved Up) ---------- */


  /* ---------- Insurance Chart Data (Moved Up) ---------- */
  const insuranceAges = React.useMemo(() => {
    const start = Number(String(form.currentAge || "30").replace(/,/g, ""));
    const end = 100; // ตารางแสดงถึงอายุ 100 ปี
    const rows: number[] = [];
    for (let age = start; age <= end; age++) rows.push(age);
    return rows;
  }, [form.currentAge]);

  const insuranceChartData = React.useMemo(() => {
    if (!form.insurancePlans || form.insurancePlans.length === 0) return null;

    const currentAge = Number(String(form.currentAge).replace(/,/g, ""));
    // Find max coverage age or life expectancy
    let maxAge = Number(String(form.lifeExpectancy).replace(/,/g, ""));
    form.insurancePlans.forEach(p => {
      if (p.active) {
        maxAge = Math.max(maxAge, Number(p.coverageAge));
      }
    });

    const endAge = maxAge;

    const labels: number[] = [];
    const deathBenefit: number[] = [];
    const cashFlow: number[] = [];
    const cashValue: (number | null)[] = [];

    for (let age = currentAge; age <= endAge; age++) {
      labels.push(age);

      let totalDeathBenefit = 0;
      let totalFlow = 0;
      let totalCashValue = 0;
      let hasCashValue = false;

      form.insurancePlans.forEach(plan => {
        if (!plan.active) return;

        const sumAssured = Number(String(plan.sumAssured).replace(/,/g, ""));
        const coverageAge = Number(plan.coverageAge);

        // 1. Death Benefit
        let currentDB = sumAssured;
        if (plan.type === "บำนาญ") {
          const dbPre = Number(String(plan.deathBenefitPrePension).replace(/,/g, ""));
          const startPension = Number(plan.pensionStartAge);
          if (age < startPension && dbPre > 0) {
            currentDB = dbPre;
          }
        }

        // Check surrender
        if (plan.useSurrender && plan.surrenderAge) {
          const sAge = Number(plan.surrenderAge);
          if (age > sAge) currentDB = 0;
        }

        if (age <= coverageAge) {
          totalDeathBenefit += currentDB;
        }

        // 2. Cash Flow
        // Endowment
        if (plan.type === "สะสมทรัพย์") {
          const maturity = Number(String(plan.maturityAmount).replace(/,/g, ""));
          const cashBack = Number(String(plan.cashBackAmount).replace(/,/g, ""));
          const freq = Number(plan.cashBackFrequency) || 1;

          if (age === coverageAge) totalFlow += maturity;

          const policyYear = age - currentAge;
          if (policyYear > 0 && policyYear % freq === 0 && age <= coverageAge) {
            totalFlow += cashBack;
          }
        }

        // Annuity
        if (plan.type === "บำนาญ") {
          if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
            for (const tier of plan.pensionTiers) {
              const tStart = Number(tier.startAge);
              const tEnd = Number(tier.endAge);
              const tAmount = Number(String(tier.amount).replace(/,/g, ""));
              if (age >= tStart && age <= tEnd) {
                totalFlow += tAmount;
              }
            }
          } else {
            const percent = Number(plan.pensionPercent);
            let pension = Number(String(plan.pensionAmount).replace(/,/g, ""));
            if (percent > 0) {
              pension = (sumAssured * percent) / 100;
            }
            const start = Number(plan.pensionStartAge);
            const end = Number(plan.pensionEndAge) || 100;

            if (age >= start && age <= end) {
              totalFlow += pension;
            }
          }
        }

        // 3. Surrender Value
        if (plan.useSurrender && plan.surrenderAge) {
          const sAge = Number(plan.surrenderAge);
          if (age === sAge) {
            totalCashValue += Number(String(plan.surrenderValue).replace(/,/g, ""));
            hasCashValue = true;
          }
        }
      });

      deathBenefit.push(totalDeathBenefit);
      cashFlow.push(totalFlow);
      cashValue.push(hasCashValue ? totalCashValue : null);
    }

    return {
      labels,
      datasets: [
        {
          label: "ผลประโยชน์กรณีเสียชีวิต",
          data: deathBenefit,
          borderColor: "#2970FF", // Primary Blue
          backgroundColor: "rgba(41, 112, 255, 0.1)",
          fill: true,
          tension: 0.3,
          order: 2,
        },
        {
          label: "เงินคืน / บำนาญ",
          data: cashFlow,
          borderColor: "#00B5A3", // Teal
          backgroundColor: "rgba(0, 181, 163, 0.5)",
          type: "bar" as const,
          barThickness: 8,
          borderRadius: 4,
          order: 1,
        },
        {
          label: "มูลค่าเวนคืน",
          data: cashValue,
          borderColor: "#FF9900", // Amber
          backgroundColor: "#FF9900",
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: false,
          order: 0,
        },
      ],
    };
  }, [form]);

  /* ---------- Helper: Calculate Death Benefit at Age ---------- */
  const calculateDeathBenefitAtAge = (plan: InsurancePlan, age: number) => {
    const sumAssured = Number(String(plan.sumAssured).replace(/,/g, ""));
    const coverageAge = Number(plan.coverageAge);

    // Basic Coverage Check
    if (age > coverageAge) return 0;

    // Surrender Check
    if (plan.useSurrender && plan.surrenderAge && age > Number(plan.surrenderAge)) return 0;

    // Annuity Logic (Depletion Check)
    if (plan.type === "บำนาญ") {
      const dbPre = Number(String(plan.deathBenefitPrePension).replace(/,/g, ""));
      let currentDB = sumAssured;
      if (age < Number(plan.pensionStartAge) && dbPre > 0) currentDB = dbPre;

      // Calculate accumulated pension to reduce DB
      let accumulatedPension = 0;
      let startAge = Number(plan.pensionStartAge);
      if (plan.unequalPension && plan.pensionTiers?.length > 0) {
        const minTierStart = Math.min(...plan.pensionTiers.map(t => Number(t.startAge)));
        startAge = minTierStart;
      }

      if (age >= startAge) {
        for (let pastAge = startAge; pastAge < age; pastAge++) {
          let pastAmount = 0;
          if (plan.unequalPension && plan.pensionTiers) {
            const tier = plan.pensionTiers.find(t => pastAge >= Number(t.startAge) && pastAge <= Number(t.endAge));
            pastAmount = tier ? Number(String(tier.amount).replace(/,/g, "")) : 0;
          } else {
            if (pastAge >= Number(plan.pensionStartAge) && pastAge <= (Number(plan.pensionEndAge) || 100)) {
              let pAmt = Number(String(plan.pensionAmount).replace(/,/g, ""));
              if (Number(plan.pensionPercent) > 0) pAmt = (sumAssured * Number(plan.pensionPercent)) / 100;
              pastAmount = pAmt;
            }
          }
          accumulatedPension += pastAmount;
        }
        currentDB = Math.max(0, currentDB - accumulatedPension);
      }
      return currentDB;
    }

    return sumAssured;
  };

  /* ---------- build projection chart ---------- */
  const projectionChart = React.useMemo(() => {
    const { labels, actual, required } = buildProjectionSeries(inputs, result);

    // use series from mcResult
    const p5Series = mcResult.p5Series || labels.map(() => 0);
    const p95Series = mcResult.p95Series || labels.map(() => 0);

    // Sum Assured Series (Get from insuranceChartData logic)
    // We need to map the insuranceChartData (which covers 0-100 or similar) to the projection timeline
    const sumAssuredSeries = labels.map(ageStr => {
      const age = Number(ageStr);
      if (!insuranceChartData) return 0;

      // Find index in insuranceChartData
      const idx = insuranceChartData.labels.indexOf(age);
      if (idx !== -1) {
        // dataset[0] is Death Benefit
        return insuranceChartData.datasets[0].data[idx] as number || 0;
      }
      return 0;
    });

    // compute step to avoid overcrowding labels on the x axis
    const maxTicks = 12; // show up to 12 ticks to keep readable (ปรับได้)
    const step = Math.max(1, Math.ceil(labels.length / maxTicks));

    // Calculate dynamic max for Y-axis based on visible main lines (ignoring P95)
    const maxActual = Math.max(...actual);
    const maxRequired = Math.max(...required);
    const maxSumAssured = showSumAssured ? Math.max(...sumAssuredSeries) : 0;
    const maxMain = Math.max(maxActual, maxRequired, maxSumAssured);
    const suggestedMax = Math.ceil((maxMain * 1.1) / 1000000) * 1000000; // +10% padding, round to nearest M

    return {
      data: {
        labels,
        datasets: [
          // Monte Carlo lower (P5)
          {
            label: "P5",
            data: p5Series,
            borderColor: "transparent",
            backgroundColor: "rgba(0, 181, 163, 0.1)", // Teal tint
            pointRadius: 0,
            fill: "+1", // fill to the next dataset (P95)
            tension: 0.4, // Smooth curve
            order: 1,
            hidden: !showActualSavings,
          },
          // Monte Carlo upper (P95)
          {
            label: "P95",
            data: p95Series,
            borderColor: "transparent",
            backgroundColor: "rgba(0, 181, 163, 0.1)", // Teal tint
            pointRadius: 0,
            fill: false,
            tension: 0.4, // Smooth curve
            order: 2,
            hidden: !showActualSavings,
          },
          // Actual projected (เส้นหลัก)
          {
            label: "เงินออมคาดว่าจะมี",
            data: actual,
            borderColor: "#00B5A3", // Teal
            backgroundColor: "rgba(0, 181, 163, 0.1)",
            tension: 0.3,
            fill: false, // Don't fill under the line, use P5-P95 for area
            pointRadius: 0,
            pointHoverRadius: 6,
            order: 3,
            hidden: !showActualSavings,
          },
          // Target (dashed) - Financial Freedom
          {
            label: "อิสรภาพทางการเงิน",
            data: required,
            borderColor: "#2970FF", // Blue
            borderDash: [6, 6],
            backgroundColor: "transparent",
            pointRadius: 0,
            borderWidth: 2,
            fill: false,
            order: 4,
          },
          // Sum Assured (Aggregated)
          {
            label: "ทุนประกัน",
            data: sumAssuredSeries,
            borderColor: "#FF9900", // Amber
            backgroundColor: "transparent",
            borderWidth: 2,
            stepped: false,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: "#FF9900",
            pointBorderColor: "white",
            pointBorderWidth: 2,
            fill: false,
            order: 5,
            hidden: !showSumAssured,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "#ffffff",
            titleColor: "#1e293b",
            bodyColor: "#1e293b",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            titleFont: { size: 16, weight: "bold", family: "'Inter', sans-serif" },
            bodyFont: { size: 14, family: "'Inter', sans-serif" },
            padding: 12,
            displayColors: false,
            callbacks: {
              title: (items: any[]) => {
                if (!items.length) return "";
                return `อายุ ${items[0].label}`;
              },
              label: (ctx: any) => {
                if (ctx.dataset.label === "เงินออมคาดว่าจะมี") {
                  return `เงินออม: ฿${formatNumber(ctx.parsed.y || 0)}`;
                }

                // Custom Tooltip for Sum Assured
                if (ctx.dataset.label === "ทุนประกัน") {
                  const age = Number(ctx.label);
                  const total = ctx.parsed.y || 0;
                  const lines = [`ทุนประกันรวม: ฿${formatNumber(total)}`];

                  form.insurancePlans.forEach(plan => {
                    if (!plan.active) return;
                    const amount = calculateDeathBenefitAtAge(plan, age);
                    if (amount > 0) {
                      lines.push(`- ${plan.planName}: ฿${formatNumber(amount)}`);
                    }
                  });
                  return lines;
                }

                return null; // Hide other labels
              },
            },
            filter: (item: any) => true, // Allow all
          },
        },
        scales: {
          x: {
            title: { display: true, text: "อายุ (ปี)" },
            grid: { display: false },
            ticks: {
              autoSkip: false,
              callback: function (val: any, index: number) {
                if (index % step !== 0) return "";
                return String(this.getLabelForValue(index));
              },
              maxRotation: 0,
              minRotation: 0,
            },
          },
          y: {
            title: { display: true, text: "จำนวนเงิน" },
            grid: { color: "#f1f5f9" },
            min: 0,
            max: suggestedMax, // Restored per user request to keep graph "high"
            ticks: {
              stepSize: 1000000,
              callback: (v: any) => {
                const val = v as number;
                if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
                if (val >= 1000) return (val / 1000).toFixed(0) + "k";
                return val;
              },
            },
          },
        },
      } as ChartOptions<"line">,
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
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top' as const,
            align: 'end' as const,
            labels: {
              boxWidth: 10,
              usePointStyle: true,
              font: { size: 11 }
            }
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: (ctx: any) => `รายจ่าย : ฿ ${formatNumber(ctx.parsed.y || 0)} / เดือน`,
              title: (ctx: any) => `อายุ ${ctx[0].label} ปี`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            title: {
              display: true,
              text: "อายุ (ปี)",
              font: { size: 12 }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            title: {
              display: true,
              text: "จำนวนเงิน",
              font: { size: 12 }
            },
            ticks: {
              callback: (v) => {
                const val = v as number;
                if (val >= 1000000) return "B" + (val / 1000000).toFixed(1) + "M";
                if (val >= 1000) return "B" + (val / 1000).toFixed(0) + "k";
                return val;
              },
            },
          },
        },
      } as ChartOptions<"line">,
    };
  }, [result.expenseSchedule]);




  /* ---------- Export CSV ---------- */
  const handleExportCSV = () => {
    const { labels, actual, required } = buildProjectionSeries(inputs, result);
    const header = ["age", "actual", "required"];
    const rows = labels.map((lab, i) => [lab, Math.round(actual[i]), Math.round(required[i])]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.planName || "retirement_plan"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- Print ---------- */
  const handlePrint = () => {
    window.print();
  };



  /* ---------- Update displayed formatting ---------- */
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
  }, []);

  /* ---------- Multiple Insurance Plans Helpers ---------- */
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

  const updateInsurancePlanTier = (planIndex: number, tierIndex: number, field: string, value: string) => {
    setForm(prev => {
      const newPlans = [...prev.insurancePlans];
      const plan = newPlans[planIndex];
      const newTiers = [...(plan.pensionTiers || [])];
      newTiers[tierIndex] = { ...newTiers[tierIndex], [field]: value };
      newPlans[planIndex] = { ...plan, pensionTiers: newTiers };
      return { ...prev, insurancePlans: newPlans };
    });
  };

  const addInsurancePlanTier = (planIndex: number) => {
    setForm(prev => {
      const newPlans = [...prev.insurancePlans];
      const plan = newPlans[planIndex];
      newPlans[planIndex] = {
        ...plan,
        pensionTiers: [...(plan.pensionTiers || []), { startAge: "60", endAge: "85", amount: "0" }]
      };
      return { ...prev, insurancePlans: newPlans };
    });
  };

  const removeInsurancePlanTier = (planIndex: number, tierIndex: number) => {
    setForm(prev => {
      const newPlans = [...prev.insurancePlans];
      const plan = newPlans[planIndex];
      const newTiers = [...(plan.pensionTiers || [])];
      newTiers.splice(tierIndex, 1);
      newPlans[planIndex] = { ...plan, pensionTiers: newTiers };
      return { ...prev, insurancePlans: newPlans };
    });
  };

  const changeInsurancePlanTierAmount = (planIndex: number, tierIndex: number, delta: number) => {
    setForm(prev => {
      const newPlans = [...prev.insurancePlans];
      const plan = newPlans[planIndex];
      const newTiers = [...(plan.pensionTiers || [])];
      const currentVal = Number(newTiers[tierIndex].amount.replace(/,/g, "")) || 0;
      newTiers[tierIndex] = { ...newTiers[tierIndex], amount: String(currentVal + delta) };
      newPlans[planIndex] = { ...plan, pensionTiers: newTiers };
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


  /* ---------- Auth Handlers ---------- */
  const handleLogin = (name: string) => {
    const u = { name };
    setUser(u);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mock-user", JSON.stringify(u));
    }
  };

  const handleLogout = () => {
    // 1. Clear Persistence
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }

    // 2. Reset Auth
    setUser(null);

    // 3. Reset Application State
    setForm(initialForm);
    setFamilyMembers([]);
    setCurrentMemberId("primary");
    setInputStep(1);
    setShowResult(false);

    // 4. Reset Settings/Preferences
    setGender("male");
    setRelation("self");
    setSavingMode("flat");
    setReturnMode("avg");
    setRetireSpendMode("flat");

    // 5. Reset Allocations
    setAllocations([
      { id: 1, name: "หุ้น", weight: "70", expectedReturn: "8", volatility: "15" },
      { id: 2, name: "ตราสารหนี้", weight: "25", expectedReturn: "4", volatility: "5" },
      { id: 3, name: "เงินสด/ทอง", weight: "5", expectedReturn: "2", volatility: "2" },
    ]);
  };

  // State-Based Logic: If not logged in, show Login Screen
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const heroImageSrc = gender === "female" ? "/images/retirement/pic2.png" : "/images/retirement/pic1.png";

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl print:hidden transition-all duration-200 supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-4 lg:px-6">
          <div className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 ring-1 ring-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-base font-bold tracking-tight text-slate-900 leading-none">Retirement<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Planner</span></span>
              <span className="text-[10px] font-medium text-slate-400 leading-tight mt-0.5">Financial Freedom OS</span>
            </div>
          </div>
          <div className="hidden items-center gap-3 text-xs lg:flex">


            {/* Add Family Member Button */}
            {user && user.name !== "Guest" && familyMembers.length < 10 && (
              <Button variant="outline" className="h-9 rounded-full px-4 text-xs font-semibold text-slate-600 border-dashed border-slate-300 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all mr-2" onClick={handleAddMember}>
                + เพิ่มสมาชิก
              </Button>
            )}

            <div className="flex items-center gap-3 pl-1 group cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-colors pr-3 border border-transparent hover:border-slate-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 border border-white shadow-sm flex items-center justify-center text-blue-700 font-bold overflow-hidden">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{user.name}</span>
                <span className="text-[9px] text-slate-400">Free Account</span>
              </div>
              <Button variant="ghost" className="h-6 w-6 rounded-full p-0 text-slate-400 hover:bg-red-50 hover:text-red-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleLogout} title="Log out">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* FAMILY PANEL (Display only if logged in AND has more than 1 member) */}
      {user && familyMembers.length > 1 && (
        <div className="bg-slate-50/80 backdrop-blur-md border-b border-white/20 px-4 py-2 lg:px-6 transition-all duration-200 supports-[backdrop-filter]:bg-slate-50/60 sticky top-[72px] z-40">
          <div className="mx-auto max-w-[1800px] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-2">Family Members</span>
              {familyMembers.map(m => (
                <div
                  key={m.id}
                  onClick={() => handleSwitchMember(m.id)}
                  className={`
                        relative flex items-center gap-2 px-4 py-1.5 rounded-full cursor-pointer border transition-all duration-300 group
                        ${m.id === currentMemberId ? "bg-white border-blue-200 shadow-sm ring-2 ring-blue-100 text-blue-700" : "bg-white/50 border-transparent hover:bg-white hover:border-slate-200 text-slate-500"}
                      `}
                >
                  <div className={`w-2 h-2 rounded-full transition-all ${m.id === currentMemberId ? "bg-blue-500 scale-110" : "bg-slate-300 group-hover:bg-slate-400"}`} />
                  <span className={`text-xs font-bold`}>
                    {m.name}
                  </span>
                  {familyMembers.length > 1 && (
                    <button
                      onClick={(e) => handleRemoveMember(m.id, e)}
                      className="ml-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <CloseIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddMember}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-slate-300 text-xs text-slate-400 hover:bg-white hover:text-blue-600 hover:border-blue-300 transition-all whitespace-nowrap ml-1"
              >
                <span>+</span>
              </button>
            </div>

            {/* Family Summary (Mini) */}
            <div className="flex items-center gap-5 text-xs bg-white/60 backdrop-blur-sm px-5 py-2 rounded-full border border-white/40 shadow-sm ml-auto hover:bg-white/80 transition-all ring-1 ring-black/5">
              <div className="flex flex-col items-end hidden lg:flex">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">เป้าหมายรวม</span>
                <span className="font-bold text-slate-800 text-sm">
                  {formatNumber(getFamilySummary().totalTarget)}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">ขาดอีก (รวม)</span>
                <span className={`${getFamilySummary().totalGap < 0 ? "text-rose-500" : "text-emerald-500"} font-bold text-sm`}>
                  {formatNumber(Math.abs(getFamilySummary().totalGap))}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
              <Button variant="ghost" className="h-7 text-[10px] px-3 rounded-full text-blue-600 hover:bg-blue-50 bg-blue-50/50 font-bold tracking-wide" onClick={() => setShowFamilySummaryModal(true)}>
                VIEW ALL
              </Button>
            </div>
          </div>
        </div>
      )}


      <div className={`flex h-[calc(100vh-60px)] overflow-hidden ${!showResult ? "items-center justify-center bg-slate-50 relative" : ""}`}>

        {/* Decorative background when centered */}
        {!showResult && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -ml-40 -mb-40"></div>
          </div>
        )}

        {/* LEFT PANEL: INPUTS */}
        <aside className={`${!showResult ? "w-full max-w-lg shadow-2xl rounded-2xl border border-white/50 bg-white/80 my-auto h-auto max-h-[85vh] relative z-10 backdrop-blur-xl flex flex-col transition-all duration-700 ease-in-out" : "w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col border-r border-border bg-card/50 print:hidden z-20 backdrop-blur-sm transition-all duration-700 ease-in-out"}`}>
          {/* Wizard Header */}
          <div className="p-6 border-b border-border bg-white/50 backdrop-blur-sm shrink-0">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {inputStep === 1 && "ข้อมูลส่วนตัว"}
              {inputStep === 2 && "การเงินปัจจุบัน"}
              {inputStep === 3 && "เป้าหมายเกษียณ"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {inputStep === 1 && "Start by telling us a bit about yourself."}
              {inputStep === 2 && "Let's look at your current financial health."}
              {inputStep === 3 && "Define your retirement lifestyle goals."}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {/* ... (Input Cards) ... */}
            {/* ... Card อายุ ... */}
            {/* 1. PROFILE SECTION */}
            {inputStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                <CollapsibleSection
                  title="ข้อมูลส่วนตัว"
                  defaultOpen={true}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                  iconColorClass="bg-blue-50 text-blue-600"
                >
                  <div className="flex items-center justify-between p-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">เพศ</Label>
                    <div className="flex bg-secondary rounded-lg p-1 ring-1 ring-border/50">
                      <button type="button" onClick={() => setGender("male")} className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${gender === "male" ? "bg-background text-blue-600 shadow-sm ring-1 ring-black/5" : "text-muted-foreground hover:text-foreground"}`}>ชาย</button>
                      <button type="button" onClick={() => setGender("female")} className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${gender === "female" ? "bg-background text-pink-500 shadow-sm ring-1 ring-black/5" : "text-muted-foreground hover:text-foreground"}`}>หญิง</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {currentMemberId !== "primary" && (
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">ความสัมพันธ์</Label>
                        <select
                          className="h-9 w-full rounded-lg border-transparent bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          value={relation}
                          onChange={(e) => setRelation(e.target.value as any)}
                        >
                          <option value="spouse">คู่สมรส (Spouse)</option>
                          <option value="child">ลูก (Child)</option>
                          <option value="father">พ่อ (Father)</option>
                          <option value="mother">แม่ (Mother)</option>
                          <option value="relative">ญาติ (Relative)</option>
                        </select>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">อายุปัจจุบัน (ปี)</Label>
                      <div className="flex items-center gap-2">
                        <Input className="h-9 bg-slate-50/50 border-input/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-xs font-medium text-slate-700 rounded-lg transition-all" type="text" value={form.currentAge} onChange={handleChange("currentAge")} onFocus={handleNumericFocus("currentAge")} onBlur={handleNumericBlur("currentAge")} />
                        <div className="flex gap-1"><SmallStepButton onClick={changeBy("currentAge", -1)}>-</SmallStepButton><SmallStepButton onClick={changeBy("currentAge", 1)}>+</SmallStepButton></div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">อายุที่ต้องการเกษียณ (ปี)</Label>
                      <div className="flex items-center gap-2">
                        <Input className="h-9 bg-slate-50/50 border-input/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-xs font-medium text-slate-700 rounded-lg transition-all" type="text" value={form.retireAge} onChange={handleChange("retireAge")} onFocus={handleNumericFocus("retireAge")} onBlur={handleNumericBlur("retireAge")} />
                        <div className="flex gap-1"><SmallStepButton onClick={changeBy("retireAge", -1)}>-</SmallStepButton><SmallStepButton onClick={changeBy("retireAge", 1)}>+</SmallStepButton></div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">จะอยู่ถึงอายุ (ปี)</Label>
                      <div className="flex items-center gap-2">
                        <Input className="h-9 bg-slate-50/50 border-input/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-xs font-medium text-slate-700 rounded-lg transition-all" type="text" value={form.lifeExpectancy} onChange={handleChange("lifeExpectancy")} onFocus={handleNumericFocus("lifeExpectancy")} onBlur={handleNumericBlur("lifeExpectancy")} />
                        <div className="flex gap-1"><SmallStepButton onClick={changeBy("lifeExpectancy", -1)}>-</SmallStepButton><SmallStepButton onClick={changeBy("lifeExpectancy", 1)}>+</SmallStepButton></div>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            )}
            {/* ... Card ปัจจุบัน ... */}
            {/* 2. FINANCIALS SECTION */}
            {inputStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                <CollapsibleSection
                  title="การเงินปัจจุบัน"
                  defaultOpen={true}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>}
                  iconColorClass="bg-emerald-50 text-emerald-600"
                >
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">เงินออมปัจจุบัน (บาท)</Label>
                    <div className="flex items-center gap-2">
                      <Input className="h-9 bg-secondary/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 text-xs font-medium text-foreground rounded-lg transition-all" type="text" value={form.currentSavings} onChange={handleChange("currentSavings")} onFocus={handleNumericFocus("currentSavings")} onBlur={handleNumericBlur("currentSavings")} />
                      <div className="flex gap-1"><SmallStepButton onClick={changeBy("currentSavings", -1000)}>-</SmallStepButton><SmallStepButton onClick={changeBy("currentSavings", 1000)}>+</SmallStepButton></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">การออมต่อเดือน (บาท)</Label>
                    <div className="flex items-center gap-2">
                      <Input className="h-9 bg-secondary/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 text-xs font-medium text-foreground rounded-lg transition-all" type="text" value={form.monthlySaving} onChange={handleChange("monthlySaving")} onFocus={handleNumericFocus("monthlySaving")} onBlur={handleNumericBlur("monthlySaving")} />
                      <div className="flex gap-1"><SmallStepButton onClick={changeBy("monthlySaving", -500)}>-</SmallStepButton><SmallStepButton onClick={changeBy("monthlySaving", 500)}>+</SmallStepButton></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">รูปแบบการออม</Label>
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="savingMode" value="flat" checked={savingMode === "flat"} onChange={() => setSavingMode("flat")} className="h-3 w-3" />
                        <span>ออมเท่าเดิมทุกปี</span>
                      </label>
                      <label className="flex items-center gap-2 text-[11px]">
                        <input type="radio" name="savingMode" value="step5" checked={savingMode === "step5"} onChange={() => setSavingMode("step5")} className="h-3 w-3" />
                        <span>ปรับตามอายุทุกปีที่ 5 <span className="rounded-full bg-indigo-50 px-2 py-[1px] text-[10px] text-indigo-600">Premium Plan</span></span>
                      </label>
                    </div>
                  </div>

                  {savingMode === "step5" && (
                    <div className="space-y-2 rounded-md bg-slate-50 p-3">
                      <div className="text-[11px] font-medium text-slate-700">ออมเพิ่มเติมตามอายุ</div>
                      {[{ label: "อายุ 35", key: "savingAt35" as const }, { label: "อายุ 40", key: "savingAt40" as const }, { label: "อายุ 45", key: "savingAt45" as const }, { label: "อายุ 50", key: "savingAt50" as const }, { label: "อายุ 55", key: "savingAt55" as const },].map((row) => (
                        <div key={row.key} className="space-y-1">
                          <Label className="text-[11px] text-slate-600">{row.label}</Label>
                          <div className="flex items-center gap-2">
                            <Input className="h-9 bg-secondary/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 text-xs font-medium text-foreground rounded-lg transition-all" type="text" value={form[row.key]} onChange={handleChange(row.key)} onFocus={handleNumericFocus(row.key)} onBlur={handleNumericBlur(row.key)} />
                            <div className="flex gap-1">
                              <SmallStepButton onClick={changeBy(row.key, -500)}>-</SmallStepButton>
                              <SmallStepButton onClick={changeBy(row.key, 500)}>+</SmallStepButton>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">ผลตอบแทนคาดหวัง (% ต่อปี)</Label>
                    <div className="flex items-center gap-2">
                      <Input className="h-9 bg-secondary/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 text-xs font-medium text-foreground rounded-lg transition-all" type="text" value={form.expectedReturn} onChange={handleChange("expectedReturn")} onFocus={handleNumericFocus("expectedReturn")} onBlur={handleNumericBlur("expectedReturn")} />
                      <div className="flex gap-1"><SmallStepButton onClick={changeBy("expectedReturn", -0.1)}>-</SmallStepButton><SmallStepButton onClick={changeBy("expectedReturn", 0.1)}>+</SmallStepButton></div>
                    </div>
                    <div className="mt-1 flex flex-col gap-1">
                      <label className="flex items-center gap-2 text-[11px]">
                        <input type="radio" name="returnMode" value="avg" checked={returnMode === "avg"} onChange={() => setReturnMode("avg")} className="h-3 w-3" />
                        <span>เฉลี่ยรวม</span>
                      </label>
                      <label className="flex items-center gap-2 text-[11px]">
                        <input type="radio" name="returnMode" value="custom" checked={returnMode === "custom"} onChange={() => setReturnMode("custom")} className="h-3 w-3" />
                        <span>จัดสรรเงินลงทุนเอง</span>
                      </label>
                    </div>
                  </div>

                  {returnMode === "custom" && (
                    <div className="space-y-2 rounded-md bg-slate-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-700">การจัดสรรสินทรัพย์</span>
                        <span className="rounded-full bg-indigo-50 px-2 py-[1px] text-[10px] text-indigo-600">Premium Plan</span>
                      </div>
                      {allocations.map((a) => (
                        <div key={a.id} className="space-y-1 rounded-md border border-slate-200 bg-white p-2">
                          <div className="flex items-center justify-between">
                            <Input className="h-8 flex-1 text-xs" value={a.name} onChange={updateAllocation(a.id, "name")} />
                            <button type="button" onClick={() => removeAllocation(a.id)} className="ml-2 h-6 w-6 rounded-full bg-rose-100 text-xs font-bold text-rose-600">×</button>
                          </div>
                          <div className="mt-1 grid grid-cols-3 gap-2 text-[11px]">
                            <div>
                              <Label className="text-[11px]">สัดส่วน (%)</Label>
                              <Input className="mt-1 h-7 text-xs" type="text" value={a.weight} onChange={updateAllocation(a.id, "weight")} />
                            </div>
                            <div>
                              <Label className="text-[11px]">ผลตอบแทนคาดหวัง (%)</Label>
                              <Input className="mt-1 h-7 text-xs" type="text" value={a.expectedReturn} onChange={updateAllocation(a.id, "expectedReturn")} />
                            </div>
                            <div>
                              <Label className="text-[11px]">ผันผวน (%)</Label>
                              <Input className="mt-1 h-7 text-xs" type="text" value={a.volatility} onChange={updateAllocation(a.id, "volatility")} />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="outline" className="mt-1 h-7 w-full text-[11px]" onClick={addAllocation}>+ เพิ่มสินทรัพย์</Button>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">อัตราเงินเฟ้อ (% ต่อปี)</Label>
                    <div className="flex items-center gap-2">
                      <Input className="h-9 bg-secondary/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 text-xs font-medium text-foreground rounded-lg transition-all" type="text" value={form.inflation} onChange={handleChange("inflation")} onFocus={handleNumericFocus("inflation")} onBlur={handleNumericBlur("inflation")} />
                      <div className="flex gap-1"><SmallStepButton onClick={changeBy("inflation", -1)}>-</SmallStepButton><SmallStepButton onClick={changeBy("inflation", 1)}>+</SmallStepButton></div>
                    </div>
                  </div>

                  {/* --------- ส่วนประกันชีวิต (Multiple Plans) --------- */}
                  <div className="mt-2 space-y-2 border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-semibold text-slate-700">ประกันชีวิต</Label>
                      <Button variant="outline" size="sm" onClick={addInsurancePlan} className="h-6 text-[10px] px-2">
                        + เพิ่มแผน
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {form.insurancePlans.map((plan, index) => (
                        <div key={plan.id} className={`rounded-xl border p-3 space-y-3 relative transition-all duration-200 ${plan.active ? "bg-gradient-to-b from-card to-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/10" : "bg-secondary/50 border-border opacity-75 grayscale-[0.5]"}`}>
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateInsurancePlan(index, "expanded", !plan.expanded)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {plan.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <input
                                type="text"
                                value={plan.planName}
                                onChange={(e) => updateInsurancePlan(index, "planName", e.target.value)}
                                className="border-none bg-transparent p-0 text-sm font-bold text-slate-800 focus:ring-0 w-32"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  className="h-3 w-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  checked={plan.active}
                                  onChange={(e) => updateInsurancePlan(index, "active", e.target.checked)}
                                />
                                <span className="text-[10px] text-slate-500">ใช้งาน</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeInsurancePlan(plan.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <CloseIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {plan.expanded && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200 border-t border-slate-100 pt-2">
                              <div className="space-y-1">
                                <Label className="text-[11px] text-slate-600">ประเภทประกัน</Label>
                                <select
                                  className="h-9 w-full rounded-lg border-transparent bg-secondary/50 px-3 text-xs font-medium text-foreground focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                  value={plan.type}
                                  onChange={(e) => updateInsurancePlan(index, "type", e.target.value)}
                                >
                                  <option value="ตลอดชีพ">ตลอดชีพ (Whole Life)</option>
                                  <option value="สะสมทรัพย์">สะสมทรัพย์ (Endowment)</option>
                                  <option value="บำนาญ">บำนาญ (Annuity)</option>
                                  <option value="ชั่วระยะเวลา">ชั่วระยะเวลา (Term)</option>
                                  <option value="Unit Linked">Unit Linked</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] text-slate-600">คุ้มครองถึงอายุ (ปี)</Label>
                                <Input
                                  className="h-8 text-xs"
                                  type="text"
                                  value={plan.coverageAge}
                                  onChange={(e) => updateInsurancePlan(index, "coverageAge", e.target.value)}
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] text-slate-600">ทุนประกัน (บาท)</Label>
                                <Input
                                  className="h-8 text-xs"
                                  type="text"
                                  value={plan.sumAssured}
                                  onChange={(e) => updateInsurancePlan(index, "sumAssured", e.target.value)}
                                  onBlur={(e) => updateInsurancePlan(index, "sumAssured", formatInputDisplay(e.target.value))}
                                />
                              </div>

                              {/* Specific Fields based on Type */}
                              {plan.type === "สะสมทรัพย์" && (
                                <>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-slate-500">เงินครบสัญญา (บาท)</Label>
                                    <Input
                                      className="h-9 text-xs font-medium bg-slate-50/50 border-input/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
                                      value={plan.maturityAmount}
                                      onChange={(e) => updateInsurancePlan(index, "maturityAmount", e.target.value)}
                                      onBlur={(e) => updateInsurancePlan(index, "maturityAmount", formatInputDisplay(e.target.value))}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <Label className="text-[11px] font-bold text-slate-500">เงินคืนระหว่างสัญญา</Label>
                                      <Input
                                        className="h-9 text-xs font-medium bg-slate-50/50 border-input/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
                                        value={plan.cashBackAmount}
                                        onChange={(e) => updateInsurancePlan(index, "cashBackAmount", e.target.value)}
                                        onBlur={(e) => updateInsurancePlan(index, "cashBackAmount", formatInputDisplay(e.target.value))}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px] font-bold text-slate-500">คืนทุกๆ (ปี)</Label>
                                      <Input
                                        className="h-9 text-xs font-medium bg-slate-50/50 border-input/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
                                        value={plan.cashBackFrequency}
                                        onChange={(e) => updateInsurancePlan(index, "cashBackFrequency", e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </>
                              )}

                              {plan.type === "บำนาญ" && (
                                <>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-slate-500">ความคุ้มครองก่อนรับบำนาญ</Label>
                                    <Input
                                      className="h-9 text-xs font-medium bg-slate-50/50 border-input/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
                                      value={plan.deathBenefitPrePension}
                                      onChange={(e) => updateInsurancePlan(index, "deathBenefitPrePension", e.target.value)}
                                      onBlur={(e) => updateInsurancePlan(index, "deathBenefitPrePension", formatInputDisplay(e.target.value))}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 py-1">
                                    <input
                                      type="checkbox"
                                      id={`chkUnequalPension-${plan.id}`}
                                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                      checked={plan.unequalPension}
                                      onChange={(e) => updateInsurancePlan(index, "unequalPension", e.target.checked)}
                                    />
                                    <Label htmlFor={`chkUnequalPension-${plan.id}`} className="text-[11px] font-medium text-slate-700">เงินบำนาญไม่เท่ากันทุกปี</Label>
                                  </div>

                                  {!plan.unequalPension ? (
                                    <>
                                      <div className="space-y-1">
                                        <Label className="text-[11px] font-bold text-slate-500">รับบำนาญตั้งแต่อายุ - ถึงอายุ</Label>
                                        <div className="flex gap-2">
                                          <Input
                                            className="h-9 text-xs font-medium bg-slate-50/50 border-input/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
                                            value={plan.pensionStartAge}
                                            onChange={(e) => updateInsurancePlan(index, "pensionStartAge", e.target.value)}
                                          />
                                          <span className="self-center text-slate-400">-</span>
                                          <Input
                                            className="h-9 text-xs font-medium bg-slate-50/50 border-input/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
                                            value={plan.pensionEndAge}
                                            onChange={(e) => updateInsurancePlan(index, "pensionEndAge", e.target.value)}
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-[11px] font-bold text-slate-500">เงินบำนาญต่อปี (% ของทุน หรือ ระบุเงิน)</Label>
                                        <div className="flex gap-2">
                                          <div className="relative flex-1">
                                            <Input
                                              className="h-9 text-xs pr-6 font-medium bg-slate-50/50 border-input/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
                                              placeholder="%"
                                              value={plan.pensionPercent}
                                              onChange={(e) => updateInsurancePlan(index, "pensionPercent", e.target.value)}
                                            />
                                            <span className="absolute right-2 top-2.5 text-[10px] text-slate-400">%</span>
                                          </div>
                                          <div className="relative flex-[2]">
                                            <Input
                                              className="h-9 text-xs font-medium bg-slate-50/50 border-input/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
                                              placeholder="บาท"
                                              value={plan.pensionAmount}
                                              onChange={(e) => updateInsurancePlan(index, "pensionAmount", e.target.value)}
                                              onBlur={(e) => updateInsurancePlan(index, "pensionAmount", formatInputDisplay(e.target.value))}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="space-y-3 rounded-lg bg-slate-50/50 p-3 border border-slate-100 mt-2">
                                      {/* Re-using checkbox for visual consistency if needed, but the outer one controls toggle. Content inside: */}
                                      <div className="space-y-3">
                                        {(plan.pensionTiers || []).map((tier, tIndex) => (
                                          <div key={tIndex} className="p-3 bg-white border border-slate-200 rounded-xl space-y-3 relative shadow-sm">
                                            <div className="space-y-1">
                                              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ช่วงอายุ</Label>
                                              <div className="flex items-center gap-2">
                                                <input
                                                  className="w-full h-8 text-center text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                  value={tier.startAge}
                                                  onChange={(e) => updateInsurancePlanTier(index, tIndex, "startAge", e.target.value)}
                                                />
                                                <span className="text-slate-400">-</span>
                                                <input
                                                  className="w-full h-8 text-center text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                  value={tier.endAge}
                                                  onChange={(e) => updateInsurancePlanTier(index, tIndex, "endAge", e.target.value)}
                                                />
                                              </div>
                                            </div>

                                            <div className="space-y-1">
                                              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">เงินบำนาญ (ปีละ)</Label>
                                              <div className="flex items-center gap-2">
                                                <input
                                                  className="flex-1 h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold shadow-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                  value={tier.amount}
                                                  onChange={(e) => updateInsurancePlanTier(index, tIndex, "amount", e.target.value)}
                                                  onBlur={(e) => updateInsurancePlanTier(index, tIndex, "amount", formatInputDisplay(e.target.value))}
                                                />
                                                <button onClick={() => changeInsurancePlanTierAmount(index, tIndex, -1000)} className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95">
                                                  -
                                                </button>
                                                <button onClick={() => changeInsurancePlanTierAmount(index, tIndex, 1000)} className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95">
                                                  +
                                                </button>
                                              </div>
                                            </div>

                                            <button
                                              onClick={() => removeInsurancePlanTier(index, tIndex)}
                                              className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                                            >
                                              <CloseIcon className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ))}

                                        <button
                                          onClick={() => addInsurancePlanTier(index)}
                                          className="w-full py-2 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100 transition-colors font-bold flex items-center justify-center gap-1 border border-blue-100 border-dashed"
                                        >
                                          + เพิ่มช่วงบำนาญ
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Surrender Option */}
                              {plan.type !== "ชั่วระยะเวลา" && (
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id={`chkSurrender-${plan.id}`}
                                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                      checked={plan.useSurrender}
                                      onChange={(e) => updateInsurancePlan(index, "useSurrender", e.target.checked)}
                                    />
                                    <Label htmlFor={`chkSurrender-${plan.id}`} className="text-[11px] text-slate-700">เวนคืนประกัน</Label>
                                  </div>
                                  {plan.useSurrender && (
                                    <div className="pl-6 space-y-3">
                                      <div className="space-y-1">
                                        <Label className="text-[11px] text-slate-700 font-semibold">รูปแบบมูลค่าเวนคืน</Label>
                                        <div className="flex items-center gap-4">
                                          <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                                            <input
                                              type="radio"
                                              className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                                              checked={plan.surrenderMode !== "table"}
                                              onChange={() => updateInsurancePlan(index, "surrenderMode", "single")}
                                            />
                                            กรอกค่าเดียว
                                          </label>
                                          <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                                            <input
                                              type="radio"
                                              className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                                              checked={plan.surrenderMode === "table"}
                                              onChange={() => updateInsurancePlan(index, "surrenderMode", "table")}
                                            />
                                            กรอกตารางเวนคืน
                                          </label>
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <Label className="text-[10px] text-slate-500">อายุที่เวนคืน</Label>
                                        <div className="flex items-center gap-2">
                                          <Input
                                            className="h-8 text-xs font-medium"
                                            value={plan.surrenderAge}
                                            onChange={(e) => updateInsurancePlan(index, "surrenderAge", e.target.value)}
                                          />
                                          <div className="flex gap-1">
                                            <RoundStepButton onClick={() => updateInsurancePlan(index, "surrenderAge", String(Number(plan.surrenderAge) - 1))}>-</RoundStepButton>
                                            <RoundStepButton onClick={() => updateInsurancePlan(index, "surrenderAge", String(Number(plan.surrenderAge) + 1))}>+</RoundStepButton>
                                          </div>
                                        </div>
                                      </div>

                                      {plan.surrenderMode === "table" ? (
                                        <div>
                                          <Button
                                            type="button"
                                            className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                                            onClick={() => {
                                              setForm(prev => ({ ...prev, selectedPlanId: plan.id }));
                                              setShowInsuranceTable(true);
                                            }}
                                          >
                                            กรอกตารางเวนคืน
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="space-y-1">
                                          <Label className="text-[10px] text-slate-500">มูลค่าที่เวนคืน</Label>
                                          <div className="flex items-center gap-2">
                                            <Input
                                              className="h-8 text-xs font-medium"
                                              value={plan.surrenderValue}
                                              onChange={(e) => updateInsurancePlan(index, "surrenderValue", e.target.value)}
                                              onBlur={(e) => updateInsurancePlan(index, "surrenderValue", formatInputDisplay(e.target.value))}
                                            />
                                            <div className="flex gap-1">
                                              <RoundStepButton onClick={() => {
                                                const v = Number(String(plan.surrenderValue).replace(/,/g, "")) || 0;
                                                updateInsurancePlan(index, "surrenderValue", formatInputDisplay(v - 1000));
                                              }}>-</RoundStepButton>
                                              <RoundStepButton onClick={() => {
                                                const v = Number(String(plan.surrenderValue).replace(/,/g, "")) || 0;
                                                updateInsurancePlan(index, "surrenderValue", formatInputDisplay(v + 1000));
                                              }}>+</RoundStepButton>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              {/* Footer Actions */}
                              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                  onClick={() => removeInsurancePlan(plan.id)}
                                >
                                  ลบแผนนี้
                                </Button>
                                <div className="flex gap-2">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-7 text-[10px] bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100"
                                    onClick={() => updateInsurancePlan(index, "expanded", false)}
                                  >
                                    ย่อ
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-7 text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"
                                    onClick={() => {
                                      setForm(prev => ({ ...prev, selectedPlanId: plan.id }));
                                      setShowInsuranceTable(true);
                                    }}
                                  >
                                    ดูตาราง
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* ------------------------------------------- */}


                </CollapsibleSection>
              </div>
            )}

            {/* 3. RETIREMENT GOAL SECTION */}
            {inputStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                <CollapsibleSection
                  title="เป้าหมายเกษียณ"
                  defaultOpen={true}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                  iconColorClass="bg-amber-50 text-amber-600"
                >
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">เงินก้อนตอนเกษียณ (เช่น กบข., บำเหน็จ)</Label>
                    <div className="flex items-center gap-2">
                      <Input className="h-9 bg-secondary/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 text-xs font-medium text-foreground rounded-lg transition-all" type="text" value={form.retireFundOther} onChange={handleChange("retireFundOther")} onFocus={handleNumericFocus("retireFundOther")} onBlur={handleNumericBlur("retireFundOther")} />
                      <div className="flex gap-1"><SmallStepButton onClick={changeBy("retireFundOther", -50000)}>-</SmallStepButton><SmallStepButton onClick={changeBy("retireFundOther", 50000)}>+</SmallStepButton></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">เงินเดือนหลังเกษียณ (ต่อเดือน)</Label>
                    <div className="flex items-center gap-2">
                      <Input className="h-9 bg-secondary/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 text-xs font-medium text-foreground rounded-lg transition-all" type="text" value={form.retireMonthlyIncome} onChange={handleChange("retireMonthlyIncome")} onFocus={handleNumericFocus("retireMonthlyIncome")} onBlur={handleNumericBlur("retireMonthlyIncome")} />
                      <div className="flex gap-1"><SmallStepButton onClick={changeBy("retireMonthlyIncome", -500)}>-</SmallStepButton><SmallStepButton onClick={changeBy("retireMonthlyIncome", 500)}>+</SmallStepButton></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-slate-600">ผลตอบแทนเฉลี่ยหลังเกษียณ (% ต่อปี)</Label>
                      <span className="rounded-full bg-indigo-50 px-2 py-[1px] text-[10px] text-indigo-600">Premium Plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input className="h-9 bg-secondary/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 text-xs font-medium text-foreground rounded-lg transition-all" type="text" value={form.retireReturnAfter} onChange={handleChange("retireReturnAfter")} onFocus={handleNumericFocus("retireReturnAfter")} onBlur={handleNumericBlur("retireReturnAfter")} />
                      <div className="flex gap-1"><SmallStepButton onClick={changeBy("retireReturnAfter", -0.1)}>-</SmallStepButton><SmallStepButton onClick={changeBy("retireReturnAfter", 0.1)}>+</SmallStepButton></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">ค่าใช้จ่ายรายเดือนหลังเกษียณ (ต่อเดือน ไม่คิดเงินเฟ้อ)</Label>
                    <div className="flex items-center gap-2">
                      <Input className="h-9 bg-secondary/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 text-xs font-medium text-foreground rounded-lg transition-all" type="text" value={form.retireExtraExpense} onChange={handleChange("retireExtraExpense")} onFocus={handleNumericFocus("retireExtraExpense")} onBlur={handleNumericBlur("retireExtraExpense")} />
                      <div className="flex gap-1"><SmallStepButton onClick={changeBy("retireExtraExpense", -500)}>-</SmallStepButton><SmallStepButton onClick={changeBy("retireExtraExpense", 500)}>+</SmallStepButton></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">แนวโน้มการใช้จ่าย</Label>
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-2 text-[11px]">
                        <input type="radio" name="retireSpendMode" value="flat" checked={retireSpendMode === "flat"} onChange={() => setRetireSpendMode("flat")} className="h-3 w-3" />
                        <span>ปรับเปอร์เซ็นต์การใช้จ่ายต่อปี</span>
                      </label>
                      <label className="flex items-center gap-2 text-[11px]">
                        <input type="radio" name="retireSpendMode" value="step5" checked={retireSpendMode === "step5"} onChange={() => setRetireSpendMode("step5")} className="h-3 w-3" />
                        <span>ปรับตามอายุทุกปีที่ 5 <span className="rounded-full bg-indigo-50 px-2 py-[1px] text-[10px] text-indigo-600">Premium Plan</span></span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-slate-600">แนวโน้มการใช้จ่าย % ต่อปี (เมื่อคิดว่าใช้จ่ายลดลง)</Label>
                      <span className="rounded-full bg-indigo-50 px-2 py-[1px] text-[10px] text-indigo-600">Premium Plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input className="h-9 bg-secondary/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 text-xs font-medium text-foreground rounded-lg transition-all" type="text" value={form.retireSpendTrendPercent} onChange={handleChange("retireSpendTrendPercent")} onFocus={handleNumericFocus("retireSpendTrendPercent")} onBlur={handleNumericBlur("retireSpendTrendPercent")} />
                      <div className="flex gap-1">
                        <SmallStepButton onClick={changeBy("retireSpendTrendPercent", -0.5)}>-</SmallStepButton>
                        <SmallStepButton onClick={changeBy("retireSpendTrendPercent", 0.5)}>+</SmallStepButton>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-slate-600">รายจ่ายพิเศษประจำปีช่วงเกษียณ</Label>
                      <Button type="button" variant="outline" className="h-7 px-3 text-[11px]">จัดการ</Button>
                    </div>
                    <div className="rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-500">ไม่มีรายจ่ายพิเศษ (ใช้ค่า {formatNumber(form.retireSpecialAnnual || "0")} บาท/ปี)</div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">บวกเงินก้อนพิเศษ (มรดก)</Label>
                    <div className="flex items-center gap-2">
                      <Input className="h-8 text-xs" type="text" value={form.legacyFund} onChange={handleChange("legacyFund")} onFocus={handleNumericFocus("legacyFund")} onBlur={handleNumericBlur("legacyFund")} />
                      <div className="flex gap-1">
                        <SmallStepButton onClick={changeBy("legacyFund", -5000)}>-</SmallStepButton>
                        <SmallStepButton onClick={changeBy("legacyFund", 5000)}>+</SmallStepButton>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">Note</Label>
                    <textarea className="min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300" value={form.retireNote} onChange={(e) => setForm((prev) => ({ ...prev, retireNote: e.target.value }))} placeholder="เขียนโน้ตเพิ่มเติม..." />
                  </div>

                </CollapsibleSection>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-end pt-2">
                    <Button type="button" variant="ghost" className="h-8 px-4 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100" onClick={resetRetirement}>รีเซ็ตข้อมูลทั้งหมด</Button>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -mr-10 -mt-10 z-0 pointer-events-none"></div>

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                        </div>
                        <Label className="text-sm font-bold text-slate-700">บันทึกแผนของคุณ</Label>
                      </div>
                      {saveMessage && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{saveMessage}</span>}
                    </div>

                    <div className="space-y-1 relative z-10">
                      <Label className="text-[11px] font-semibold text-slate-500">ชื่อแผน (Profile Name)</Label>
                      <Input className="h-10 text-sm bg-slate-50/50 focus:bg-white transition-all" value={form.planName} onChange={handleChange("planName")} placeholder="ตั้งชื่อแผนของคุณ..." />
                    </div>

                    <Button className="w-full h-10 text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white relative z-10" type="button" onClick={handleSavePlan}>
                      {planButtonLabel}
                    </Button>

                    <div className="flex items-center gap-1.5 justify-center pt-1 text-[10px] text-slate-400 relative z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                      <span>ข้อมูลถูกเก็บรักษาอย่างปลอดภัยในเบราว์เซอร์ของคุณ</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wizard Footer */}
          {/* Wizard Footer */}
          <div className="p-4 border-t border-border bg-white/80 backdrop-blur-sm flex justify-between shrink-0 sticky bottom-0 w-full z-30">
            {/* Back Button (Only show if step > 1) */}
            <div>
              {inputStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setInputStep(prev => Math.max(1, prev - 1))}
                  className="w-24 rounded-full border-slate-300 hover:bg-slate-50"
                  tabIndex={-1}
                >
                  ย้อนกลับ
                </Button>
              )}
            </div>

            {inputStep < 3 ? (
              <Button
                onClick={() => setInputStep(prev => Math.min(3, prev + 1))}
                className="w-24 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
              >
                ถัดไป
              </Button>
            ) : (
              <Button
                onClick={() => setShowResult(true)}
                className="w-36 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95 ring-2 ring-white"
              >
                <span className="mr-2 font-bold">คำนวณแผน</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </Button>
            )}
          </div>
        </aside>

        {/* RIGHT PANEL: RESULTS */}
        <main className={`flex-1 min-w-0 overflow-y-auto bg-muted/20 text-foreground relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent ${!showResult ? "hidden" : "block animate-in fade-in zoom-in-95 duration-700"}`}>
          {!showResult ? null : (
            <div className="relative p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* Print Summary Section (Professional Report Style) */}
              <div className="hidden print:block mb-4 font-sans">
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-2 mb-4 flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">แผนเกษียณอายุส่วนบุคคล</h1>
                    <p className="text-sm text-slate-600 mt-1">รายงานวิเคราะห์และวางแผนการเงินฉบับสมบูรณ์</p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>จัดทำสำหรับ: <span className="font-semibold text-slate-900">{user?.name || "ผู้ใช้งาน"}</span></p>
                    <p>วันที่: {new Date().toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="mb-4 break-inside-avoid">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1 mb-2 uppercase tracking-wider">บทสรุปผู้บริหาร</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-sm border border-slate-100">
                      <h3 className="font-semibold text-slate-700 mb-1 text-sm">ข้อมูลส่วนตัว</h3>
                      <div className="grid grid-cols-2 gap-y-1 text-sm">
                        <span className="text-slate-500">อายุปัจจุบัน:</span>
                        <span className="font-medium">{form.currentAge} ปี</span>
                        <span className="text-slate-500">เกษียณอายุ:</span>
                        <span className="font-medium">{form.retireAge} ปี</span>
                        <span className="text-slate-500">อายุขัยคาดการณ์:</span>
                        <span className="font-medium">{form.lifeExpectancy} ปี</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-sm border border-slate-100">
                      <h3 className="font-semibold text-slate-700 mb-1 text-sm">สุขภาพทางการเงิน</h3>
                      <div className="grid grid-cols-2 gap-y-1 text-sm">
                        <span className="text-slate-500">สถานะ:</span>
                        <span className={`font-bold ${result.status === 'enough' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {result.status === 'enough' ? 'เพียงพอ' : 'ต้องปรับปรุง'}
                        </span>
                        <span className="text-slate-500">เงินออมคาดการณ์:</span>
                        <span className="font-medium">฿{formatNumber(result.projectedFund)}</span>
                        <span className="text-slate-500">เป้าหมายเงินออม:</span>
                        <span className="font-medium">฿{formatNumber(result.targetFund)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insurance Portfolio */}
                {form.insurancePlans.length > 0 && (
                  <div className="mb-4 break-inside-avoid">
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1 mb-2 uppercase tracking-wider">พอร์ตโฟลิโอประกันชีวิต</h2>
                    <div className="overflow-hidden border border-slate-200 rounded-sm">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ชื่อแผน</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ประเภท</th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">คุ้มครองถึง</th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">ทุนประกัน</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {form.insurancePlans.filter(p => p.active).map((plan, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-900">{plan.planName}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{plan.type}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 text-right">{plan.coverageAge}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 text-right font-medium">฿{formatNumber(plan.sumAssured)}</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-50 font-bold">
                            <td colSpan={3} className="px-4 py-2 text-right text-sm text-slate-700">ทุนประกันรวมทั้งหมด</td>
                            <td className="px-4 py-2 text-right text-sm text-orange-600">
                              ฿{formatNumber(Math.max(...(projectionChart.data.datasets.find(d => d.label === "ทุนประกัน")?.data as number[] || [0])))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mb-2 break-inside-avoid">
                  <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    สรุปผลการวางแผน
                  </h2>
                </div>
              </div>

              <Card className="shadow-xl border-border/50 bg-card ring-1 ring-black/5 print:hidden overflow-hidden backdrop-blur-sm">
                <CardContent className="space-y-8 p-8">
                  {/* Family Summary Overview (if multiple members) */}
                  {familyMembers.length > 1 && (
                    <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-white/50 border border-slate-200 p-5 mb-8">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">ภาพรวมครอบครัว ({familyMembers.length} คน)</h3>
                            <p className="text-xs text-slate-500">สถานะการเงินรวมของสมาชิกทั้งหมด</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">เป้าหมายรวม</p>
                            <p className="text-lg font-bold text-slate-800">฿{formatNumber(getFamilySummary().totalTarget)}</p>
                          </div>
                          <div className="h-8 w-px bg-slate-200"></div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">คาดการณ์รวม</p>
                            <p className="text-lg font-bold text-blue-600">฿{formatNumber(getFamilySummary().totalProjected)}</p>
                          </div>
                          <div className="h-8 w-px bg-slate-200"></div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">สถานะรวม</p>
                            <p className={`text-lg font-bold ${getFamilySummary().totalGap >= -1 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {getFamilySummary().totalGap >= -1 ? "เพียงพอ" : "ขาด " + formatNumber(Math.abs(getFamilySummary().totalGap))}
                            </p>
                          </div>
                        </div>

                        <Button variant="outline" size="sm" onClick={() => setShowFamilySummaryModal(true)}>ดูรายละเอียด</Button>
                      </div>
                    </div>
                  )}
                  {/* --- TOP SUMMARY SECTION --- */}
                  <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden mb-8 group">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

                    <div className="relative z-10 flex flex-col xl:flex-row items-center gap-10">
                      {/* Avatar/Illustration */}
                      <div className="shrink-0 relative">
                        <div className="w-40 h-40 rounded-full bg-white p-2 shadow-xl shadow-slate-200/50 ring-4 ring-white relative z-10">
                          <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 relative">
                            <Image src={heroImageSrc} alt="User Avatar" fill className="object-cover" />
                          </div>
                          <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${result.status === 'enough' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                            {result.status === 'enough' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12" /></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            )}
                          </div>
                        </div>
                        {/* Decorative Rings */}
                        <div className="absolute inset-0 rounded-full border border-blue-100 scale-125 opacity-50 animate-pulse"></div>
                        <div className="absolute inset-0 rounded-full border border-indigo-50 scale-150 opacity-30"></div>
                      </div>

                      {/* Text Content */}
                      <div className="text-center xl:text-left space-y-4 max-w-2xl">
                        <div>
                          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">ภาพรวมอนาคตของคุณ</h2>
                          <p className="text-slate-500 leading-relaxed text-lg">
                            จากการคำนวณข้อมูลปัจจุบัน คุณจะมีเงินใช้จ่ายหลังเกษียณประมาณ <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-lg">฿{formatNumber(result.projectedFund)}</span> ซึ่ง
                            {result.status === 'enough' ? (
                              <span className="text-emerald-600 font-bold mx-1"> เพียงพอ </span>
                            ) : (
                              <span className="text-rose-500 font-bold mx-1"> ไม่เพียงพอ </span>
                            )}
                            ต่อความต้องการที่ <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg mx-1">฿{formatNumber(result.targetFund)}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 4 Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 relative z-10">

                      {/* Card 1: Projected Fund */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group/card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover/card:scale-110"></div>
                        <div className="relative z-10">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                            <TargetIcon className="w-5 h-5" />
                          </div>
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">เงินออมที่มีตอนเกษียณ</p>
                            <button onClick={() => setShowProjectedModal(true)} className="text-slate-300 hover:text-blue-600 transition-colors" title="ดูที่มาการคำนวณ">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                            </button>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-1">฿{formatNumber(result.projectedFund)}</h3>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">+4.5% ต่อปี</span>
                            <span className="text-[10px] text-slate-400">ผลตอบแทน</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Target Fund */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group/card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover/card:scale-110"></div>
                        <div className="relative z-10">
                          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-3">
                            <span className="font-serif font-bold text-lg">$</span>
                          </div>
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">เงินที่ต้องมี (เป้าหมาย)</p>
                            <button onClick={() => setShowTargetModal(true)} className="text-slate-300 hover:text-teal-600 transition-colors" title="ดูที่มาการคำนวณ">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                            </button>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-1">฿{formatNumber(result.targetFund)}</h3>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ใช้จ่าย {result.yearsInRetirement} ปี</span>
                            <span className="text-[10px] text-slate-400">หลังเกษียณ</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 3: Monthly Expense */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group/card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover/card:scale-110"></div>
                        <div className="relative z-10">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                          </div>
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ค่าใช้จ่าย/เดือน (อนาคต)</p>
                            <button onClick={() => setShowExpenseModal(true)} className="text-slate-300 hover:text-purple-600 transition-colors" title="ดูที่มาการคำนวณ">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                            </button>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-1">฿{formatNumber(result.fvExpenseMonthly)}</h3>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">รวมเงินเฟ้อแล้ว</span>
                            <span className="text-[10px] text-slate-400">ปรับค่าครองชีพ</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 4: Status */}
                      <div className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all group/card relative overflow-hidden ${result.status === 'enough' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover/card:scale-110"></div>
                        <div className="relative z-10">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${result.status === 'enough' ? 'bg-emerald-200/50 text-emerald-700' : 'bg-rose-200/50 text-rose-700'}`}>
                            {result.status === 'enough' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>
                            )}
                          </div>
                          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.status === 'enough' ? 'text-emerald-600/70' : 'text-rose-600/70'}`}>สถานะแผน</p>
                          <h3 className={`text-2xl font-black mb-1 ${result.status === 'enough' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {result.status === 'enough' ? 'เพียงพอ' : 'ต้องปรับปรุง'}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <p className={`text-[10px] font-medium leading-tight ${result.status === 'enough' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {result.status === 'enough' ? 'ยินดีด้วย! แผนของคุณยอดเยี่ยม' : `ขาดอีก ฿${formatNumber(Math.abs(result.gap))}`}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Graph card */}
              <Card className="shadow-xl border border-border/50 bg-card print:shadow-none print:border-none print:w-full max-w-full break-inside-avoid rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between pb-4 print:hidden border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(41,112,255,0.5)]"></div>
                    <CardTitle className="text-lg font-bold text-foreground tracking-tight">กราฟการเงินออมสะสม</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-8 px-3 text-[10px] border-border text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg" onClick={handleSavePlan}>
                      บันทึกข้อมูล
                    </Button>
                    <Button variant="outline" className="h-8 px-3 text-[10px] border-border text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg flex items-center gap-1" onClick={handleExportCSV}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                      CSV
                    </Button>
                    <Button variant="outline" className="h-8 px-3 text-[10px] border-border text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg" onClick={handlePrint}>
                      Print
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="min-h-[500px] print:min-h-0 print:h-[350px] rounded-2xl border border-border/50 bg-secondary/10 px-4 py-6">
                    <div className="h-[450px] print:h-[320px]">
                      <Line
                        data={projectionChart.data}
                        options={{
                          ...projectionChart.options,
                          scales: {
                            x: {
                              ...projectionChart.options.scales?.x,
                              grid: { color: 'rgba(0, 0, 0, 0.05)' },
                              ticks: { color: '#64748b' }
                            },
                            y: {
                              ...projectionChart.options.scales?.y,
                              grid: { color: 'rgba(0, 0, 0, 0.05)' },
                              ticks: { color: '#64748b' }
                            }
                          },
                          plugins: {
                            ...projectionChart.options.plugins,
                            legend: {
                              labels: { color: '#475569' }
                            }
                          }
                        }}
                        plugins={[{
                          id: 'financialFreedomLabel',
                          afterDraw: (chart) => {
                            const ctx = chart.ctx;
                            const datasetIndex = chart.data.datasets.findIndex((d: any) => d.label === 'อิสรภาพทางการเงิน');
                            if (datasetIndex === -1) return;

                            const meta = chart.getDatasetMeta(datasetIndex);
                            if (!meta.data || meta.data.length === 0) return;

                            // Draw label at roughly 15% of the width (early in the chart)
                            const indexToDraw = Math.min(Math.floor(meta.data.length * 0.15), meta.data.length - 1);
                            const point = meta.data[indexToDraw];

                            if (point) {
                              ctx.save();
                              ctx.font = "bold 16px 'Inter', sans-serif";
                              ctx.fillStyle = "#2563eb"; // Blue-600
                              ctx.textAlign = "left";
                              ctx.textBaseline = "bottom";
                              ctx.fillText("อิสรภาพทางการเงิน", point.x, point.y - 8);
                              ctx.restore();
                            }
                          }
                        }]}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-600 print:hidden">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="chkSumAssured"
                          className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 accent-orange-500"
                          checked={showSumAssured}
                          onChange={(e) => setShowSumAssured(e.target.checked)}
                        />
                        <label htmlFor="chkSumAssured" className="select-none text-base text-slate-600">แสดงทุนประกัน</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="chkActualSavings"
                          className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 accent-blue-600"
                          checked={showActualSavings}
                          onChange={(e) => setShowActualSavings(e.target.checked)}
                        />
                        <label htmlFor="chkActualSavings" className="select-none text-base text-slate-600">แสดงเงินที่เก็บได้จริง</label>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 bg-emerald-100 border border-emerald-200 block"></span>
                      <span className="text-base text-slate-600">Monte Carlo Simulation P5-P95</span>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Portfolio & Monte Carlo */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 print:hidden">
                <Card className="shadow-lg border border-border/50 bg-card rounded-3xl">
                  <CardHeader className="pb-4 border-b border-border/40"><CardTitle className="text-base font-bold text-foreground">คำแนะนำการจัดพอร์ต (แบบคร่าวๆ)</CardTitle></CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <p className="text-xs text-muted-foreground">ตามกฎง่ายๆ: equity% ≈ 100 - อายุ</p>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Equity */}
                      <div className="rounded-2xl bg-secondary/30 p-4 flex flex-col items-center justify-center space-y-2 border border-border/50 hover:bg-secondary/50 transition-colors">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">หุ้น</span>
                        <span className="text-3xl font-black text-foreground">{100 - inputs.currentAge}%</span>
                      </div>

                      {/* Bond */}
                      <div className="rounded-2xl bg-secondary/30 p-4 flex flex-col items-center justify-center space-y-2 border border-border/50 hover:bg-secondary/50 transition-colors">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ตราสารหนี้</span>
                        <span className="text-3xl font-black text-foreground">{Math.floor((inputs.currentAge) * 0.8)}%</span>
                      </div>

                      {/* Cash */}
                      <div className="rounded-2xl bg-secondary/30 p-4 flex flex-col items-center justify-center space-y-2 border border-border/50 hover:bg-secondary/50 transition-colors">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">เงินสด/ทอง</span>
                        <span className="text-3xl font-black text-foreground">{inputs.currentAge - Math.floor((inputs.currentAge) * 0.8)}%</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                      หมายเหตุ: เป็นคำแนะนำทั่วไปเท่านั้น ควรปรึกษาที่ปรึกษาทางการเงินสำหรับคำแนะนำเฉพาะบุคคล
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border border-border/50 bg-card rounded-3xl">
                  <CardHeader className="pb-4 border-b border-border/40"><CardTitle className="text-base font-bold text-foreground">Monte Carlo Simulation</CardTitle></CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <p className="text-xs font-medium text-destructive">การจำลอง 5 ครั้ง ที่ความผันผวน 6%</p>

                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl font-black text-foreground">ความน่าจะเป็นเงินพอ: <span className="text-primary">{formatNumber2(mcResult.probability * 100, 0)}%</span></div>
                        <button onClick={() => setShowMonteCarloDetails(true)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <InfoIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-xs text-muted-foreground mb-4">มัธยฐานผลลัพธ์: <span className="font-bold text-foreground">฿{formatNumber(mcResult.p50)}</span></div>

                      <div className="flex gap-2 mt-4">
                        <span className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary ring-1 ring-inset ring-primary/20">
                          Premium Plan
                        </span>
                        <span className="inline-flex items-center rounded-lg bg-chart-4/10 px-3 py-1 text-[10px] font-bold text-chart-4 ring-1 ring-inset ring-chart-4/20">
                          Pro Plan
                        </span>
                      </div>

                      <p className="text-[10px] text-muted-foreground/60 leading-relaxed mt-4">
                        ลดความคลาดเคลื่อนมากขึ้นด้วยจำลองกว่า 1,000 ครั้ง
                        <br />
                        ปรับความผันผวนผลตอบแทนตอบแทนได้
                      </p>


                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Family Summary Overview Card (Shows ONLY if more than 1 member) */}
              {familyMembers.length > 1 && (
                <div className="mt-4">
                  <Card className="shadow-lg border-0 bg-white ring-1 ring-slate-200/50 break-inside-avoid print:shadow-none print:border print:ring-0">
                    <CardHeader className="pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-200 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <div>
                          <CardTitle className="text-lg text-slate-800">สรุปแผนครอบครัว (Family Plan Summary)</CardTitle>
                          <div className="text-xs text-slate-500 mt-0.5">ภาพรวมสถานะการเงินของสมาชิกทั้งหมด {familyMembers.length} คน</div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-8">

                      {/* 1. Wealth Overview Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                            ความมั่งคั่งรวม (Total Wealth)
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFamilySummaryModal(true)}
                            className="h-8 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                            ดูรายงานเต็ม
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Projected */}
                          <div className="relative rounded-2xl border border-indigo-50 bg-indigo-50/30 p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-100 group/tooltip">
                            <div className="absolute inset-0 overflow-hidden rounded-2xl">
                              <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 mb-2 relative z-10">
                              <div className="text-xs font-bold text-indigo-900/70 uppercase tracking-wide">เงินที่จะมี (Projected)</div>
                              <div className="cursor-help text-indigo-300 hover:text-indigo-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                              </div>

                              {/* Simplified Tooltip (Above) */}
                              <div className="hidden group-hover/tooltip:block absolute bottom-full left-0 mb-2 z-[100] w-64 p-4 bg-white/95 backdrop-blur-sm text-slate-700 text-xs shadow-xl border border-indigo-100 rounded-xl animate-in fade-in zoom-in-95 duration-200 select-none">
                                <p className="leading-relaxed">เงินออมรวมที่คาดว่าจะมีตอนเกษียณ (จากเงินต้นและดอกเบี้ย)</p>
                                <div className="absolute -bottom-1.5 left-3 w-3 h-3 bg-white border-b border-r border-indigo-100 rotate-45"></div>
                              </div>
                            </div>

                            <div className="flex items-baseline gap-1 relative z-10">
                              <span className="text-2xl font-bold text-indigo-600">฿</span>
                              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{formatNumber(getFamilySummary().totalProjected)}</span>
                            </div>
                          </div>

                          {/* Target */}
                          <div className="relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-200 group/tooltip">
                            <div className="absolute inset-0 overflow-hidden rounded-2xl">
                              <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 mb-2 relative z-10">
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">เงินที่ต้องใช้ (Target)</div>
                              <div className="cursor-help text-slate-300 hover:text-slate-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                              </div>

                              {/* Simplified Tooltip (Above) */}
                              <div className="hidden group-hover/tooltip:block absolute bottom-full left-0 mb-2 z-[100] w-64 p-4 bg-white/95 backdrop-blur-sm text-slate-700 text-xs shadow-xl border border-slate-200 rounded-xl animate-in fade-in zoom-in-95 duration-200 select-none">
                                <p className="leading-relaxed">ยอดรวมที่ทุกคนต้องมีเพื่อให้พอใช้จ่ายตามแผนของตัวเอง</p>
                                <div className="absolute -bottom-1.5 left-3 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>
                              </div>
                            </div>

                            <div className="flex items-baseline gap-1 relative z-10">
                              <span className="text-2xl font-bold text-slate-400">฿</span>
                              <span className="text-3xl font-extrabold text-slate-700 tracking-tight">{formatNumber(getFamilySummary().totalTarget)}</span>
                            </div>
                          </div>

                          {/* Gap Analysis */}
                          <div className={`relative rounded-2xl border p-5 shadow-sm flex flex-col justify-center transition-all hover:shadow-md ${getFamilySummary().totalGap < 0 ? "bg-rose-50/50 border-rose-100" : "bg-emerald-50/50 border-emerald-100"}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className={`text-xs font-bold uppercase tracking-wide ${getFamilySummary().totalGap < 0 ? "text-rose-700" : "text-emerald-700"}`}>
                                {getFamilySummary().totalGap < 0 ? "ขาดอีก (Shortfall)" : "เพียงพอ (Surplus)"}
                              </div>
                              <div className={`p-1 rounded-full ${getFamilySummary().totalGap < 0 ? "bg-white text-rose-600 shadow-sm" : "bg-white text-emerald-600 shadow-sm"}`}>
                                {getFamilySummary().totalGap < 0
                                  ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16 16v4" /><path d="M20 16v4" /><path d="M8 20H3" /><path d="M8 16v4" /><path d="M4 16v4" /><path d="M12 4v16" /></svg>
                                  : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                }
                              </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className={`text-2xl font-bold ${getFamilySummary().totalGap < 0 ? "text-rose-500" : "text-emerald-500"}`}>{getFamilySummary().totalGap < 0 ? "-" : "+"}</span>
                              <span className={`text-3xl font-extrabold tracking-tight ${getFamilySummary().totalGap < 0 ? "text-rose-700" : "text-emerald-700"}`}>{formatNumber(Math.abs(getFamilySummary().totalGap))}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 2. Cash Flow & Action Plan */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 whitespace-nowrap">
                            <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                            สถานะกระแสเงินสด (Cash Flow)
                            <div className="group/cf relative">
                              <span className="cursor-help text-slate-300 hover:text-amber-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                              </span>
                              <div className="hidden group-hover/cf:block absolute bottom-full left-0 mb-2 z-[100] w-72 p-4 bg-white/95 backdrop-blur-sm text-slate-700 text-xs font-normal rounded-xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 select-none whitespace-normal">
                                <div className="font-bold text-amber-700 mb-2 border-b border-amber-50 pb-1">การวิเคราะห์กระแสเงินสด (Cash Flow Analysis)</div>
                                <p className="mb-2 leading-relaxed">เปรียบเทียบ <span className="text-emerald-600 font-bold">สิ่งที่ทำได้จริง</span> (เงินออมปัจจุบัน) กับ <span className="text-indigo-600 font-bold">สิ่งที่ควรทำ</span> (เงินออมที่แนะนำ) เพื่อให้บรรลุเป้าหมาย</p>
                                <ul className="list-disc pl-4 space-y-1 mb-2 text-slate-600">
                                  <li>ถ้า <span className="text-emerald-600 font-bold">มากกว่า 100%</span> = ออมเกินเป้า (ดีมาก)</li>
                                  <li>ถ้า <span className="text-amber-600 font-bold">น้อยกว่า 100%</span> = ควรออมเพิ่ม</li>
                                </ul>
                                <div className="absolute -bottom-1.5 left-3 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>
                              </div>
                            </div>
                          </h4>

                          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="space-y-6">
                              <div>
                                <div className="flex justify-between items-end mb-2">
                                  <span className="text-xs text-slate-500 font-medium">ออมได้จริง (Actual)</span>
                                  <span className="text-lg font-bold text-slate-800">฿{formatNumber(getFamilySummary().totalMonthlySavingsCurrent)}<span className="text-xs font-normal text-slate-400">/เดือน</span></span>
                                </div>
                                <div className="flex justify-between items-end mb-2">
                                  <span className="text-xs text-slate-500 font-medium">ควรจะออม (Recommended)</span>
                                  <span className="text-lg font-bold text-indigo-600">฿{formatNumber2(getFamilySummary().totalMonthlyNeeded, 0)}<span className="text-xs font-normal text-slate-400">/เดือน</span></span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  *คิดจากผลรวมเงินออมรายเดือนของทุกคน เทียบกับ ยอดที่ต้องออมรวมเพื่อให้ทุกคนบรรลุเป้าหมาย
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getFamilySummary().totalMonthlySavingsCurrent >= getFamilySummary().totalMonthlyNeeded ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-amber-500 to-amber-400"}`}
                                    style={{ width: `${Math.min(100, (getFamilySummary().totalMonthlySavingsCurrent / (getFamilySummary().totalMonthlyNeeded || 1)) * 100)}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between mt-2 text-[10px]">
                                  <span className="text-slate-400">0%</span>
                                  <span className={getFamilySummary().totalMonthlySavingsCurrent >= getFamilySummary().totalMonthlyNeeded ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                                    {((getFamilySummary().totalMonthlySavingsCurrent / (getFamilySummary().totalMonthlyNeeded || 1)) * 100).toFixed(0)}% ของเป้าหมาย
                                  </span>
                                </div>
                              </div>

                              <div className={`p-4 rounded-xl border ${getFamilySummary().totalMonthlySavingsCurrent >= getFamilySummary().totalMonthlyNeeded ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}>
                                {getFamilySummary().totalMonthlySavingsCurrent >= getFamilySummary().totalMonthlyNeeded ? (
                                  <div className="flex gap-3">
                                    <div className="text-emerald-600 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
                                    <div>
                                      <div className="text-xs font-bold text-emerald-800">Excellent!</div>
                                      <div className="text-[11px] text-emerald-700/80 leading-relaxed mt-1">การออมรวมของครอบครัวอยู่ในเกณฑ์ที่ดีเยี่ยม สามารถบรรลุเป้าหมายได้ตามแผน</div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-3">
                                    <div className="text-amber-600 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                                    <div>
                                      <div className="text-xs font-bold text-amber-800">Action Required</div>
                                      <div className="text-[11px] text-amber-700/80 leading-relaxed mt-1">ควรพิจารณาออมเพิ่มอีก <span className="font-bold border-b border-amber-300">฿{formatNumber2(getFamilySummary().totalMonthlyNeeded - getFamilySummary().totalMonthlySavingsCurrent, 0)}</span> ต่อเดือน เพื่อปิดช่องว่างทางการเงิน</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. Detailed Breakdown Analysis (Vertical Card List) */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                              รายละเอียดรายคน ({familyMembers.length})
                            </div>
                            <span className="text-[10px] text-slate-400 font-normal">เรียงตามแผน</span>
                          </h4>

                          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                            {familyMembers.map((m) => {
                              const isCurrent = String(m.id) === String(currentMemberId);
                              const mInputs = buildRetirementInputs({
                                form: isCurrent ? form : m.form,
                                gender: isCurrent ? gender : m.gender,
                                savingMode: isCurrent ? savingMode : m.savingMode,
                                returnMode: isCurrent ? returnMode : m.returnMode,
                                allocations: isCurrent ? allocations : m.allocations
                              });
                              const mRes = calculateRetirement(mInputs);
                              const isGood = mRes.status === "enough";
                              const progress = Math.min(100, (mRes.projectedFund / (mRes.targetFund || 1)) * 100);

                              // Translation map
                              const relationMap: Record<string, string> = {
                                self: "ตนเอง", spouse: "คู่สมรส", child: "บุตร", father: "บิดา", mother: "มารดา", relative: "ญาติ"
                              };
                              const relationLabel = relationMap[m.relation || "self"] || m.relation;

                              return (
                                <div key={m.id} className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-all hover:shadow-md">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white ${isGood ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                                        {m.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="font-bold text-slate-700 text-sm group-hover:text-indigo-700 transition-colors">{m.name}</div>
                                        <div className="text-[10px] text-slate-400">{relationLabel} • อายุ {m.form.currentAge} ปี</div>
                                      </div>
                                    </div>
                                    {isGood ? (
                                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                        <span className="text-[10px] font-bold">พอใช้</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded-md border border-rose-100">
                                        <span className="text-[10px] font-bold">ขาด ฿{formatNumber2(Math.abs(mRes.gap), 0)}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Progress */}
                                  <div className="space-y-1 mb-3">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-slate-500">ความคืบหน้า</span>
                                      <span className={isGood ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full transition-all ${isGood ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${progress}%` }}></div>
                                    </div>
                                  </div>

                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                                    <div>
                                      <div className="text-[9px] text-slate-400 uppercase tracking-wide">Target</div>
                                      <div className="text-xs font-semibold text-slate-700">฿{formatNumber(mRes.targetFund)}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-[9px] text-slate-400 uppercase tracking-wide">Projected</div>
                                      <div className="text-xs font-bold text-indigo-600">฿{formatNumber(mRes.projectedFund)}</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </div>
              )}


              {/* insurance table modal */}
              {
                showInsuranceTable && (
                  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                    <div className="max-h-[80vh] w-[90vw] max-w-3xl overflow-hidden rounded-lg bg-white shadow-lg">
                      <div className="flex items-center justify-between border-b px-4 py-3">
                        <h3 className="font-bold text-slate-800 text-sm">โปรดตรวจสอบรายละเอียดของแผนประกัน และความถูกต้อง</h3>
                        <Button variant="ghost" className="h-7 w-7 p-0 text-slate-500" type="button" onClick={() => setShowInsuranceTable(false)}>✕</Button>
                      </div>
                      <div className="max-h-[60vh] overflow-auto px-4 pb-4">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="border border-slate-200 px-2 py-2 text-left w-[10%]">อายุ</th>
                              {form.selectedPlanId && form.insurancePlans.find(p => p.id === form.selectedPlanId)?.surrenderMode === "table" && (
                                <th className="border border-slate-200 px-2 py-2 text-right w-[20%] text-blue-600">เวนคืน (บาท)</th>
                              )}
                              <th className="border border-slate-200 px-2 py-2 text-right w-[25%]">กระแสเงินสดไหลเข้า</th>
                              <th className="border border-slate-200 px-2 py-2 text-right w-[25%]">ผลประโยชน์เมื่อเสียชีวิต</th>
                              <th className="border border-slate-200 px-2 py-2 pl-4 text-left w-[20%]">สถานะ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: 100 - Number(form.currentAge) + 1 }, (_, i) => Number(form.currentAge) + i).map(age => {
                              let totalCashInflow = 0;
                              let totalDeathBenefit = 0;
                              let statusText = "";
                              let isSurrenderYear = false;
                              let isAfterSurrenderAll = true; // If all plans are surrendered/ended
                              let hasActiveCoverage = false;
                              let isPensionYear = false;

                              // Strict Isolation: ONLY use selectedPlanId if present.
                              const targetPlans = form.selectedPlanId
                                ? form.insurancePlans.filter(p => p.id === form.selectedPlanId)
                                : form.insurancePlans.filter(p => p.active);

                              targetPlans.forEach(plan => {
                                const sumAssured = Number(String(plan.sumAssured).replace(/,/g, ""));
                                const coverageAge = Number(plan.coverageAge);
                                const surrenderAge = Number(plan.surrenderAge);
                                const useSurrender = plan.useSurrender && plan.type !== "ชั่วระยะเวลา";
                                const planIsSurrenderYear = useSurrender && age === surrenderAge;
                                const planIsAfterSurrender = useSurrender && age > surrenderAge;
                                const planIsWithinCoverage = age <= coverageAge;

                                if (!planIsAfterSurrender && planIsWithinCoverage) {
                                  isAfterSurrenderAll = false;
                                  hasActiveCoverage = true;
                                }

                                // Pre-calculate Accumulated Pension for Annuity to check for depletion
                                let accumulatedPension = 0;
                                let initialDB = sumAssured;
                                let isDepleted = false;

                                if (plan.type === "บำนาญ") {
                                  const dbPre = Number(String(plan.deathBenefitPrePension).replace(/,/g, ""));
                                  if (dbPre > 0) initialDB = dbPre;

                                  let startAge = Number(plan.pensionStartAge);
                                  if (plan.unequalPension && plan.pensionTiers?.length > 0) {
                                    const minTierStart = Math.min(...plan.pensionTiers.map(t => Number(t.startAge)));
                                    startAge = minTierStart;
                                  }

                                  if (age >= startAge) {
                                    for (let pastAge = startAge; pastAge < age; pastAge++) {
                                      let pastAmount = 0;
                                      if (plan.unequalPension && plan.pensionTiers) {
                                        const tier = plan.pensionTiers.find(t => pastAge >= Number(t.startAge) && pastAge <= Number(t.endAge));
                                        pastAmount = tier ? Number(String(tier.amount).replace(/,/g, "")) : 0;
                                      } else {
                                        if (pastAge >= Number(plan.pensionStartAge) && pastAge <= (Number(plan.pensionEndAge) || 100)) {
                                          let pAmt = Number(String(plan.pensionAmount).replace(/,/g, ""));
                                          if (Number(plan.pensionPercent) > 0) pAmt = (sumAssured * Number(plan.pensionPercent)) / 100;
                                          pastAmount = pAmt;
                                        }
                                      }
                                      accumulatedPension += pastAmount;
                                    }
                                  }

                                  // Check if depleted (Past Pension >= Initial DB)
                                  if (accumulatedPension >= initialDB) {
                                    isDepleted = true;
                                  }
                                }

                                // Cash Inflow Calculation
                                let flow = 0;
                                let isPension = false;

                                if (planIsSurrenderYear) {
                                  let sv = Number(String(plan.surrenderValue).replace(/,/g, ""));
                                  if (plan.surrenderMode === "table" && plan.surrenderTableData) {
                                    const row = plan.surrenderTableData.find(d => d.age === age);
                                    if (row) sv = Number(String(row.amount).replace(/,/g, ""));
                                  }
                                  flow += sv;
                                  isSurrenderYear = true;
                                } else if (!planIsAfterSurrender && planIsWithinCoverage) {
                                  // Endowment
                                  if (plan.type === "สะสมทรัพย์") {
                                    const maturity = Number(String(plan.maturityAmount).replace(/,/g, ""));
                                    const cashBack = Number(String(plan.cashBackAmount).replace(/,/g, ""));
                                    const freq = Number(plan.cashBackFrequency) || 1;
                                    const policyYear = age - Number(form.currentAge);

                                    if (age === coverageAge) flow += maturity;
                                    if (policyYear > 0 && policyYear % freq === 0) flow += cashBack;
                                  }
                                  // Annuity
                                  if (plan.type === "บำนาญ") {
                                    // If depleted, NO FLOW
                                    if (!isDepleted) {
                                      if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                                        for (const tier of plan.pensionTiers) {
                                          if (age >= Number(tier.startAge) && age <= Number(tier.endAge)) {
                                            flow += Number(String(tier.amount).replace(/,/g, ""));
                                            isPension = true;
                                          }
                                        }
                                      } else {
                                        let pensionAmt = Number(String(plan.pensionAmount).replace(/,/g, ""));
                                        if (Number(plan.pensionPercent) > 0) {
                                          pensionAmt = (sumAssured * Number(plan.pensionPercent)) / 100;
                                        }
                                        if (age >= Number(plan.pensionStartAge) && age <= (Number(plan.pensionEndAge) || 100)) {
                                          flow += pensionAmt;
                                          isPension = true;
                                        }
                                      }
                                    }
                                  }
                                }

                                totalCashInflow += flow;
                                if (isPension) isPensionYear = true;

                                // Death Benefit Calculation
                                let currentDB = 0; // Start with 0 for this plan

                                if (!planIsAfterSurrender && planIsWithinCoverage) {
                                  currentDB = sumAssured; // Base DB

                                  // Annuity Logic: Reduced by accumulated pension
                                  if (plan.type === "บำนาญ") {
                                    const dbPre = Number(String(plan.deathBenefitPrePension).replace(/,/g, ""));
                                    if (dbPre > 0) currentDB = dbPre;

                                    // Calculate accumulated pension
                                    let accumulatedPension = 0;
                                    let startAge = Number(plan.pensionStartAge);
                                    if (plan.unequalPension && plan.pensionTiers?.length > 0) {
                                      const minTierStart = Math.min(...plan.pensionTiers.map(t => Number(t.startAge)));
                                      startAge = minTierStart;
                                    }

                                    if (age >= startAge) {
                                      for (let pastAge = startAge; pastAge < age; pastAge++) {
                                        let pastAmount = 0;
                                        if (plan.unequalPension && plan.pensionTiers) {
                                          const tier = plan.pensionTiers.find(t => pastAge >= Number(t.startAge) && pastAge <= Number(t.endAge));
                                          pastAmount = tier ? Number(String(tier.amount).replace(/,/g, "")) : 0;
                                        } else {
                                          if (pastAge >= Number(plan.pensionStartAge) && pastAge <= (Number(plan.pensionEndAge) || 100)) {
                                            let pAmt = Number(String(plan.pensionAmount).replace(/,/g, ""));
                                            if (Number(plan.pensionPercent) > 0) pAmt = (sumAssured * Number(plan.pensionPercent)) / 100;
                                            pastAmount = pAmt;
                                          }
                                        }
                                        accumulatedPension += pastAmount;
                                      }
                                      // Reduce DB
                                      currentDB = Math.max(0, currentDB - accumulatedPension);
                                    }
                                  }
                                }

                                totalDeathBenefit += currentDB;
                              });

                              let deathBenefitDisplay = formatNumber(totalDeathBenefit);
                              let cashInflowDisplay = totalCashInflow > 0 ? `+${formatNumber(totalCashInflow)}` : "-";
                              let rowClass = "hover:bg-slate-50";

                              if (isSurrenderYear) {
                                statusText = "มีการเวนคืน";
                                rowClass = "bg-green-50 hover:bg-green-100";
                              } else if (hasActiveCoverage) {
                                statusText = "คุ้มครอง";
                                if (totalCashInflow > 0) {
                                  statusText = "รับเงินคืน/บำนาญ | คุ้มครอง";
                                  // Highlight row if receiving money
                                  rowClass = "bg-emerald-50 hover:bg-emerald-100";
                                }
                              } else {
                                statusText = "สิ้นสุดความคุ้มครอง";
                                deathBenefitDisplay = "-";
                                rowClass = "text-slate-400";
                              }

                              const lifeExpectancy = Number(String(form.lifeExpectancy).replace(/,/g, ""));
                              if (age === lifeExpectancy) {
                                statusText = `เสียชีวิตที่อายุ ${age} → ได้รับเงินประกัน ${deathBenefitDisplay}`;
                                rowClass = "bg-red-50 hover:bg-red-100 font-bold";
                              } else if (age > lifeExpectancy) {
                                statusText = "เสียชีวิตแล้ว";
                                deathBenefitDisplay = "-";
                                cashInflowDisplay = "-";
                                rowClass = "text-slate-300";
                              }

                              const editingThisPlan = form.selectedPlanId === targetPlans[0]?.id && targetPlans[0]?.surrenderMode === "table";
                              const pIndex = form.insurancePlans.findIndex(p => p.id === targetPlans[0]?.id);

                              const svTableVal = editingThisPlan && pIndex >= 0
                                ? (form.insurancePlans[pIndex].surrenderTableData?.find(d => d.age === age)?.amount || "")
                                : "";

                              return (
                                <tr key={age} className={rowClass}>
                                  <td className="border border-slate-200 px-2 py-1">{age}</td>
                                  {editingThisPlan && (
                                    <td className="border border-slate-200 px-2 py-0.5 text-right">
                                      <input
                                        className="w-full text-right bg-blue-50/50 border-b border-blue-200 focus:outline-none focus:border-blue-500 text-xs py-1 px-1 text-blue-700"
                                        placeholder="-"
                                        value={svTableVal}
                                        onChange={(e) => updateSurrenderTable(pIndex, age, e.target.value)}
                                        onBlur={(e) => updateSurrenderTable(pIndex, age, formatInputDisplay(e.target.value))}
                                      />
                                    </td>
                                  )}
                                  <td className={`border border-slate-200 px-2 py-1 text-right ${totalCashInflow > 0 ? 'text-emerald-600 font-bold' : ''}`}>
                                    {cashInflowDisplay}
                                  </td>
                                  <td className="border border-slate-200 px-2 py-1 text-right">
                                    {deathBenefitDisplay}
                                  </td>
                                  <td className="border border-slate-200 px-2 py-1 pl-4 text-slate-500">
                                    {statusText}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              }





              {/* ----- MODAL 1: PROJECTED SAVINGS (คำนวณเงินออม) ----- */}
              {
                showProjectedModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20">
                      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">คำนวณเงินออม</h3>
                        <button onClick={() => setShowProjectedModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                          <CloseIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                        {/* TABS */}
                        <div className="flex gap-1 p-1 bg-slate-100/50 rounded-2xl mx-6 mt-4 mb-2">
                          <button className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${projectedModalTab === 'details' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setProjectedModalTab('details')}>รายละเอียด</button>
                          <button className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${projectedModalTab === 'formula' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setProjectedModalTab('formula')}>สูตรคำนวณ</button>
                        </div>

                        <div className="p-6">
                          {projectedModalTab === "details" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="space-y-4">
                                {["เริ่มต้นจากเงินสะสมที่มีอยู่ในปัจจุบัน", "คำนวณผลตอบแทนจากเงินสะสมทั้งหมดของปีนั้น (ผลตอบแทนเฉลี่ยต่อปี)", "เพิ่มเงินออมประจำปีเข้าไปในยอดสะสม", "หากมีเงินเพิ่มเติมจากแหล่งอื่น เช่น เงินคืนประกัน ก็จะนำมาบวกกับยอดสะสมของปีนั้นด้วย", "ทำซ้ำขั้นตอน 2–4 สำหรับทุกปีจนถึงปีเกษียณ → จะได้ยอดสะสมสุดท้าย"].map((step, idx) => (
                                  <div key={idx} className="flex gap-4 text-xs text-slate-600">
                                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-bold text-[10px] shadow-sm">
                                      {idx + 1}
                                    </div>
                                    <div className="pt-1 leading-relaxed">{step}</div>
                                  </div>
                                ))}
                              </div>
                              <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-100/50 flex gap-3 items-start mt-4">
                                <span className="text-amber-500 text-lg">💡</span>
                                <div className="text-xs text-slate-700 pt-1">
                                  <span className="font-bold text-slate-900 block mb-1">สรุปคอนเซปต์</span>
                                  (เงินต้น + ดอกเบี้ย) + เงินออมใหม่ + เงินพิเศษ<br />คำนวณทบต้นไปเรื่อยๆ จนถึงปีเกษียณ
                                </div>
                              </div>
                            </div>
                          )}

                          {projectedModalTab === "formula" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="space-y-3">
                                <div className="text-sm font-bold text-slate-900">สูตรมูลค่าเงินในอนาคต (Future Value)</div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  คำนวณโดยนำเงิน 2 ก้อนมารวมกัน คือ "เงินก้อนแรกที่โตขึ้น" และ "เงินที่ออมเพิ่มทุกปีพร้อมดอกเบี้ย"
                                </p>

                                <div className="rounded-2xl bg-slate-900 p-4 overflow-x-auto shadow-inner">
                                  <div className="font-mono text-xs text-emerald-400 whitespace-nowrap">
                                    FV = [P₀ × (1 + r)ⁿ] + [P × ((1 + r)ⁿ - 1) / r] + CashFlows
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mt-2">
                                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-bold text-slate-900">FV</span> = มูลค่าเงินในอนาคต</div>
                                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-bold text-slate-900">P₀</span> = เงินเริ่มต้นที่มีอยู่</div>
                                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-bold text-slate-900">P</span> = เงินที่ออมเพิ่มต่อปี</div>
                                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-bold text-slate-900">r</span> = ผลตอบแทนต่อปี</div>
                                  <div className="col-span-2 bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-bold text-slate-900">n</span> = จำนวนปีที่ออม</div>
                                </div>
                              </div>

                              <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="text-xs font-bold text-slate-900">ตัวอย่างการคำนวณจริง (อีก {result.yearsToRetire} ปีเกษียณ):</div>
                                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                                  <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ส่วนที่ 1: เงินก้อนแรกโต</div>
                                    <div className="font-mono text-xs text-slate-600 break-all">
                                      = {formatNumber(form.currentSavings)} × (1 + {Number(form.expectedReturn) / 100})^{result.yearsToRetire}
                                    </div>
                                    <div className="font-mono text-sm font-bold text-indigo-600 mt-1">
                                      = ฿ {formatNumber(result.fvLumpSum)}
                                    </div>
                                  </div>
                                  <div className="border-t border-slate-200 pt-3">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ส่วนที่ 2: เงินออมเพิ่มรายปีโต</div>
                                    <div className="font-mono text-xs text-slate-600 break-all">
                                      = ({formatNumber(form.monthlySaving)} × 12) × ((1 + {Number(form.expectedReturn) / 100})^{result.yearsToRetire} - 1) / {Number(form.expectedReturn) / 100}
                                    </div>
                                    <div className="font-mono text-sm font-bold text-indigo-600 mt-1">
                                      = ฿ {formatNumber(result.fvAnnuity)}
                                    </div>
                                  </div>
                                  {result.insuranceCashInflow > 0 && (
                                    <div className="border-t border-slate-200 pt-3">
                                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">ส่วนพิเศษ: เงินจากประกัน</div>
                                      <div className="font-mono text-sm font-bold text-emerald-600 mt-1">
                                        + ฿ {formatNumber(result.insuranceCashInflow)}
                                      </div>
                                    </div>
                                  )}
                                  <div className="border-t border-slate-200 pt-3 bg-white -mx-4 -mb-4 p-4 rounded-b-2xl">
                                    <div className="flex justify-between items-end">
                                      <div className="text-xs font-bold text-slate-900">รวมเงินออมทั้งหมด (FV)</div>
                                      <div className="font-mono text-lg font-black text-emerald-600">
                                        ฿ {formatNumber(result.projectedFund)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              {/* ----- MODAL 2: TARGET FUND (เงินที่ต้องการ) ----- */}
              {
                showTargetModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20">
                      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">เงินที่ต้องการก่อนเกษียณ</h3>
                        <button onClick={() => setShowTargetModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                          <CloseIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                        <div className="flex gap-1 p-1 bg-slate-100/50 rounded-2xl mx-6 mt-4 mb-2">
                          <button className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${targetModalTab === 'details' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setTargetModalTab('details')}>รายละเอียด</button>
                          <button className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${targetModalTab === 'formula' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setTargetModalTab('formula')}>สูตรคำนวณ</button>
                        </div>

                        <div className="p-6">
                          {targetModalTab === "details" && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-4 rounded-2xl border border-blue-50">
                                <span className="font-bold text-blue-700">Concept:</span> เป็นจำนวนเงินทั้งหมดที่ต้องเตรียมก่อนเกษียณ เพื่อให้ครอบคลุมค่าใช้จ่ายในช่วงเกษียณ จนถึงเงินมรดกที่ต้องมี
                              </p>
                              <div className="space-y-3">
                                <div className="text-xs font-bold text-slate-900">ขั้นตอนการคิดแบบง่ายๆ:</div>
                                <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-2 marker:font-bold marker:text-blue-500">
                                  <li>รวมค่าใช้จ่ายรายปีทั้งหมด (ปรับเงินเฟ้อแล้ว) ตั้งแต่เกษียณจนถึงอายุขัย</li>
                                  <li>หักลบด้วย รายได้หลังเกษียณ (เช่น บำนาญประกันสังคม)</li>
                                  <li>หักลบด้วย ผลตอบแทนการลงทุนหลังเกษียณ (ถ้ามี)</li>
                                  <li>ผลลัพธ์ที่เหลือ คือ "เงินก้อน" ที่เราต้องเตรียมไว้</li>
                                </ol>
                                <div className="text-xs text-slate-500 mt-4 border-t pt-3 font-medium text-center">
                                  (ค่าใช้จ่ายสุทธิช่วงเกษียณ + เงินมรดก) = เป้าหมาย
                                </div>
                              </div>
                            </div>
                          )}

                          {targetModalTab === "formula" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="space-y-3">
                                <div className="text-sm font-bold text-slate-900">สูตรคำนวณเงินออมต่อปีที่ต้องเก็บ (PMT)</div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  หากเราต้องการรู้ว่า "จะต้องเก็บเงินเท่าไหร่" ในแต่ละปี เพื่อให้ไปถึงเป้าหมาย เราจะใช้สูตรนี้:
                                </p>

                                <div className="rounded-2xl bg-slate-900 p-4 overflow-x-auto shadow-inner">
                                  <div className="font-mono text-xs text-blue-400 whitespace-nowrap">
                                    P = (Target - Current * (1+r)^n) / ( ((1+r)^n - 1) / r )
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mt-2">
                                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-bold text-slate-900">P</span> = เงินออมต่อปี</div>
                                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-bold text-slate-900">Target</span> = เงินเป้าหมายเกษียณ</div>
                                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-bold text-slate-900">Current</span> = เงินต้นที่มีอยู่ตอนนี้</div>
                                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-bold text-slate-900">r</span> = ผลตอบแทนต่อปี</div>
                                </div>
                              </div>

                              <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="text-xs font-bold text-slate-900">ตัวอย่างการคำนวณจริง:</div>
                                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 overflow-x-auto">
                                  <div className="font-mono text-[10px] text-slate-600 whitespace-pre-wrap leading-relaxed break-all">
                                    P = ({formatNumber(result.targetFund)} - {formatNumber(form.currentSavings)} * (1 + {Number(form.expectedReturn) / 100})^{result.yearsToRetire})
                                    <br /><span className="text-slate-400">÷</span> ( ((1 + {Number(form.expectedReturn) / 100})^{result.yearsToRetire} - 1) ÷ {Number(form.expectedReturn) / 100} )
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                      <span className="text-[10px] text-slate-500">ออมต่อปี</span>
                                      <span className="font-mono text-xs font-bold text-blue-600">฿ {formatNumber2(result.monthlyNeeded * 12, 2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-blue-50 p-2 rounded-lg border border-blue-100">
                                      <span className="text-[10px] text-blue-600 font-bold">ออมต่อเดือน</span>
                                      <span className="font-mono text-sm font-black text-blue-700">฿ {formatNumber2(result.monthlyNeeded, 2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              {/* ----- MODAL 3: EXPENSE DETAILS (ค่าใช้จ่าย) ----- */}
              {
                showExpenseModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20">
                      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">ค่าใช้จ่ายตอนเกษียณ</h3>
                        <button onClick={() => setShowExpenseModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                          <CloseIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                        <div className="flex gap-1 p-1 bg-slate-100/50 rounded-2xl mx-6 mt-4 mb-2">
                          <button className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${expenseModalTab === 'details' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setExpenseModalTab('details')}>รายละเอียด</button>
                          <button className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${expenseModalTab === 'formula' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setExpenseModalTab('formula')}>สูตรคำนวณ</button>
                        </div>

                        <div className="p-6">
                          {expenseModalTab === "details" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="h-[220px] w-full rounded-2xl border border-slate-100 p-4 bg-white shadow-sm">
                                {expenseChart ? <Line data={expenseChart.data} options={expenseChart.options} /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">ไม่มีข้อมูลกราฟ</div>}
                              </div>
                              <div className="space-y-3">
                                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">ตารางค่าใช้จ่ายรายปี (จนถึงอายุขัย)</div>
                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                  <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-700 font-bold">
                                      <tr><th className="p-3 border-b">อายุ</th><th className="p-3 border-b text-right">รายเดือน</th><th className="p-3 border-b text-right">รายปี</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {result.expenseSchedule.slice(0, 5).map((row) => (
                                        <tr key={row.age} className="hover:bg-slate-50 transition-colors">
                                          <td className="p-3 text-slate-600 font-medium">{row.age}</td>
                                          <td className="p-3 text-right font-medium text-purple-600">{formatNumber(row.monthly)}</td>
                                          <td className="p-3 text-right text-slate-800">{formatNumber(row.yearly)}</td>
                                        </tr>
                                      ))}
                                      {result.expenseSchedule.length > 5 && (
                                        <tr><td colSpan={3} className="p-2 text-center text-[10px] text-slate-400 bg-slate-50/50">... ดูข้อมูลเพิ่มเติม {result.expenseSchedule.length - 5} ปี ...</td></tr>
                                      )}
                                    </tbody>
                                    <tfoot className="bg-slate-900 text-white font-semibold">
                                      <tr><td className="p-3">รวมทั้งหมด</td><td className="p-3 text-right">-</td><td className="p-3 text-right text-purple-200">{formatNumber(result.totalLifetimeExpense)}</td></tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                          {expenseModalTab === "formula" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="space-y-3">
                                <div className="text-sm font-bold text-slate-900">การคิดค่าใช้จ่ายในอนาคต (Inflation Adjusted)</div>
                                <div className="rounded-2xl bg-slate-900 p-4 text-xs text-purple-200 border border-slate-800 leading-relaxed font-mono shadow-inner">
                                  Expense(n) = {formatNumber(form.retireExtraExpense)} × (1 + {Number(form.inflation) / 100}) ^ {result.yearsToRetire}
                                </div>
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900 leading-relaxed">
                                  <span className="font-bold">หลักการ:</span> เราปรับค่าใช้จ่ายปัจจุบันให้เป็นค่าในอนาคตตามอัตราเงินเฟ้อ เพื่อให้รู้ว่าตอนเกษียณจริงต้องใช้เงิน "กี่บาท" ในค่าเงินตอนนั้น
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              {/* ----- MODAL 4: MONTE CARLO DETAILS ----- */}
              {
                showMonteCarloDetails && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20">
                      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">กราฟจำลอง 5 ครั้ง</h3>
                        <button onClick={() => setShowMonteCarloDetails(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                          <CloseIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-6">
                        <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          จำลองผลลัพธ์การลงทุน (Volatility 6%)
                        </p>
                        <div className="space-y-3">
                          {mcResult.finalBalances.map((run, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                              <span className="text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded text-[10px]">RUN #{idx + 1}</span>
                              <div className="flex items-center gap-2">
                                <span className={run.pass ? "text-emerald-700 font-bold font-mono" : "text-rose-700 font-bold font-mono"}>
                                  ฿{formatNumber(run.balance)}
                                </span>
                                <span className={`w-2 h-2 rounded-full ${run.pass ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">อัตราความสำเร็จ</span>
                          <span className="text-lg font-black text-slate-900">{formatNumber2(mcResult.probability * 100, 0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }



              {/* Family Summary Modal - Enhanced Version */}
              {
                showFamilySummaryModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl relative max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20 flex flex-col">

                      {/* Header */}
                      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">สรุปแผนครอบครัว (Family Plan Summary)</h3>
                            <p className="text-sm text-slate-500">รายงานวิเคราะห์สุขภาพทางการเงินของครอบครัว ({familyMembers.length} ท่าน)</p>
                          </div>
                        </div>
                        <button
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                          onClick={() => setShowFamilySummaryModal(false)}
                        >
                          <CloseIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Scrollable Content */}
                      <div className="overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">

                        {/* 1. Executive Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                          {/* Status Card */}
                          <div className={`col-span-1 md:col-span-1 rounded-2xl p-6 border shadow-sm flex flex-col justify-center items-center text-center ${getFamilySummary().totalGap >= 0 ? "bg-white border-emerald-100" : "bg-white border-amber-100"}`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${getFamilySummary().totalGap >= 0 ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"}`}>
                              {getFamilySummary().totalGap >= 0
                                ? <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                              }
                            </div>
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">สถานะภาพรวม</div>
                            <div className={`text-xl font-black ${getFamilySummary().totalGap >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                              {getFamilySummary().totalGap >= 0 ? "Mansion Grade" : "Needs Attention"}
                            </div>
                            <div className="text-xs text-slate-400 mt-2 font-medium">
                              {getFamilySummary().totalGap >= 0 ? "แผนการเงินตระกูลมั่นคงเยี่ยม" : "ควรปรับแผนเพื่อปิดความเสี่ยง"}
                            </div>
                          </div>

                          {/* Wealth Stats */}
                          <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-6 -mt-6"></div>
                              <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-2">เป้าหมายรวม (Target)</div>
                              <div className="text-2xl font-black text-slate-800 tracking-tight">฿{formatNumber(getFamilySummary().totalTarget)}</div>
                              <div className="mt-2 text-[10px] text-slate-400">ทรัพย์สินที่ต้องมีเมื่อเกษียณ</div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full -mr-6 -mt-6"></div>
                              <div className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-2">คาดการณ์ (Projected)</div>
                              <div className="text-2xl font-black text-indigo-600 tracking-tight">฿{formatNumber(getFamilySummary().totalProjected)}</div>
                              <div className="mt-2 text-[10px] text-indigo-400">ทรัพย์สินที่จะมีตามแผนปัจจุบัน</div>
                            </div>

                            <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden ${getFamilySummary().totalGap >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
                              <div className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
                                Gap Analysis
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getFamilySummary().totalGap >= 0 ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"}`}>
                                  {getFamilySummary().totalGap >= 0 ? "SURPLUS" : "SHORTFALL"}
                                </span>
                              </div>
                              <div className={`text-2xl font-black tracking-tight ${getFamilySummary().totalGap >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                {getFamilySummary().totalGap >= 0 ? "+" : "-"}{formatNumber(Math.abs(getFamilySummary().totalGap))}
                              </div>
                              <div className={`mt-2 text-[10px] font-medium ${getFamilySummary().totalGap >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                {getFamilySummary().totalGap >= 0 ? "มีเงินเหลือใช้เกินเป้าหมาย" : "ยังขาดเงินทุนอีกจำนวนหนึ่ง"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Analysis & Insight Section */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
                          <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="text-amber-500">💡</span>
                            บทวิเคราะห์และคำแนะนำ (Insight & Recommendation)
                          </h4>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Left: Text Analysis */}
                            <div className="space-y-6">
                              <div>
                                <div className="text-sm font-bold text-slate-700 mb-2">สรุปผลการประเมิน</div>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                  จากการประเมินแผนการเกษียณของสมาชิกในครอบครัวทั้ง {familyMembers.length} ท่าน พบว่า
                                  {getFamilySummary().totalGap >= 0
                                    ? " ภาพรวมสถานะทางการเงินมีความแข็งแกร่งมาก (Strong Financial Health) สามารถบรรลุเป้าหมายเกษียณได้ทุกคน โดยมีส่วนเกินทุนสำรองที่เพียงพอ แนะนำให้พิจารณาการลงทุนเพื่อเพิ่มความมั่งคั่ง (Wealth Accumulation) หรือส่งต่อมรดก"
                                    : " ภาพรวมยังมีความเสี่ยงที่จะเงินไม่พอใช้หลังเกษียณ (Potential Shortfall) โดยเฉพาะในช่วงปลายของแผน จำเป็นต้องปรับปรุงโครงสร้างการออมหรือลดค่าใช้จ่ายเป้าหมายลง เพื่อปิดช่องว่างทางการเงินนี้"}
                                </p>
                              </div>

                              <div className="space-y-3">
                                <div className="text-sm font-bold text-slate-700">ข้อแนะนำ (Action Plan)</div>
                                <ul className="space-y-3">
                                  {getFamilySummary().totalMonthlySavingsCurrent < getFamilySummary().totalMonthlyNeeded && (
                                    <li className="flex gap-3 text-sm text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                      <div className="flex-shrink-0 text-amber-500 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                                      <div>
                                        <span className="font-bold text-amber-800">เพิ่มการออมด่วน:</span> ควรพิจารณาออมเพิ่มรวมกันอีก <span className="font-bold">฿{formatNumber2(getFamilySummary().totalMonthlyNeeded - getFamilySummary().totalMonthlySavingsCurrent, 0)}</span> ต่อเดือน
                                      </div>
                                    </li>
                                  )}
                                  <li className="flex gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex-shrink-0 text-blue-500 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                                    <div>
                                      <span className="font-bold text-slate-800">ปรับพอร์ตการลงทุน:</span> ตรวจสอบว่าผลตอบแทนเฉลี่ย (Expected Return) สอดคล้องกับความเสี่ยงที่รับได้หรือไม่ การเพิ่มผลตอบแทนเพียง 1-2% สามารถลดเงินออมที่ต้องใช้ได้มหาศาล
                                    </div>
                                  </li>
                                  <li className="flex gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex-shrink-0 text-purple-500 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg></div>
                                    <div>
                                      <span className="font-bold text-slate-800">จัดการความคุ้มครอง:</span> ตรวจสอบสิทธิประโยชน์ทางภาษีและการประกันสุขภาพ เพื่อลดภาระค่าใช้จ่ายแฝงหลังเกษียณ
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Right: Savings Performance */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center">
                              <div className="text-center mb-6">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efficiency Score</span>
                                <div className="text-4xl font-black text-slate-800 mt-2 mb-1">
                                  {((getFamilySummary().totalMonthlySavingsCurrent / (getFamilySummary().totalMonthlyNeeded || 1)) * 100).toFixed(0)}<span className="text-2xl text-slate-400">%</span>
                                </div>
                                <div className="text-xs text-slate-500">ประสิทธิภาพการออมต่อเป้าหมาย</div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                                    <span>ออมจริง (Actual)</span>
                                    <span>฿{formatNumber(getFamilySummary().totalMonthlySavingsCurrent)}</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.min(100, (getFamilySummary().totalMonthlySavingsCurrent / (getFamilySummary().totalMonthlyNeeded || 1)) * 100)}%` }}></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-xs font-semibold text-indigo-600 mb-2">
                                    <span>เป้าหมาย (Needed)</span>
                                    <span>฿{formatNumber2(getFamilySummary().totalMonthlyNeeded, 0)}</span>
                                  </div>
                                  <div className="h-2 w-full bg-indigo-100 rounded-full overflow-hidden relative">
                                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-indigo-500"></div>
                                    <div className="h-full bg-indigo-500/20 w-full"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. Detailed Member Breakdown Table */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span className="text-blue-500">👥</span>
                            รายละเอียดรายบุคคล (Individual Breakdown)
                          </h4>

                          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                  <th className="py-4 px-6 w-[25%]">สมาชิก (Member)</th>
                                  <th className="py-4 px-6 text-right w-[10%]">อายุเหลือเก็บ (Yrs)</th>
                                  <th className="py-4 px-6 text-right w-[20%]">เป้าหมาย (Target)</th>
                                  <th className="py-4 px-6 text-left w-[25%] pl-8">ความก้าวหน้า (Progress)</th>
                                  <th className="py-4 px-6 text-right w-[20%]">สถานะ (Status)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {familyMembers.map((m, idx) => {
                                  // Re-calculate for each member
                                  const isCurrent = String(m.id) === String(currentMemberId);
                                  const inputs = buildRetirementInputs({
                                    form: isCurrent ? form : m.form,
                                    gender: isCurrent ? gender : m.gender,
                                    savingMode: isCurrent ? savingMode : m.savingMode,
                                    returnMode: isCurrent ? returnMode : m.returnMode,
                                    allocations: isCurrent ? allocations : m.allocations
                                  });
                                  const res = calculateRetirement(inputs);
                                  const progress = Math.min(100, (res.projectedFund / (res.targetFund || 1)) * 100);
                                  const yearsLeft = Number(m.form.retireAge) - Number(m.form.currentAge);

                                  // Relation translation
                                  const relationMap: Record<string, string> = {
                                    self: "ตนเอง", spouse: "คู่สมรส", child: "บุตร", father: "บิดา", mother: "มารดา", relative: "ญาติ"
                                  };

                                  return (
                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                      <td className="py-5 px-6">
                                        <div className="flex items-center gap-4">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-white
                                            ${res.status === "enough" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                                            {m.name.charAt(0)}
                                          </div>
                                          <div>
                                            <div className="font-bold text-slate-800 text-base">{m.name}</div>
                                            <div className="text-xs text-slate-400">{relationMap[m.relation || "self"] || m.relation} • อายุ {m.form.currentAge} ปี</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-5 px-6 text-right">
                                        <span className="font-bold text-slate-700">{Math.max(0, yearsLeft)}</span> <span className="text-xs text-slate-400 font-normal">ปี</span>
                                      </td>
                                      <td className="py-5 px-6 text-right">
                                        <div className="font-bold text-slate-700">฿{formatNumber(res.targetFund)}</div>
                                        <div className="text-[10px] text-slate-400">ออมเดือนละ {formatNumber(Number(m.form.monthlySaving))}</div>
                                      </td>
                                      <td className="py-5 px-6 pl-8">
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                          <span className="font-bold text-slate-600">฿{formatNumber(res.projectedFund)}</span>
                                          <span className={res.status === "enough" ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>{progress.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full transition-all ${res.status === "enough" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${progress}%` }}></div>
                                        </div>
                                      </td>
                                      <td className="py-5 px-6 text-right">
                                        {res.status === "enough" ? (
                                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            <span className="text-xs font-bold">Planned</span>
                                          </div>
                                        ) : (
                                          <div className="inline-flex flex-col items-end">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 mb-1">
                                              <span className="text-xs font-bold">Shortfall</span>
                                            </div>
                                            <div className="text-[10px] text-rose-600 font-medium">ขาดอีก ฿{formatNumber(Math.abs(res.gap))}</div>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10">
                        <Button variant="outline" className="border-slate-200 text-slate-600" onClick={() => setShowFamilySummaryModal(false)}>ปิดหน้าต่าง</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200" onClick={() => window.print()}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                          พิมพ์รายงาน
                        </Button>
                      </div>

                    </div>
                  </div>
                )
              }

            </div>
          )}
        </main>
      </div >
    </div >
  );
}