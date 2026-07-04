/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Download, AlertTriangle, Music, Video, Headphones, Sparkles } from "lucide-react";
import type { FormatOption } from "../types";

interface FormatTableProps {
  videoUrl: string;
  videoTitle: string;
  formats: FormatOption[];
}

export function FormatTable({ videoUrl, videoTitle, formats }: FormatTableProps) {
  const [activeTab, setActiveTab] = useState<"video" | "audio" | "hd-only">("video");
  const [downloadingItag, setDownloadingItag] = useState<number | string | null>(null);

  // Group formats
  // 1. Progressive video formats (contains both video and audio)
  const progressiveFormats = formats.filter(
    (f) => f.hasVideo && f.hasAudio && f.container === "mp4"
  ).sort((a, b) => {
    const resA = parseInt(a.quality) || 0;
    const resB = parseInt(b.quality) || 0;
    return resB - resA;
  });

  // 2. High Definition video-only formats (DASH formats like 1080p, 1440p, 4K)
  const hdVideoOnlyFormats = formats.filter(
    (f) => f.hasVideo && !f.hasAudio
  ).sort((a, b) => {
    const resA = parseInt(a.quality) || 0;
    const resB = parseInt(b.quality) || 0;
    return resB - resA;
  });

  // 3. Audio-only formats (Native M4A / WebM)
  const nativeAudioFormats = formats.filter(
    (f) => !f.hasVideo && f.hasAudio
  ).sort((a, b) => {
    const brA = parseInt(a.quality) || 0;
    const brB = parseInt(b.quality) || 0;
    return brB - brA;
  });

  // 4. Synthetic MP3 conversions (We transcode the highest quality audio to MP3 on-the-fly)
  const mp3Formats = [
    { itag: "mp3-320", container: "mp3", quality: "320kbps", hasVideo: false, hasAudio: true, size: "High-Fi Transcode", mimeType: "audio/mpeg", bitrate: "320k", isSynthetic: true },
    { itag: "mp3-192", container: "mp3", quality: "192kbps", hasVideo: false, hasAudio: true, size: "Standard Transcode", mimeType: "audio/mpeg", bitrate: "192k", isSynthetic: true },
    { itag: "mp3-128", container: "mp3", quality: "128kbps", hasVideo: false, hasAudio: true, size: "Eco Transcode", mimeType: "audio/mpeg", bitrate: "128k", isSynthetic: true },
  ];

  const handleDownload = (itag: number | string, isSynthetic: boolean = false, bitrate?: string) => {
    setDownloadingItag(itag);
    
    // Construct download link
    let downloadUrl = "";
    if (isSynthetic) {
      downloadUrl = `/api/download?url=${encodeURIComponent(videoUrl)}&format=mp3&bitrate=${bitrate}&title=${encodeURIComponent(videoTitle)}`;
    } else {
      downloadUrl = `/api/download?url=${encodeURIComponent(videoUrl)}&itag=${itag}&title=${encodeURIComponent(videoTitle)}`;
    }

    // Trigger standard browser download
    window.location.href = downloadUrl;

    // Reset indicator after a short delay (once the browser handles the download start)
    setTimeout(() => {
      setDownloadingItag(null);
    }, 4000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-1.5 pb-4 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === "video"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Video className="h-3.5 w-3.5" />
          Video (MP4)
        </button>
        <button
          onClick={() => setActiveTab("audio")}
          className={`flex items-center gap-1.5 pb-4 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === "audio"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Music className="h-3.5 w-3.5" />
          Audio (MP3 / M4A)
        </button>
        <button
          onClick={() => setActiveTab("hd-only")}
          className={`flex items-center gap-1.5 pb-4 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === "hd-only"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          High-Def Video
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {/* TAB 1: Progressive Video */}
        {activeTab === "video" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Direct downloads with both high-quality video and audio merged in a standard MP4 file. Highly recommended for general devices.
            </p>
            {progressiveFormats.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center border border-dashed border-slate-200">
                <p className="text-sm font-medium text-slate-500">No direct combined video/audio formats available for this URL.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      <th className="pb-3 pt-3 pl-3">Resolution</th>
                      <th className="pb-3 pt-3">File Type</th>
                      <th className="pb-3 pt-3">File Size</th>
                      <th className="pb-3 pt-3 text-right pr-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {progressiveFormats.map((f) => (
                      <tr key={f.itag} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pl-3">
                          <span className="font-sans font-bold text-slate-800 text-sm">
                            {f.quality}
                          </span>
                          {parseInt(f.quality) >= 720 && (
                            <span className="ml-1.5 inline-flex items-center rounded bg-green-50 border border-green-200 px-1.5 py-0.5 text-[10px] font-bold text-green-700 uppercase">
                              HD
                            </span>
                          )}
                        </td>
                        <td className="py-3.5">
                          <span className="font-mono text-xs text-slate-500 uppercase font-medium">{f.container}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="font-mono text-xs text-slate-500">{f.size}</span>
                        </td>
                        <td className="py-3.5 text-right pr-3">
                          <button
                            onClick={() => handleDownload(f.itag)}
                            disabled={downloadingItag !== null}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-all ${
                              downloadingItag === f.itag
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow shadow-blue-100"
                            }`}
                          >
                            <Download className="h-3.5 w-3.5" />
                            {downloadingItag === f.itag ? "Starting..." : "Download"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Audio Only */}
        {activeTab === "audio" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">
              Extract high-fidelity audio tracks. Choose **MP3 format** for absolute maximum device compatibility (real-time transcoded on our servers using FFmpeg). Choose **Native M4A** for lightning-fast direct streaming with zero transcoding quality loss.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="pb-3 pt-3 pl-3">Audio Bitrate</th>
                    <th className="pb-3 pt-3">File Type</th>
                    <th className="pb-3 pt-3">Engine & Source</th>
                    <th className="pb-3 pt-3 text-right pr-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* MP3 Transcodes */}
                  {mp3Formats.map((f) => (
                    <tr key={f.itag} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-3">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-slate-800 text-sm">
                            {f.quality}
                          </span>
                          {f.quality === "320kbps" && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 uppercase">
                              <Sparkles className="h-2.5 w-2.5" /> Premium
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="font-mono text-xs text-blue-600 font-bold uppercase">{f.container}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 font-sans text-xs text-slate-500">
                          <Headphones className="h-3 w-3 text-blue-400" />
                          {f.size}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-3">
                        <button
                          onClick={() => handleDownload(f.itag, true, f.bitrate)}
                          disabled={downloadingItag !== null}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-all ${
                            downloadingItag === f.itag
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow shadow-blue-100"
                          }`}
                        >
                          <Download className="h-3.5 w-3.5" />
                          {downloadingItag === f.itag ? "Transcoding..." : "Extract MP3"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Native Audio Formats */}
                  {nativeAudioFormats.map((f) => (
                    <tr key={f.itag} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-3">
                        <span className="font-sans font-medium text-slate-700 text-sm">
                          {f.quality}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-mono text-xs text-slate-500 uppercase font-medium">{f.container}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-sans text-xs text-slate-400">Direct Native Stream ({f.size})</span>
                      </td>
                      <td className="py-3.5 text-right pr-3">
                        <button
                          onClick={() => handleDownload(f.itag)}
                          disabled={downloadingItag !== null}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-all ${
                            downloadingItag === f.itag
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-slate-800 text-white hover:bg-slate-700 hover:shadow shadow-slate-100"
                          }`}
                        >
                          <Download className="h-3.5 w-3.5" />
                          {downloadingItag === f.itag ? "Downloading..." : "Download Audio"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: High Definition Video (Only) */}
        {activeTab === "hd-only" && (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-sans font-bold text-amber-950 text-xs">Aesthetic & Technical Consideration</h4>
                <p className="font-sans text-[11px] text-amber-800 leading-relaxed mt-1 font-medium">
                  YouTube serves HD resolutions (1080p, 1440p, 4K) as separate video and audio streams (DASH). Downloading these directly will result in a video file with <strong>no audio</strong>. Refer to our **Technical Guide** below on how to easily merge them using FFmpeg or a scalable cloud API.
                </p>
              </div>
            </div>

            {hdVideoOnlyFormats.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center border border-dashed border-slate-200">
                <p className="text-sm font-medium text-slate-500">No high-definition video-only streams available.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      <th className="pb-3 pt-3 pl-3">HD Resolution</th>
                      <th className="pb-3 pt-3">File Type</th>
                      <th className="pb-3 pt-3">Audio Track</th>
                      <th className="pb-3 pt-3">File Size</th>
                      <th className="pb-3 pt-3 text-right pr-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hdVideoOnlyFormats.map((f) => (
                      <tr key={f.itag} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pl-3">
                          <span className="font-sans font-bold text-slate-800 text-sm">
                            {f.quality}
                          </span>
                          <span className="ml-1.5 inline-flex items-center rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                            Video Only
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="font-mono text-xs text-slate-500 uppercase font-medium">{f.container}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="font-sans text-xs text-red-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Muted
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="font-mono text-xs text-slate-500">{f.size}</span>
                        </td>
                        <td className="py-3.5 text-right pr-3">
                          <button
                            onClick={() => handleDownload(f.itag)}
                            disabled={downloadingItag !== null}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-all ${
                              downloadingItag === f.itag
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow shadow-blue-100"
                            }`}
                          >
                            <Download className="h-3.5 w-3.5" />
                            {downloadingItag === f.itag ? "Starting..." : "Download Muted HD"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
