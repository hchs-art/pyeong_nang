"use client";

import { useCallback, useMemo, useState } from "react";
import RouletteWheel from "@/components/RouletteWheel";

const DEFAULT_ITEMS = ["치킨", "피자", "햄버거", "초밥", "파스타", "샐러드"];
const SPIN_FULL_TURNS = 5;

/** 최종 회전 각도로부터 포인터(12시) 아래에 놓인 항목 인덱스를 계산. */
function winnerFromRotation(rotation: number, count: number) {
  if (count === 0) return -1;
  const segAngle = 360 / count;
  const mod = ((rotation % 360) + 360) % 360;
  const pointerAngle = (360 - mod) % 360; // 휠 자체 좌표상 포인터 위치
  return Math.floor(pointerAngle / segAngle) % count;
}

export default function Home() {
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [draft, setDraft] = useState("");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const canSpin = items.length >= 2 && !spinning;

  const addItem = useCallback(() => {
    const value = draft.trim();
    if (!value) return;
    setItems((prev) => [...prev, value]);
    setDraft("");
  }, [draft]);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index: number, value: string) => {
    setItems((prev) => prev.map((it, i) => (i === index ? value : it)));
  }, []);

  const reset = useCallback(() => {
    setItems(DEFAULT_ITEMS);
    setWinner(null);
  }, []);

  const spin = useCallback(() => {
    if (!canSpin) return;
    const count = items.length;
    const segAngle = 360 / count;
    const target = Math.floor(Math.random() * count);

    // 선택된 세그먼트의 중심이 포인터 아래에 오도록 하는 회전량 + 약간의 흔들림.
    const mid = (target + 0.5) * segAngle;
    const jitterRange = segAngle * 0.6; // 세그먼트 안에서만 흔들리도록 제한
    const jitter = (Math.random() - 0.5) * jitterRange;
    const targetMod = (((360 - mid + jitter) % 360) + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta < 0) delta += 360;

    setWinner(null);
    setSpinning(true);
    setRotation((prev) => prev + SPIN_FULL_TURNS * 360 + delta);
  }, [canSpin, items.length, rotation]);

  const handleSpinEnd = useCallback(() => {
    setSpinning(false);
    const idx = winnerFromRotation(rotation, items.length);
    if (idx >= 0) setWinner(items[idx]);
  }, [rotation, items]);

  const hint = useMemo(() => {
    if (items.length < 2) return "항목을 2개 이상 추가하세요.";
    if (spinning) return "돌리는 중…";
    return "버튼을 눌러 돌려보세요!";
  }, [items.length, spinning]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-8 px-4 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">🎯 룰렛</h1>
        <p className="mt-2 text-sm text-gray-500">
          항목을 추가하고 돌려서 무작위로 하나를 골라보세요.
        </p>
      </header>

      <div className="grid w-full grid-cols-1 items-start gap-10 md:grid-cols-2">
        {/* 왼쪽: 휠 + 컨트롤 */}
        <section className="flex flex-col items-center gap-6">
          <RouletteWheel
            items={items}
            rotation={rotation}
            spinning={spinning}
            onSpinEnd={handleSpinEnd}
          />

          <button
            type="button"
            onClick={spin}
            disabled={!canSpin}
            className="rounded-full bg-indigo-600 px-10 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {spinning ? "돌리는 중…" : "돌리기"}
          </button>

          <p className="min-h-6 text-sm text-gray-500" aria-live="polite">
            {hint}
          </p>

          {winner && (
            <div
              className="w-full rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-center dark:border-indigo-900 dark:bg-indigo-950"
              aria-live="assertive"
            >
              <p className="text-sm text-gray-500">결과</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                🎉 {winner}
              </p>
            </div>
          )}
        </section>

        {/* 오른쪽: 항목 편집 */}
        <section className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">항목 ({items.length})</h2>
            <button
              type="button"
              onClick={reset}
              className="text-sm text-gray-500 underline-offset-2 hover:underline"
            >
              초기화
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addItem();
            }}
            className="flex gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="새 항목 입력"
              aria-label="새 항목"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-900"
            />
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
            >
              추가
            </button>
          </form>

          <ul className="flex flex-col gap-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  value={item}
                  onChange={(e) => updateItem(i, e.target.value)}
                  aria-label={`항목 ${i + 1}`}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  aria-label={`항목 ${i + 1} 삭제`}
                  className="rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  삭제
                </button>
              </li>
            ))}
            {items.length === 0 && (
              <li className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400 dark:border-gray-700">
                항목이 없습니다. 위에서 추가하세요.
              </li>
            )}
          </ul>
        </section>
      </div>

      <footer className="mt-auto pt-6 text-xs text-gray-400">
        Next.js · Tailwind CSS
      </footer>
    </main>
  );
}
