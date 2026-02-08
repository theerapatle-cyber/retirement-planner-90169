import React, { useMemo, useState } from 'react';
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
    ScriptableContext
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { formatNumber } from "@/lib/utils";
import { buildProjectionSeries } from "@/lib/retirement-calculation";
import { CalculationResult, MonteCarloResult, RetirementInputs } from "@/types/retirement";
import { InsuranceChartData } from "./DashboardCharts"; // Import shared interface

// Register ChartJS components (ลงทะเบียน Component กราฟที่ต้องใช้)
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
    inputs: RetirementInputs; // ข้อมูล Input ทั้งหมด
    result: CalculationResult; // ผลลัพธ์การคำนวณ
    mcResult: MonteCarloResult | null; // ผลลัพธ์ Monte Carlo (ถ้ามี)
    showSumAssured: boolean; // แสดงกราฟทุนประกันหรือไม่
    showActualSavings: boolean; // แสดงกราฟเงินออมหรือไม่
    insuranceChartData: InsuranceChartData | null; // ข้อมูลกราฟประกัน
    chartTickInterval: number; // ระยะห่างปี (เช่น ทุก 1 ปี, 5 ปี)
}

// --- MobileProjectionChart: กราฟคาดการณ์สำหรับมือถือ (แสดงแนวตั้ง/แนวนอนได้) ---
export const MobileProjectionChart: React.FC<MobileProjectionChartProps> = ({
    inputs,
    result,
    mcResult,
    showSumAssured,
    showActualSavings,
    insuranceChartData,
    chartTickInterval
}) => {
    // Mode State: 'horizontal' (Bar Chart) vs 'vertical' (Column Chart)
    // สำหรับ Mobile จะใช้ Vertical เป็นหลัก แต่เตรียมไว้เผื่อปรับเปลี่ยน
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

    // Formatting Helpers (ตัวช่วยจัดรูปแบบตัวเลข)
    const valFormatter = (val: number) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
        if (val >= 1000) return (val / 1000).toFixed(0) + "k";
        return String(val);
    };

    // Enforce minimum interval of 5 years on mobile/vertical charts to prevent overcrowding
    // บังคับให้แสดงผลทุก 5 ปี หากเลือก 1 ปี เพื่อไม่ให้กราฟบนจอมือถือแน่นเกินไป
    // If user selects 1 Year on desktop, mobile will still show 5 Years.
    const effectiveInterval = chartTickInterval === 1 ? 5 : chartTickInterval;

    const chartData = useMemo(() => {
        // เตรียมข้อมูลชุดข้อมูล (Series)
        const { labels, actual, required } = buildProjectionSeries(inputs, result);

        // Logic: Keep Current Age, Retirement Age, End Age, and every Nth year
        // กรองข้อมูลแสดงเฉพาะปีที่ต้องการ: ปีปัจจุบัน, ปีเกษียณ, ปีสุดท้าย, และตามจำนวนปีที่เลือก (เช่น ทุก 5 ปี)
        const indicesToKeep: number[] = [];
        labels.forEach((ageStr, index) => {
            const age = Number(ageStr);
            const isStart = index === 0;
            const isEnd = index === labels.length - 1;
            const isRetirement = age === Number(inputs.retireAge);
            const isInterval = age % effectiveInterval === 0;

            if (isStart || isEnd || isRetirement || isInterval) {
                indicesToKeep.push(index);
            }
        });

        // Helper to filter array by indices (ฟังก์ชันช่วยกรองอาร์เรย์ตาม Index ที่เลือก)
        const filterByIndices = (arr: any[]) => arr.filter((_, i) => indicesToKeep.includes(i));

        const filteredLabels = filterByIndices(labels);
        const filteredActual = filterByIndices(actual);
        const filteredRequired = filterByIndices(required);

        // MC Series (เตรียมข้อมูล Monte Carlo ถ้ามี)
        const p5Series = mcResult?.p5Series ? filterByIndices(mcResult.p5Series) : filteredLabels.map(() => 0);
        const p95Series = mcResult?.p95Series ? filterByIndices(mcResult.p95Series) : filteredLabels.map(() => 0);

        // Insurance Series (เตรียมข้อมูลประกัน)
        const sumAssuredSeries = labels.map(ageStr => {
            const age = Number(ageStr);
            if (!insuranceChartData) return 0;
            const idx = insuranceChartData.labels.indexOf(age);
            return idx !== -1 ? (insuranceChartData.datasets[0].data[idx] as number) || 0 : 0;
        });
        const filteredSumAssured = filterByIndices(sumAssuredSeries);

        // Calculate suggested Max (คำนวณค่าสูงสุดแกน Y เพื่อให้กราฟดูสมดุล)
        const maxActual = Math.max(...actual);
        const maxRequired = Math.max(...required);
        const maxSumAssured = showSumAssured ? Math.max(...sumAssuredSeries) : 0;
        const maxMain = Math.max(maxActual, maxRequired, maxSumAssured);
        const suggestedMax = Math.ceil((maxMain * 1.1) / 1000000) * 1000000;

        return {
            data: {
                labels: filteredLabels,
                datasets: [
                    // 1. Monte Carlo Range (Background)
                    {
                        label: "P5",
                        data: p5Series,
                        borderColor: "transparent",
                        backgroundColor: "rgba(16, 185, 129, 0.05)",
                        pointRadius: 0,
                        fill: "+1",
                        tension: 0.4,
                        order: 10,
                        type: 'line' as const,
                        xAxisID: 'x', // Explicit ID binding not strictly needed if only one axis, but safe
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

                    // 2. Savings (Main Bar)
                    {
                        label: "เงินออมคาดว่าจะมี",
                        data: filteredActual,
                        backgroundColor: (context: ScriptableContext<"bar">) => {
                            const ctx = context.chart.ctx;
                            // Gradient Direction depends on Orientation
                            // Vertical: (0,0,0,height), Horizontal: (0,0,width,0)
                            // Ideally use chartArea, but standard gradient works for both simple cases often.
                            // Let's adapt based on orientation state passed via closure if possible, or just standard fill.
                            // For simplicity, a generic gradient or solid color is safer unless we calculate bounds.
                            // Let's use a Diagonal gradient which works for both?
                            // Or standard vertical (Green to Light Green)
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, "rgba(16, 185, 129, 1)");
                            gradient.addColorStop(1, "rgba(16, 185, 129, 0.6)");
                            return gradient;
                        },
                        borderColor: "transparent",
                        borderWidth: 0,
                        borderRadius: 6,
                        barThickness: orientation === 'horizontal' ? (effectiveInterval === 1 ? 8 : 20) : undefined, // Fixed thickness for horizontal view
                        barPercentage: orientation === 'vertical' ? 0.6 : undefined,
                        categoryPercentage: orientation === 'vertical' ? 0.8 : undefined,
                        order: 2,
                        hidden: !showActualSavings,
                        type: 'bar' as const,
                        xAxisID: 'x',
                        yAxisID: 'y',
                    },

                    // 3. Insurance
                    {
                        label: "ทุนประกัน",
                        data: filteredSumAssured,
                        backgroundColor: (context: ScriptableContext<"bar">) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, "rgba(249, 115, 22, 1)");
                            gradient.addColorStop(1, "rgba(249, 115, 22, 0.6)");
                            return gradient;
                        },
                        borderColor: "transparent",
                        borderRadius: 4,
                        barThickness: orientation === 'horizontal' ? (effectiveInterval === 1 ? 4 : 12) : undefined,
                        barPercentage: orientation === 'vertical' ? 0.6 : undefined,
                        categoryPercentage: orientation === 'vertical' ? 0.8 : undefined,
                        order: 3,
                        hidden: !showSumAssured,
                        type: 'bar' as const,
                        xAxisID: 'x',
                        yAxisID: 'y',
                    },

                    // 5. Goal (เป้าหมายเกษียณ)
                    {
                        label: "เป้าหมาย",
                        // Only show goal at Retirement Age for Horizontal mode
                        // แนวนอน: แสดงจุดเดียวที่อายุเกษียณ
                        // แนวตั้ง: แสดงเป็นเส้นตั้งแต่อายุเริ่มต้นถึงเกษียณ
                        data: filteredRequired.map((val, i) => {
                            const age = Number(filteredLabels[i]);
                            const retireAge = Number(inputs.retireAge);
                            if (orientation === 'horizontal') {
                                return age === retireAge ? val : null;
                            }
                            // Vertical mode: Line logic
                            return age <= retireAge ? val : null;
                        }),
                        // Horizontal: Dot (Scatter style), Vertical: Solid Line
                        borderColor: orientation === 'horizontal' ? "transparent" : "rgba(59, 130, 246, 0.5)",
                        backgroundColor: orientation === 'horizontal' ? "#3b82f6" : undefined,
                        borderWidth: orientation === 'horizontal' ? 0 : 4,
                        borderDash: [],
                        pointRadius: orientation === 'horizontal' ? 6 : 0, // Dot only in Horizontal
                        pointHoverRadius: orientation === 'horizontal' ? 8 : 0,
                        fill: false,
                        tension: 0.4,
                        order: 1,
                        type: 'line' as const,
                        spanGaps: true
                    },

                    // 6. Legacy (มรดก)
                    {
                        label: "มรดก",
                        data: filteredLabels.map((age, i) => Number(age) >= Number(inputs.retireAge) ? inputs.legacyFund : null),
                        borderColor: "#EF4444",
                        borderWidth: 3,
                        borderDash: [4, 4],
                        pointRadius: 0,
                        fill: false,
                        order: 0,
                        type: 'line' as const,
                        hidden: !(inputs.legacyFund > 0),
                        spanGaps: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: orientation === 'horizontal' ? 'y' as const : 'x' as const, // สลับแกนตามโหมด (แนวนอน/แนวตั้ง)
                layout: {
                    padding: { left: 0, right: 10, top: 10, bottom: 0 }
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
                        titleFont: { size: 13, weight: 'bold', family: "'Inter', 'Prompt', sans-serif" },
                        bodyFont: { size: 12, family: "'Inter', 'Prompt', sans-serif" },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        usePointStyle: true,
                        callbacks: {
                            title: (items: any[]) => items.length ? `อายุ ${items[0].label} ปี` : "",
                            label: (context: any) => {
                                let label = context.dataset.label || '';
                                let value = orientation === 'horizontal' ? context.parsed.x : context.parsed.y; // Parse based on axis
                                if (label === "P5" || label === "P95") return null;
                                return `${label}: ฿${formatNumber(value)}`;
                            }
                        },
                        filter: (item: any) => item.dataset.label !== "P5" && item.dataset.label !== "P95",
                    },
                },
                scales: {
                    x: orientation === 'horizontal' ? {
                        // Horizontal Mode (X = Value)
                        position: 'bottom' as const,
                        min: 0,
                        max: suggestedMax,
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: {
                            font: { size: 10 },
                            color: '#94a3b8',
                            stepSize: 2000000,
                            callback: (val: any) => valFormatter(val),
                            maxTicksLimit: 20, // Increase limit to allow all 2M steps to show
                        }
                    } : {
                        // Vertical Mode (X = Category/Age)
                        grid: { display: false },
                        ticks: {
                            font: { size: 11 },
                            color: '#64748b',
                            autoSkip: false,
                            maxRotation: 0,
                        }
                    },
                    y: orientation === 'horizontal' ? {
                        // Horizontal Mode (Y = Category/Age)
                        position: 'left' as const,
                        reverse: true, // REVERSE: 30 at bottom, 85 at top
                        grid: { display: false },
                        ticks: {
                            font: { size: 12, weight: 'bold' as const },
                            color: '#64748b',
                            autoSkip: false,
                        }
                    } : {
                        // Vertical Mode (Y = Value)
                        position: 'left' as const,
                        min: 0,
                        max: suggestedMax,
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: {
                            font: { size: 10, weight: 'bold' as const },
                            color: '#94a3b8',
                            // Auto step size for Vertical mode (as per user request "only horizontal")
                            callback: (val: any) => valFormatter(val),
                            maxTicksLimit: 10,
                        }
                    }
                },
                interaction: {
                    mode: 'nearest' as const,
                    axis: orientation === 'horizontal' ? 'y' : 'x',
                    intersect: false,
                },
                onClick: (event, elements, chart) => {
                    if (!elements.length) return;

                    const el = elements[0];
                    const datasetIndex = el.datasetIndex;
                    const index = el.index;
                    const datasetLabel = chart.data.datasets[datasetIndex].label;

                    // Interaction for Single Goal Dot (Horizontal Mode)
                    if (orientation === 'horizontal' && datasetLabel === "เป้าหมาย") {
                        const age = chart.data.labels?.[index];
                        const value = chart.data.datasets[datasetIndex].data[index];
                        // In a real app, use a Toast or Bottom Sheet. For now, native alert or console is simplest proof-of-concept,
                        // but user interaction usually expects visual feedback.
                        // Let's assume the Tooltip is sufficient, or if "cliking" is needed, we alert.
                        // The user said "If press... tell age".
                        alert(`เป้าหมายเกษียณที่อายุ ${age} ปี: ฿${formatNumber(Number(value))}`);
                    }
                },
            } as ChartOptions
        };
    }, [inputs, result, mcResult, showSumAssured, showActualSavings, insuranceChartData, effectiveInterval, orientation]);

    // Calculate Scroll Width for Vertical Mode
    const minVerticalWidth = Math.max(window.innerWidth - 32, chartData.data.labels.length * 50);

    return (
        <div className="w-full h-full flex flex-col relative">

            {/* Header: Legend + Toggle (ส่วนหัวและปุ่มสลับมุมมอง) */}
            <div className="flex flex-col items-center gap-2 mb-2 px-2 shrink-0">

                {/* 1. View Toggle Switch (ปุ่มสลับแนวนอน/แนวตั้ง) */}
                <div className="flex bg-slate-100 p-1 rounded-lg print:hidden">
                    <button
                        onClick={() => setOrientation('horizontal')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${orientation === 'horizontal'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        แนวนอน
                    </button>
                    <button
                        onClick={() => setOrientation('vertical')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${orientation === 'vertical'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        แนวตั้ง
                    </button>
                </div>

                {/* 2. Legend (คำอธิบายสีกราฟ) */}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                    {showActualSavings && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm bg-[#10B981]"></div>
                            <span className="text-[10px] lg:text-xs font-medium text-slate-500">เงินออม</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        {orientation === 'horizontal' ? (
                            <div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-full"></div>
                        ) : (
                            <div className="w-5 h-[4px] bg-[#3b82f6] opacity-50 rounded-full"></div>
                        )}
                        <span className="text-[10px] lg:text-xs font-medium text-slate-500">เป้าหมาย</span>
                    </div>
                    {inputs.legacyFund > 0 && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-0 border-t-[3px] border-dashed border-[#EF4444]"></div>
                            <span className="text-[10px] lg:text-xs font-medium text-slate-500">มรดก</span>
                        </div>
                    )}
                    {showSumAssured && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm bg-[#F97316]"></div>
                            <span className="text-[10px] lg:text-xs font-medium text-slate-500">ทุนประกัน</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Container based on Orientation (พื้นที่แสดงกราฟ) */}
            <div className={`flex-1 w-full relative min-h-0 ${orientation === 'vertical' ? 'overflow-x-auto pb-2 custom-scrollbar' : ''}`}>
                {orientation === 'vertical' ? (
                    <div style={{ width: `${minVerticalWidth}px`, height: '100%' }} className="relative">
                        <Chart type='bar' data={chartData.data} options={chartData.options} />
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        <Chart type='bar' data={chartData.data} options={chartData.options} />
                    </div>
                )}
            </div>
        </div>
    );
};
