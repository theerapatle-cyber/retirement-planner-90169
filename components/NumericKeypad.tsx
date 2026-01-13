"use client";

import * as React from "react";
import { X, Check, Delete, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPreviewNumber } from "@/app/lib/number-utils";

import { createPortal } from "react-dom";

interface NumericKeypadProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    initialValue: string | number;
    label?: string;
    allowDecimal?: boolean;
}

export function NumericKeypad({
    isOpen,
    onClose,
    onConfirm,
    initialValue,
    label,
    allowDecimal = true,
}: NumericKeypadProps) {
    const [displayValue, setDisplayValue] = React.useState("");
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (isOpen) {
            let val = String(initialValue);
            // If it's a "0" (and not actively being typed as 0.something), start clean
            if (val === "0") val = "";
            setDisplayValue(val);
        }
    }, [isOpen, initialValue]);

    // Format for display: 123456 -> 123,456
    const formattedDisplay = React.useMemo(() => {
        if (displayValue === "") return "";
        if (displayValue.endsWith(".")) return formatPreviewNumber(displayValue.slice(0, -1)) + ".";
        // Handle intermediate decimal states like "123.0"
        if (displayValue.includes(".") && displayValue.endsWith("0")) {
            const [int, dec] = displayValue.split(".");
            return `${formatPreviewNumber(int)}.${dec}`;
        }
        return formatPreviewNumber(displayValue);
    }, [displayValue]);

    if (!isOpen || !mounted) return null;

    const handleNumClick = (num: string) => {
        setDisplayValue((prev) => {
            // Prevent multiple leading zeros
            if (prev === "0" && num === "0") return "0";
            if (prev === "0" && num !== ".") return num;
            if (prev === "" && num === ".") return "0.";
            // Max length check to prevent layout break
            if (prev.length > 15) return prev;
            return prev + num;
        });
    };

    const handleDecimal = () => {
        if (!allowDecimal) return;
        setDisplayValue((prev) => {
            if (prev.includes(".")) return prev;
            return prev === "" ? "0." : prev + ".";
        });
    };

    const handleBackspace = () => {
        setDisplayValue((prev) => prev.slice(0, -1));
    };

    const handleClear = () => {
        setDisplayValue("");
    };

    const handleConfirm = () => {
        const finalVal = displayValue === "" ? "0" : displayValue;
        onConfirm(finalVal);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-indigo-900/30 backdrop-blur-[8px] transition-all duration-300"
                onClick={onClose}
            />

            <div className="relative z-50 w-full sm:w-[380px] animate-in zoom-in-95 slide-in-from-bottom-12 duration-300">
                <Card className="w-full bg-white/90 backdrop-blur-2xl border-white/60 shadow-[0_40px_80px_-20px_rgba(50,50,93,0.3)] rounded-[3rem] overflow-hidden ring-1 ring-white/80 p-1">
                    <div className="bg-gradient-to-b from-white/50 to-white/20 p-6 rounded-[2.8rem] flex flex-col gap-5 relative">

                        {/* Close Button (Floating) */}
                        <div className="absolute top-5 right-5 z-20">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 rounded-full bg-slate-100/80 text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-colors shadow-sm"
                            >
                                <X className="w-4 h-4" strokeWidth={3} />
                            </Button>
                        </div>

                        {/* Display Area */}
                        <div className="w-full pt-6 pb-2 flex flex-col items-end px-2 space-y-1 relative">
                            {/* Decorative background blob */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                            <span className="text-[9px] font-extrabold text-indigo-300 tracking-[0.2em] uppercase">Value</span>
                            <div className="relative z-10 w-full text-right">
                                <span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-slate-800 via-slate-700 to-slate-500 drop-shadow-sm select-none break-all leading-none">
                                    {displayValue === "" ? <span className="text-slate-200/50">0</span> : formattedDisplay}
                                </span>
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50" />

                        {/* Keypad Grid */}
                        <div className="grid grid-cols-4 gap-3">

                            {/* Row 1 */}
                            <KeypadButton onClick={() => handleNumClick("7")}>7</KeypadButton>
                            <KeypadButton onClick={() => handleNumClick("8")}>8</KeypadButton>
                            <KeypadButton onClick={() => handleNumClick("9")}>9</KeypadButton>

                            <KeypadButton
                                onClick={handleClear}
                                className="bg-rose-50/80 text-rose-500 hover:bg-rose-100 border-rose-100"
                            >
                                <div className="flex flex-col items-center justify-center">
                                    <RotateCcw className="w-5 h-5 mb-0.5" strokeWidth={2.5} />
                                </div>
                            </KeypadButton>

                            {/* Row 2 */}
                            <KeypadButton onClick={() => handleNumClick("4")}>4</KeypadButton>
                            <KeypadButton onClick={() => handleNumClick("5")}>5</KeypadButton>
                            <KeypadButton onClick={() => handleNumClick("6")}>6</KeypadButton>

                            <KeypadButton
                                onClick={handleBackspace}
                                className="bg-amber-50/80 text-amber-500 hover:bg-amber-100 border-amber-100"
                            >
                                <Delete className="w-6 h-6" strokeWidth={2.5} />
                            </KeypadButton>

                            {/* Row 3 */}
                            <KeypadButton onClick={() => handleNumClick("1")}>1</KeypadButton>
                            <KeypadButton onClick={() => handleNumClick("2")}>2</KeypadButton>
                            <KeypadButton onClick={() => handleNumClick("3")}>3</KeypadButton>

                            {/* Confirm (Big Button) */}
                            <Button
                                onClick={handleConfirm}
                                className="row-span-2 h-full w-full rounded-[2rem] bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)] border-t border-white/20 active:scale-95 transition-all group"
                            >
                                <div className="flex flex-col items-center gap-1 group-hover:scale-110 transition-transform duration-200">
                                    <Check className="w-8 h-8" strokeWidth={4} />
                                </div>
                            </Button>

                            {/* Row 4 */}
                            <KeypadButton onClick={() => handleNumClick("0")} className="col-span-2 aspect-auto h-[4.5rem]">0</KeypadButton>
                            <KeypadButton onClick={handleDecimal} disabled={!allowDecimal} className="h-[4.5rem] text-4xl pb-4">.</KeypadButton>

                        </div>
                    </div>
                </Card>
            </div>
        </div>,
        document.body
    );
}

function KeypadButton({
    children,
    onClick,
    className,
    disabled
}: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "h-[4.5rem] w-full rounded-[1.5rem] text-2xl font-bold transition-all duration-200 select-none flex items-center justify-center",
                "bg-white shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100",
                "text-slate-600 hover:text-slate-900 hover:bg-white hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/10",
                "active:scale-90 active:bg-slate-50",
                "disabled:opacity-30 disabled:pointer-events-none",
                className
            )}
        >
            {children}
        </button>
    );
}
