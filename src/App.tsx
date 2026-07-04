/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { VideoInfoCard } from "./components/VideoInfoCard";
import { FormatTable } from "./components/FormatTable";
import { TechnicalGuide } from "./components/TechnicalGuide";
import { 
  Search, 
  Youtube, 
  Sparkles, 
  CornerDownRight, 
  HelpCircle, 
  Loader2, 
  AlertCircle,
  X,
  Play,
  ArrowRight
} from "lucide-react";
import type { VideoMetadata } from "./types";
import { motion, AnimatePresence } from "motion/react";

const SAMPLE_VIDEOS = [
  {
    title: "Rick Astley - Never Gonna Give You Up",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tag: "Classic"
  },
  {
    title: "Lofi Girl - Synthwave Radio",
    url: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
    tag: "Music"
  },
  {
    title: "Big Buck Bunny (Sintel) HD",
    url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    tag: "HD Video"
  }
];

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [loadingStatus, setLoadingStatus] = useState("Validating URL...");

  // Rotate loading tips to make the loader engaging
  useEffect(() => {
    if (!loading) return;
    
    const statuses = [
      "Validating URL structure...",
      "Connecting to YouTube servers...",
      "Extracting manifest signatures...",
      "Parsing available stream bitrates...",
      "Filtering direct MP4 download paths...",
      "Preparing server-side transcoding buffers...",
      "Almost ready to download..."
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % statuses.length;
      setLoadingStatus(statuses[currentIdx]);
    }, 1800);

    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (targetUrl?: string) => {
    const searchUrl = targetUrl || url;
    if (!searchUrl.trim()) return;

    setLoading(true);
    setError(null);
    setMetadata(null);
    setLoadingStatus("Validating URL...");

    try {
      const response = await fetch(`/api/info?url=${encodeURIComponent(searchUrl)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch video information.");
      }

      setMetadata(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while processing the YouTube URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = (sampleUrl: string) => {
    setUrl(sampleUrl);
    handleSearch(sampleUrl);
  };

  const handleClear = () => {
    setUrl("");
    setError(null);
    setMetadata(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between">
      <div>
        <Header />

        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
          {/* Hero Section */}
          <section className="text-center space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-100/50"
            >
              <Sparkles className="h-3 w-3" />
              Advanced Video & Audio Fetcher
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl"
            >
              Convert any YouTube video to <br className="sm:hidden" />
              <span className="text-blue-600">High-Quality MP4 or MP3</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto max-w-lg font-sans text-sm text-slate-500 leading-relaxed"
            >
              Fast, secure, and permanent downloads without registration. Instantly convert links to high-fidelity audio or native video formats.
            </motion.p>
          </section>

          {/* Search/Input Form */}
          <section>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="yt-url" className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                  <Youtube className="h-4 w-4 text-blue-600" />
                  YouTube Link or Share URL
                </label>
                
                <div className="relative mt-1 flex flex-col sm:flex-row items-stretch gap-2.5">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search className="h-5 w-5" />
                    </div>
                    
                    <input
                      id="yt-url"
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      className="w-full h-14 pl-12 pr-12 font-sans text-base font-medium text-slate-900 placeholder-slate-400 outline-none border-2 border-blue-500 bg-slate-50 rounded-xl shadow-sm focus:bg-white focus:outline-none transition-all"
                    />

                    {url && (
                      <button
                        onClick={handleClear}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleSearch()}
                    disabled={loading || !url.trim()}
                    className={`h-14 px-8 rounded-xl font-bold transition-all flex items-center justify-center shadow-md ${
                      loading || !url.trim()
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg shadow-blue-100 active:scale-[0.98]"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <span>Fetch Links</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 pl-1 font-medium">
                    <CornerDownRight className="h-3.5 w-3.5 text-slate-300" />
                    Supports short links (youtu.be) and playlist items.
                  </div>
                </div>
              </div>

              {/* Sample Quick Tests */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5 pl-1">
                  Quick Test Templates
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_VIDEOS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickTest(sample.url)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-600 transition-all text-left font-medium"
                    >
                      <Play className="h-3 w-3 shrink-0 text-slate-400 fill-slate-400 group-hover:text-blue-500 group-hover:fill-blue-500" />
                      <span>{sample.title}</span>
                      <span className="ml-1 rounded bg-slate-200/60 px-1 py-0.2 text-[9px] font-bold text-slate-500 shrink-0">
                        {sample.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Dynamic Content Display */}
          <AnimatePresence mode="wait">
            {/* 1. Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full border-4 border-blue-100" />
                  <Loader2 className="absolute h-12 w-12 animate-spin text-blue-600 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-slate-900 text-sm">Processing YouTube Stream</h3>
                  <p className="font-mono text-xs text-blue-600 font-bold h-4">
                    {loadingStatus}
                  </p>
                </div>
              </motion.div>
            )}

            {/* 2. Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm"
              >
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-sans font-bold text-red-950 text-sm">
                      Extraction Interrupted
                    </h3>
                    <p className="font-sans text-xs text-red-800 leading-relaxed">
                      {error}
                    </p>
                    <div className="pt-2">
                      <p className="font-sans text-[11px] text-red-700/80 leading-relaxed">
                        💡 <strong>Why does this happen?</strong> YouTube occasionally detects cloud hosting providers and restricts video info scraping. If this error persists, you can retry using one of our quick test templates or verify the link is publicly accessible.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. Successful Metadata & Formats */}
            {metadata && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <VideoInfoCard metadata={metadata} />
                <FormatTable 
                  videoUrl={url} 
                  videoTitle={metadata.title} 
                  formats={metadata.formats} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Technical Architecture Guide */}
          <section>
            <TechnicalGuide />
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-6 mt-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 space-y-2">
          <p className="font-sans text-xs text-slate-400">
            &copy; 2026 Y2Extract Downloader Engine. Crafted as a high-fidelity full-stack proxy.
          </p>
          <p className="font-sans text-[10px] text-slate-300">
            Disclaimer: This application is built for educational and personal backup purposes. Please respect YouTube’s terms of service and content creator copyrights.
          </p>
        </div>
      </footer>
    </div>
  );
}
