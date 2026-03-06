"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Eye, EyeOff, Download, Wifi } from "lucide-react";

type EncryptionType = "WPA" | "WEP" | "nopass";

export default function QrGenerator() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState<EncryptionType>("WPA");
  const [showPassword, setShowPassword] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  // WIFI:T:WPA;S:mynetwork;P:mypass;;
  const generateWifiString = () => {
    // Escape special characters in SSID and Password
    const escapeString = (str: string) => str.replace(/([\\;,":])/g, "\\$1");
    
    const escapedSsid = escapeString(ssid);
    const escapedPassword = escapeString(password);
    
    if (encryption === "nopass") {
      return `WIFI:T:nopass;S:${escapedSsid};P:;;`;
    }
    return `WIFI:T:${encryption};S:${escapedSsid};P:${escapedPassword};;`;
  };

  const wifiString = generateWifiString();
  const isFormValid = ssid.trim() !== "" && (encryption === "nopass" || password.length > 0);

  const handleDownload = () => {
    if (!qrRef.current) return;
    
    // Create a canvas to draw the SVG onto, to download as PNG
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Add some padding
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
      }
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `wifi-qr-${ssid || "network"}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/70 dark:bg-black/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10">
      
      {/* Input Section */}
      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Wifi className="w-6 h-6 text-blue-500" />
            Network Details
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your WiFi details to generate a connection QR code.
          </p>
        </div>

        <div className="space-y-4">
          {/* SSID Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Network Name (SSID)
            </label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="e.g. MyHomeNetwork"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Encryption Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Security Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["WPA", "WEP", "nopass"] as EncryptionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setEncryption(type)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    encryption === type
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {type === "nopass" ? "None" : type}
                </button>
              ))}
            </div>
          </div>

          {/* Password Input */}
          {encryption !== "nopass" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter network password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Section */}
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />

        <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 transition-transform duration-300 group-hover:scale-105">
          <QRCodeSVG
            value={wifiString}
            size={200}
            level="M"
            includeMargin={false}
            ref={qrRef}
            className={`transition-opacity duration-300 ${isFormValid ? "opacity-100" : "opacity-20 flex"}`}
          />
        </div>

        {!isFormValid ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm text-center max-w-xs">
            Please enter your network details to generate the QR code.
          </p>
        ) : (
          <div className="space-y-4 w-full flex flex-col items-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white text-center">
              Scan to connect to <span className="font-bold text-blue-500">{ssid}</span>
            </p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-medium hover:scale-105 hover:shadow-lg transition-transform focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:focus:ring-offset-black"
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
