import QrGenerator from "@/components/QrGenerator";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4 sm:p-8 font-[family-name:var(--font-sans)] relative overflow-hidden">
      {/* Background ambient lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />

      <main className="w-full max-w-5xl flex flex-col items-center gap-8 relative z-10">
        <div className="text-center space-y-4 mb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Wi-Fi QR Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Create a secure QR code for your Wi-Fi network instantly. Guests can simply scan to connect without typing passwords.
          </p>
        </div>

        <QrGenerator />
      </main>

      <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-500 relative z-10">
        &copy; {new Date().getFullYear()} Wi-Fi QR Generator. All data processing happens in your browser.
      </footer>
    </div>
  );
}
