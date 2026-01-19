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
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#64748b'; // Slate 500 (Grey)

            // Vertical Line (Point -> Bottom) - "Lines meet at the point"
            // Starts at y (dataset value) going down to bottom axis
            ctx.moveTo(x, y);
            ctx.lineTo(x, bottom);
            ctx.stroke();

            // Horizontal Line (Value Line)
            ctx.beginPath();
            ctx.moveTo(left, y);
            // Draw to the point (x)
            ctx.lineTo(x, y);
            ctx.stroke();

            ctx.restore();
        }
    }
};

const goalLabelPlugin = {
    id: "goalLabelPlugin",
    afterDraw: (chart: any, args: any, options: any) => {
        const { ctx, scales: { x, y } } = chart;
        const goalVal = options.goalValue;
        const retireAge = options.retireAge;
        if (!goalVal || goalVal <= 0) return;

        const yPos = y.getPixelForValue(goalVal);
        const xStart = x.left;
        let xEnd = x.right;

        // Limit line to retire age if possible
        if (retireAge) {
            const px = x.getPixelForValue(String(retireAge));
            if (px !== undefined && px !== null && !isNaN(px)) xEnd = px;
        }

        // Draw Blue Dashed Line
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "#3b82f6"; // Blue 500
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]); // Clean dash pattern

        ctx.moveTo(xStart, yPos);
        ctx.lineTo(xEnd, yPos);
        ctx.stroke();
        ctx.restore();

        // Draw Label "เป้าหมายทางการเงิน" as a Badge
        const text = options.labelText || "เป้าหมายทางการเงิน";
        ctx.save();
        ctx.font = "bold 12px 'Inter', 'Prompt', sans-serif";
        const textMetrics = ctx.measureText(text);

        // Badge Dimensions
        const paddingX = 12;
        const paddingY = 6;
        const badgeHeight = 26;
        const badgeWidth = textMetrics.width + (paddingX * 2);

        // Position: 20px from left axis, centered vertically on line
        const badgeX = xStart + 20;
        const badgeY = yPos - (badgeHeight / 2);

        // Shadow
        ctx.shadowColor = "rgba(37, 99, 235, 0.15)"; // Blue shadow
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        // Background (Pill Shape)
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 100); // Max rounded
        } else {
            ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight); // Fallback
        }
        ctx.fill();

        // Restoring shadow for border/text to be clean
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        // Border
        ctx.strokeStyle = "#bfdbfe"; // Blue 200
        ctx.lineWidth = 1;
        ctx.stroke();

        // Text
        ctx.fillStyle = "#2563eb"; // Blue 600
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(text, badgeX + paddingX, yPos + 1); // +1 for visual centering in font

        // Optional: Small dot indicator at start of badge? No, keep clean.
        ctx.restore();
    }
};

const agePeriodPlugin = {
    id: "agePeriodPlugin",
    beforeDatasetsDraw: (chart: any, args: any, options: any) => {
        const { ctx, scales: { x, y } } = chart;
        const interval = options.tickInterval || 10; // Default to 10

        ctx.save();

        const xMeta = chart.getDatasetMeta(0).data;
        if (!xMeta || xMeta.length === 0) return;

        chart.data.labels.forEach((label: string, index: number) => {
            const age = parseInt(label);
            if (isNaN(age)) return;

            // Draw faint line if age matches interval
            if (age % interval === 0) {
                const xPos = x.getPixelForValue(label);

                // Draw line
                ctx.beginPath();
                ctx.strokeStyle = "rgba(0, 0, 0, 0.08)"; // Very faint grey
                ctx.lineWidth = 1;
                ctx.moveTo(xPos, y.bottom);
                ctx.lineTo(xPos, y.top);
                ctx.stroke();
            }
        });

        ctx.restore();
    }
};

