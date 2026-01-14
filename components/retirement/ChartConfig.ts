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
    Plugin,
    ChartType
} from "chart.js";

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

// Module augmentation to fix lint error for custom plugin options
declare module 'chart.js' {
    interface PluginOptionsByType<TType extends ChartType> {
        goalLabelPlugin?: {
            goalValue: number;
            labelText: string;
            formatNumber: (v: number | string) => string;
            chartTickInterval: number;
        };
    }
}


export const goalLabelPlugin: Plugin<'line'> = {
    id: 'goalLabelPlugin',
    afterDraw: (chart, args, options) => {
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

export const crosshairPlugin = {
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
