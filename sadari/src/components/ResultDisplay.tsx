"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { pickRandom, shuffleList } from "../utils/random";

interface ResultDisplayProps {
    participants: string[];
    onUpdate: (names: string[]) => void;
}

export function ResultDisplay({ participants, onUpdate }: ResultDisplayProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [result, setResult] = useState<string[] | null>(null);
    const [mode, setMode] = useState<"pick" | "shuffle" | null>(null);

    const fireConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    const handlePick = () => {
        if (participants.length === 0) return;
        setMode("pick");
        setIsDrawing(true);
        setResult(null);

        // Simulate drawing animation time with rolling effect
        setTimeout(() => {
            const picked = pickRandom(participants, 1);
            setResult(picked);
            setIsDrawing(false);
            fireConfetti();
        }, 2000);
    };

    const handleShuffle = () => {
        if (participants.length === 0) return;
        setMode("shuffle");
        setIsDrawing(true);
        setResult(null);

        setTimeout(() => {
            const shuffled = shuffleList(participants);
            setResult(shuffled);
            setIsDrawing(false);
            fireConfetti();
        }, 1500);
    };

    const handleExclude = () => {
        if (!result || result.length === 0) return;
        const newParticipants = participants.filter(p => !result.includes(p));
        onUpdate(newParticipants);
        setResult(null);
        setMode(null);
    };

    const hasParticipants = participants.length > 0;

    return (
        <div className="w-full flex flex-col gap-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={handlePick}
                    disabled={!hasParticipants || isDrawing}
                    className="flex-1 py-4 px-6 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 shadow-lg shadow-blue-500/30"
                >
                    한 명 뽑기 (Pick 1)
                </button>
                <button
                    onClick={handleShuffle}
                    disabled={!hasParticipants || isDrawing}
                    className="flex-1 py-4 px-6 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 shadow-lg shadow-indigo-500/30"
                >
                    순서 섞기 (Shuffle)
                </button>
            </div>

            <div className="mt-8 min-h-[200px] flex items-center justify-center p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
                {isDrawing ? (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                            {mode === "pick" ? "추첨 중입니다..." : "섞는 중입니다..."}
                        </p>
                    </div>
                ) : result ? (
                    <div className="w-full h-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-6">
                            {mode === "pick" ? "✨ 당첨자 ✨" : "📝 섞기 결과 📝"}
                        </h3>

                        {mode === "pick" ? (
                            <div className="flex flex-col items-center">
                                <div className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm py-4 tracking-tight">
                                    {result[0]}
                                </div>
                                <button
                                    onClick={handleExclude}
                                    className="mt-8 text-sm px-6 py-2.5 rounded-full border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition shadow-sm font-medium flex items-center gap-2"
                                >
                                    <span>🚀</span> 당첨자 제외하고 명단 업데이트
                                </button>
                            </div>
                        ) : (
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {result.map((name, index) => (
                                    <div
                                        key={`${name}-${index}`}
                                        className="flex items-center p-3 sm:p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm animate-in slide-in-from-bottom-4 duration-500 hover:scale-105 transition-transform"
                                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                                    >
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-sm mr-4">
                                            {index + 1}
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                                            {name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-zinc-400 dark:text-zinc-600 font-medium my-12 text-center animate-pulse">
                        참가자를 입력하고<br />추첨 버튼을 눌러주세요
                    </p>
                )}
            </div>
        </div>
    );
}