const legacyLabelPlugin = {
    id: "legacyLabelPlugin",
    afterDraw: (chart: any, args: any, options: any) => {
        const { ctx, scales: { x, y } } = chart;
        const legacyVal = options.legacyValue || 0;
        if (legacyVal <= 0) return;

        const yPos = y.getPixelForValue(legacyVal);
        const xStart = x.left;
        const xEnd = x.right;

        // Draw Label "มรดก" as a Badge
        const text = "มรดก";
        ctx.save();
        ctx.font = "bold 12px 'Inter', 'Prompt', sans-serif";
        const textMetrics = ctx.measureText(text);

        // Badge Dimensions
        const paddingX = 12;
        const paddingY = 6;
        const badgeHeight = 26;
        const badgeWidth = textMetrics.width + (paddingX * 2);

        // Position: Align more to the right side (e.g. 80-85% of width) to distinct from potentially overlapping goal line
        const badgeX = xStart + (xEnd - xStart) * 0.85;
        const badgeY = yPos - (badgeHeight / 2);

        // Shadow
        ctx.shadowColor = "rgba(239, 68, 68, 0.15)"; // Red shadow
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        // Background (Pill Shape)
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 100);
        } else {
            ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
        }
        ctx.fill();

        // Restore shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        // Border
        ctx.strokeStyle = "#fca5a5"; // Red 300
        ctx.lineWidth = 1;
        ctx.stroke();

        // Text
        ctx.fillStyle = "#ef4444"; // Red 500
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(text, badgeX + paddingX, yPos + 1);

        ctx.restore();
    }
};

// Also register local plugins
ChartJS.register(goalLabelPlugin, legacyLabelPlugin, crosshairPlugin, agePeriodPlugin);


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
                        label: "เงินออมคาดว่าจะมี", data: actual, borderColor: "#10B981", borderWidth: 3, backgroundColor: (context: any) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)"); gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)"); return gradient;
                        }, tension: 0.4, fill: true,
                        pointRadius: 3, // Restored small dots
                        pointHoverRadius: 6,
                        pointBackgroundColor: "#ffffff", // White center
                        pointBorderColor: "#10B981", // Green border
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: "#ffffff",
                        pointHoverBorderColor: "#10B981",
                        pointHoverBorderWidth: 3,
                        order: 1, hidden: !showActualSavings
                    },
                    { label: "เงินที่เก็บได้จริง", data: actualHistory, borderColor: "#2563eb", backgroundColor: "transparent", pointRadius: 3, pointHoverRadius: 6, pointBackgroundColor: "#ffffff", pointBorderColor: "#2563eb", pointBorderWidth: 2, order: 0, showLine: false, hidden: !showActualSavings },
                    // Label changed to "เป้าหมาย" (Target) and Color to Blue
                    {
                        label: "เป้าหมาย",
                        data: required.map((val, i) => Number(labels[i]) <= Number(inputs.retireAge) ? val : null),
                        borderColor: "#2563eb",
                        borderDash: [6, 6],
                        backgroundColor: "#2563eb",
                        borderWidth: 0, // Hidden Line (drawn by plugin)

                        // Point Style (Hollow Blue Circle like friends)
                        pointRadius: 0,
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#2563eb",
                        pointBorderWidth: 2,
                        pointHoverRadius: 4,

                        fill: false,
                        order: 2,
                        hidden: false
                    },
                    {
                        label: "มรดก",
                        data: labels.map((age, i) => Number(age) >= Number(inputs.retireAge) ? inputs.legacyFund : null),
                        borderColor: "#EF4444", // Red-500
                        borderDash: [5, 5],
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        fill: false,
                        order: 4,
                        hidden: !(inputs.legacyFund > 0),
                    },
                    {
                        label: "ทุนประกัน", data: sumAssuredSeries, borderColor: "#F97316", backgroundColor: "transparent", borderWidth: 2, stepped: false,
                        pointRadius: 3, // Restored small dots
                        pointHoverRadius: 6,
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#F97316",
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: "#ffffff",
                        pointHoverBorderColor: "#F97316",
                        pointHoverBorderWidth: 3,
                        fill: false, order: 3, hidden: !showSumAssured
                    },
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
                                if (label === "เป้าหมาย") return `เป้าหมาย: ฿${formatNumber(val)}`;
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
                    goalLabelPlugin: { goalValue: result.targetFund, labelText: "เป้าหมายทางการเงิน", formatNumber, chartTickInterval, retireAge: Number(inputs.retireAge) },
                    legacyLabelPlugin: { legacyValue: inputs.legacyFund },
                    agePeriodPlugin: { tickInterval: chartTickInterval },
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
