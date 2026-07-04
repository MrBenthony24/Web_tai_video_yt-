/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Code, Cpu, Server, Layers, HelpCircle, CheckCircle } from "lucide-react";

export function TechnicalGuide() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 md:p-8 space-y-8">
      {/* Introduction Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-sans text-base font-bold text-slate-900 md:text-lg">
            Systems Architecture & Stream Merging Guide
          </h3>
          <p className="font-sans text-xs text-slate-500 leading-relaxed mt-1">
            Understanding how high-resolution YouTube streaming operates and implementing scalable solutions for merging split DASH streams.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Core Challenge Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Layers className="h-4.5 w-4.5" />
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider">The Split-Stream Challenge</h4>
          </div>
          <p className="font-sans text-xs text-slate-600 leading-relaxed">
            YouTube serves video files in resolutions higher than 720p (such as 1080p, 1440p, and 4K) using **DASH (Dynamic Adaptive Streaming over HTTP)**. In this configuration:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-500">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>The **video stream** is muted and contains only visual content.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>The **audio stream** is separated entirely.</span>
            </li>
          </ul>
          <p className="font-sans text-xs text-slate-600 leading-relaxed">
            To provide a single high-definition download with sound, the server must fetch both components and combine them using a transcoding pipeline.
          </p>
        </div>

        {/* FFmpeg Integration Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Cpu className="h-4.5 w-4.5" />
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider">Solution A: Self-Hosted Merging</h4>
          </div>
          <p className="font-sans text-xs text-slate-600 leading-relaxed">
            Since **FFmpeg** is preinstalled in this environment (at `/usr/bin/ffmpeg`), you can merge streams programmatically in Node.js.
          </p>
          <div className="relative">
            <pre className="font-mono text-[10px] text-blue-900 bg-blue-50/30 rounded-lg p-3 overflow-x-auto leading-relaxed border border-blue-100">
{`# FFmpeg Merging Command Syntax
ffmpeg \\
  -i video.mp4 \\
  -i audio.m4a \\
  -c:v copy -c:a aac \\
  output_1080p.mp4`}
            </pre>
          </div>
          <p className="font-sans text-[11px] text-slate-500 italic">
            This operation copies the video frames without re-encoding (`-c:v copy`), and encodes audio to AAC format—reducing CPU overhead significantly.
          </p>
        </div>
      </div>

      {/* Production Implementation Options */}
      <div className="space-y-4">
        <h4 className="font-sans text-sm font-bold text-slate-800 flex items-center gap-2">
          <Server className="h-4 w-4 text-slate-500" />
          Production Engineering Solutions
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Node.js Streaming Implementation code */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-xs text-slate-800">1. Node.js Streaming Pipeline</span>
                <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">Cost: $0</span>
              </div>
              <p className="font-sans text-[11px] text-slate-500 leading-relaxed mt-2">
                Instantiate both the video and audio streams using `@distube/ytdl-core`, and pipe them as two separate streaming inputs directly to a spawned FFmpeg process.
              </p>
              <div className="mt-3">
                <pre className="font-mono text-[9px] bg-slate-50 rounded p-2.5 overflow-x-auto text-slate-700 border border-slate-200">
{`// Merging pipeline template
const ffmpeg = spawn('ffmpeg', [
  '-i', videoStreamUrl,
  '-i', audioStreamUrl,
  '-c:v', 'copy',
  '-c:a', 'aac',
  '-f', 'matroska', // support on-the-fly streaming
  'pipe:1'
]);
ffmpeg.stdout.pipe(res);`}
                </pre>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
              ⚠️ Consumes server memory & high CPU during multiple parallel operations.
            </div>
          </div>

          {/* Third-Party APIs */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-xs text-slate-800">2. Third-Party APIs (Recommended)</span>
                <span className="rounded bg-green-50 border border-green-200 px-1.5 py-0.5 text-[9px] font-bold text-green-700">Scalable & Fast</span>
              </div>
              <p className="font-sans text-[11px] text-slate-500 leading-relaxed mt-2">
                If self-hosting the merging process consumes too much CPU or exceeds server resource allocation, you can query reliable third-party rapid APIs that handle hosting, proxying, and heavy encoding.
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>RapidAPI YouTube Downloader</strong>: Offers high-performance JSON endpoints returns final combined 1080p links.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Cobalt API</strong>: A beautiful, modern open-source web service that accepts a video URL and returns a ready-to-download combined file.</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
              ✅ Highly recommended for scalable, cost-efficient, production-grade applications.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
