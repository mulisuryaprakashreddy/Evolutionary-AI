import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipForward, SkipBack } from 'lucide-react';
import { formatTime, parseDuration } from '@/lib/format';

interface VideoPlayerProps {
  src: string;
  duration: string;
  title: string;
}

export default function VideoPlayer({ src, duration, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(parseDuration(duration));
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => setCurrent(video.currentTime);
    const onDuration = () => setTotal(video.duration || parseDuration(duration));
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    video.addEventListener('timeupdate', onTime);
    video.addEventListener('durationchange', onDuration);
    video.addEventListener('progress', onProgress);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [duration]);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
      setMuted(v === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrent(t);
  };

  const skip = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const showControlsTemp = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const progressPct = total > 0 ? (current / total) * 100 : 0;
  const bufferedPct = total > 0 ? (buffered / total) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black"
      onMouseMove={showControlsTemp}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-contain"
        onClick={togglePlay}
        playsInline
      />

      {/* Click overlay for play/pause when video area clicked */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
          aria-label="Play"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-transform hover:scale-110">
            <Play className="h-8 w-8 fill-white text-white" />
          </span>
        </button>
      )}

      {/* Title bar */}
      <div className={`absolute left-0 right-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-4 pt-3 pb-8 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <h2 className="text-sm font-medium text-white line-clamp-2">{title}</h2>
      </div>

      {/* Controls bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Progress bar */}
        <div className="group/progress relative mb-2 h-1 cursor-pointer">
          <div className="absolute inset-0 h-1 rounded-full bg-white/30" />
          <div className="absolute h-1 rounded-full bg-white/40" style={{ width: `${bufferedPct}%` }} />
          <div className="absolute h-1 rounded-full bg-brand-red" style={{ width: `${progressPct}%` }} />
          <input
            type="range"
            min={0}
            max={total || 0}
            step={0.1}
            value={current}
            onChange={handleSeek}
            className="brand-range absolute inset-0 w-full opacity-0 group-hover/progress:opacity-100"
            style={{
              background: `linear-gradient(to right, #ff0000 ${progressPct}%, transparent ${progressPct}%)`,
            }}
          />
        </div>

        {/* Buttons row */}
        <div className="flex items-center gap-2 text-white">
          <button onClick={togglePlay} className="rounded p-1 transition-colors hover:bg-white/20" aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
          </button>
          <button onClick={() => skip(-10)} className="rounded p-1 transition-colors hover:bg-white/20" aria-label="Back 10 seconds">
            <SkipBack className="h-5 w-5" />
          </button>
          <button onClick={() => skip(10)} className="rounded p-1 transition-colors hover:bg-white/20" aria-label="Forward 10 seconds">
            <SkipForward className="h-5 w-5" />
          </button>

          <div className="group/vol flex items-center gap-1">
            <button onClick={toggleMute} className="rounded p-1 transition-colors hover:bg-white/20" aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted || volume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolume}
              className="brand-range w-0 opacity-0 transition-all group-hover/vol:w-16 group-hover/vol:opacity-100"
              style={{
                background: `linear-gradient(to right, #fff ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(muted ? 0 : volume) * 100}%)`,
              }}
            />
          </div>

          <span className="ml-1 text-xs tabular-nums text-white">
            {formatTime(current)} / {formatTime(total)}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button className="rounded p-1 transition-colors hover:bg-white/20" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </button>
            <button onClick={toggleFullscreen} className="rounded p-1 transition-colors hover:bg-white/20" aria-label="Fullscreen">
              {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
