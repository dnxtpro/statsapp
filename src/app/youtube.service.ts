import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class YoutubeService {
  apiKey: string = environment.youtubeApiKey || '';

  constructor(public http: HttpClient) {}

  getVideosForChanel(channel: string, maxResults: number): Observable<Object> {
    if (!this.apiKey) {
      throw new Error('Missing YouTube API key configuration');
    }
    const url =
      `https://www.googleapis.com/youtube/v3/search?key=${this.apiKey}` +
      `&channelId=${channel}` +
      `&order=date&part=snippet&type=video,id&maxResults=${maxResults}`;
      console.log('Generated URL:', url);

      return this.http.get(url).pipe(
        map((res) => res),
        catchError((error) => {
          console.error('Error fetching videos:', error);
          // You can throw a custom error here or return a default value
          throw new Error('Failed to fetch videos from Youtube');
        })
      );
  }
}
