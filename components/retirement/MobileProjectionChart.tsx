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
    TooltipItem
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { formatNumber } from "@/lib/utils";
import { buildProjectionSeries } from "@/lib/retirement-calculation";
import { CalculationResult, MonteCarloResult, RetirementInputs } from "@/types/retirement";
import { InsuranceChartData } from "./DashboardCharts"; // Import shared interface

// Register ChartJS components (Redundant if already registered in app entry, but safe here)
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

interface MobileProjectionChartProps {
    inputs: RetirementInputs;
    result: CalculationResult;
    mcResult: MonteCarloResult;
    showSumAssured: boolean;
    showActualSavings: boolean;
    insuranceChartData: InsuranceChartData | null;
    chartTickInterval: number;
}

export const MobileProjectionChart: React.FC<MobileProjectionChartProps> = ({
    inputs,
    result,
    mcResult,
    showSumAssured,
    showActualSavings,
    insuranceChartData,
    chartTickInterval
}) => {

    // Formatting Helpers
    const valFormatter = (val: number) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
        if (val >= 1000) return (val / 1000).toFixed(0) + "k";
        return String(val);
    };

    const chartData = useMemo(() => {
        const { labels, actual, required, actualHistory } = buildProjectionSeries(inputs, result);

        // Prepare Series Data
        const p5Series = mcResult.p5Series || labels.map(() => 0);
        const p95Series = mcResult.p95Series || labels.map(() => 0);

        const sumAssuredSeries = labels.map(ageStr => {
            const age = Number(ageStr);
            if (!insuranceChartData) return 0;
            const idx = insuranceChartData.labels.indexOf(age);
            return idx !== -1 ? (insuranceChartData.datasets[0].data[idx] as number) || 0 : 0;
        });

        // Calculate Max for Scale
        const maxActual = Math.max(...actual);
        const maxRequired = Math.max(...required);
        const maxSumAssured = showSumAssured ? Math.max(...sumAssuredSeries) : 0;
        const maxMain = Math.max(maxActual, maxRequired, maxSumAssured);
        const suggestedMax = Math.ceil((maxMain * 1.1) / 1000000) * 1000000;

        return {
            data: {
                labels,
                datasets: [
                    // Order Matters for painting layers: Background (MC) -> Bars -> Lines -> Foreground

                    // 1. Monte Carlo Range (Background Area)
                    {
                        label: "P5",
                        data: p5Series,
                        borderColor: "transparent",
                        backgroundColor: "rgba(16, 185, 129, 0.05)", // Very faint green
                        pointRadius: 0,
                        fill: "+1", // Fill to next dataset (P95)
                        tension: 0.4,
                        order: 10,
                        type: 'line' as const,
                        xAxisID: 'x',
                        yAxisID: 'y',
                    },
                    {
                        label: "P95",
                        data: p95Series,
                        borderColor: "transparent",
                        backgroundColor: "rgba(16, 185, 129, 0.05)",
                        pointRadius: 0,
                        fill: false,
                        tension: 0.4,
                        order: 11,
                        type: 'line' as const,
                        xAxisID: 'x',
                        yAxisID: 'y',
                    },

                    // 2. Accumulated Savings (Main Bar)
                    {
                        label: "เงินออมคาดว่าจะมี",
                        data: actual,
                        backgroundColor: "#10B981", // Solid Green
                        borderColor: "transparent",
                        borderWidth: 0,
                        borderRadius: 2,
                        barThickness: 6, // Slim bars
                        order: 2,
                        hidden: !showActualSavings,
                        type: 'bar' as const,
                        // Stack group to allow side-by-side with Insurance? 
                        // Default behavior of Bar chart is side-by-side unless stacked: true.
                    },

                    // 3. Insurance (Parallel Bar)
                    {
                        label: "ทุนประกัน",
                        data: sumAssuredSeries,
                        backgroundColor: "#F97316", // Orange 500
                        borderColor: "transparent",
                        borderRadius: 2,
                        barThickness: 4, // Slightly thinner than savings
                        order: 3,
                        hidden: !showSumAssured,
                        type: 'bar' as const,
                    },

                    // 4. Financial Goal (Reference Line - Dashed)
                    {
                        label: "เป้าหมาย",
                        data: required.map((val, i) => Number(labels[i]) <= Number(inputs.retireAge) ? val : null),
                        borderColor: "#3b82f6", // Blue 500
                        borderWidth: 2,
                        borderDash: [4, 4],
                        pointRadius: 0,
                        fill: false,
                        tension: 0.4, // Curve to smooth out the path
                        order: 1, // On top
                        type: 'line' as const,
                    },

                    // 5. Legacy (Post-Retirement)
                    {
                        label: "มรดก",
                        data: labels.map((age, i) => Number(age) >= Number(inputs.retireAge) ? inputs.legacyFund : null),
                        borderColor: "#EF4444", // Red 500
                        borderWidth: 2,
                        borderDash: [2, 2],
                        pointRadius: 0,
                        fill: false,
                        order: 0, // Very Top
                        type: 'line' as const,
                        hidden: !(inputs.legacyFund > 0),
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y' as const, // Horizontal Chart!
                layout: {
                    padding: { left: 0, right: 10, top: 0, bottom: 0 }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index' as const,
                        intersect: false,
                        position: 'nearest' as const,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1e293b',
                        bodyColor: '#475569',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        titleFont: { size: 12, weight: 'bold', family: "'Inter', 'Prompt', sans-serif" },
                        bodyFont: { size: 11, family: "'Inter', 'Prompt', sans-serif" },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: true,
                        usePointStyle: true,
                        callbacks: {
                            title: (items: any[]) => items.length ? `อายุ ${items[0].label} ปี` : "",
                            label: (context: any) => {
                                let label = context.dataset.label || '';
                                let value = context.parsed.x; // Value is on X axis now
                                if (label === "P5" || label === "P95") return null; // Hide MC bounds in tooltip to reduce clutter/duplication unless requested
                                return `${label}: ฿${formatNumber(value)}`;
                            }
                        },
                        filter: (item: any) => item.dataset.label !== "P5" && item.dataset.label !== "P95", // Explicit filter
                    },
                    // Disable custom plugins from Shared Charts by not registering them here or locally disabling if registered globally
                },
                scales: {
                    x: {
                        position: 'bottom' as const,
                        min: 0,
                        max: suggestedMax,
                        grid: {
                            color: '#f1f5f9',
                            drawBorder: false,
                        },
                        ticks: {
                            font: { size: 9 }, // Tiny text
                            color: '#94a3b8',
                            callback: (val: any) => valFormatter(val),
                            maxTicksLimit: 5,
                        },
                        title: { display: false },
                    },
                    y: {
                        position: 'left' as const,
                        reverse: false, // Age goes down (top) to up (bottom) naturally in ChartJS Bar?
                        // Actually in Bars, index 0 is at Top usually.
                        // We want Age 30 at Top, Age 85 at Bottom => Standard behavior.
                        grid: {
                            display: false,
                        },
                        ticks: {
                            font: { size: 10, weight: 'bold' as const },
                            color: '#64748b',
                            autoSkip: false, // We want to control skipping manually if needed
                            callback: function (this: any, val: any, index: number) {
                                // Show every 5th or 10th label based on density
                                const label = this.getLabelForValue(val as number);
                                const age = Number(label);
                                // Show first, last, and interval
                                const isInterval = age % 5 === 0;
                                return isInterval ? `${age}` : "";
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index' as const,
                    intersect: false,
                },
            } as ChartOptions
        };
    }, [inputs, result, mcResult, showSumAssured, showActualSavings, insuranceChartData]);

    return (
        <div className="w-full h-full relative overflow-hidden">
            <Chart type='bar' data={chartData.data} options={chartData.options} />
        </div>
    );
};
