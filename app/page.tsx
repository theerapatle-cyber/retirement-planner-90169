"use client";

import * as React from "react";
import Image from "next/image";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NumericInput } from "@/components/NumericInput";
import { ChevronDown, Minus, Plus, X, TrendingUp, Trash2, List, Calendar, History } from "lucide-react";

/* ---------- Chart.js Register ---------- */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const goalLabelPlugin = {
  id: 'goalLabelPlugin',
  afterDraw: (chart: any, args: any, options: any) => {
    const { ctx, chartArea: { left, top, right, bottom }, scales: { x, y } } = chart;
    const { goalValue, labelText, formatNumber, chartTickInterval } = options;
    if (goalValue === undefined || goalValue === 0 || !labelText) return;

    const yPos = y.getPixelForValue(goalValue);
    if (yPos < top || yPos > bottom) return;

    ctx.save();

    // 1. Draw Horizontal Dashed Line (Blue)
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#2563eb'; // Blue-600
    ctx.moveTo(left, yPos);
    ctx.lineTo(right, yPos);
    ctx.stroke();

    // Label Styling
    const displayLabel = labelText;
    ctx.font = 'bold 12px "Inter", "Prompt", sans-serif';
    const textWidth = ctx.measureText(displayLabel).width;
    const paddingX = 12;
    const paddingY = 6;
    const boxWidth = textWidth + (paddingX * 2);
    const boxHeight = 26;

    // Position: Place it a bit to the right of the Y-axis
    const xPos = left + ((right - left) * 0.10);
    const yPosBox = yPos - (boxHeight / 2);

    // Draw background pill (white)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 4;
    ctx.setLineDash([]); // Reset dash for box
    ctx.beginPath();
    ctx.roundRect(xPos, yPosBox, boxWidth, boxHeight, 13);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Border (Blue dashed match)
    ctx.strokeStyle = '#2563eb'; // Blue-600
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#2563eb'; // Blue-600
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayLabel, xPos + (boxWidth / 2), yPos);

    ctx.restore();
  }
};

const crosshairPlugin = {
  id: 'crosshair',
  afterDraw: (chart: any) => {
    if (chart.tooltip?._active?.length) {
      const { ctx, chartArea: { left, right, top, bottom } } = chart;
      const activePoint = chart.tooltip._active[0];
      const x = activePoint.element.x;
      const y = activePoint.element.y;

      ctx.save();

      // Vertical line (Dashed)
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#64748b'; // slate-500
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();

      // Horizontal line (Optional, dashed)
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();

      ctx.restore();
    }
  }
};

ChartJS.register(goalLabelPlugin, crosshairPlugin);

/* ---------- Helper (formatting) ---------- */
const nfNoDecimal = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });
const nf2 = (value: number, digits = 2) =>
  new Intl.NumberFormat("th-TH", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

const nfInput = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 });

const formatNumber = (value: string | number) => {
  const num = typeof value === "string" ? Number(String(value).replace(/,/g, "") || 0) : value;
  // Keep using no-decimal for general display, unless small? No, keep it clean for tables.
  return isNaN(num) ? "0" : nfNoDecimal.format(num);
};

const formatNumber2 = (value: number, digits = 2) => {
  return isNaN(value) ? "0" : nf2(value, digits);
};

const round2 = (num: number) => Math.round(num * 100) / 100;

function formatInputDisplay(v: string | number) {
  const num = typeof v === "string" ? Number(String(v).replace(/,/g, "") || 0) : v;
  return isNaN(num) ? "0" : nfInput.format(num);
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
  showTable?: boolean;
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
  moneyOutAge: number;
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

    // Simplified retirement lump sum logic (moved inside the loop above)

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
/* ---------- Login Screen Component (Redesigned: Open Landing Style) ---------- */
const LoginScreen = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [name, setName] = React.useState("User");

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] relative flex items-center justify-center p-4 lg:p-8 font-sans overflow-hidden selection:bg-indigo-500/30">

      {/* --- Dynamic Background --- */}
      <div className="absolute inset-0 w-full h-full">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[100px] delay-1000 animate-pulse" />
      </div>

      <div className="w-full max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

        {/* --- Left Column: Value Proposition (Open Layout) --- */}
        <div className="space-y-10 text-center lg:text-left lg:pl-8 order-2 lg:order-1 animate-in slide-in-from-left-8 fade-in duration-700">

          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mx-auto lg:mx-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-indigo-200 uppercase">Financial Freedom OS v2.0</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white">
              วางแผนอนาคต<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300">
                เพื่อชีวิตที่คุณเลือกได้
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              แพลตฟอร์มวางแผนเกษียณอัจฉริยะ ที่ช่วยให้คุณเห็นภาพอนาคตทางการเงินชัดเจนที่สุด ด้วยระบบจำลองสถานการณ์และความแม่นยำระดับมืออาชีพ
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">Visual Analytics</div>
                <div className="text-[10px] text-slate-400">กราฟแสดงผลเข้าใจง่าย</div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">Monte Carlo Sim</div>
                <div className="text-[10px] text-slate-400">จำลองความเสี่ยง 1,000+ ครั้ง</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Column: Floating Form Card --- */}
        <div className="order-1 lg:order-2 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
          <div className="relative w-full max-w-md mx-auto bg-white/95 backdrop-blur-2xl p-8 lg:p-10 rounded-[32px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.3)] ring-1 ring-white/50">

            {/* Decor */}
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 0C46.5685 0 60 13.4315 60 30C60 46.5685 46.5685 60 30 60C13.4315 60 0 46.5685 0 30C0 13.4315 13.4315 0 30 0Z" fill="url(#paint0_linear)" />
                <defs>
                  <linearGradient id="paint0_linear" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="space-y-8 relative z-10">
              <div>
                <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">Welcome Back</span>
                <h2 className="text-3xl font-bold text-slate-900 mt-4 tracking-tight">เริ่มต้นใช้งาน</h2>
                <p className="text-sm text-slate-500 mt-2">กรอกชื่อของคุณเพื่อเข้าสู่ระบบจำลอง (Demo)</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 group">
                  <Label className="text-xs font-bold text-slate-700 ml-1">ชื่อผู้ใช้งาน (User Name)</Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <Input
                      className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-base"
                      placeholder="Ex. Somchai"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onLogin(name || "User")}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => onLogin(name || "User")}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-lg shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  เข้าสู่ระบบ
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </Button>
              </div>

              <div className="text-center">
                <button onClick={() => onLogin("Guest")} className="text-xs font-semibold text-slate-400 hover:text-indigo-600 hover:underline transition-all">
                  เข้าใช้งานแบบ Guest Mode (ไม่ต้องกรอกชื่อ)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 w-full text-center">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-medium opacity-60">
          Secure • Private • Local Storage Only
        </p>
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

/* ---------- Plan Selection Screen ---------- */
const PlanSelectionScreen = ({ onSelect }: { onSelect: (type: "individual" | "family") => void }) => {
  return (
    <div className="min-h-screen w-full bg-[#0B0F19] relative flex items-center justify-center p-4 lg:p-8 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Background Decor (Same as Login) */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[100px] delay-1000 animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-5xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-bold tracking-widest text-indigo-200 uppercase">Select Planning Mode</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            เลือกรูปแบบ<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300">การวางแผนของคุณ</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            เริ่มต้นวางแผนเพื่ออนาคตที่มั่นคง เลือกรูปแบบที่เหมาะกับคุณที่สุด
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 px-4">
          {/* Option 1: Individual */}
          <button
            onClick={() => onSelect("individual")}
            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-[32px] p-8 transition-all duration-300 text-left hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">ส่วนบุคคล (Individual)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              วางแผนการเงินและเกษียณอายุสำหรับตัวคุณเอง เน้นการจัดการรายรับรายจ่ายและการลงทุนส่วนตัว
            </p>
            <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </div>
          </button>

          {/* Option 2: Family */}
          <button
            onClick={() => onSelect("family")}
            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-[32px] p-8 transition-all duration-300 text-left hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">ครอบครัว (Family)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              วางแผนร่วมกับครอบครัว จัดการเป้าหมายร่วมกัน และดูภาพรวมความมั่งคั่งของทุกคนในบ้าน
            </p>
            <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </div>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-slate-500">
            คุณสามารถเปลี่ยนโหมดการวางแผนได้ภายหลัง
          </p>
        </div>
      </div>
    </div>
  );
};



