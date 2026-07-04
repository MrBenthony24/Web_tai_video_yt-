/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Author {
  name: string;
  channelUrl: string;
  avatar: string;
  subscribers: string;
}

export interface FormatOption {
  itag: number;
  container: string;
  quality: string;
  hasVideo: boolean;
  hasAudio: boolean;
  size: string;
  mimeType: string;
  fps?: number;
  bitrate?: number;
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  views: string;
  publishDate: string;
  author: Author;
  thumbnail: string;
  formats: FormatOption[];
}
