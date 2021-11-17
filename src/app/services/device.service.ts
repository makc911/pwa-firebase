import { Injectable } from '@angular/core';
import {BehaviorSubject, fromEvent, Observable} from 'rxjs';

export type ConnectionStatus = 'online' | 'offline';

@Injectable({
  providedIn: 'root'
})
// @ts-ignore
export class DeviceService {
  private isOnline: boolean;
  private connectionStatus$: BehaviorSubject<ConnectionStatus>;

  constructor() {
    this.isOnline = window.navigator.onLine;
    this.connectionStatus$ = new BehaviorSubject<ConnectionStatus>(this.isOnline ? 'online' : 'offline');
    this.initConnectionsEvents();
  }

  public get connectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatus$.asObservable();
  }

  public checkOnline(): boolean {
    return this.isOnline;
  }

  public convertToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const fileReader = new FileReader();
      if (fileReader && file) {
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
          resolve(String(fileReader.result));
        };

        fileReader.onerror = (error) => {
          reject(error);
        };
      } else {
        reject('No file provided');
      }
    });
  }

  private initConnectionsEvents(): void {
    fromEvent(window, 'online').subscribe(e => {
      console.warn('Online detected');
      this.isOnline = true;
      this.connectionStatus$.next('online');
      // window.location.reload();
    });

    fromEvent(window, 'offline').subscribe(e => {
      console.warn('Offline detected', e);
      this.isOnline = false;
      this.connectionStatus$.next('offline');
    });
  }
}


