import React, { useMemo } from 'react';
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
    TooltipItem,
    ScriptableContext,
    ChartData
} from "chart.js";
import { Line } from "react-chartjs-2";
import { formatNumber } from "@/lib/utils";
import { buildProjectionSeries } from "@/lib/retirement-calculation";
import { CalculationResult, MonteCarloResult, RetirementInputs } from "@/types/retirement";

// Define strict type for Insurance Chart Data structure
export interface InsuranceChartData {
    labels: number[];
    datasets: {
        label: string;
        data: (number | null)[];
        borderColor?: string;
        backgroundColor?: string;
        [key: string]: any;
    }[];
}

// Register ChartJS components
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

// Chart Plugins
const goalLabelPlugin = {
    id: "goalLabelPlugin",
    afterDraw: (chart: any, args: any, options: any) => {
        const { ctx, scales: { x, y } } = chart;
        const goalVal = options.goalValue;
        if (!goalVal) return;
        const yPos = y.getPixelForValue(goalVal);
        const xStart = x.left;
        const xEnd = x.right;

        // Draw Line
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "#2563eb"; // Blue
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(xStart, yPos);
        ctx.lineTo(xEnd, yPos);
        ctx.stroke();

        // Draw Label Background
        const text = `${options.labelText}: ฿${options.formatNumber(goalVal)}`;
        ctx.font = "bold 10px 'Inter', 'Prompt', sans-serif";
        const textWidth = ctx.measureText(text).width;
        const padding = 6;
        const rectX = xEnd - textWidth - padding * 2;
        const rectY = yPos - 22; // Above line
        // Prevent label overlap if chart is tight? No, simple logic for now.

        // Only draw if within bounds (roughly)
        if (yPos > y.top && yPos < y.bottom) {
            ctx.fillStyle = "rgba(37, 99, 235, 0.9)";
            ctx.beginPath();
            ctx.roundRect(rectX, rectY, textWidth + padding * 2, 20, 4);
            ctx.fill();

            // Draw Text
            ctx.fillStyle = "white";
            ctx.fillText(text, rectX + padding, rectY + 14);
        }
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
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#64748b';
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();
            ctx.restore();
        }
    }
};

// Also register local plugins
ChartJS.register(goalLabelPlugin, crosshairPlugin);


