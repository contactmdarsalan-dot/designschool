import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import {
  EmptyWorkspaceState,
  StatusBadge,
  WorkspaceError,
  WorkspaceLoading,
} from '../components/student/StudentWorkspaceUi';
import { useStudentWorkspaceResource } from '../hooks/useStudentWorkspaceResource';
import { cx, formatDate } from '../lib/studentWorkspace';
import { pageTransition } from '../lib/studentWorkspaceMotion';

const formatDuration = (seconds) => {
  const safeSeconds = Math.max(Number(seconds || 0), 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

const playbackRates = [0.75, 1, 1.25, 1.5, 2];

const StudentVideoPlayerPage = () => {
  const { recordingId } = useParams();
  const playerElementId = useMemo(() => `youtube-player-${recordingId}`, [recordingId]);
  const playerRef = useRef(null);
  const frameWrapRef = useRef(null);
  const [apiReady, setApiReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { data, isLoading, error } = useStudentWorkspaceResource(
    'students/recordings/',
    {
      summary: {},
      recordings: [],
    },
    'Unable to load this lesson.',
  );

  const recordings = data.recordings || [];
  const recording = recordings.find((item) => String(item.id) === String(recordingId)) || recordings[0] || null;
  const isYoutube = recording?.video_provider === 'youtube' && recording?.youtube_video_id;
  const progress = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

  useEffect(() => {
    if (!isYoutube) {
      return undefined;
    }

    if (window.YT?.Player) {
      const timeoutId = window.setTimeout(() => setApiReady(true), 0);
      return () => window.clearTimeout(timeoutId);
    }

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      setApiReady(true);
    };

    return () => {
      window.onYouTubeIframeAPIReady = previousCallback;
    };
  }, [isYoutube]);

  useEffect(() => {
    if (!apiReady || !isYoutube || !recording?.youtube_video_id) {
      return undefined;
    }

    const resetTimeoutId = window.setTimeout(() => {
      setPlayerReady(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(Number(recording.duration_seconds || 0));
    }, 0);

    playerRef.current?.destroy?.();
    playerRef.current = new window.YT.Player(playerElementId, {
      videoId: recording.youtube_video_id,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onReady: (event) => {
          event.target.setVolume(volume);
          event.target.setPlaybackRate(playbackRate);
          setDuration(event.target.getDuration() || Number(recording.duration_seconds || 0));
          setPlayerReady(true);
        },
        onStateChange: (event) => {
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
        },
      },
    });

    return () => {
      window.clearTimeout(resetTimeoutId);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [apiReady, isYoutube, playbackRate, playerElementId, recording?.duration_seconds, recording?.youtube_video_id, volume]);

  useEffect(() => {
    if (!playerReady || !isYoutube) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) {
        return;
      }
      setCurrentTime(player.getCurrentTime() || 0);
      setDuration(player.getDuration() || Number(recording?.duration_seconds || 0));
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [isYoutube, playerReady, recording?.duration_seconds]);

  const togglePlayback = () => {
    if (!playerRef.current || !playerReady) {
      return;
    }
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const seekBy = (offset) => {
    if (!playerRef.current || !playerReady) {
      return;
    }
    playerRef.current.seekTo(Math.max(currentTime + offset, 0), true);
  };

  const seekTo = (value) => {
    const nextTime = Number(value);
    setCurrentTime(nextTime);
    playerRef.current?.seekTo?.(nextTime, true);
  };

  const handleVolume = (value) => {
    const nextVolume = Number(value);
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
    playerRef.current?.setVolume?.(nextVolume);
    if (nextVolume > 0) {
      playerRef.current?.unMute?.();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) {
      return;
    }
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume || 80);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const changePlaybackRate = (value) => {
    const nextRate = Number(value);
    setPlaybackRate(nextRate);
    playerRef.current?.setPlaybackRate?.(nextRate);
  };

  const openFullscreen = () => {
    frameWrapRef.current?.requestFullscreen?.();
  };

  if (isLoading) {
    return <WorkspaceLoading label="Loading video player..." />;
  }

  if (!recording) {
    return (
      <motion.div variants={pageTransition} initial="hidden" animate="show" className="space-y-6">
        {error ? <WorkspaceError message={error} /> : null}
        <EmptyWorkspaceState title="No lesson found" description="Published recordings appear here." />
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="space-y-5">
      {error ? <WorkspaceError message={error} /> : null}

      <section className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/dashboard/recordings"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#dce5f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#53657f] transition hover:bg-[#f8fafc]"
        >
          <ArrowLeft className="h-4 w-4" />
          Recordings
        </Link>
        <div className="flex items-center gap-2">
          <StatusBadge value={recording.video_provider || 'Video'} tone={isYoutube ? 'success' : 'neutral'} />
          {recording.is_unlisted ? <StatusBadge value="Unlisted" tone="info" /> : null}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-2xl border border-[#dfe7f2] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div ref={frameWrapRef} className="relative aspect-video bg-[#07111f]">
            {isYoutube ? (
              <div id={playerElementId} className="h-full w-full" />
            ) : (
              <iframe
                src={recording.embed_url || recording.video_url}
                title={recording.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )}
          </div>

          <div className="border-t border-[#e8eef6] bg-white px-4 py-4">
            <div className="flex flex-col gap-3">
              <div>
                <div className="h-2 rounded-full bg-[#e7edf6]">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="1"
                  value={Math.min(currentTime, duration || currentTime)}
                  onChange={(event) => seekTo(event.target.value)}
                  disabled={!isYoutube || !playerReady}
                  aria-label="Video progress"
                  className="mt-[-10px] block h-5 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlayback}
                    disabled={!isYoutube || !playerReady}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-[#b8c8bf]"
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => seekBy(-10)}
                    disabled={!isYoutube || !playerReady}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce5f0] text-[#53657f] transition hover:bg-[#f8fafc] disabled:opacity-40"
                    aria-label="Back 10 seconds"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => seekBy(10)}
                    disabled={!isYoutube || !playerReady}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce5f0] text-[#53657f] transition hover:bg-[#f8fafc] disabled:opacity-40"
                    aria-label="Forward 10 seconds"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <p className="min-w-[84px] text-sm font-medium tabular-nums text-[#53657f]">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    disabled={!isYoutube || !playerReady}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce5f0] text-[#53657f] transition hover:bg-[#f8fafc] disabled:opacity-40"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(event) => handleVolume(event.target.value)}
                    disabled={!isYoutube || !playerReady}
                    aria-label="Volume"
                    className="w-24 accent-emerald-500 disabled:opacity-40"
                  />
                  <select
                    value={playbackRate}
                    onChange={(event) => changePlaybackRate(event.target.value)}
                    disabled={!isYoutube || !playerReady}
                    className="h-10 rounded-xl border border-[#dce5f0] bg-white px-2 text-sm font-medium text-[#53657f] outline-none disabled:opacity-40"
                    aria-label="Playback speed"
                  >
                    {playbackRates.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}x
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={openFullscreen}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce5f0] text-[#53657f] transition hover:bg-[#f8fafc]"
                    aria-label="Fullscreen"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#e5ebf5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8fa0bb]">Now Playing</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#22324d]">{recording.title}</h1>
            <p className="mt-2 text-sm text-[#7e8ba3]">{recording.course_title}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#60748f]">
              <span className="rounded-full border border-[#e5ebf5] bg-[#fbfcfe] px-3 py-1.5">Uploaded {formatDate(recording.uploaded_at)}</span>
              {recording.uploaded_by ? (
                <span className="rounded-full border border-[#e5ebf5] bg-[#fbfcfe] px-3 py-1.5">By {recording.uploaded_by}</span>
              ) : null}
            </div>
            <a
              href={recording.video_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce5f0] bg-white px-4 py-3 text-sm font-semibold text-[#53657f] transition hover:bg-[#f8fafc]"
            >
              Open source
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="rounded-2xl border border-[#e5ebf5] bg-white p-3 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3 px-1 pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8fa0bb]">Playlist</p>
              <span className="text-xs text-[#8fa0bb]">{recordings.length} lessons</span>
            </div>
            <div className="space-y-2">
              {recordings.map((item) => (
                <Link
                  key={item.id}
                  to={`/dashboard/recordings/${item.id}`}
                  className={cx(
                    'grid grid-cols-[76px_minmax(0,1fr)] gap-3 rounded-xl border p-2 transition',
                    String(item.id) === String(recording.id)
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-transparent hover:border-[#dfe7f2] hover:bg-[#fbfcfe]',
                  )}
                >
                  <div className="aspect-video overflow-hidden rounded-lg bg-[#dce5f0]">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#7890ad]">
                        <Play className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#22324d]">{item.title}</p>
                    <p className="mt-1 truncate text-xs text-[#7e8ba3]">{item.course_title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </motion.div>
  );
};

export default StudentVideoPlayerPage;
