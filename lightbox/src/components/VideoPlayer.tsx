"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  src: string;
  title?: string;
}

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    cleanup();

    if (src.includes(".m3u8") || src.includes("m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error("HLS 播放错误:", data);
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

    return cleanup;
  }, [src]);

  if (!src) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-black text-[var(--muted)]">
        请选择剧集开始播放
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        controls
        playsInline
        className="aspect-video w-full"
        title={title}
      />
    </div>
  );
}