interface ProjectionChartProps {
    inputs: RetirementInputs;
    result: CalculationResult;
    mcResult: MonteCarloResult;
    showSumAssured: boolean;
    showActualSavings: boolean;
    insuranceChartData: InsuranceChartData | null;
    chartTickInterval: number;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({
    inputs,
    result,
    mcResult,
    showSumAssured,
    showActualSavings,
    insuranceChartData,
    chartTickInterval
}) => {
    const valFormatter = (val: number) => {
        if (val >= 1000000) return "B" + (val / 1000000).toFixed(1) + "M";
        if (val >= 1000) return "B" + (val / 1000).toFixed(0) + "k";
        return String(val);
    };

    const projectionChart = useMemo(() => {
        const { labels, actual, required, actualHistory } = buildProjectionSeries(inputs, result);
        const p5Series = mcResult.p5Series || labels.map(() => 0);
        const p95Series = mcResult.p95Series || labels.map(() => 0);
        const sumAssuredSeries = labels.map(ageStr => {
            const age = Number(ageStr);
            if (!insuranceChartData) return 0;
            const idx = insuranceChartData.labels.indexOf(age);
            if (idx !== -1) return insuranceChartData.datasets[0].data[idx] as number || 0;
            return 0;
        });

        const maxActual = Math.max(...actual);
        const maxRequired = Math.max(...required);
        const maxSumAssured = showSumAssured ? Math.max(...sumAssuredSeries) : 0;
        const maxMain = Math.max(maxActual, maxRequired, maxSumAssured);
        const suggestedMax = Math.ceil((maxMain * 1.1) / 1000000) * 1000000;

        return {
            data: {
                labels,
                datasets: [
                    { label: "P5", data: p5Series, borderColor: "transparent", backgroundColor: "rgba(16, 185, 129, 0.1)", pointRadius: 0, fill: "+1", tension: 0.4, order: 5, hidden: false },
                    { label: "P95", data: p95Series, borderColor: "transparent", backgroundColor: "rgba(16, 185, 129, 0.1)", pointRadius: 0, fill: false, tension: 0.4, order: 6, hidden: false },
                    {
                        label: "เงินออมคาดว่าจะมี", data: actual, borderColor: "#10B981", backgroundColor: (context: any) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)"); gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)"); return gradient;
                        }, tension: 0.4, fill: true, pointRadius: 6, pointBackgroundColor: "#ffffff", pointBorderColor: "#10B981", pointBorderWidth: 3, pointHoverRadius: 8, pointHoverBackgroundColor: "#ffffff", pointHoverBorderColor: "#10B981", pointHoverBorderWidth: 4, order: 1, hidden: !showActualSavings
                    },
                    { label: "เงินที่เก็บได้จริง", data: actualHistory, borderColor: "#2563eb", backgroundColor: "transparent", pointRadius: 6, pointBackgroundColor: "#ffffff", pointBorderColor: "#2563eb", pointBorderWidth: 3, pointHoverRadius: 8, pointHoverBackgroundColor: "#ffffff", pointHoverBorderColor: "#2563eb", pointHoverBorderWidth: 4, order: 0, showLine: false, hidden: !showActualSavings },
                    { label: "อิสรภาพทางการเงิน", data: required.map((val, i) => Number(labels[i]) <= Number(inputs.retireAge) - 1 ? val : null), borderColor: "#2563eb", borderDash: [6, 6], backgroundColor: "transparent", pointRadius: 0, borderWidth: 2, fill: false, order: 2, hidden: false },
                    { label: "ทุนประกัน", data: sumAssuredSeries, borderColor: "#F97316", backgroundColor: "transparent", borderWidth: 2, stepped: false, pointRadius: 6, pointBackgroundColor: "#ffffff", pointBorderColor: "#F97316", pointBorderWidth: 3, pointHoverRadius: 8, pointHoverBackgroundColor: "#ffffff", pointHoverBorderColor: "#F97316", pointHoverBorderWidth: 4, fill: false, order: 3, hidden: !showSumAssured },
                ],
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: "index" as const, intersect: false, backgroundColor: 'rgba(255, 255, 255, 0.98)', titleColor: '#1e293b', bodyColor: '#475569', borderColor: '#e2e8f0', borderWidth: 1,
                        titleFont: { size: 14, weight: "bold" as const, family: "'Inter', 'Prompt', sans-serif" }, bodyFont: { size: 13, family: "'Inter', 'Prompt', sans-serif" }, padding: 12, displayColors: true, boxPadding: 4, usePointStyle: true,
                        callbacks: {
                            title: (items: any[]) => items.length ? `อายุ ${items[0].label}` : "",
                            label: (ctx: any) => {
                                const label = ctx.dataset.label; const val = ctx.parsed.y || 0;
                                if (label === "เงินออมคาดว่าจะมี" || label === "เงินที่เก็บได้จริง") return `เงินออม: ฿${formatNumber(val)}`;
                                if (label === "อิสรภาพทางการเงิน") return `ทางเลือก: ฿${formatNumber(val)}`;
                                if (label === "ทุนประกัน") {
                                    const age = Number(ctx.label);
                                    const flowIdx = insuranceChartData?.labels.indexOf(age) ?? -1;
                                    const flow = flowIdx !== -1 ? (insuranceChartData?.datasets[1].data[flowIdx] as number) : 0;
                                    return [`วงเงินประกัน: ฿${formatNumber(val)}`, `กระแสเงินจากประกัน: ฿${formatNumber(flow)}`];
                                }
                                if (label === "P5") return `โอกาส 5% (แย่สุด): ฿${formatNumber(val)}`;
                                if (label === "P95") return `โอกาส 95% (ดีสุด): ฿${formatNumber(val)}`;
                                return;
                            },
                        }, filter: (item: any) => item.dataset.label !== "P5" && item.dataset.label !== "P95",
                    },
                    goalLabelPlugin: { goalValue: result.targetFund, labelText: "อิสรภาพทางการเงิน", formatNumber, chartTickInterval },
                },
                scales: {
                    x: {
                        title: { display: true, text: "อายุ (ปี)" }, grid: { display: false },
                        ticks: {
                            maxRotation: 0, minRotation: 0, autoSkip: false, maxTicksLimit: chartTickInterval === 1 ? 200 : undefined,
                            font: { size: chartTickInterval === 1 ? 10 : 12 },
                            callback: function (this: any, val: any) { const label = this.getLabelForValue(val as number); const age = Number(label); if (age % chartTickInterval === 0) return label; return ""; }
                        },
                    },
                    y: {
                        title: { display: true, text: "จำนวนเงิน" }, grid: { color: "#f1f5f9" }, min: 0, max: suggestedMax,
                        ticks: { stepSize: 1000000, color: '#94a3b8', font: { size: 10, weight: 'bold' as const }, padding: 10, callback: function (this: any, v: any) { return valFormatter(v as number); }, },
                    },
                },
            },
        };
    }, [inputs, result, mcResult, showSumAssured, showActualSavings, insuranceChartData, chartTickInterval]);

    return (
        <Line
            data={projectionChart.data}
            options={{
                ...projectionChart.options,
                maintainAspectRatio: false,
                layout: { padding: { top: 20, bottom: 10, left: 10, right: 10 } }
            }}
        />
    );
};


