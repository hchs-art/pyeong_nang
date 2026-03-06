"use client";

import { Suspense } from "react";
import { useParticipants } from "../hooks/useParticipants";
import { InputSection } from "../components/InputSection";
import { ResultDisplay } from "../components/ResultDisplay";

// Required for Cloudflare Pages when using useSearchParams in Next.js 14+ 
// to prevent it from trying to statically generate the page at build time.
export const dynamic = 'force-dynamic';

function AppContent() {
  const { isMounted, participants, updateParticipants } = useParticipants();

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-300">
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center">
        {/* Header section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
            팀 랜덤 선택기
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
            참가자 명단을 입력하고 공정하게 랜덤으로 추첨해보세요. URL을 복사해 팀원들과 바로 공유할 수도 있습니다.
          </p>
        </div>

        {/* Input & Display Container */}
        <div className="w-full bg-white dark:bg-zinc-900/50 rounded-3xl p-6 sm:p-10 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: "150px" }}>
          <InputSection participants={participants} onUpdate={updateParticipants} />
          <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
          <ResultDisplay participants={participants} onUpdate={updateParticipants} />
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AppContent />
    </Suspense>
  );
}
