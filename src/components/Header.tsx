/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Download, Music, Shield, Zap } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-blue-600 text-white shadow-sm">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <span className="font-sans font-bold text-xl tracking-tight text-slate-800">
                Y2Extract<span className="text-blue-600">HQ</span>
              </span>
              <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                Full-Stack
              </span>
            </div>
          </div>
          
          <nav className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Zap className="h-3.5 w-3.5 text-blue-500" />
              Real-time Transcoding
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Music className="h-3.5 w-3.5 text-indigo-500" />
              High-Fidelity MP3
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              100% Secure
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
