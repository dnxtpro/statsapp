import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { YoutubeService } from '../youtube.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.css']
})
export class YoutubePlayerComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  videos: any[] = [];
  player: YT.Player | undefined;
  currentTime: number=0;
  duration: number = 0;
  playbackRate: number=0;

  currentPlaybackRate = 1;
  constructor(public youTubeService: YoutubeService) {}

  ngOnInit() {
    this.loadYouTubeAPI();
  
  }
  loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    (window as any)['onYouTubeIframeAPIReady'] = () => this.onYouTubeIframeAPIReady();
  }
  onYouTubeIframeAPIReady() {
    this.player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: '3iF5e_G6Mp4',
      playerVars: {
        'controls': 0, // Oculta los controles
        'showinfo': 0, // Oculta la información del video
        'rel': 0,      // Evita mostrar videos relacionados al final
        'modestbranding': 1 // Oculta el logo de YouTube
      },
      events: {
        'onReady': this.onPlayerReady.bind(this),
        'onStateChange': this.onPlayerStateChange.bind(this)
      }
    });
  }
  onPlayerReady(event: YT.PlayerEvent) {
    this.duration = this.player?.getDuration() ?? 0;
    this.updatePlayerInfo();
  }

  onPlayerStateChange(event: YT.OnStateChangeEvent) {
    if (event.data == YT.PlayerState.PLAYING) {
      this.updatePlayerInfo();
    }
  }

  updatePlayerInfo() {
    setInterval(() => {
      if (this.player) {
        this.currentTime = this.player.getCurrentTime();
        this.playbackRate = this.player.getPlaybackRate();
        console.log(this.playbackRate,this.currentTime)
      }
    }, 1000);
  }
  changePlaybackRate(rate: number) {
    if (this.player) {
      this.player.setPlaybackRate(rate);
      this.playbackRate = this.player.getPlaybackRate();
    }
  }
  playVideo(){
    this.player?.playVideo();
  }
  pauseVideo(){
    this.player?.pauseVideo();
  }
  seekTo(seconds: number) {
    this.player?.seekTo(seconds, true);
  }
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}