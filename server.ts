/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";
import ytdl from "@distube/ytdl-core";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to format bytes to human readable sizes
function formatBytes(bytes?: string | number): string {
  if (!bytes) return "Unknown";
  const num = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
  if (isNaN(num)) return "Unknown";
  const mb = num / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

// Helper function to format subscribers
function formatSubscribers(count?: number | string): string {
  if (!count) return "Unknown";
  const num = typeof count === "string" ? parseInt(count, 10) : count;
  if (isNaN(num)) return "Unknown";
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M subscribers`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K subscribers`;
  }
  return `${num} subscribers`;
}

// Helper function to format view count
function formatViews(count?: string | number): string {
  if (!count) return "0";
  const num = typeof count === "string" ? parseInt(count, 10) : count;
  if (isNaN(num)) return "0";
  return num.toLocaleString();
}

// Helper to sanitize filenames
function sanitizeFilename(title: string): string {
  return title
    .replace(/[\\/:*?"<>|]/g, "") // Remove characters invalid in Windows filenames
    .replace(/\s+/g, " ")         // Replace multiple spaces with a single space
    .trim();
}

// API Route: Validate YouTube URL and fetch metadata & formats
app.get("/api/info", async (req, res) => {
  const videoUrl = req.query.url as string;

  if (!videoUrl) {
    return res.status(400).json({ error: "YouTube URL is required." });
  }

  try {
    const isValid = ytdl.validateURL(videoUrl);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid YouTube URL format." });
    }

    // Get detailed video info
    const info = await ytdl.getInfo(videoUrl);
    
    const details = info.videoDetails;
    
    // Group and format the available download formats
    const formats = info.formats.map((f) => {
      // Determine quality text
      let quality = "";
      if (f.qualityLabel) {
        quality = f.qualityLabel;
        if (f.fps) quality += ` (${f.fps}fps)`;
      } else if (f.audioBitrate) {
        quality = `${f.audioBitrate}kbps`;
      } else {
        quality = "Unknown Quality";
      }

      return {
        itag: f.itag,
        container: f.container || "mp4",
        quality,
        hasVideo: !!f.hasVideo,
        hasAudio: !!f.hasAudio,
        size: formatBytes(f.contentLength),
        mimeType: f.mimeType || "",
        fps: f.fps,
        bitrate: f.audioBitrate || undefined,
      };
    });

    // Extract relevant data to send to the client
    const responseData = {
      id: details.videoId,
      title: details.title,
      description: details.description || "No description available.",
      duration: parseInt(details.lengthSeconds, 10) || 0,
      views: formatViews(details.viewCount),
      publishDate: details.publishDate || "Unknown date",
      thumbnail: details.thumbnails[details.thumbnails.length - 1]?.url || details.thumbnails[0]?.url || "",
      author: {
        name: details.author.name,
        channelUrl: details.author.channel_url,
        avatar: details.author.thumbnails?.[0]?.url || "",
        subscribers: formatSubscribers(details.author.subscriber_count),
      },
      formats,
    };

    return res.json(responseData);
  } catch (err: any) {
    console.error("Error fetching video info:", err);
    return res.status(500).json({
      error: "Failed to retrieve video metadata. YouTube might be blocking or throttling requests.",
      details: err.message,
    });
  }
});

// API Route: Handle direct download and transcoding on-the-fly
app.get("/api/download", async (req, res) => {
  const videoUrl = req.query.url as string;
  const itagStr = req.query.itag as string;
  const format = (req.query.format as string || "mp4").toLowerCase();
  const title = req.query.title as string || "video";
  const bitrate = req.query.bitrate as string || "192k"; // for mp3 conversion

  if (!videoUrl) {
    return res.status(400).send("YouTube URL is required.");
  }

  try {
    const isValid = ytdl.validateURL(videoUrl);
    if (!isValid) {
      return res.status(400).send("Invalid YouTube URL.");
    }

    const safeTitle = sanitizeFilename(title);

    // If downloading MP3 (Transcoding audio stream on-the-fly)
    if (format === "mp3") {
      res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.mp3"`);
      res.setHeader("Content-Type", "audio/mpeg");

      // Obtain audio-only stream (request highest audio quality)
      const audioStream = ytdl(videoUrl, {
        quality: "highestaudio",
        filter: "audioonly",
      });

      // Spawn ffmpeg to transcode audio stream to MP3 in real-time
      const ffmpegProcess = spawn("ffmpeg", [
        "-i", "pipe:0",              // read input from stdin pipe
        "-f", "mp3",                 // force MP3 container format
        "-ab", bitrate,              // audio bitrate (e.g. 128k, 192k, 320k)
        "-acodec", "libmp3lame",     // MP3 encoder codec
        "pipe:1",                    // output to stdout pipe
      ]);

      // Pipe video stream to ffmpeg stdin
      audioStream.pipe(ffmpegProcess.stdin);

      // Pipe ffmpeg stdout directly to the client's Express response
      ffmpegProcess.stdout.pipe(res);

      // Handle process errors and stream closing
      audioStream.on("error", (err) => {
        console.error("Audio stream error:", err);
        ffmpegProcess.kill("SIGKILL");
      });

      ffmpegProcess.on("error", (err) => {
        console.error("FFmpeg process error:", err);
        if (!res.headersSent) {
          res.status(500).send("Error converting audio to MP3.");
        }
      });

      // Ensure cleanup if the client aborts/closes connection early
      req.on("close", () => {
        audioStream.destroy();
        ffmpegProcess.kill("SIGKILL");
      });

      return;
    }

    // Otherwise, direct stream piping (Progressive MP4 or Video-only / Audio-only)
    if (!itagStr) {
      return res.status(400).send("Itag parameter is required for native formats.");
    }

    const itag = parseInt(itagStr, 10);
    const info = await ytdl.getInfo(videoUrl);
    const selectedFormat = info.formats.find((f) => f.itag === itag);

    if (!selectedFormat) {
      return res.status(404).send("Requested format not found.");
    }

    const ext = selectedFormat.container || "mp4";
    const mime = selectedFormat.mimeType || "video/mp4";

    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.${ext}"`);
    res.setHeader("Content-Type", mime);

    if (selectedFormat.contentLength) {
      res.setHeader("Content-Length", selectedFormat.contentLength);
    }

    // Pipe native stream directly from YouTube to user
    const downloadStream = ytdl(videoUrl, {
      quality: itag,
    });

    downloadStream.pipe(res);

    downloadStream.on("error", (err) => {
      console.error("Download stream error:", err);
    });

    req.on("close", () => {
      downloadStream.destroy();
    });

  } catch (err: any) {
    console.error("Download error:", err);
    if (!res.headersSent) {
      res.status(500).send(`Failed to start download: ${err.message}`);
    }
  }
});

// Setup Vite Development Server or Production Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode with Vite Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    console.log("Vite development server loaded as middleware.");
  } else {
    // Production Mode serving compiled static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static server enabled.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
