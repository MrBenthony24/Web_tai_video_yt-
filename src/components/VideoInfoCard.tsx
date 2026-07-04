/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clock, Eye, Calendar, ExternalLink, Users } from "lucide-react";
import type { VideoMetadata } from "../types";

interface VideoInfoCardProps {
  metadata: VideoMetadata;
}

export function VideoInfoCard({ metadata }: VideoInfoCardProps) {
  // Format seconds to hh:mm:ss or mm:ss
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail area */}
        <div className="relative aspect-video w-full md:w-80 bg-slate-900 shrink-0">
          <img
            src={metadata.thumbnail}
            alt={metadata.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-slate-900/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-white backdrop-blur-[2px]">
            <Clock className="h-3 w-3" />
            {formatDuration(metadata.duration)}
          </div>
        </div>

        {/* Content Details */}
        <div className="flex flex-col justify-between p-5 md:p-6 grow min-w-0">
          <div>
            <h2 className="font-sans text-lg font-bold leading-snug tracking-tight text-slate-900 line-clamp-2 md:text-xl">
              {metadata.title}
            </h2>
            
            {/* Creator / Channel Details */}
            <div className="mt-4 flex items-center gap-3">
              <img
                src={metadata.author.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(metadata.author.name)}`}
                alt={metadata.author.name}
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full border border-slate-200 bg-slate-50 object-cover"
              />
              <div className="min-w-0">
                <a
                  href={metadata.author.channelUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-sans text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                >
                  {metadata.author.name}
                  <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                </a>
                <p className="flex items-center gap-1 font-mono text-[11px] text-slate-400 mt-0.5">
                  <Users className="h-3 w-3" />
                  {metadata.author.subscribers}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Eye className="h-4 w-4 text-slate-400" />
              <span>
                <strong className="text-slate-700 font-semibold">{metadata.views}</strong> views
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>
                Published <strong className="text-slate-700 font-semibold">{metadata.publishDate}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
