// Global YouTube IFrame API types
declare namespace YT {
  interface Player {
    playVideo(): void;
    stopVideo(): void;
    pauseVideo(): void;
    unMute(): void;
    mute(): void;
    setVolume(volume: number): void;
    getVolume(): number;
    setSize(width: number, height: number): void;
    getPlaylist(): string[];
    getPlaylistIndex(): number;
    cueVideoById(videoId: string): void;
    playVideoById(videoId: string): void;
  }

  interface PlayerEvent {
    target: Player;
  }

  interface OnStateChangeEvent extends PlayerEvent {
    data: number;
  }

  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  interface PlayerOptions {
    width?: number | string;
    height?: number | string;
    videoId?: string;
    playerVars?: Record<string, any>;
    events?: {
      onReady?: (event: PlayerEvent) => void;
      onStateChange?: (event: OnStateChangeEvent) => void;
      onError?: (event: any) => void;
    };
  }

  function Player(
    elementOrId: string | HTMLElement,
    options?: PlayerOptions
  ): Player;
}

declare var YT: typeof YT;
