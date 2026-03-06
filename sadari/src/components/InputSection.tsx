"use client";

import { useState, useRef, ChangeEvent } from "react";

interface InputSectionProps {
    participants: string[];
    onUpdate: (names: string[]) => void;
}

export function InputSection({ participants, onUpdate }: InputSectionProps) {
    const [inputText, setInputText] = useState(participants.join("\n"));
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setInputText(text);

        // Parse using commas or newlines
        const names = text
            .split(/[\n,]+/)
            .map((n) => n.trim())
            .filter(Boolean);

        // Remove duplicates
        const uniqueNames = Array.from(new Set(names));
        onUpdate(uniqueNames);
    };

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const names = content
                .split(/[\n,]+/)
                .map((n) => n.trim())
                .filter(Boolean);

            const uniqueNames = Array.from(new Set(names));
            onUpdate(uniqueNames);
            setInputText(uniqueNames.join("\n"));
        };
        reader.readAsText(file);

        // Clear input so the same file can be uploaded again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClear = () => {
        setInputText("");
        onUpdate([]);
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
                <label htmlFor="participants" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    참가자 명단 ({participants.length}명)
                </label>
                <div className="flex gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                    >
                        .txt 파일 업로드
                    </button>
                    <input
                        type="file"
                        accept=".txt"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={handleClear}
                        className="text-xs px-3 py-1.5 rounded-md text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                    >
                        초기화
                    </button>
                </div>
            </div>
            <textarea
                id="participants"
                value={inputText}
                onChange={handleTextChange}
                placeholder="이름을 입력하세요 (줄바꿈 또는 쉼표로 구분)&#13;&#10;예: 김철수, 이영희, 박지수"
                className="w-full h-48 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow"
            />
        </div>
    );
}