interface ExpenseChartProps {
    result: CalculationResult;
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ result }) => {
    const valFormatter = (val: number) => {
        if (val >= 1000000) return "B" + (val / 1000000).toFixed(1) + "M";
        if (val >= 1000) return "B" + (val / 1000).toFixed(0) + "k";
        return String(val);
    };

    const expenseChart = useMemo(() => {
        if (!result.expenseSchedule || result.expenseSchedule.length === 0) return null;
        const labels = result.expenseSchedule.map((r) => String(r.age));
        const dataMonthly = result.expenseSchedule.map((r) => r.monthly);
        return {
            data: {
                labels,
                datasets: [{ label: "รายจ่ายต่อเดือน (บาท)", data: dataMonthly, borderColor: "#B05AD9", backgroundColor: "rgba(176, 90, 217, 0.1)", tension: 0.3, fill: true, pointRadius: 3, pointHoverRadius: 5 }],
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' as const, align: 'end' as const, labels: { boxWidth: 10, usePointStyle: true, font: { size: 11 } } },
                    tooltip: { mode: "index", intersect: false, callbacks: { label: (ctx: any) => `รายจ่าย : ฿ ${formatNumber(ctx.parsed.y || 0)} / เดือน`, title: (ctx: any) => `อายุ ${ctx[0].label} ปี` } },
                },
                scales: {
                    x: { grid: { display: false }, title: { display: true, text: "อายุ (ปี)", font: { size: 12 } } },
                    y: { beginAtZero: true, grid: { color: "#f1f5f9" }, title: { display: true, text: "จำนวนเงิน", font: { size: 12 } }, ticks: { callback: (v: any) => valFormatter(v) } },
                },
            } as ChartOptions<"line">,
        };
    }, [result.expenseSchedule]);

    if (!expenseChart) {
        return <div className="flex h-full items-center justify-center text-xs text-slate-400">ไม่มีข้อมูลกราฟ</div>;
    }

    return <Line data={expenseChart.data} options={{ ...expenseChart.options, maintainAspectRatio: false }} />;
};