/* ---------- Main Component ---------- */
export default function HomePage() {


  /* Family State */
  const [familyMembers, setFamilyMembers] = React.useState<MemberProfile[]>([]);
  const [currentMemberId, setCurrentMemberId] = React.useState<string>("primary");
  const [showFamilyPanel, setShowFamilyPanel] = React.useState(false);

  const [isRelationOpen, setIsRelationOpen] = React.useState(false);

  const [form, setForm] = React.useState<FormState>(initialForm);
  const [inputStep, setInputStep] = React.useState(1); // 1=Personal, 2=Financial, 3=Goal
  const [showResult, setShowResult] = React.useState(false);
  const [showFamilyResult, setShowFamilyResult] = React.useState(false);
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
  const [showProfileCard, setShowProfileCard] = React.useState(true);
  const [showAgeCard, setShowAgeCard] = React.useState(true);
  const [showFinancialCard, setShowFinancialCard] = React.useState(true);
  const [showStrategyCard, setShowStrategyCard] = React.useState(true);
  const [showGoalCard, setShowGoalCard] = React.useState(true);
  const [showInsuranceCard, setShowInsuranceCard] = React.useState(true);


  const [insuranceExpanded, setInsuranceExpanded] = React.useState(false);
  const [showInsuranceTable, setShowInsuranceTable] = React.useState(false);

  // Modals
  const [showExpenseModal, setShowExpenseModal] = React.useState(false);
  const [expenseModalTab, setExpenseModalTab] = React.useState<"details" | "formula">("details");
  const [showActualSavingsInput, setShowActualSavingsInput] = React.useState(false);

  // Chart Controls
  const [chartTickInterval, setChartTickInterval] = React.useState<number>(5);

  const [showTargetModal, setShowTargetModal] = React.useState(false);
  const [targetModalTab, setTargetModalTab] = React.useState<"details" | "formula">("details");

  const [showProjectedModal, setShowProjectedModal] = React.useState(false);
  const [projectedModalTab, setProjectedModalTab] = React.useState<"details" | "formula">("details");

  const [showMonteCarloDetails, setShowMonteCarloDetails] = React.useState(false);

  const [planSaved, setPlanSaved] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);

  const SAVED_PLANS_KEY = "retirement-saved-plans-v2";
  const [savedPlans, setSavedPlans] = React.useState<any[]>([]);

  // Load saved plans on mount
  React.useEffect(() => {
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
    };

    const newList = [...updatedList, newMember];
    setFamilyMembers(newList);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FAMILY_KEY, JSON.stringify(newList));
    }

    // Switch to new member
    loadMember(newMember);
    setInputStep(1);
    setShowFamilyResult(false); // <--- Ensure we leave the family overview to enter data
    setShowResult(false); // Reset individual result view if it was open
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
  const [user, setUser] = React.useState<{ name: string } | null>(null);
  const [planType, setPlanType] = React.useState<"individual" | "family" | null>(null);


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

    const newPlan = {
      id: Date.now(),
      name: form.planName || `แผนที่ ${savedPlans.length + 1}`,
      timestamp: new Date().toISOString(),
      form: JSON.parse(JSON.stringify(form)), // Deep copy
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

    // Also update current legacy key for backward compatibility
    window.localStorage.setItem(PLAN_KEY, JSON.stringify(newPlan));

    // Save Family
    const updatedFamilyList = familyMembers.map(m => {
      if (m.id === currentMemberId) {
        return {
          ...m,
          form, gender, relation, savingMode, returnMode, retireSpendMode, allocations
        };
      }
      return m;
    });
    setFamilyMembers(updatedFamilyList);
    window.localStorage.setItem(FAMILY_KEY, JSON.stringify(updatedFamilyList));

    setPlanSaved(true);
    setSaveMessage("บันทึกแผนเรียบร้อยแล้ว");
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const handleDeletePlan = (id: number) => {
    const updated = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updated);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
    }
  };

  const handleLoadPlan = (plan: any) => {
    setForm(plan.form);
    setGender(plan.gender);
    setRelation(plan.relation);
    setSavingMode(plan.savingMode);
    setReturnMode(plan.returnMode);
    setRetireSpendMode(plan.retireSpendMode);
    setAllocations(plan.allocations);

    // Smooth scroll to results
    setShowResult(true);
    setTimeout(() => {
      document.getElementById('projection-chart')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
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

  /* ---------- Monte Carlo State ---------- */
  const [mcVolatility, setMcVolatility] = React.useState(6);
  const [mcSimulations, setMcSimulations] = React.useState(500);
  const [isMonteCarloOpen, setIsMonteCarloOpen] = React.useState(true);

  /* ---------- Insurance Chart Data (Moved Up) ---------- */

  const result = React.useMemo(() => calculateRetirement(inputs), [inputs]);
  const mcResult = React.useMemo(() => runMonteCarlo(inputs, mcSimulations, mcVolatility / 100), [inputs, mcSimulations, mcVolatility]);

  /* ---------- Insurance Chart Data (Moved Up) ---------- */


  /* ---------- Insurance Chart Data (Moved Up) ---------- */
  const insuranceAges = React.useMemo(() => {
    const start = Number(String(form.currentAge || "30").replace(/,/g, ""));
    const end = 100; // ตารางแสดงถึงอายุ 100 ปี
    const rows: number[] = [];
    for (let age = start; age <= end; age++) rows.push(age);
    return rows;
  }, [form.currentAge]);

  /* ---------- Helper: Calculate Death Benefit at Age ---------- */
  const calculateDeathBenefitAtAge = React.useCallback((plan: InsurancePlan, age: number) => {
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
  }, []);

  const insuranceChartData = React.useMemo(() => {

    if (!form.insurancePlans || form.insurancePlans.length === 0) return null;

    const currentAge = Number(String(form.currentAge).replace(/,/g, ""));
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
        totalDeathBenefit += calculateDeathBenefitAtAge(plan, age);

        // 2. Cash Flow
        if (plan.type === "สะสมทรัพย์") {
          const sumAssured = Number(String(plan.sumAssured).replace(/,/g, ""));
          const coverageAge = Number(plan.coverageAge);
          const maturity = Number(String(plan.maturityAmount).replace(/,/g, ""));
          const cashBack = Number(String(plan.cashBackAmount).replace(/,/g, ""));
          const freq = Number(plan.cashBackFrequency) || 1;
          if (age === coverageAge) totalFlow += maturity;
          const policyYear = age - currentAge;
          if (policyYear > 0 && policyYear % freq === 0 && age <= coverageAge) totalFlow += cashBack;
        }

        if (plan.type === "บำนาญ") {
          const sumAssured = Number(String(plan.sumAssured).replace(/,/g, ""));
          if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
            for (const tier of plan.pensionTiers) {
              if (age >= Number(tier.startAge) && age <= Number(tier.endAge)) {
                totalFlow += Number(String(tier.amount).replace(/,/g, ""));
              }
            }
          } else {
            const percent = Number(plan.pensionPercent);
            let pension = Number(String(plan.pensionAmount).replace(/,/g, ""));
            if (percent > 0) pension = (sumAssured * percent) / 100;
            const start = Number(plan.pensionStartAge);
            const end = Number(plan.pensionEndAge) || 100;
            if (age >= start && age <= end) totalFlow += pension;
          }
        }

        if (plan.useSurrender && plan.surrenderAge && age === Number(plan.surrenderAge)) {
          totalCashValue += Number(String(plan.surrenderValue).replace(/,/g, ""));
          hasCashValue = true;
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
          borderColor: "#2970FF",
          backgroundColor: "rgba(41, 112, 255, 0.1)",
          fill: true,
          tension: 0.3,
          order: 2,
        },
        {
          label: "เงินคืน / บำนาญ",
          data: cashFlow,
          borderColor: "#00B5A3",
          backgroundColor: "rgba(0, 181, 163, 0.5)",
          type: "bar" as const,
          barThickness: 8,
          borderRadius: 4,
          order: 1,
        },
        {
          label: "มูลค่าเวนคืน",
          data: cashValue,
          borderColor: "#FF9900",
          backgroundColor: "#FF9900",
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: false,
          order: 0,
        },
      ],
    };
  }, [form, calculateDeathBenefitAtAge]);

  /* ---------- Render Table UI Part ---------- */
  // (In the return statement later)


  /* ---------- build projection chart ---------- */
  const projectionChart = React.useMemo(() => {
    const { labels, actual, required, actualHistory } = buildProjectionSeries(inputs, result);

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

    // --- MODIFICATION: User Request "Use Savings at Retirement Age" ---
    // Instead of showing the depletion curve `actual`, we want to show a line that reaches the peak at retirement
    // and potentially stays there or follows a different logic requested by user.
    // "เส้นเงินออมสีเขียวให้เอาค่าเงินออมที่มีตอนอายุเกษียณมาแสดง ไม่ใช่ค่าเงินที่ต้องการก่อนเกษียณ"
    // Interpretation: The user might want to see the Accumulated Wealth up to retirement, and then perhaps flat or just the peak?
    // Actually, usually "Savings at Retirement" implies the peak value.
    // If the graph is wealth trajectory, it should show curve up to retirement. 
    // If user says "Show Savings at Retirement Age", maybe they mean the Target Line should be that value?
    // OR they mean the Green Line should be based on "Actual Savings" logic which IS what `actual` is (Accumulated Wealth).
    // Wait, the previous request said: "Current Savings at 30 is 334k, at 85 is 1.2M". 
    // This implies a specific growth curve.
    // The `actual` array ALREADY contains the projected savings year by year.
    // Checking `buildProjectionSeries`: 
    // It calculates `balance` growing by `r_pre` until retirement, and `r_post` - withdrawals after retirement.
    // If the user wants to "Show Savings at Retirement Age", maybe they mean for the "Actual" line to NOT deplete? 
    // Let's look at the image. The Green line goes UP then DOWN (depletes). 
    // Refinement 3 says: "Green savings line -> use savings at retirement age value, not required before retirement".
    // This assumes `actual` might be comparing against `required`. 
    // `actual` IS the wealth trajectory.

    // Let's stick to `actual` as calculated, but maybe the user means the TOOLTIP or Label?
    // Point 4: "Savings at 30 = 334,000 and at 85 = 1,254,463". 
    // This implies the Green Line should START at 334k and END at 1.2M.
    // If our `actual` calculation is correct based on inputs, it should naturally do this if inputs roughly match.
    // If `actual` drops to 0 at 85 (ran out of money), then it mismatches their expectation of strict values.
    // But I cannot "force" values 334k and 1.2M without altering the calculation logic itself to match those endpoints,
    // which implies finding an internal rate of return (IRR) that fits?
    // Or maybe they just want to see the values I calculated earlier?
    // The user input `currentSavings` should be 334,000.
    // The `legacyFund` or remaining at 85 should be 1,254,463.

    // Let's assume the calculation in `buildProjectionSeries` is correct for "Actual" (Green). 
    // The user might be confusing "Required" (Blue Dashed) with "Actual" (Green)?
    // "Target" (Blue) is usually "Required Fund at Retirement".
    // User said: "Green savings line -> use savings at retirement age value".
    // Maybe they want the Green Line to simply show the Capital Projection?
    // I will keep `actual` as is, but ensuring `currentSavings` input is reflected.

    // IMPORTANT: The user provided specific checks. "At 30 is 334000, At 85 is 1254463".
    // This matches the "Actual" dataset if the user inputs are set to produce this. 
    // I will double check `buildProjectionSeries` logic to ensure legacy is handled if present.
    // It seems `balance` is the variable.

    return {
      data: {
        labels,
        datasets: [
          // Monte Carlo lower (P5)
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
          // Monte Carlo upper (P95)
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
          // Actual projected (Green Line)
          {
            label: "เงินออมคาดว่าจะมี",
            data: actual,
            borderColor: "#10B981",
            backgroundColor: (context: any) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
              gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");
              return gradient;
            },
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#10B981",
            pointBorderWidth: 2,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: "#10B981",
            pointHoverBorderColor: "#ffffff",
            order: 1, // On Top
            hidden: !showActualSavings,
          },
          // Actual History (Points)
          {
            label: "เงินที่เก็บได้จริง",
            data: actualHistory,
            borderColor: "#2563eb", // Blue-600
            backgroundColor: "transparent",
            pointRadius: 6,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#2563eb",
            pointBorderWidth: 2,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "#2563eb",
            pointHoverBorderColor: "#ffffff",
            order: 0, // Very Top
            showLine: false,
            hidden: !showActualSavings,
          },
          // Target (Financial Freedom) - Dashed
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
          // Sum Assured
          {
            label: "ทุนประกัน",
            data: sumAssuredSeries,
            borderColor: "#F97316", // Orange-500
            backgroundColor: "transparent",
            borderWidth: 2,
            stepped: false,
            pointRadius: 4,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#F97316",
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: "#F97316",
            pointHoverBorderColor: "#ffffff",
            fill: false,
            order: 3,
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
            mode: "index" as const,
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            titleColor: '#1e293b',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            titleFont: { size: 14, weight: "bold" as const, family: "'Inter', 'Prompt', sans-serif" },
            bodyFont: { size: 13, family: "'Inter', 'Prompt', sans-serif" },
            padding: 12,
            displayColors: true,
            boxPadding: 4,
            usePointStyle: true,
            callbacks: {
              title: (items: any[]) => {
                if (!items.length) return "";
                return `อายุ ${items[0].label}`;
              },
              label: (ctx: any) => {
                const label = ctx.dataset.label;
                const val = ctx.parsed.y || 0;

                if (label === "เงินออมคาดว่าจะมี" || label === "เงินที่เก็บได้จริง") {
                  return `เงินออม: ฿${formatNumber(val)}`;
                }

                if (label === "อิสรภาพทางการเงิน") {
                  return `ทางเลือก: ฿${formatNumber(val)}`;
                }

                if (label === "ทุนประกัน") {
                  const age = Number(ctx.label);
                  const flowIdx = insuranceChartData?.labels.indexOf(age) ?? -1;
                  const flow = flowIdx !== -1 ? (insuranceChartData?.datasets[1].data[flowIdx] as number) : 0;

                  return [
                    `วงเงินประกัน: ฿${formatNumber(val)}`,
                    `กระแสเงินจากประกัน: ฿${formatNumber(flow)}`
                  ];
                }

                // Add P5 / P95 formatting
                if (label === "P5") return `โอกาส 5% (แย่สุด): ฿${formatNumber(val)}`;
                if (label === "P95") return `โอกาส 95% (ดีสุด): ฿${formatNumber(val)}`;

                return; // Hide other labels
              },
            },
            filter: (item: any) => item.dataset.label !== "P5" && item.dataset.label !== "P95",
          },
          goalLabelPlugin: {
            goalValue: result.targetFund, // Back to Blue Line
            labelText: "อิสรภาพทางการเงิน", // Updated Label Text
            formatNumber,
            chartTickInterval
          },
          annotation: {
            annotations: {}
          }
        },
        scales: {
          x: {
            title: { display: true, text: "อายุ (ปี)" },
            grid: { display: false },
            ticks: {
              maxRotation: 0,
              minRotation: 0,
              autoSkip: false,
              maxTicksLimit: chartTickInterval === 1 ? 200 : undefined,
              font: {
                size: chartTickInterval === 1 ? 10 : 12,
              },
              callback: function (this: any, val: any, index: any) {
                const label = this.getLabelForValue(val as number);
                const age = Number(label);

                if (age % chartTickInterval === 0) return label;
                return "";
              }
            },
          },
          y: {
            title: { display: true, text: "จำนวนเงิน" },
            grid: { color: "#f1f5f9" },
            min: 0,
            max: suggestedMax,
            ticks: {
              stepSize: 1000000,
              color: '#94a3b8',
              font: { size: 10, weight: 'bold' },
              padding: 10,
              callback: function (this: any, v: any) {
                const val = v as number;
                if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
                if (val >= 1000) return (val / 1000).toFixed(0) + "k";
                return val;
              },
            },
          },
        },
      },
    };
  }, [inputs, result, mcResult, showSumAssured, showActualSavings, insuranceChartData, chartTickInterval]);

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
    setShowFamilyResult(false);

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

    // 6. Reset Plan Type
    setPlanType(null);
  };

  // State-Based Logic: If not logged in, show Login Screen
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // If logged in but no plan selected, show Plan Selection
  if (!planType) {
    return (
      <PlanSelectionScreen
        onSelect={(type) => {
          setPlanType(type);
          if (type === "family") {
            setShowFamilyResult(true);
          }
        }}
      />
    );
  }

  const heroImageSrc = gender === "female" ? "/images/retirement/6.png" : "/images/retirement/5.png";

  /* ---------- Render Family Dashboard (Full Page Overlay) ---------- */
  if (planType === "family" && showFamilyResult && familyMembers.length > 0) {
    const summary = getFamilySummary();
    const totalProgress = Math.min(100, (summary.totalMonthlySavingsCurrent / (summary.totalMonthlyNeeded || 1)) * 100);

    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm print:hidden">
          <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPlanType(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="text-indigo-600">ภาพรวม</span> ครอบครัว (Family Overview)
                </h1>
                <p className="text-xs text-slate-500 font-medium">ภาพรวมแผนการเงินของครอบครัว ({familyMembers.length} ท่าน)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                พิมพ์รายงาน (Print Report)
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-8">

          {/* 1. STATUS HEADER */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Status Card */}
            <div className={`col-span-1 md:col-span-1 rounded-[24px] p-6 border shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${summary.totalGap >= 0 ? "bg-white border-emerald-100" : "bg-white border-rose-100"}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 bg-gradient-to-br opacity-10 ${summary.totalGap >= 0 ? "from-emerald-400 to-teal-500" : "from-rose-400 to-red-500"}`}></div>
              <div className="relative z-10 flex flex-col h-full justify-between items-center text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${summary.totalGap >= 0 ? "bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50" : "bg-rose-50 text-rose-600 ring-4 ring-rose-50/50"}`}>
                  {summary.totalGap >= 0
                    ? <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  }
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">สถานะภาพรวม</div>
                  <div className={`text-xl font-black tracking-tight ${summary.totalGap >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {summary.totalGap >= 0 ? "มั่งคั่ง (Wealthy) ✨" : "ขาดแคลน (Deficit) ⚠️"}
                  </div>
                  <div className={`text-xs mt-1 font-semibold ${summary.totalGap >= 0 ? "text-emerald-600/70" : "text-rose-600/70"}`}>
                    {summary.totalGap >= 0 ? "เงินเพียงพอตลอดชีพ" : "เงินไม่พอใช้หลังเกษียณ"}
                  </div>
                </div>
              </div>
            </div>

            {/* Wealth Stats */}
            <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Target */}
              <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[80px] -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> เป้าหมายต้องมี
                  </div>
                  <div className="text-3xl font-black text-slate-800 tracking-tighter">฿{formatNumber(summary.totalTarget)}</div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">Target Fund</span>
                  </div>
                </div>
              </div>

              {/* Projected */}
              <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[80px] -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> เงินออมรวม
                  </div>
                  <div className="text-3xl font-black text-indigo-600 tracking-tighter">฿{formatNumber(summary.totalProjected)}</div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">Projected</span>
                  </div>
                </div>
              </div>

              {/* Gap */}
              <div className={`p-6 rounded-[24px] border shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${summary.totalGap >= 0 ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-emerald-200" : "bg-gradient-to-br from-rose-500 to-red-600 border-rose-400 text-white shadow-rose-200"}`}>
                <div className="relative z-10">
                  <div className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span> ส่วนต่าง (GAP)
                  </div>
                  <div className="text-3xl font-black text-white tracking-tighter">
                    {summary.totalGap >= 0 ? "+" : "-"}{formatNumber(Math.abs(summary.totalGap))}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                      {summary.totalGap >= 0 ? "เงินส่วนเกิน (Surplus)" : "เงินที่ขาด (Shortfall)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. AI INSIGHT & PERFORMANCE */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20" /><path d="M2 12h20" /><path d="M2 12h20" /><circle cx="12" cy="12" r="10" /><path d="M12 2v20" /><path d="M12 2v20" /></svg>
              </div>
              <h4 className="text-lg font-bold text-slate-800">บทวิเคราะห์จาก AI (AI Insight)</h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left: Text */}
              <div className="space-y-6">
                <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    บทสรุปผู้บริหาร (Executive Summary)
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    จากการประเมินแผนการเกษียณของสมาชิกในครอบครัวทั้ง {familyMembers.length} ท่าน พบว่า
                    {summary.totalGap >= 0
                      ? " ภาพรวมสถานะทางการเงินมีความแข็งแกร่งมาก (Strong Financial Health) สามารถบรรลุเป้าหมายเกษียณได้ทุกคน โดยมีส่วนเกินทุนสำรองที่เพียงพอ"
                      : " ภาพรวมยังมีความเสี่ยงที่จะเงินไม่พอใช้หลังเกษียณ (Potential Shortfall) โดยเฉพาะในช่วงปลายของแผน จำเป็นต้องปรับปรุงโครงสร้างการออม"}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-slate-700 ml-1">ข้อแนะนำเพิ่มเติม (Action Plan)</div>
                  <ul className="space-y-3">
                    {summary.totalMonthlySavingsCurrent < summary.totalMonthlyNeeded && (
                      <li className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm mb-0.5">เพิ่มการออมด่วน</div>
                          <div className="text-xs text-slate-500">
                            ควรพิจารณาออมเพิ่มรวมกันอีก <span className="font-bold text-amber-600">฿{formatNumber(summary.totalMonthlyNeeded - summary.totalMonthlySavingsCurrent)}</span> ต่อเดือน
                          </div>
                        </div>
                      </li>
                    )}
                    <li className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-white text-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm mb-0.5">จัดการความคุ้มครอง</div>
                        <div className="text-xs text-slate-500">ตรวจสอบสิทธิประโยชน์ทางภาษีและการประกันสุขภาพ</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right: Graphic */}
              <div className="bg-slate-50 rounded-[24px] p-8 border border-slate-200 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm mb-6">คะแนนความสำเร็จ (Success Score)</div>
                <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="45%" stroke="#cbd5e1" strokeWidth="12" fill="none" className="opacity-30" />
                    <circle cx="50%" cy="50%" r="45%" stroke={summary.totalGap >= 0 ? "#10b981" : "#f59e0b"} strokeWidth="12" fill="none"
                      strokeDasharray="283" strokeDashoffset={283 - (283 * (totalProgress / 100))} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">{totalProgress.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="w-full space-y-4 px-8">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>ออมจริง</span>
                      <span>฿{formatNumber(summary.totalMonthlySavingsCurrent)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.min(100, (summary.totalMonthlySavingsCurrent / summary.totalMonthlyNeeded) * 100)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-indigo-500 mb-1">
                      <span>เป้าหมาย</span>
                      <span>฿{formatNumber(summary.totalMonthlyNeeded)}</span>
                    </div>
                    <div className="h-2 w-full bg-indigo-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-full opacity-50"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MEMBER BREAKDOWN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-blue-500 bg-blue-50 p-1.5 rounded-lg border border-blue-100">👥</span>
                รายละเอียดรายบุคคล (Member Breakdown)
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddMember}
                className="rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2"
              >
                <Plus className="w-4 h-4" />
                เพิ่มสมาชิกใหม่
              </Button>
            </div>
            <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-4 px-6 w-[25%]">สมาชิก (Member)</th>
                    <th className="py-4 px-6 text-right w-[15%]">อีก (ปี) เกษียณ</th>
                    <th className="py-4 px-6 text-right w-[20%]">เป้าหมาย</th>
                    <th className="py-4 px-6 text-left w-[25%] pl-8">ความก้าวหน้า</th>
                    <th className="py-4 px-6 text-right w-[15%]">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {familyMembers.map((m) => {
                    const isCurrent = String(m.id) === String(currentMemberId);
                    const inputs = buildRetirementInputs({
                      form: isCurrent ? form : m.form,
                      gender: isCurrent ? gender : m.gender,
                      savingMode: isCurrent ? savingMode : m.savingMode,
                      returnMode: isCurrent ? returnMode : m.returnMode,
                      allocations: isCurrent ? allocations : m.allocations
                    });
                    const res = calculateRetirement(inputs);
                    const prog = Math.min(100, (res.projectedFund / (res.targetFund || 1)) * 100);
                    const yearsLeft = Number(m.form.retireAge) - Number(m.form.currentAge);
                    const relationMap: Record<string, string> = { self: "ตนเอง", spouse: "คู่สมรส", child: "บุตร", father: "บิดา", mother: "มารดา", relative: "ญาติ" };

                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group/row"
                        onClick={() => {
                          handleSwitchMember(m.id);
                          setShowFamilyResult(false);
                        }}
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover/row:scale-110 ${res.status === "enough" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {m.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-2">
                                {m.name}
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 opacity-0 group-hover/row:opacity-100 transition-all ml-1"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                              </div>
                              <div className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded inline-block">{relationMap[m.relation] || m.relation}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <span className="font-bold text-slate-700">{yearsLeft}</span> <span className="text-xs text-slate-400">ปี</span>
                        </td>
                        <td className="py-5 px-6 text-right font-bold text-slate-800">
                          ฿{formatNumber(res.targetFund)}
                        </td>
                        <td className="py-5 px-6 pl-8">
                          <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                            <div className={`h-2 rounded-full ${res.status === "enough" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${prog}%` }}></div>
                          </div>
                          <div className="text-[10px] text-slate-400 text-right">{prog.toFixed(0)}%</div>
                        </td>
                        <td className="py-5 px-6 text-right">
                          {res.status === "enough"
                            ? <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">เพียงพอ</span>
                            : <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">ขาด {formatNumber(Math.abs(res.gap))}</span>
                          }
                        </td>
                      </tr>
                    )
                  })}

                  {familyMembers.length < 10 && (
                    <tr
                      className="bg-slate-50/30 hover:bg-blue-50/50 transition-colors cursor-pointer border-t border-slate-100 group/add"
                      onClick={handleAddMember}
                    >
                      <td colSpan={5} className="py-4 px-6">
                        <div className="flex items-center justify-center gap-3 text-slate-400 font-bold group-hover/add:text-blue-600 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-lg group-hover/add:border-blue-200 group-hover/add:bg-blue-50 transition-all shadow-sm">+</div>
                          <span className="text-sm">เพิ่มสมาชิกคนถัดไป (Add next member)</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- STANDARD DASHBOARD ---
  // --- STANDARD DASHBOARD ---
  // --- STANDARD DASHBOARD ---

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* --- HEADER --- */}
      {/* --- HEADER --- */}
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-[100] bg-white/70 backdrop-blur-2xl border-b border-white/40 shadow-sm transition-all duration-300 print:hidden">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-6 lg:px-8">
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-indigo-900/20 group-hover:scale-105 transition-transform duration-300 ring-1 ring-black/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-none font-display">Retirement<span className="text-indigo-600">OS</span></span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5 ml-0.5">Financial Planner</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Add Member Button (Only if Room and Family Mode) */}
            {user && user.name !== "Guest" && planType === "family" && familyMembers.length < 10 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 rounded-xl px-4 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/50 hover:border-indigo-100 transition-all gap-2"
                onClick={handleAddMember}
              >
                <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 mb-[1px]">+</div>
                เพิ่มสมาชิก
              </Button>
            )}

            {/* View Family Overview Button (Top Header) */}
            {planType === "family" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 rounded-xl px-4 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/50 hover:border-indigo-100 transition-all gap-2"
                onClick={() => {
                  syncCurrentToFamily();
                  setShowFamilyResult(true);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                ดูภาพรวมครอบครัว
              </Button>
            )}

            {/* User Profile */}
            <div className={`flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl border border-white/50 bg-white/50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 cursor-default group/profile backdrop-blur-sm`}>
              <div className="flex flex-col items-end leading-none gap-0.5 pl-2">
                <span className="text-xs font-bold text-slate-700">{user.name}</span>
              </div>
              <div className="h-9 w-9 rounded-xl bg-slate-200 border-2 border-white shadow-sm overflow-hidden relative group-hover:scale-105 transition-transform">
                <Image src={heroImageSrc} alt="Profile" fill className="object-cover" />
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all active:scale-95"
                title="Log out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- FAMILY CONTROL BAR --- */}
      {user && familyMembers.length > 1 && (
        <div className="sticky top-16 z-[90] bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-md transition-all animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="w-full flex items-center justify-between px-6 py-3 gap-4 overflow-x-auto scrollbar-hide">

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <span className="text-xs font-bold text-slate-600">Family Members</span>
              </div>
              <div className="h-4 w-px bg-slate-300"></div>

              {/* Member List */}
              <div className="flex items-center gap-2">
                {familyMembers.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleSwitchMember(m.id)}
                    className={`
                      relative group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border text-xs font-bold transition-all duration-300
                      ${m.id === currentMemberId
                        ? "bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-900/20 scale-105"
                        : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                      }
                    `}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${m.id === currentMemberId ? "bg-white/20 border-white/20" : "bg-slate-100 border-slate-200 group-hover:bg-white"}`}>
                      <span className="mb-0.5">{m.id === "primary" ? "👑" : m.relation === "spouse" ? "💍" : m.relation === "child" ? "👶" : "👤"}</span>
                    </div>
                    {m.name}
                    {familyMembers.length > 1 && (
                      <span
                        onClick={(e) => { e.stopPropagation(); handleRemoveMember(m.id, e); }}
                        className={`ml-1.5 p-0.5 rounded-full hover:bg-white/20 transition-colors ${m.id === currentMemberId ? "text-slate-400 hover:text-white" : "text-slate-300 hover:text-rose-500 hover:bg-rose-50"}`}
                      >
                        <CloseIcon className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                ))}

                <button
                  onClick={handleAddMember}
                  className="group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold text-xs h-[34px]"
                  title="Add Member"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 text-slate-400 transition-colors">
                    <span className="text-sm leading-none mb-0.5">+</span>
                  </div>
                  Add
                </button>
              </div>
            </div>


          </div>
        </div>
      )}

      {/* --- CONTENT LAYOUT --- */}

      <div className={`flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden relative transition-all duration-500 ${!showResult ? "items-center justify-center p-4 lg:p-6" : ""}`}>

        {/* Background Decor (Persistent throughout app) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
          {/* Mesh Gradients (Light Theme) */}
          <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] bg-indigo-300/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] bg-purple-300/10 rounded-full blur-[80px] delay-1000 animate-pulse" />
          <div className="absolute top-[40%] left-[60%] w-[25vw] h-[25vw] bg-emerald-300/10 rounded-full blur-[60px] delay-500" />
          <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
        </div>

        {/* LEFT PANEL: INPUT FORM */}
        <aside className={`
          relative z-10 flex flex-col transition-all duration-700 ease-in-out bg-white/90 backdrop-blur-xl border border-white/60
          ${!showResult
            ? "w-full max-w-3xl mx-auto h-auto max-h-[85vh] rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] ring-1 ring-white/50 my-auto"
            : "w-full lg:w-[480px] xl:w-[500px] h-full shrink-0 shadow-xl lg:shadow-none bg-white border-r border-slate-100/60 z-50"
          }
        `}>
          {/* Wizard Header (Modern Stepper) */}
          <div className="flex-1 overflow-y-auto p-5 pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {/* Wizard Header (Modern Stepper) - MOVED INSIDE SCROLL VIEW */}
            <div className="bg-white/80 backdrop-blur-md rounded-[28px] p-6 border border-slate-100 shadow-sm mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">สร้างแผนเกษียณ</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">STEP {inputStep}</span>
                    {inputStep === 1 ? "ข้อมูลส่วนตัว" : inputStep === 2 ? "สุขภาพการเงิน" : "เป้าหมายเกษียณ"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <button
                        onClick={() => setInputStep(step)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${inputStep >= step ? "bg-indigo-600 ring-4 ring-indigo-50" : "bg-slate-200"}`}
                      />
                      {step < 3 && <div className={`w-12 h-0.5 rounded-full mx-1 transition-all duration-300 ${inputStep > step ? "bg-indigo-600" : "bg-slate-100"}`} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* ... (Input Cards) ... */}
            {/* ... Card อายุ ... */}
            {/* 1. PROFILE SECTION (Redesigned) */}
            {inputStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

                {/* Header Card: Identity (Collapsible) */}
                <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative z-30 group transition-all duration-300">
                  <div
                    className="flex items-center justify-between mb-2 relative z-10 w-full cursor-pointer"
                    onClick={() => setShowProfileCard(!showProfileCard)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-100 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg tracking-tight">ข้อมูลส่วนตัว</h3>
                        <p className="text-sm text-slate-400 font-medium">ระบุเพศและสถานะสมาชิก</p>
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors">
                      <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${showProfileCard ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  <div className={`relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center transition-all duration-500 ease-in-out ${showProfileCard ? "opacity-100 max-h-[1000px] mt-4" : "opacity-0 max-h-0 overflow-hidden"}`}>
                    <div className="md:col-span-8 space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Gender Selection */}
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-slate-600 pl-1 uppercase tracking-wider">เพศสภาพ (Gender)</Label>
                          <div className="flex bg-slate-100/50 p-2 rounded-2xl border border-slate-200 shadow-inner">
                            {["male", "female"].map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setGender(g as any)}
                                className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 ${gender === g
                                  ? g === "male"
                                    ? "bg-white text-indigo-600 shadow-md ring-1 ring-indigo-50"
                                    : "bg-white text-rose-500 shadow-md ring-1 ring-rose-50"
                                  : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                  }`}
                              >
                                {g === "male" ? "♂️ ชาย" : "♀️ หญิง"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Relationship Selection */}
                        {currentMemberId !== "primary" && (
                          <div className="space-y-2 relative z-50">
                            <Label className="text-xs font-semibold text-slate-600 pl-1 uppercase tracking-wider">สถานะกับหัวหน้าครอบครัว</Label>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setIsRelationOpen(!isRelationOpen)}
                                className={`w-full h-14 flex items-center justify-between px-5 bg-white border rounded-2xl transition-all duration-300 ${isRelationOpen
                                  ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-md"
                                  : "border-slate-200 hover:border-indigo-300 hover:shadow-sm shadow-sm"
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">
                                    {relation === "spouse" ? "💍" : relation === "child" ? "👶" : relation === "father" ? "👴" : relation === "mother" ? "👵" : "🤝"}
                                  </span>
                                  <span className={`text-base font-bold ${relation ? "text-slate-700" : "text-slate-400"}`}>
                                    {relation === "spouse" ? "คู่สมรส (Spouse)" :
                                      relation === "child" ? "บุตร (Child)" :
                                        relation === "father" ? "บิดา (Father)" :
                                          relation === "mother" ? "มารดา (Mother)" :
                                            "ญาติ/อื่นๆ (Other)"}
                                  </span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isRelationOpen ? "rotate-180 text-indigo-500" : ""}`} />
                              </button>

                              {isRelationOpen && (
                                <>
                                  <div className="fixed inset-0 z-[90]" onClick={() => setIsRelationOpen(false)} />
                                  <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-slate-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2">
                                    {[
                                      { val: "spouse", label: "คู่สมรส (Spouse)", icon: "💍" },
                                      { val: "child", label: "บุตร (Child)", icon: "👶" },
                                      { val: "father", label: "บิดา (Father)", icon: "👴" },
                                      { val: "mother", label: "มารดา (Mother)", icon: "👵" },
                                      { val: "relative", label: "ญาติ/อื่นๆ (Other)", icon: "🤝" },
                                    ].map((opt) => (
                                      <button
                                        key={opt.val}
                                        type="button"
                                        onClick={() => {
                                          setRelation(opt.val as any);
                                          setIsRelationOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left group ${relation === opt.val ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-600"
                                          }`}
                                      >
                                        <span className="text-xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                                        <span className="text-base font-bold">{opt.label}</span>
                                        {relation === opt.val && <div className="ml-auto w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Profile Picture (Right Side) */}
                    <div className="md:col-span-4 flex justify-center py-4">
                      <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-slate-50 border-4 border-white shadow-2xl shadow-indigo-200/50 overflow-hidden relative hover:scale-105 transition-transform duration-500 ring-8 ring-indigo-50/30">
                        <Image src={currentMemberId === "primary" ? (gender === "female" ? "/images/retirement/6.png" : "/images/retirement/5.png") : (familyMembers.find(m => String(m.id) === currentMemberId)?.gender === "female" ? "/images/retirement/6.png" : "/images/retirement/5.png")} alt="Profile" fill className="object-cover" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative z-20 overflow-hidden group transition-all duration-300">
                  <div
                    className="flex items-center justify-between mb-4 relative z-10 w-full cursor-pointer"
                    onClick={() => setShowAgeCard(!showAgeCard)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm ring-1 ring-emerald-100 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg tracking-tight">อายุ (Age Timeline)</h3>
                        <p className="text-sm text-slate-400 font-medium">กำหนดช่วงเวลาสำคัญของชีวิต</p>
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors">
                      <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${showAgeCard ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {/* Collapsible Content */}
                  <div className={`relative z-10 grid gap-6 md:grid-cols-3 transition-all duration-500 ease-in-out ${showAgeCard ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0 overflow-hidden"}`}>

                    {/* Current Age */}
                    <div className="bg-slate-50/50 rounded-[20px] p-5 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group/item">
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-sm font-bold text-slate-500">อายุปัจจุบัน</Label>
                        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-slate-800 transition-colors"></div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <button onClick={changeBy("currentAge", -1)} className="w-12 h-12 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-slate-300 hover:text-slate-600 hover:shadow-sm flex items-center justify-center transition-all active:scale-95"><Minus className="w-5 h-5" strokeWidth={3} /></button>
                        <div className="flex-1 flex flex-col items-center">
                          <NumericInput
                            className="h-16 w-full text-center text-5xl font-black bg-transparent border-none p-0 focus:ring-0 text-slate-800 leading-none placeholder:text-slate-200 tracking-tighter"
                            value={form.currentAge}
                            onChange={(v) => setForm(prev => ({ ...prev, currentAge: v }))}
                          />
                          <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Years Old</span>
                        </div>
                        <button onClick={changeBy("currentAge", 1)} className="w-12 h-12 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-slate-300 hover:text-slate-600 hover:shadow-sm flex items-center justify-center transition-all active:scale-95"><Plus className="w-5 h-5" strokeWidth={3} /></button>
                      </div>
                    </div>

                    {/* Retire Age */}
                    <div className="bg-indigo-50/30 rounded-[20px] p-5 border border-indigo-100 hover:border-indigo-300 hover:bg-white hover:shadow-lg hover:shadow-indigo-200/50 transition-all duration-300 group/item">
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-sm font-bold text-indigo-500">เกษียณที่อายุ</Label>
                        <div className="w-2 h-2 rounded-full bg-indigo-300 group-hover:bg-indigo-600 transition-colors"></div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <button onClick={changeBy("retireAge", -1)} className="w-12 h-12 rounded-2xl bg-white text-indigo-300 border border-indigo-100 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm flex items-center justify-center transition-all active:scale-95"><Minus className="w-5 h-5" strokeWidth={3} /></button>
                        <div className="flex-1 flex flex-col items-center">
                          <NumericInput
                            className="h-16 w-full text-center text-5xl font-black bg-transparent border-none p-0 focus:ring-0 text-indigo-600 leading-none placeholder:text-indigo-200 tracking-tighter"
                            value={form.retireAge}
                            onChange={(v) => setForm(prev => ({ ...prev, retireAge: v }))}
                          />
                          <span className="text-xs font-bold text-indigo-400 mt-1 uppercase tracking-widest">Retire Age</span>
                        </div>
                        <button onClick={changeBy("retireAge", 1)} className="w-12 h-12 rounded-2xl bg-white text-indigo-300 border border-indigo-100 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm flex items-center justify-center transition-all active:scale-95"><Plus className="w-5 h-5" strokeWidth={3} /></button>
                      </div>
                    </div>

                    {/* Life Expectancy */}
                    <div className="bg-slate-50/50 rounded-[20px] p-5 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group/item">
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-sm font-bold text-slate-500">อายุขัย (อยู่ถึง)</Label>
                        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-slate-800 transition-colors"></div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <button onClick={changeBy("lifeExpectancy", -1)} className="w-12 h-12 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-slate-300 hover:text-slate-600 hover:shadow-sm flex items-center justify-center transition-all active:scale-95"><Minus className="w-5 h-5" strokeWidth={3} /></button>
                        <div className="flex-1 flex flex-col items-center">
                          <NumericInput
                            className="h-16 w-full text-center text-5xl font-black bg-transparent border-none p-0 focus:ring-0 text-slate-500 leading-none placeholder:text-slate-200 tracking-tighter"
                            value={form.lifeExpectancy}
                            onChange={(v) => setForm(prev => ({ ...prev, lifeExpectancy: v }))}
                          />
                          <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Until Age</span>
                        </div>
                        <button onClick={changeBy("lifeExpectancy", 1)} className="w-12 h-12 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-slate-300 hover:text-slate-600 hover:shadow-sm flex items-center justify-center transition-all active:scale-95"><Plus className="w-5 h-5" strokeWidth={3} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* ... Card ปัจจุบัน ... */}
            {/* 2. FINANCIALS SECTION (Redesigned) */}
            {inputStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                {/* Wealth Status Card (Financials) */}
                <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group transition-all duration-300">
                  <div
                    className="flex items-center justify-between mb-2 relative z-10 w-full cursor-pointer"
                    onClick={() => setShowFinancialCard(!showFinancialCard)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm ring-1 ring-emerald-100 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg tracking-tight">สถานะการเงิน (Financial Status)</h3>
                        <p className="text-sm text-slate-400 font-medium">ระบุเงินออมและแผนการออมปัจจุบัน {savingMode === "step5" ? "(ปรับเพิ่มทุก 5 ปี)" : "(ออมคงที่)"}</p>
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors">
                      <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${showFinancialCard ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  <div className={`relative z-10 transition-all duration-500 ease-in-out ${showFinancialCard ? "opacity-100 max-h-[1200px] mt-6" : "opacity-0 max-h-0 overflow-hidden"}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Current Savings */}
                      <div className="bg-slate-50/50 rounded-[24px] p-6 border border-slate-200 hover:border-emerald-300 hover:bg-white hover:shadow-xl transition-all duration-300 group/item">
                        <div className="flex justify-between items-center mb-4">
                          <Label className="text-sm font-bold text-slate-500 uppercase tracking-wider">เงินออมที่มีอยู่แล้ว</Label>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={changeBy("currentSavings", -50000)} className="w-14 h-14 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-emerald-200 hover:text-emerald-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"><Minus className="w-6 h-6" strokeWidth={3} /></button>
                          <div className="flex-1 flex flex-col items-center">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-slate-300">฿</span>
                              <NumericInput
                                className="h-16 w-full text-center text-5xl font-black bg-transparent border-none p-0 focus:ring-0 text-slate-800 leading-none placeholder:text-slate-200 tracking-tighter"
                                value={form.currentSavings}
                                onChange={(v) => setForm(prev => ({ ...prev, currentSavings: v }))}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Current Savings</span>
                          </div>
                          <button onClick={changeBy("currentSavings", 50000)} className="w-14 h-14 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-emerald-200 hover:text-emerald-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"><Plus className="w-6 h-6" strokeWidth={3} /></button>
                        </div>
                        <input
                          type="range"
                          min="0" max="20000000" step="50000"
                          value={Number(String(form.currentSavings).replace(/,/g, ""))}
                          onChange={(e) => setForm(prev => ({ ...prev, currentSavings: formatInputDisplay(e.target.value) }))}
                          className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600 transition-all mt-8"
                        />
                      </div>

                      {/* Monthly Savings */}
                      <div className="bg-slate-50/50 rounded-[24px] p-6 border border-slate-200 hover:border-emerald-300 hover:bg-white hover:shadow-xl transition-all duration-300 group/item">
                        <div className="flex justify-between items-center mb-4">
                          <Label className="text-sm font-bold text-slate-500 uppercase tracking-wider">ออมเพิ่มต่อเดือน</Label>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={changeBy("monthlySaving", -1000)} className="w-14 h-14 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-emerald-200 hover:text-emerald-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"><Minus className="w-6 h-6" strokeWidth={3} /></button>
                          <div className="flex-1 flex flex-col items-center">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-slate-300">฿</span>
                              <NumericInput
                                className="h-16 w-full text-center text-5xl font-black bg-transparent border-none p-0 focus:ring-0 text-slate-800 leading-none placeholder:text-slate-200 tracking-tighter"
                                value={form.monthlySaving}
                                onChange={(v) => setForm(prev => ({ ...prev, monthlySaving: v }))}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Monthly Contribution</span>
                          </div>
                          <button onClick={changeBy("monthlySaving", 1000)} className="w-14 h-14 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-emerald-200 hover:text-emerald-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"><Plus className="w-6 h-6" strokeWidth={3} /></button>
                        </div>
                        <input
                          type="range"
                          min="0" max="500000" step="1000"
                          value={Number(String(form.monthlySaving).replace(/,/g, ""))}
                          onChange={(e) => setForm(prev => ({ ...prev, monthlySaving: formatInputDisplay(e.target.value) }))}
                          className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600 transition-all mt-8"
                        />
                      </div>
                    </div>

                    {/* Saving Mode Toggle */}
                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] block mb-4 text-center">รูปแบบการออม</Label>
                      <div className="flex bg-slate-100 p-2 rounded-2xl border border-slate-200 shadow-inner max-w-lg mx-auto mb-8">
                        <button onClick={() => setSavingMode("flat")} className={`flex-1 py-3.5 text-base font-bold rounded-xl transition-all ${savingMode === "flat" ? "bg-white text-slate-800 shadow-md ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"}`}>ออมเท่าเดิมตลอด</button>
                        <button onClick={() => setSavingMode("step5")} className={`flex-1 py-3.5 text-base font-bold rounded-xl transition-all ${savingMode === "step5" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 font-black" : "text-slate-400 hover:text-slate-600"}`}>ปรับเพิ่มทุก 5 ปี</button>
                      </div>

                      {savingMode === "step5" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                          {[{ label: "เริ่มที่อายุ 35 (฿)", key: "savingAt35" as const }, { label: "เริ่มที่อายุ 40 (฿)", key: "savingAt40" as const }, { label: "เริ่มที่อายุ 45 (฿)", key: "savingAt45" as const }].map((row) => (
                            <div key={row.key} className="bg-white rounded-[24px] border border-slate-200 p-6 text-center shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group/subitem">
                              <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3 group-hover/subitem:text-emerald-500 transition-colors">{row.label}</div>
                              <NumericInput className="h-12 w-full text-center text-3xl font-black border-none bg-emerald-50/20 rounded-2xl p-0 text-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all" value={form[row.key]} onChange={(v) => setForm(prev => ({ ...prev, [row.key]: v }))} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Investment Strategy Card (Collapsible) */}
                <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group transition-all duration-300">
                  <div
                    className="flex items-center justify-between mb-2 relative z-10 w-full cursor-pointer"
                    onClick={() => setShowStrategyCard(!showStrategyCard)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 shadow-sm ring-1 ring-violet-100 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg tracking-tight">กลยุทธ์การลงทุน (Strategy)</h3>
                        <p className="text-sm text-slate-400 font-medium">ระบุผลตอบแทนที่คาดหวังและเงินเฟ้อ</p>
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors">
                      <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${showStrategyCard ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  <div className={`relative z-10 transition-all duration-500 ease-in-out ${showStrategyCard ? "opacity-100 max-h-[1500px] mt-6" : "opacity-0 max-h-0 overflow-hidden"}`}>
                    <div className="space-y-8">
                      {/* Expected Return Section */}
                      <div className="bg-slate-50/50 rounded-[28px] p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <Label className="text-sm font-bold text-slate-500 uppercase tracking-wider">ผลตอบแทนคาดหวัง (% ต่อปี)</Label>
                            <p className="text-xs text-slate-400 font-medium mt-1">Expected Annual Return</p>
                          </div>

                          {returnMode === 'avg' && (
                            <div className="flex items-center gap-3 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
                              <button onClick={changeBy("expectedReturn", -0.5)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-violet-50 hover:text-violet-600 transition-all"><Minus className="w-4 h-4" strokeWidth={3} /></button>
                              <div className="flex items-center justify-center min-w-[4rem]">
                                <NumericInput
                                  className="w-12 h-10 bg-transparent border-none p-0 text-center text-2xl font-black focus:ring-0 text-slate-800 leading-none"
                                  value={form.expectedReturn}
                                  onChange={(v) => setForm(prev => ({ ...prev, expectedReturn: v }))}
                                />
                                <span className="text-sm font-bold text-slate-400 ml-1">%</span>
                              </div>
                              <button onClick={changeBy("expectedReturn", 0.5)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-violet-50 hover:text-violet-600 transition-all"><Plus className="w-4 h-4" strokeWidth={3} /></button>
                            </div>
                          )}
                        </div>

                        <div className="flex bg-slate-200/50 p-2 rounded-2xl border border-slate-200 shadow-inner max-w-md mx-auto mb-8">
                          <button onClick={() => setReturnMode("avg")} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${returnMode === "avg" ? "bg-white text-slate-800 shadow-md ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"}`}>ค่าเฉลี่ยรวม</button>
                          <button onClick={() => setReturnMode("custom")} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${returnMode === "custom" ? "bg-violet-600 text-white shadow-lg shadow-violet-200" : "text-slate-400 hover:text-slate-600"}`}>จัดพอร์ตเอง</button>
                        </div>

                        {returnMode === "custom" && (
                          <div className="bg-white rounded-[24px] border border-slate-200 p-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                            <div className="flex justify-between items-center mb-4 px-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-6 bg-violet-500 rounded-full"></span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">สินทรัพย์ (Asset Allocation)</span>
                              </div>
                              <button onClick={addAllocation} className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full hover:bg-violet-100 transition-colors">+ เพิ่มสินทรัพย์</button>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                              {allocations.map((a) => (
                                <div key={a.id} className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-violet-200 transition-all group/row">
                                  <div className="flex-1 w-full">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1.5 block">Asset Name</Label>
                                    <input className="w-full text-base font-bold bg-white px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all text-slate-700" placeholder="ชื่อสินทรัพย์" value={a.name} onChange={updateAllocation(a.id, "name")} />
                                  </div>
                                  <div className="w-full md:w-24">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1.5 block">สัดส่วน (%)</Label>
                                    <NumericInput className="w-full text-base font-black bg-white px-3 py-2 rounded-xl border border-slate-200 text-center text-slate-800 focus:ring-2 focus:ring-violet-200" value={a.weight} onChange={(v) => setAllocations(prev => prev.map(item => item.id === a.id ? { ...item, weight: v } : item))} />
                                  </div>
                                  <div className="w-full md:w-24">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1.5 block">Ret (%)</Label>
                                    <NumericInput className="w-full text-base font-black bg-emerald-50 px-3 py-2 rounded-xl border-none text-center text-emerald-700 focus:ring-2 focus:ring-emerald-200" value={a.expectedReturn} onChange={(v) => setAllocations(prev => prev.map(item => item.id === a.id ? { ...item, expectedReturn: v } : item))} />
                                  </div>
                                  <button onClick={() => removeAllocation(a.id)} className="w-10 h-10 shrink-0 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all md:mt-5"><X className="w-5 h-5" /></button>
                                </div>
                              ))}
                            </div>

                            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center px-6">
                              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">สัดส่วนรวม (Total)</span>
                              <span className={`text-xl font-black ${allocations.reduce((sum, a) => sum + Number(a.weight || 0), 0) === 100 ? "text-emerald-600" : "text-rose-500"}`}>
                                {allocations.reduce((sum, a) => sum + Number(a.weight || 0), 0)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Inflation Hero */}
                      <div className="bg-slate-50/50 rounded-[28px] p-6 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                            <TrendingUp className="w-8 h-8" />
                          </div>
                          <div>
                            <Label className="text-sm font-black text-slate-800 uppercase tracking-wider block">อัตราเงินเฟ้อที่คาดไว้</Label>
                            <p className="text-xs text-slate-400 font-medium">Annual Inflation Rate (%)</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white rounded-[24px] p-2 shadow-sm border border-slate-100">
                          <button onClick={changeBy("inflation", -0.5)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"><Minus className="w-5 h-5" strokeWidth={3} /></button>
                          <div className="flex items-baseline justify-center min-w-[5rem]">
                            <NumericInput
                              className="w-14 h-12 bg-transparent border-none p-0 text-center text-3xl font-black focus:ring-0 text-slate-800 leading-none"
                              value={form.inflation}
                              onChange={(v) => setForm(prev => ({ ...prev, inflation: v }))}
                            />
                            <span className="text-base font-bold text-slate-300 ml-1">%</span>
                          </div>
                          <button onClick={changeBy("inflation", 0.5)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"><Plus className="w-5 h-5" strokeWidth={3} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



                {/* Insurance Plans Card (Collapsible) */}
                <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group transition-all duration-300">
                  <div
                    className="flex items-center justify-between mb-2 relative z-10 w-full cursor-pointer"
                    onClick={() => setShowInsuranceCard(!showInsuranceCard)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm ring-1 ring-blue-100 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg tracking-tight">ประกันชีวิต (Insurance Plans)</h3>
                        <p className="text-sm text-slate-400 font-medium">จัดการความคุ้มครองและเงินคืน</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); addInsurancePlan(); }}
                        className="h-9 px-4 rounded-xl bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 font-bold text-xs gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Plus className="w-3 h-3" strokeWidth={3} /> เพิ่มประกัน
                      </Button>
                      <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${showInsuranceCard ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <div className={`relative z-10 transition-all duration-500 ease-in-out ${showInsuranceCard ? "opacity-100 max-h-[5000px] mt-6" : "opacity-0 max-h-0 overflow-hidden"}`}>
                    <div className="flex items-center justify-between mb-6 px-1">
                      <h4 className="font-black text-slate-800 text-base uppercase tracking-widest">รายการกรมธรรม์ ({form.insurancePlans.length})</h4>
                      {form.insurancePlans.length > 0 && (
                        <button
                          onClick={() => setForm(prev => ({
                            ...prev,
                            insurancePlans: prev.insurancePlans.map(p => ({ ...p, expanded: false }))
                          }))}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg"
                        >
                          ย่อทั้งหมด
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {form.insurancePlans.map((plan, index) => (
                        <div key={plan.id} className="bg-slate-50/50 rounded-[24px] border border-slate-200 p-5 space-y-5 transition-all relative">
                          {/* Section 1: Plan Name & Type */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-500 pl-1">ชื่อแผน</Label>
                              <Input
                                className="h-11 bg-white border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
                                value={plan.planName}
                                onChange={(e) => updateInsurancePlan(index, "planName", e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-500 pl-1">ประเภท</Label>
                              <select
                                className="h-11 w-full bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                                value={plan.type}
                                onChange={(e) => updateInsurancePlan(index, "type", e.target.value)}
                              >
                                <option value="สะสมทรัพย์">สะสมทรัพย์</option>
                                <option value="บำนาญ">บำนาญ</option>
                                <option value="ตลอดชีพ">ตลอดชีพ</option>
                                <option value="ชั่วระยะเวลา">ประกันชั่วระยะเวลา</option>
                                <option value="Unit Linked">Unit Linked</option>
                              </select>
                            </div>
                          </div>

                          {/* Section 2: Universal Fields (Coverage & Sum Assured) */}
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-500 pl-1">คุ้มครองถึงอายุ</Label>
                              <div className="flex items-center gap-3">
                                <NumericInput
                                  className="h-11 bg-white border-slate-200 rounded-xl text-center text-sm font-bold"
                                  value={plan.coverageAge}
                                  onChange={(v) => updateInsurancePlan(index, "coverageAge", v)}
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => changeInsuranceBy(index, "coverageAge", -1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all shadow-sm font-bold text-xl">-</button>
                                  <button onClick={() => changeInsuranceBy(index, "coverageAge", 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all shadow-sm font-bold text-xl">+</button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-500 pl-1">ทุนประกัน</Label>
                              <div className="flex items-center gap-3">
                                <NumericInput
                                  className="h-11 bg-white border-slate-200 rounded-xl text-center text-sm font-bold"
                                  value={plan.sumAssured}
                                  onChange={(v) => updateInsurancePlan(index, "sumAssured", v)}
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => changeInsuranceBy(index, "sumAssured", -100000)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all shadow-sm font-bold text-xl">-</button>
                                  <button onClick={() => changeInsuranceBy(index, "sumAssured", 100000)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all shadow-sm font-bold text-xl">+</button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Section 3: Surrender Logic (Checkbox) */}
                          {plan.type !== "ชั่วระยะเวลา" && (
                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  checked={plan.useSurrender}
                                  onChange={(e) => updateInsurancePlan(index, "useSurrender", e.target.checked)}
                                />
                                <span className="text-sm font-bold text-slate-800">เวนคืนประกัน</span>
                              </label>

                              {plan.useSurrender && (
                                <div className="mt-4 space-y-4 pl-7 border-l-2 border-blue-50">
                                  <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                                    <button
                                      onClick={() => updateInsurancePlan(index, "surrenderMode", "single")}
                                      className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${plan.surrenderMode === "single" || !plan.surrenderMode ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                      ยอดเดียว
                                    </button>
                                    <button
                                      onClick={() => updateInsurancePlan(index, "surrenderMode", "table")}
                                      className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${plan.surrenderMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                      ตารางรายปี
                                    </button>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label className="text-[11px] font-bold text-slate-400">เวนคืนตอนอายุ</Label>
                                      <div className="flex items-center gap-2">
                                        <NumericInput className="h-9 w-20 bg-slate-50 text-center text-xs font-bold" value={plan.surrenderAge} onChange={(v) => updateInsurancePlan(index, "surrenderAge", v)} />
                                        <div className="flex gap-1">
                                          <button onClick={() => changeInsuranceBy(index, "surrenderAge", -1)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 font-bold text-sm">-</button>
                                          <button onClick={() => changeInsuranceBy(index, "surrenderAge", 1)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 font-bold text-sm">+</button>
                                        </div>
                                      </div>
                                    </div>

                                    {(plan.surrenderMode === "single" || !plan.surrenderMode) ? (
                                      <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-slate-400">มูลค่าเวนคืน</Label>
                                        <NumericInput className="h-9 bg-slate-50 font-bold text-xs" value={plan.surrenderValue} onChange={(v) => updateInsurancePlan(index, "surrenderValue", v)} />
                                      </div>
                                    ) : (
                                      <div className="py-2">
                                        <Button
                                          size="sm"
                                          className="h-9 w-full rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-bold text-xs hover:bg-blue-100 transition-all gap-2"
                                          onClick={() => {
                                            setForm(prev => ({ ...prev, selectedPlanId: plan.id }));
                                            setShowInsuranceTable(true);
                                          }}
                                        >
                                          <TableIcon className="w-4 h-4" />
                                          กรอกตารางเวนคืนรายปี
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Section 4: Type Specific Fields */}
                          <div className="space-y-5">
                            {plan.type === "สะสมทรัพย์" && (
                              <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 pl-1">ผลประโยชน์เมื่อครบกำหนด</Label>
                                <div className="flex items-center gap-3">
                                  <NumericInput
                                    className="h-11 bg-white border-slate-200 rounded-xl text-center text-sm font-bold"
                                    value={plan.maturityAmount}
                                    onChange={(v) => updateInsurancePlan(index, "maturityAmount", v)}
                                  />
                                  <div className="flex gap-2">
                                    <button onClick={() => changeInsuranceBy(index, "maturityAmount", -100000)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all font-bold text-xl">-</button>
                                    <button onClick={() => changeInsuranceBy(index, "maturityAmount", 100000)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all font-bold text-xl">+</button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {plan.type === "บำนาญ" && (
                              <div className="space-y-5">
                                <div className="space-y-2">
                                  <Label className="text-xs font-bold text-slate-500 pl-1">ผลประโยชน์เมื่อเสียชีวิต (ก่อนอายุรับบำนาญ)</Label>
                                  <div className="flex items-center gap-3">
                                    <NumericInput
                                      className="h-11 bg-white border-slate-200 rounded-xl text-center text-sm font-bold"
                                      value={plan.deathBenefitPrePension}
                                      onChange={(v) => updateInsurancePlan(index, "deathBenefitPrePension", v)}
                                    />
                                    <div className="flex gap-2">
                                      <button onClick={() => changeInsuranceBy(index, "deathBenefitPrePension", -100000)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xl">-</button>
                                      <button onClick={() => changeInsuranceBy(index, "deathBenefitPrePension", 100000)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xl">+</button>
                                    </div>
                                  </div>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer bg-white p-4 rounded-xl border border-slate-200">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    checked={plan.unequalPension}
                                    onChange={(e) => updateInsurancePlan(index, "unequalPension", e.target.checked)}
                                  />
                                  <span className="text-sm font-bold text-slate-800">ได้รับเงินเป็นช่วงไม่เท่ากัน</span>
                                </label>

                                {!plan.unequalPension && (
                                  <>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 pl-1">เริ่มรับบำนาญ</Label>
                                        <div className="flex items-center gap-3">
                                          <NumericInput
                                            className="h-11 bg-white border-slate-200 rounded-xl text-center text-sm font-bold"
                                            value={plan.pensionStartAge}
                                            onChange={(v) => updateInsurancePlan(index, "pensionStartAge", v)}
                                          />
                                          <div className="flex gap-2">
                                            <button onClick={() => changeInsuranceBy(index, "pensionStartAge", -1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xl">-</button>
                                            <button onClick={() => changeInsuranceBy(index, "pensionStartAge", 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xl">+</button>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 pl-1">สิ้นสุดรับบำนาญ</Label>
                                        <div className="flex items-center gap-3">
                                          <NumericInput
                                            className="h-11 bg-white border-slate-200 rounded-xl text-center text-sm font-bold"
                                            value={plan.pensionEndAge}
                                            onChange={(v) => updateInsurancePlan(index, "pensionEndAge", v)}
                                          />
                                          <div className="flex gap-2">
                                            <button onClick={() => changeInsuranceBy(index, "pensionEndAge", -1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xl">-</button>
                                            <button onClick={() => changeInsuranceBy(index, "pensionEndAge", 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xl">+</button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs font-bold text-slate-500 pl-1">บำนาญ % ของเงินทุน</Label>
                                      <div className="flex items-center gap-3">
                                        <NumericInput
                                          className="h-11 bg-white border-slate-200 rounded-xl text-center text-sm font-bold"
                                          value={plan.pensionPercent}
                                          onChange={(v) => updateInsurancePlan(index, "pensionPercent", v)}
                                        />
                                        <div className="flex gap-2">
                                          <button onClick={() => changeInsuranceBy(index, "pensionPercent", -1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xl">-</button>
                                          <button onClick={() => changeInsuranceBy(index, "pensionPercent", 1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xl">+</button>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Section 5: Plan Card Footer (Actions) */}
                          <div className="flex items-center justify-between pt-4 gap-3">
                            <button
                              onClick={() => removeInsurancePlan(plan.id)}
                              className="h-10 px-6 rounded-xl bg-rose-100 text-rose-600 font-bold text-xs hover:bg-rose-200 transition-all flex items-center justify-center"
                            >
                              ลบ
                            </button>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateInsurancePlan(index, "expanded", false)}
                                className="h-10 px-6 rounded-xl bg-amber-100 text-amber-600 font-bold text-xs hover:bg-amber-200 transition-all flex items-center justify-center"
                              >
                                ย่อ
                              </button>
                              <button
                                onClick={() => updateInsurancePlan(index, "showTable", !plan.showTable)}
                                className="h-10 px-6 rounded-xl bg-blue-100 text-blue-600 font-bold text-xs hover:bg-blue-200 transition-all flex items-center justify-center"
                              >
                                ดูตาราง
                              </button>
                            </div>
                          </div>

                          {/* Inline Table (Conditionally Rendered) */}
                          {plan.showTable && (
                            <div className="mt-4 bg-white rounded-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                <h4 className="text-xs font-bold text-slate-700">ตารางผลประโยชน์รายปี</h4>
                              </div>
                              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                                    <tr>
                                      <th className="p-3">อายุ</th>
                                      <th className="p-3 text-right">เงินคืน</th>
                                      <th className="p-3 text-right">ทุนประกัน</th>
                                      <th className="p-3">รายละเอียด</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {Array.from({ length: 110 - Number(String(form.currentAge).replace(/,/g, "")) + 1 }, (_, i) => Number(String(form.currentAge).replace(/,/g, "")) + i).map(age => {
                                      const benefit = calculateDeathBenefitAtAge(plan, age);

                                      // Local flow calculation for this specific plan
                                      let flow = 0;
                                      if (plan.type === "สะสมทรัพย์") {
                                        const coverageAge = Number(plan.coverageAge);
                                        if (age === coverageAge) flow += Number(String(plan.maturityAmount).replace(/,/g, ""));
                                        const policyYear = age - Number(String(form.currentAge).replace(/,/g, ""));
                                        if (policyYear > 0 && policyYear % (Number(plan.cashBackFrequency) || 1) === 0 && age <= coverageAge) {
                                          flow += Number(String(plan.cashBackAmount).replace(/,/g, ""));
                                        }
                                      } else if (plan.type === "บำนาญ") {
                                        if (plan.unequalPension && plan.pensionTiers) {
                                          const tier = plan.pensionTiers.find(t => age >= Number(t.startAge) && age <= Number(t.endAge));
                                          if (tier) flow = Number(String(tier.amount).replace(/,/g, ""));
                                        } else {
                                          const start = Number(plan.pensionStartAge);
                                          const end = Number(plan.pensionEndAge) || 100;
                                          if (age >= start && age <= end) {
                                            let pAmt = Number(String(plan.pensionAmount).replace(/,/g, ""));
                                            if (Number(plan.pensionPercent) > 0) pAmt = (Number(String(plan.sumAssured).replace(/,/g, "")) * Number(plan.pensionPercent)) / 100;
                                            flow = pAmt;
                                          }
                                        }
                                      }

                                      // Status Logic
                                      const coverageAge = Number(plan.coverageAge);
                                      let status = "-";
                                      if (age > coverageAge) {
                                        if (age === coverageAge + 1) status = "ตายแล้ว";
                                        else return null;
                                      } else {
                                        if (plan.type === "บำนาญ") {
                                          const pStart = Number(plan.pensionStartAge);
                                          if (age === coverageAge) status = "เสียชีวิต แต่ไม่ได้รับเงินประกัน";
                                          else if (age < pStart) status = "คุ้มครอง";
                                          else if (benefit > 0) status = "เงินบำนาญ | คุ้มครอง";
                                          else status = "เงินบำนาญ";
                                        } else {
                                          status = benefit > 0 ? "คุ้มครอง" : "-";
                                        }
                                      }

                                      if (benefit <= 0 && flow <= 0 && age > coverageAge) return null;

                                      return (
                                        <tr key={age} className={`hover:bg-slate-50 ${age === coverageAge && plan.type === "บำนาญ" ? "bg-rose-50/50" : ""}`}>
                                          <td className="p-3 font-mono font-bold text-slate-800">{age}</td>
                                          <td className="p-3 text-right text-emerald-600 font-bold">
                                            {flow > 0 ? `+${formatNumber(flow)}` : "-"}
                                          </td>
                                          <td className="p-3 text-right text-slate-600 font-bold">
                                            {benefit > 0 ? formatNumber(benefit) : "-"}
                                          </td>
                                          <td className={`p-3 font-medium ${age === coverageAge && plan.type === "บำนาญ" ? "text-rose-600" : "text-slate-500"}`}>
                                            {status}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                    </div>
                  </div>



                </div>
              </div>
            )}

            {/* 3. RETIREMENT GOAL SECTION (Redesigned) */}
            {inputStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">

                {/* Retirement Goal Card (Collapsible) */}
                <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group transition-all duration-300">
                  <div
                    className="flex items-center justify-between mb-2 relative z-10 w-full cursor-pointer"
                    onClick={() => setShowGoalCard(!showGoalCard)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm ring-1 ring-orange-100 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /><path d="M12 21v2" /><path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" /><path d="M1 12h2" /><path d="M21 12h2" /><path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg tracking-tight">เป้าหมายเกษียณ (Retirement Goal)</h3>
                        <p className="text-sm text-slate-400 font-medium">กำหนดค่าใช้จ่ายและเงินมรดก</p>
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors">
                      <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${showGoalCard ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  <div className={`relative z-10 transition-all duration-500 ease-in-out ${showGoalCard ? "opacity-100 max-h-[3000px] mt-6" : "opacity-0 max-h-0 overflow-hidden"}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Monthly Post-Retire Spending */}
                      <div className="bg-orange-50/30 rounded-[28px] p-6 border border-orange-100 hover:bg-white hover:shadow-xl transition-all duration-300 group/item">
                        <div className="flex justify-between items-center mb-4">
                          <Label className="text-sm font-black text-orange-600 uppercase tracking-wider">รายจ่ายหลังเกษียณ / เดือน</Label>
                          <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(251,146,60,0.6)]"></div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={changeBy("retireExtraExpense", -1000)} className="w-14 h-14 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-orange-200 hover:text-orange-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"><Minus className="w-6 h-6" strokeWidth={3} /></button>
                          <div className="flex-1 flex flex-col items-center">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-slate-300">฿</span>
                              <NumericInput
                                className="h-16 w-full text-center text-5xl font-black bg-transparent border-none p-0 focus:ring-0 text-slate-800 leading-none placeholder:text-slate-200 tracking-tighter"
                                value={form.retireExtraExpense}
                                onChange={(v) => setForm(prev => ({ ...prev, retireExtraExpense: v }))}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Monthly Spending</span>
                          </div>
                          <button onClick={changeBy("retireExtraExpense", 1000)} className="w-14 h-14 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-orange-200 hover:text-orange-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"><Plus className="w-6 h-6" strokeWidth={3} /></button>
                        </div>
                        <input
                          type="range"
                          min="0" max="500000" step="1000"
                          value={Number(String(form.retireExtraExpense).replace(/,/g, ""))}
                          onChange={(e) => setForm(prev => ({ ...prev, retireExtraExpense: formatInputDisplay(e.target.value) }))}
                          className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-600 transition-all mt-8"
                        />
                      </div>

                      {/* Legacy Fund */}
                      <div className="bg-slate-50/50 rounded-[28px] p-6 border border-slate-200 hover:bg-white hover:shadow-xl transition-all duration-300 group/item">
                        <div className="flex justify-between items-center mb-4">
                          <Label className="text-sm font-black text-slate-500 uppercase tracking-wider">เงินมรดกที่อยากเหลือไว้</Label>
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={changeBy("legacyFund", -100000)} className="w-14 h-14 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-slate-300 hover:text-slate-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"><Minus className="w-6 h-6" strokeWidth={3} /></button>
                          <div className="flex-1 flex flex-col items-center">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-slate-200">฿</span>
                              <NumericInput
                                className="h-16 w-full text-center text-4xl font-black bg-transparent border-none p-0 focus:ring-0 text-slate-800 leading-none placeholder:text-slate-200 tracking-tighter"
                                value={form.legacyFund}
                                onChange={(v) => setForm(prev => ({ ...prev, legacyFund: v }))}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Legacy Goal</span>
                          </div>
                          <button onClick={changeBy("legacyFund", 100000)} className="w-14 h-14 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-slate-300 hover:text-slate-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"><Plus className="w-6 h-6" strokeWidth={3} /></button>
                        </div>
                        <input
                          type="range"
                          min="0" max="50000000" step="100000"
                          value={Number(String(form.legacyFund).replace(/,/g, ""))}
                          onChange={(e) => setForm(prev => ({ ...prev, legacyFund: formatInputDisplay(e.target.value) }))}
                          className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-500 hover:accent-slate-600 transition-all mt-8"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {/* Pension/Annuity Income */}
                      <div className="bg-emerald-50/20 rounded-[24px] p-5 border border-emerald-100 transition-all hover:bg-white hover:shadow-lg group/sub">
                        <Label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 block">บำนาญ/รายรับอื่นๆ หลังเกษียณ</Label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 flex items-baseline gap-1 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 group-hover/sub:bg-emerald-50 transition-colors">
                            <span className="text-xs font-bold text-slate-400">฿</span>
                            <NumericInput
                              className="w-full h-8 bg-transparent border-none p-0 text-xl font-black focus:ring-0 text-emerald-700"
                              value={form.retireMonthlyIncome}
                              onChange={(v) => setForm(prev => ({ ...prev, retireMonthlyIncome: v }))}
                              placeholder="0"
                            />
                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">/ เดือน</span>
                          </div>
                        </div>
                      </div>

                      {/* Other Lump Sums */}
                      <div className="bg-blue-50/20 rounded-[24px] p-5 border border-blue-100 transition-all hover:bg-white hover:shadow-lg group/sub">
                        <Label className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 block">เงินก้อนอื่นๆ ณ วันเกษียณ</Label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 flex items-baseline gap-1 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 group-hover/sub:bg-blue-50 transition-colors">
                            <span className="text-xs font-bold text-slate-400">฿</span>
                            <NumericInput
                              className="w-full h-8 bg-transparent border-none p-0 text-xl font-black focus:ring-0 text-blue-700"
                              value={form.retireFundOther}
                              onChange={(v) => setForm(prev => ({ ...prev, retireFundOther: v }))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Spend Trend Toggle */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] block mb-4 text-center">แนวโน้มการใช้จ่ายหลังเกษียณ</Label>
                      <div className="flex bg-slate-100 p-2 rounded-2xl border border-slate-200 shadow-inner max-w-lg mx-auto mb-6">
                        <button onClick={() => setRetireSpendMode("flat")} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${retireSpendMode === "flat" ? "bg-white text-slate-800 shadow-sm ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"}`}>คงที่ (ตามเงินเฟ้อ)</button>
                        <button onClick={() => setRetireSpendMode("step5")} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${retireSpendMode === "step5" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-400 hover:text-slate-600"}`}>ปรับลด/เพิ่ม ทุก 5 ปี</button>
                      </div>

                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex items-center justify-between max-w-lg mx-auto">
                        <div>
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest block">ปรับเปลี่ยน (% ต่อปี)</span>
                          <p className="text-[10px] text-slate-400 font-medium">ติดลบ = ใช้จ่ายลดลงเมื่อแก่ตัวลง</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                          <button onClick={() => setForm(prev => ({ ...prev, retireSpendTrendPercent: String(Number(prev.retireSpendTrendPercent) - 0.5) }))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all font-bold text-lg">-</button>
                          <div className="min-w-[3rem] text-center">
                            <NumericInput
                              className="w-10 h-8 bg-transparent border-none p-0 text-center text-lg font-black focus:ring-0 text-slate-800"
                              value={form.retireSpendTrendPercent}
                              onChange={(v) => setForm(prev => ({ ...prev, retireSpendTrendPercent: v }))}
                            />
                          </div>
                          <button onClick={() => setForm(prev => ({ ...prev, retireSpendTrendPercent: String(Number(prev.retireSpendTrendPercent) + 0.5) }))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all font-bold text-lg">+</button>
                        </div>
                      </div>
                    </div>

                    {/* Monte Carlo Setting (Minimal) */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <button
                        onClick={() => setIsMonteCarloOpen(!isMonteCarloOpen)}
                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 transition-colors mx-auto"
                      >
                        Monte Carlo Settings
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isMonteCarloOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isMonteCarloOpen && (
                        <div className="mt-4 grid grid-cols-2 gap-4 max-w-md mx-auto animate-in fade-in slide-in-from-top-2">
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Volatility (%)</Label>
                            <NumericInput className="w-full bg-white rounded-lg border-slate-200 h-9 text-sm font-bold text-center" value={mcVolatility} onChange={(v) => setMcVolatility(Number(v))} />
                          </div>
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Simulations</Label>
                            <NumericInput className="w-full bg-white rounded-lg border-slate-200 h-9 text-sm font-bold text-center" value={mcSimulations} onChange={(v) => setMcSimulations(Number(v))} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- SAVE & CALCULATE ACTION AREA --- */}
                <div className="space-y-4 pt-4">
                  {showResult ? (
                    /* บันทึกแผน (Show only after calculation) */
                    <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
                      {/* Top Section: Save Plan (Dark) */}
                      <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none overflow-hidden transition-all duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] -ml-16 -mb-16 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                          <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-black tracking-tight text-white mb-1">บันทึกแผนของคุณ</h3>
                            <p className="text-xs text-indigo-300 font-medium">เพื่อนำไปเปรียบเทียบหรือแชร์ให้ครอบครัว</p>
                            <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
                              <Input
                                className="max-w-[200px] h-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl focus:ring-indigo-500"
                                placeholder="ชื่อแผน..."
                                value={form.planName}
                                onChange={handleChange("planName")}
                              />
                              <Button
                                onClick={handleSavePlan}
                                className="h-10 px-6 bg-white text-slate-900 hover:bg-indigo-50 font-black rounded-xl transition-all shadow-xl shadow-white/5 active:scale-95"
                              >
                                บันทึก
                              </Button>
                            </div>
                            {saveMessage && <p className="text-[10px] text-emerald-400 font-bold mt-2 animate-pulse">{saveMessage}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section: Saved Plans List (Light) */}
                      {savedPlans.length > 0 && (
                        <div className="p-6 space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                            <History className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-900">รายการแผนที่บันทึกไว้ ({savedPlans.length})</h3>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent space-y-3">
                            {savedPlans.map((plan) => (
                              <div
                                key={plan.id}
                                className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer"
                                onClick={() => handleLoadPlan(plan)}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                                    <List className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{plan.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      <p className="text-[10px] font-medium text-slate-400 capitalize">
                                        {new Date(plan.timestamp).toLocaleDateString("th-TH", { day: 'numeric', month: 'short', year: '2-digit' })} • {new Date(plan.timestamp).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePlan(plan.id);
                                  }}
                                  className="w-10 h-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Calculate & Reset buttons (Show before calculation) */
                    <div className="space-y-6 flex flex-col items-center">
                      <Button
                        onClick={() => {
                          setShowResult(true);
                          // Smooth scroll to results
                          setTimeout(() => {
                            document.getElementById('projection-chart')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                        className="w-full h-20 md:h-28 rounded-[36px] bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white shadow-[0_20px_50px_-15px_rgba(79,70,229,0.5)] transition-all hover:scale-[1.02] active:scale-95 group/btn border-t border-white/10"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/20 flex items-center justify-center group-hover/btn:rotate-12 transition-transform duration-500 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                          </div>
                          <div className="text-left">
                            <span className="block text-2xl md:text-3xl font-black tracking-tight leading-none mb-1">คำนวณแผน</span>
                            <span className="block text-[10px] md:text-xs font-bold text-indigo-200 uppercase tracking-[0.2em] opacity-80">Generate Retirement Report</span>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={resetRetirement}
                        className="h-10 px-6 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 font-bold transition-all gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                        รีเซ็ตข้อมูล
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Wizard Footer */}
          <div className={`p-6 border-t border-slate-100 bg-white flex shrink-0 sticky bottom-0 w-full z-30 transition-all duration-300 ${showResult ? "justify-center" : "justify-between"}`}>
            {/* Back Button */}
            {!showResult ? (
              <div>
                {inputStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setInputStep(prev => Math.max(1, prev - 1))}
                    className="w-28 h-10 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold transition-all"
                    tabIndex={-1}
                  >
                    ย้อนกลับ
                  </Button>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setShowResult(false);
                  setInputStep(3);
                }}
                className="w-48 h-11 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold transition-all shadow-sm gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                ย้อนกลับไปแก้ไข
              </Button>
            )}

            {!showResult && inputStep < 3 && (
              <Button
                onClick={() => setInputStep(prev => Math.min(3, prev + 1))}
                className="w-28 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 font-bold transition-all"
              >
                ถัดไป
              </Button>
            )}
          </div>
        </aside >

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
              </div>



              {/* Header for Results Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 break-inside-avoid px-1">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">สรุปผลลัพธ์ทางการเงิน</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">วางแผนการรับมือเกษียณด้วยเครื่องมือแบบเห็นภาพ</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {planType === "family" && (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-9 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-200 transition-all gap-2"
                      onClick={() => {
                        syncCurrentToFamily(); // Sync current inputs to family state
                        setShowFamilyResult(true);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      ดูผลลัพธ์ครอบครัว
                    </Button>
                  )}
                  {form.insurancePlans.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all gap-2"
                      onClick={() => {
                        setForm(prev => ({ ...prev, selectedPlanId: null }));
                        setShowInsuranceTable(true);
                      }}
                    >
                      <TableIcon className="w-4 h-4" />
                      พอร์ตประกัน
                    </Button>
                  )}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <span>ข้อมูลล่าสุด: {new Date().toLocaleDateString('th-TH')}</span>
                  </div>
                </div>
              </div>

              {/* 1. HERO SUMMARY CARD ("Your Future Overview") - REFINED PREMIUM */}
              {/* 1. HERO SUMMARY CARD (Green Banner Style) */}
              <div className={`rounded-[32px] p-8 lg:p-12 relative overflow-hidden font-sans mb-10 break-inside-avoid shadow-2xl transition-all duration-500 ${result.status === 'enough' ? 'bg-gradient-to-br from-[#025035] to-[#047556] text-white shadow-emerald-900/30' : 'bg-gradient-to-br from-[#7f1d1d] to-[#991b1b] text-white shadow-red-900/30'}`}>
                {/* Clean Background - Discrete decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none mix-blend-overlay"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="flex-1 space-y-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${result.status === 'enough' ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${result.status === 'enough' ? 'bg-[#34D399]' : 'bg-red-400'}`}></span>
                      {result.status === 'enough' ? 'สถานะ : เป้าหมายสำเร็จ' : 'สถานะ : ต้องปรับปรุง'}
                    </span>

                    <div className="space-y-3">
                      <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                        {result.status === 'enough' ? 'แผนการเงินมั่นคง' : 'แผนการเงินยังมีความเสี่ยง'}
                      </h1>
                      <h2 className="text-xl lg:text-2xl font-bold text-white/90">
                        {result.status === 'enough' ? 'พร้อมเกษียณอย่างสบาย' : 'ควรเริ่มวางแผนเพิ่มเติมทันที'}
                      </h2>
                    </div>

                    <p className="text-white/80 text-base font-medium max-w-xl leading-relaxed">
                      {result.status === 'enough'
                        ? 'ยินดีด้วย! สินทรัพย์ของคุณเพียงพอสำหรับใช้จ่ายตามไลฟ์สไตล์ที่หวังไว้ตลอดช่วงเกษียณ'
                        : `จากการคำนวณ คุณยังมีส่วนต่างที่ต้องออมเพิ่มอีกประมาณ ฿${formatNumber(Math.abs(result.gap))} เพื่อให้บรรลุเป้าหมาย`}
                    </p>
                  </div>

                  <div className="shrink-0 bg-white/10 backdrop-blur-sm rounded-[24px] p-8 min-w-[340px]">
                    <div className="space-y-8">
                      <div>
                        <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-2">เงินออมที่จะมี (Projected)</p>
                        <p className="text-5xl font-black tracking-tighter text-white drop-shadow-sm">฿{formatNumber(result.projectedFund)}</p>
                      </div>
                      <div className="pt-6 border-t border-white/10 opacity-90">
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">เงินต้นที่ควรมี (Target)</p>
                        <p className={`text-2xl lg:text-3xl font-bold tracking-tight ${result.status === 'enough' ? 'text-white/90' : 'text-rose-200'}`}>฿{formatNumber(result.targetFund)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* 2. KEY METRICS GRID (Premium 2x2 Grid) */}
              <div className="relative group/grid">
                {/* Background Grid Pattern (Subtle Dots) */}
                <div className="absolute inset-0 -m-4 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 break-inside-avoid px-2 relative z-10">

                  {/* Card 1: Projected Savings - Emerald Theme */}
                  <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(16,185_129,0.15)]">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-200/40 transition-colors duration-700"></div>
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl opacity-60"></div>

                    {/* Large Decorative + Icon */}
                    <div className="absolute top-8 right-8 text-emerald-100/80 group-hover:text-emerald-200/60 transition-colors duration-500 rotate-12 group-hover:rotate-0 transform origin-center transition-transform duration-700">
                      <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>

                    <div className="flex flex-col h-full justify-between relative z-10">
                      <div>
                        <div className="flex justify-between items-start mb-8">
                          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100 ring-4 ring-emerald-50/50 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                          </div>
                          <button onClick={() => setShowProjectedModal(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-slate-100 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                          </button>
                        </div>
                        <p className="text-sm font-black text-slate-800 mb-1 tracking-tight">เงินออมที่มีตอนอายุเกษียณ</p>
                        <h4 className="text-5xl lg:text-5xl font-black text-emerald-600 leading-none tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left">
                          ฿{formatNumber(result.projectedFund)}
                        </h4>
                        <p className="text-sm font-bold text-slate-400 mt-2">จากการออมและการลงทุน</p>
                      </div>

                      <div className="mt-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 shadow-sm group-hover:bg-emerald-100 transition-colors">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          Wealth Projection
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Target Fund - Blue Theme */}
                  <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(59,130,246,0.15)]">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-200/40 transition-colors duration-700"></div>
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl opacity-60"></div>

                    {/* Large Decorative Circle Icon */}
                    <div className="absolute top-8 right-8 text-blue-100/80 group-hover:text-blue-200/60 transition-colors duration-500 transform group-hover:scale-90 transition-transform duration-700">
                      <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                    </div>

                    <div className="flex flex-col h-full justify-between relative z-10">
                      <div>
                        <div className="flex justify-between items-start mb-8">
                          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100 ring-4 ring-blue-50/50 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                          </div>
                          <button onClick={() => setShowTargetModal(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                          </button>
                        </div>
                        <p className="text-sm font-black text-slate-800 mb-1 tracking-tight">เงินที่ต้องการก่อนเกษียณ</p>
                        <h4 className="text-5xl lg:text-5xl font-black text-blue-600 leading-none tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left">
                          ฿{formatNumber(result.targetFund)}
                        </h4>
                        <p className="text-xs font-bold text-slate-400 mt-2 leading-relaxed">
                          สำหรับ {result.yearsInRetirement} ปีหลังเกษียณ (โดยไม่สร้างผลตอบแทนเพิ่มเติมเลย)<br />
                          หรือออมขั้นต่ำคร่าวๆ ฿{formatNumber(result.monthlyNeeded)} ต่อเดือน
                        </p>
                      </div>

                      <div className="mt-8 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 shadow-sm group-hover:bg-blue-100 transition-colors">
                          Goal
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-slate-500 group-hover:text-blue-600 group-hover:border-blue-100 transition-all duration-300">
                          <span className="text-[10px] font-bold tracking-tight opacity-70">~฿{formatNumber(result.monthlyNeeded)}/เดือน</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Monthly Expense - Purple Theme */}
                  <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(168,85,247,0.15)]">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-purple-200/40 transition-colors duration-700"></div>
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-50/50 rounded-full blur-2xl opacity-60"></div>

                    <div className="flex flex-col h-full justify-between relative z-10">
                      <div>
                        <div className="flex justify-between items-start mb-8">
                          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm border border-purple-100 ring-4 ring-purple-50/50 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                          </div>
                          <button onClick={() => setShowExpenseModal(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-slate-100 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                          </button>
                        </div>
                        <p className="text-sm font-black text-slate-800 mb-1 tracking-tight">ค่าใช้จ่าย/เดือน (ปีแรก)</p>
                        <h4 className="text-5xl lg:text-5xl font-black text-purple-600 leading-none tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left">
                          ฿{formatNumber(result.fvExpenseMonthly)}
                        </h4>
                        <div className="flex justify-between items-end mt-2">
                          <p className="text-sm font-bold text-slate-400">หลังเกษียณ (รวมเงินเฟ้อ)</p>
                          <p className="text-xs font-bold text-slate-400">รวม ฿{formatNumber(result.totalLifetimeExpense)}</p>
                        </div>
                      </div>

                      <div className="mt-8 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-bold border border-purple-100 shadow-sm group-hover:bg-purple-100 transition-colors">
                          Monthly
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-slate-500 group-hover:text-purple-600 group-hover:border-purple-100 transition-all duration-300">
                          <span className="text-[10px] font-bold tracking-tight opacity-70">Total {(result.totalLifetimeExpense / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Status - Adaptive Theme */}
                  <div className={`bg-white/70 backdrop-blur-md rounded-[32px] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 ${result.status === 'enough' ? 'hover:shadow-[0_30px_70px_-20px_rgba(16,185_129,0.15)]' : 'hover:shadow-[0_30px_70px_-20px_rgba(244,63,94,0.15)]'}`}>
                    {/* Decorative Background Elements */}
                    <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-12 -mt-12 group-hover:opacity-60 transition-colors duration-700 ${result.status === 'enough' ? 'bg-emerald-100/30' : 'bg-rose-100/30'}`}></div>
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-slate-50/50 rounded-full blur-2xl opacity-60"></div>

                    <div className="flex flex-col h-full justify-between relative z-10">
                      <div>
                        <div className="flex justify-between items-start mb-8">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border ring-4 ring-offset-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500 ${result.status === 'enough' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-50/50' : 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-50/50'}`}>
                            {result.status === 'enough' ?
                              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> :
                              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            }
                          </div>
                        </div>
                        <p className="text-sm font-black text-slate-800 mb-1 tracking-tight">สถานะแผน</p>
                        <h4 className={`text-5xl lg:text-5xl font-black leading-none tracking-tight transition-all duration-300 group-hover:scale-[1.02] origin-left ${result.status === 'enough' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {result.status === 'enough' ? "เพียงพอ" : "ไม่เพียงพอ"}
                        </h4>
                        <div className="mt-2 space-y-0.5">
                          <p className="text-sm font-bold text-slate-400">
                            {result.status === 'enough' ? `มีส่วนเกินประมาณ ฿${formatNumber(result.gap)}` : `ขาดอีก ฿${formatNumber(Math.abs(result.gap))}`}
                          </p>
                          <p className={`text-sm font-bold ${result.status === 'enough' ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                            เงินหมดที่อายุ {result.moneyOutAge >= inputs.lifeExpectancy ? inputs.lifeExpectancy + '+' : result.moneyOutAge}
                          </p>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm transition-colors ${result.status === 'enough' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-100'}`}>
                          {result.status === 'enough' ?
                            <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Goal Achieved</> :
                            <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Shortfall -฿{formatNumber(Math.abs(result.gap))}</>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3. MAIN DASHBOARD GRID (New Layout: Chart flowing into Widgets) */}
              <div className="flex flex-col gap-8 mb-8 break-inside-avoid">

                {/* 3.1 Main Chart Area (Full Width "Long Strip") */}
                <div className="w-full bg-white rounded-[32px] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden group">
                  {/* Decorative Background for Chart */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-50/50 via-transparent to-transparent opacity-60 pointer-events-none -mr-20 -mt-20 rounded-full blur-3xl"></div>

                  <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">กราฟการเงินออม</h3>
                      </div>
                      <p className="text-sm text-slate-500 font-medium pl-4.5">Wealth Projection & Goal Analysis</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Chart Intervals */}
                      <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 mr-2">
                        {[1, 5, 10].map((interval) => (
                          <button
                            key={interval}
                            onClick={() => setChartTickInterval(interval)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${chartTickInterval === interval ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"}`}
                          >
                            {interval} ปี
                          </button>
                        ))}
                      </div>

                      <button className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5" onClick={() => setShowActualSavingsInput(true)}>
                        บันทึกเงินสะสมจริงตามอายุ
                      </button>
                      <button className="px-5 py-2.5 text-sm font-bold text-blue-600 bg-white hover:bg-blue-50 rounded-xl border-2 border-blue-600 flex items-center gap-2 transition-all hover:-translate-y-0.5" onClick={handleExportCSV}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Export CSV
                      </button>
                      <button className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5" onClick={handlePrint}>
                        Print
                      </button>
                    </div>
                  </div>

                  <div className="w-full relative h-[500px] bg-gradient-to-b from-white to-slate-50/50 rounded-2xl border border-slate-100 p-4">
                    <Line
                      data={projectionChart.data}
                      options={{
                        ...projectionChart.options,
                        maintainAspectRatio: false,
                        layout: { padding: { top: 20, bottom: 10, left: 10, right: 10 } }
                      }}
                    />
                  </div>

                  {/* Custom Legend Bar */}
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 pt-6 border-t border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer select-none group/toggle">
                      <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${showSumAssured ? "bg-orange-500 border-orange-500 shadow-sm" : "bg-white border-slate-300 group-hover/toggle:border-slate-400"}`}>
                        {showSumAssured && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={showSumAssured} onChange={(e) => setShowSumAssured(e.target.checked)} />
                      <span className="text-sm font-bold text-slate-700">แสดงทุนประกัน</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer select-none group/toggle">
                      <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${showActualSavings ? "bg-blue-600 border-blue-600 shadow-sm" : "bg-white border-slate-300 group-hover/toggle:border-slate-400"}`}>
                        {showActualSavings && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={showActualSavings} onChange={(e) => setShowActualSavings(e.target.checked)} />
                      <span className="text-sm font-bold text-slate-700">แสดงเงินที่เก็บได้จริง</span>
                    </label>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-4 bg-emerald-100 border border-emerald-200 rounded"></div>
                      <span className="text-sm font-bold text-slate-700">Monte Carlo Simulation P5-P95</span>
                    </div>
                  </div>
                </div>

                {/* 3.2 Side Column Widgets (Asset Allocation & Monte Carlo) - NOW BELOW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Asset Allocation Widget (Premium Card Layout) */}
                  <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] transition-all duration-500">
                    <div className="mb-8 relative z-10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 text-lg">
                        📊
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg tracking-tight">คำแนะนำการจัดพอร์ต</h3>
                        <p className="text-xs text-slate-400 font-medium">Age-based Rule: {100 - inputs.currentAge}/{Math.floor((inputs.currentAge) * 0.8)}/{inputs.currentAge - Math.floor((inputs.currentAge) * 0.8)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 flex-1 relative z-10">
                      {/* Equity */}
                      <div className="relative overflow-hidden rounded-2xl p-4 py-8 flex flex-col justify-center items-center text-center border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white hover:from-indigo-50 hover:to-indigo-50/80 transition-all duration-300 group/card cursor-default">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/card:opacity-20 transition-opacity">
                          <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-600"><path d="M3 3v18h18" /><path d="M18 9l-5 5-4-4-3 3" /></svg>
                        </div>
                        <span className="text-xs text-indigo-600 font-bold mb-2 uppercase tracking-wider">หุ้น</span>
                        <span className="text-4xl font-black text-indigo-900 tracking-tight">{(100 - inputs.currentAge)}<span className="text-lg align-top ml-0.5 opacity-60">%</span></span>
                      </div>

                      {/* Fixed Income */}
                      <div className="relative overflow-hidden rounded-2xl p-4 py-8 flex flex-col justify-center items-center text-center border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white hover:from-emerald-50 hover:to-emerald-50/80 transition-all duration-300 group/card cursor-default">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/card:opacity-20 transition-opacity">
                          <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-600"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                        </div>
                        <span className="text-xs text-emerald-600 font-bold mb-2 uppercase tracking-wider">ตราสารหนี้</span>
                        <span className="text-4xl font-black text-emerald-900 tracking-tight">{Math.floor((inputs.currentAge) * 0.8)}<span className="text-lg align-top ml-0.5 opacity-60">%</span></span>
                      </div>

                      {/* Cash */}
                      <div className="relative overflow-hidden rounded-2xl p-4 py-8 flex flex-col justify-center items-center text-center border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white hover:from-amber-50 hover:to-amber-50/80 transition-all duration-300 group/card cursor-default">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/card:opacity-20 transition-opacity">
                          <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="text-amber-600"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /></svg>
                        </div>
                        <span className="text-xs text-amber-600 font-bold mb-2 uppercase tracking-wider">เงินสด</span>
                        <span className="text-4xl font-black text-amber-900 tracking-tight">{inputs.currentAge - Math.floor((inputs.currentAge) * 0.8)}<span className="text-lg align-top ml-0.5 opacity-60">%</span></span>
                      </div>
                    </div>

                    <p className="relative z-10 text-[10px] text-slate-400 mt-6 leading-relaxed flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      เป็นคำแนะนำเบื้องต้น ควรปรับตามความเสี่ยงที่รับได้
                    </p>
                  </div>

                  {/* Monte Carlo Widget (Premium Gradient Theme) */}
                  <div
                    onClick={() => setShowMonteCarloDetails(true)}
                    className="rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(255,100,100,0.15)] bg-gradient-to-br from-white to-rose-50 border border-slate-100/50 flex flex-col justify-between gap-2 relative overflow-hidden group hover:shadow-[0_25px_70px_-15px_rgba(255,100,100,0.25)] hover:-translate-y-1 transition-all duration-500 cursor-pointer min-h-[300px]"
                  >
                    {/* Decorative Rotating Die */}
                    <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-rose-100 to-rose-200 rounded-3xl rotate-12 flex flex-wrap gap-2 p-4 items-center justify-center opacity-30 group-hover:opacity-50 group-hover:scale-110 group-hover:rotate-[25deg] transition-all duration-700 backdrop-blur-sm shadow-inner border border-white/20">
                      <div className="w-4 h-4 rounded-full bg-rose-400 shadow-sm"></div>
                      <div className="w-4 h-4 rounded-full bg-rose-400 shadow-sm"></div>
                      <div className="w-4 h-4 rounded-full bg-rose-400 shadow-sm"></div>
                      <div className="w-4 h-4 rounded-full bg-rose-400 shadow-sm"></div>
                      <div className="w-4 h-4 rounded-full bg-rose-400 shadow-sm"></div>
                    </div>

                    {/* Mesh Gradient Overlay */}
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-rose-100/30 to-transparent pointer-events-none"></div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Monte Carlo</h3>
                          <p className="text-xs font-medium text-rose-500 bg-rose-100/50 px-2 py-0.5 rounded-full border border-rose-100 w-fit mt-0.5">จำลอง {mcSimulations} เหตุการณ์</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">ความน่าจะเป็น (Success Rate)</span>
                          <div className="flex items-baseline gap-2">
                            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-700 tracking-tighter filter drop-shadow-sm transition-all group-hover:scale-105 origin-left duration-300">
                              {Math.round(mcResult.probability * 100)}%
                            </h2>
                          </div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-rose-100/50 group-hover:bg-white/80 transition-colors">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            มิดเดียนผลลัพธ์ (P50)
                          </p>
                          <span className="font-mono text-xl font-bold text-slate-700 tracking-tight block">฿{formatNumber(mcResult.p50)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>








                {/* ----- INSURANCE TABLE MODAL (Premium) ----- */}
                {
                  showInsuranceTable && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-3xl p-4 transition-all duration-500 animate-in fade-in">
                      <div className="w-full max-w-4xl rounded-[32px] bg-[#F8FAFC] shadow-2xl relative max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-white/20 flex flex-col font-sans">

                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-50">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-slate-900 tracking-tight">ตารางกระแสเงินสด (Cash Flow Table)</h3>
                              <p className="text-sm text-slate-500 font-medium">รายละเอียดผลประโยชน์และความคุ้มครองรายปี</p>
                            </div>
                          </div>
                          <button
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"
                            type="button"
                            onClick={() => setShowInsuranceTable(false)}
                          >
                            <CloseIcon className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="overflow-y-auto px-8 py-6 custom-scrollbar bg-slate-50/50 flex-1">
                          <div className="rounded-[24px] border border-slate-200 overflow-hidden shadow-sm bg-white">
                            <table className="w-full text-sm border-collapse">
                              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] backdrop-blur-sm sticky top-0 z-10">
                                <tr>
                                  <th className="py-4 px-4 text-left w-[10%] font-bold text-slate-600">อายุ (Age)</th>
                                  {form.selectedPlanId && form.insurancePlans.find(p => p.id === form.selectedPlanId)?.surrenderMode === "table" && (
                                    <th className="py-4 px-4 text-right w-[20%] text-blue-600">เวนคืน (Surrender)</th>
                                  )}
                                  <th className="py-4 px-4 text-right w-[25%] font-bold text-slate-600">กระแสเงินสดรับ (Inflow)</th>
                                  <th className="py-4 px-4 text-right w-[25%] font-bold text-slate-600">ทุนประกัน (Death Benefit)</th>
                                  <th className="py-4 px-4 pl-8 text-left w-[20%] font-bold text-slate-600">สถานะ (Status)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
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
                                  let rowClass = "hover:bg-indigo-50/30 transition-colors";

                                  if (isSurrenderYear) {
                                    statusText = "มีการเวนคืนกรมธรรม์";
                                    rowClass = "bg-green-50/50 hover:bg-green-50";
                                  } else if (hasActiveCoverage) {
                                    statusText = "คุ้มครองปกติ";
                                    if (totalCashInflow > 0) {
                                      statusText = "ได้รับเงินคืน / จ่ายบำนาญ";
                                      // Highlight row if receiving money
                                      rowClass = "bg-emerald-50/50 hover:bg-emerald-50";
                                    }
                                  } else {
                                    statusText = "สิ้นสุดความคุ้มครอง";
                                    deathBenefitDisplay = "-";
                                    rowClass = "text-slate-400 bg-slate-50/30";
                                  }

                                  const lifeExpectancy = Number(String(form.lifeExpectancy).replace(/,/g, ""));
                                  if (age === lifeExpectancy) {
                                    statusText = `เสียชีวิตที่อายุ ${age} → ทุนประกัน ${deathBenefitDisplay}`;
                                    rowClass = "bg-red-50 hover:bg-red-100 font-bold border-l-4 border-l-red-500";
                                  } else if (age > lifeExpectancy) {
                                    statusText = "เสียชีวิตแล้ว";
                                    deathBenefitDisplay = "-";
                                    cashInflowDisplay = "-";
                                    rowClass = "text-slate-300 bg-slate-100/50";
                                  }

                                  const editingThisPlan = form.selectedPlanId === targetPlans[0]?.id && targetPlans[0]?.surrenderMode === "table";
                                  const pIndex = form.insurancePlans.findIndex(p => p.id === targetPlans[0]?.id);

                                  const svTableVal = editingThisPlan && pIndex >= 0
                                    ? (form.insurancePlans[pIndex].surrenderTableData?.find(d => d.age === age)?.amount || "")
                                    : "";

                                  return (
                                    <tr key={age} className={rowClass}>
                                      <td className="py-3 px-4 border-b border-slate-100 text-center font-bold text-slate-500">{age}</td>
                                      {editingThisPlan && (
                                        <td className="py-3 px-4 border-b border-slate-100 text-right">
                                          <input
                                            className="w-full text-right bg-blue-50/50 border-b border-blue-200 focus:outline-none focus:border-blue-500 text-xs py-1.5 px-2 rounded text-blue-700 font-mono"
                                            placeholder="-"
                                            value={svTableVal}
                                            onChange={(e) => updateSurrenderTable(pIndex, age, e.target.value)}
                                            onBlur={(e) => updateSurrenderTable(pIndex, age, formatInputDisplay(e.target.value))}
                                          />
                                        </td>
                                      )}
                                      <td className={`py-3 px-4 border-b border-slate-100 text-right font-mono text-base ${totalCashInflow > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                                        {cashInflowDisplay}
                                      </td>
                                      <td className="py-3 px-4 border-b border-slate-100 text-right font-mono">
                                        {deathBenefitDisplay}
                                      </td>
                                      <td className="py-3 px-4 pl-8 border-b border-slate-100 text-xs font-medium text-slate-500">
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
                    </div>
                  )
                }





                {/* ----- MODAL 1: PROJECTED SAVINGS (คำนวณเงินออม) ----- */}
                {
                  showProjectedModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 transition-all duration-500">
                      <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-black/5">
                        <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-emerald-100/50 flex items-center justify-center text-emerald-600 text-lg">💰</span>
                              ที่มาของเงินออม (Projected Savings)
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 ml-10">วิเคราะห์องค์ประกอบของเงินออมในอนาคต</p>
                          </div>
                          <button onClick={() => setShowProjectedModal(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                            <CloseIcon className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
                          {/* TABS */}
                          <div className="flex gap-2 p-1.5 bg-white/80 backdrop-blur border border-slate-200/60 rounded-2xl mx-8 mt-6 mb-4 shadow-sm sticky top-0 z-10">
                            <button className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${projectedModalTab === 'details' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setProjectedModalTab('details')}>รายละเอียด (Details)</button>
                            <button className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${projectedModalTab === 'formula' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setProjectedModalTab('formula')}>สูตรคำนวณ (Formula)</button>
                          </div>

                          <div className="px-8 pb-8 pt-2">
                            {projectedModalTab === "details" && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-4">
                                  {["เริ่มต้นจากเงินสะสมที่มีอยู่ในปัจจุบัน", "คำนวณผลตอบแทนจากเงินสะสมทั้งหมดของปีนั้น (ผลตอบแทนเฉลี่ยต่อปี)", "เพิ่มเงินออมประจำปีเข้าไปในยอดสะสม", "หากมีเงินเพิ่มเติมจากแหล่งอื่น เช่น เงินคืนประกัน ก็จะนำมาบวกกับยอดสะสมของปีนั้นด้วย", "ทำซ้ำขั้นตอนทั้งหมดจนถึงปีเกษียณ → จะได้ยอดสะสมสุดท้าย"].map((step, idx) => (
                                    <div key={idx} className="flex gap-4 text-sm text-slate-600 group">
                                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs shadow-sm ring-1 ring-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        {idx + 1}
                                      </div>
                                      <div className="pt-1.5 leading-relaxed font-medium">{step}</div>
                                    </div>
                                  ))}
                                </div>
                                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 border border-amber-100/50 flex gap-4 items-start shadow-sm">
                                  <span className="text-amber-500 text-2xl mt-0.5">💡</span>
                                  <div className="text-sm text-slate-700 pt-1">
                                    <span className="font-bold text-slate-900 block mb-1 text-base">Key Takeaway</span>
                                    หัวใจสำคัญคือ <span className="font-bold text-amber-700">"พลังของดอกเบี้ยทบต้น"</span> (Compound Interest) ยิ่งออมเร็ว เงินยิ่งทบต้นได้นานขึ้น
                                  </div>
                                </div>
                              </div>
                            )}

                            {projectedModalTab === "formula" && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-4">
                                  <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                                    สูตรมูลค่าเงินในอนาคต (Future Value)
                                  </div>
                                  <p className="text-sm text-slate-500 leading-relaxed pl-3 border-l-2 border-slate-100">
                                    คำนวณโดยนำเงิน 2 ส่วนมารวมกัน: <br />
                                    1. <b>เงินก้อนเดิม</b> ที่เติบโตขึ้นตามผลตอบแทน <br />
                                    2. <b>เงินออมใหม่</b> ที่เติมเข้ามาทุกปีพร้อมผลตอบแทน
                                  </p>

                                  <div className="rounded-2xl bg-slate-900 p-6 overflow-x-auto shadow-inner relative group">
                                    <div className="absolute top-3 right-3 text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">Math</div>
                                    <div className="font-mono text-sm text-emerald-400 whitespace-nowrap">
                                      FV = [P₀ × (1 + r)ⁿ] + [PMT × ((1 + r)ⁿ - 1) / r] + Others
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mt-2">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3"><span className="font-bold text-slate-900 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">FV</span> มูลค่าเงินในอนาคต</div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3"><span className="font-bold text-slate-900 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">P₀</span> เงินเริ่มต้น</div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3"><span className="font-bold text-slate-900 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">PMT</span> เงินออมเพิ่มต่อปี</div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3"><span className="font-bold text-slate-900 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">r</span> ผลตอบแทนต่อปี</div>
                                  </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                  <div className="text-sm font-bold text-slate-900">ตัวอย่างการคำนวณจริง (Live Calculation):</div>
                                  <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-6 shadow-sm">
                                    <div className="relative pl-4 border-l-2 border-indigo-100">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ส่วนที่ 1: เงินก้อนเดิมเติบโต</div>
                                      <div className="font-mono text-xs text-slate-600 break-all bg-slate-50 p-2 rounded-lg">
                                        = {formatNumber(form.currentSavings)} × (1 + {Number(form.expectedReturn) / 100})^{result.yearsToRetire}
                                      </div>
                                      <div className="font-mono text-base font-bold text-indigo-600 mt-2">
                                        = ฿ {formatNumber(result.fvLumpSum)}
                                      </div>
                                    </div>

                                    <div className="relative pl-4 border-l-2 border-purple-100">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ส่วนที่ 2: เงินออมใหม่เติบโต</div>
                                      <div className="font-mono text-xs text-slate-600 break-all bg-slate-50 p-2 rounded-lg">
                                        = ({formatNumber(form.monthlySaving)} × 12) × ((1 + {Number(form.expectedReturn) / 100})^{result.yearsToRetire} - 1) / {Number(form.expectedReturn) / 100}
                                      </div>
                                      <div className="font-mono text-base font-bold text-purple-600 mt-2">
                                        = ฿ {formatNumber(result.fvAnnuity)}
                                      </div>
                                    </div>

                                    {result.insuranceCashInflow > 0 && (
                                      <div className="relative pl-4 border-l-2 border-emerald-100">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ส่วนที่ 3: เงินคืนจากประกัน</div>
                                        <div className="font-mono text-base font-bold text-emerald-600 mt-2">
                                          + ฿ {formatNumber(result.insuranceCashInflow)}
                                        </div>
                                      </div>
                                    )}

                                    <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-end">
                                      <div className="text-sm font-bold text-slate-900">รวมเงินออมทั้งหมด (Total FV)</div>
                                      <div className="font-mono text-2xl font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
                                        ฿ {formatNumber(result.projectedFund)}
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
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 transition-all duration-500">
                      <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-black/5">
                        <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600 text-lg">🎯</span>
                              เป้าหมายเกษียณ (Target Fund)
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 ml-10">คำนวณเงินทุนที่ต้องมีเพื่อให้พอใช้</p>
                          </div>
                          <button onClick={() => setShowTargetModal(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                            <CloseIcon className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
                          <div className="flex gap-2 p-1.5 bg-white/80 backdrop-blur border border-slate-200/60 rounded-2xl mx-8 mt-6 mb-4 shadow-sm sticky top-0 z-10">
                            <button className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${targetModalTab === 'details' ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setTargetModalTab('details')}>รายละเอียด (Details)</button>
                            <button className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${targetModalTab === 'formula' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setTargetModalTab('formula')}>สูตรคำนวณ (Formula)</button>
                          </div>

                          <div className="px-8 pb-8 pt-2">
                            {targetModalTab === "details" && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <p className="text-sm text-slate-600 leading-relaxed bg-white p-6 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
                                  <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></span>
                                  <span className="font-bold text-slate-900 block mb-2 text-base">นิยาม (Simple Definition)</span>
                                  คือจำนวนเงินก้อนที่คุณ <b>"ต้องมี"</b> ณ วันสุดท้ายของการทำงาน เพื่อให้สามารถถอนออกมาใช้จ่ายได้ทุกเดือนไปจนถึงวันสุดท้ายของชีวิต โดยไม่เดือดร้อน
                                </p>

                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-4">
                                  <div className="text-base font-bold text-slate-900">ขั้นตอนการคิด (Step-by-Step):</div>
                                  <ol className="list-none space-y-3">
                                    {[
                                      "ประมาณการรายจ่ายต่อเดือน หลังเกษียณ (ปรับเงินเฟ้อแล้ว)",
                                      "หักลบรายได้อื่นๆ ที่จะมีแน่นอน เช่น บำนาญ, เบี้ยยังชีพ",
                                      "คำนวณว่าต้องมีเงินก้อนเท่าไหร่ ที่จะถอนมาใช้ได้พอดีตามระยะเวลาที่คาดการณ์",
                                      "บวกเงินมรดกที่ต้องการส่งต่อ (ถ้ามี)",
                                      "ผลลัพธ์คือ เป้าหมายทางการเงิน (Target Fund)"
                                    ].map((item, idx) => (
                                      <li key={idx} className="flex gap-4 items-center p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                                        <span className="text-sm text-slate-700 font-medium">{item}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              </div>
                            )}

                            {targetModalTab === "formula" && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-4">
                                  <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                    สูตรหาเงินออมที่ต้องเก็บ (PMT for Goal)
                                  </div>
                                  <p className="text-sm text-slate-500 leading-relaxed pl-3 border-l-2 border-slate-100">
                                    คำนวณย้อนกลับว่า ต้องเก็บเงินเพิ่มปีละเท่าไหร่ จึงจะไปถึงเป้าหมาย โดยคำนึงถึงผลตอบแทนทบต้น
                                  </p>

                                  <div className="rounded-2xl bg-slate-900 p-6 overflow-x-auto shadow-inner relative group">
                                    <div className="absolute top-3 right-3 text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">Math</div>
                                    <div className="font-mono text-sm text-blue-400 whitespace-nowrap">
                                      PMT = (Target - Current × (1+r)^n) / [((1+r)^n - 1) / r]
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="text-sm font-bold text-slate-900">สรุปการคำนวณจริง (Result):</div>
                                  <div className="rounded-3xl bg-white border border-slate-200 p-6 overflow-hidden shadow-sm relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

                                    <div className="relative z-10 space-y-4">
                                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <span className="text-sm text-slate-600">เป้าหมายทั้งหมดที่ต้องมี</span>
                                        <span className="font-bold text-lg text-slate-800">฿ {formatNumber(result.targetFund)}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <span className="text-sm text-slate-600">เงินที่มีและจะโตไปในอนาคต</span>
                                        <span className="font-bold text-lg text-slate-500">฿ {formatNumber(result.fvLumpSum + result.insuranceCashInflow)}</span>
                                      </div>
                                      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">ต้องออมเพิ่มต่อปี</span>
                                          <span className="font-mono text-base font-bold text-blue-700">฿ {formatNumber2(result.monthlyNeeded * 12, 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-black text-slate-800">เฉลี่ยต่อเดือน</span>
                                          <span className="font-mono text-2xl font-black text-blue-600">฿ {formatNumber2(result.monthlyNeeded, 0)}</span>
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

                {/* ----- MODAL 3: EXPENSE DETAILS (ค่าใช้จ่าย) ----- */}
                {
                  showExpenseModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 transition-all duration-500">
                      <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-black/5">
                        <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-purple-100/50 flex items-center justify-center text-purple-600 text-lg">💸</span>
                              ค่าใช้จ่ายหลังเกษียณ (Future Expense)
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 ml-10">ประมาณการเงินเฟ้อและค่าครองชีพ</p>
                          </div>
                          <button onClick={() => setShowExpenseModal(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                            <CloseIcon className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
                          <div className="flex gap-2 p-1.5 bg-white/80 backdrop-blur border border-slate-200/60 rounded-2xl mx-8 mt-6 mb-4 shadow-sm sticky top-0 z-10">
                            <button className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${expenseModalTab === 'details' ? 'bg-purple-500 text-white shadow-md shadow-purple-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setExpenseModalTab('details')}>รายละเอียด (Details)</button>
                            <button className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${expenseModalTab === 'formula' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={() => setExpenseModalTab('formula')}>สูตรคำนวณ (Formula)</button>
                          </div>

                          <div className="px-8 pb-8 pt-2">
                            {expenseModalTab === "details" && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="h-[260px] w-full rounded-3xl border border-slate-100 p-6 bg-white shadow-sm flex flex-col">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">กราฟค่าใช้จ่ายสะสม</h4>
                                  <div className="flex-1 min-h-0">
                                    {expenseChart ? <Line data={expenseChart.data} options={{ ...expenseChart.options, maintainAspectRatio: false }} /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">ไม่มีข้อมูลกราฟ</div>}
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                                    ตารางค่าใช้จ่ายรายปี (จนถึงอายุขัย)
                                  </div>
                                  <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
                                    <table className="w-full text-sm text-left">
                                      <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                                        <tr><th className="p-4 w-1/4">อายุ (ปี)</th><th className="p-4 text-right w-1/3">รายเดือน (อนาคต)</th><th className="p-4 text-right">รายปี (อนาคต)</th></tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {result.expenseSchedule.map((row, idx) => (
                                          <tr key={row.age} className={`hover:bg-purple-50/30 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                                            <td className="p-4 text-slate-800 font-bold">{row.age}</td>
                                            <td className="p-4 text-right font-medium text-purple-600">฿{formatNumber(row.monthly)}</td>
                                            <td className="p-4 text-right text-slate-600">฿{formatNumber(row.yearly)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot className="bg-slate-900 text-white font-semibold">
                                        <tr>
                                          <td className="p-4 rounded-bl-xl">รวมทั้งหมดตลอดอายุขัย</td>
                                          <td className="p-4 text-right">-</td>
                                          <td className="p-4 text-right text-purple-300 text-lg rounded-br-xl">฿{formatNumber(result.totalLifetimeExpense)}</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}
                            {expenseModalTab === "formula" && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/60 space-y-4">
                                  <div className="text-base font-bold text-slate-900">การคิดค่าเงินเฟ้อ (Inflation Calc)</div>
                                  <p className="text-sm text-slate-500 leading-relaxed pl-3 border-l-2 border-slate-100">
                                    เงินในอนาคตจะมีค่าน้อยลง เราจึงต้องคำนวณว่า "จำนวนเงินที่เราต้องใช้" จะเพิ่มขึ้นเป็นเท่าไหร่
                                  </p>
                                  <div className="rounded-2xl bg-slate-900 p-6 text-sm text-purple-300 border border-slate-800 leading-relaxed font-mono shadow-inner">
                                    FutureExpense = CurrentExpense × (1 + InflationRate) ^ Years
                                  </div>
                                </div>

                                <div className="bg-purple-50 rounded-3xl p-6 border border-purple-100 space-y-3">
                                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">ตัวอย่างวันนี้ vs วันเกษียณ</h4>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">ค่าใช้จ่ายวันนี้ (บาท/เดือน)</span>
                                    <span className="font-bold text-slate-900">{formatNumber(form.retireExtraExpense)}</span>
                                  </div>
                                  <div className="w-full h-px bg-purple-200"></div>
                                  <div className="flex items-center justify-between text-base">
                                    <span className="text-purple-800 font-bold">ค่าใช้จ่ายวันเกษียณ (บาท/เดือน)</span>
                                    <span className="font-black text-purple-700 text-xl">{formatNumber(result.fvExpenseMonthly)}</span>
                                  </div>
                                  <p className="text-xs text-purple-600/80 mt-2 text-right">
                                    *คิดที่เงินเฟ้อ {form.inflation}% เป็นเวลา {result.yearsToRetire} ปี
                                  </p>
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
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 transition-all duration-500">
                      <div className="w-full max-w-md rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-black/5">
                        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100">
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight">🔎 ผลจำลอง Monte Carlo</h3>
                          <button onClick={() => setShowMonteCarloDetails(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                            <CloseIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="p-6 bg-[#F8FAFC]">
                          <p className="text-xs text-slate-500 mb-6 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm leading-relaxed">
                            <b>Monte Carlo Simulation</b> คือการจำลองเหตุการณ์การลงทุนกว่า 1,000 ครั้ง โดยใส่ความผันผวน (Volatility 6%) เพื่อดูโอกาสรอดในสถานการณ์ต่างๆ
                          </p>

                          <div className="space-y-3 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm max-h-[400px] overflow-y-auto custom-scrollbar">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 sticky top-0 bg-white z-10 pb-2 border-b border-slate-50">ผลลัพธ์ {mcSimulations} เหตุการณ์</h4>
                            {mcResult.finalBalances.map((run, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                <span className="text-slate-500 font-bold text-xs">Run #{idx + 1}</span>
                                <div className="flex items-center gap-3">
                                  <span className={run.pass ? "text-emerald-600 font-bold font-mono" : "text-rose-600 font-bold font-mono"}>
                                    ฿{formatNumber(run.balance)}
                                  </span>
                                  <span className={`w-2 h-2 rounded-full ring-2 ring-white shadow-sm ${run.pass ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-6 flex flex-col items-center justify-center bg-slate-900 text-white rounded-3xl p-6 shadow-lg shadow-slate-200">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ความน่าจะเป็นที่จะสำเร็จ</span>
                            <span className="text-4xl font-black tracking-tight">{formatNumber2(mcResult.probability * 100, 0)}%</span>
                            <span className="text-[10px] text-slate-500 mt-2">Success Rate from 1,000+ simulations</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

