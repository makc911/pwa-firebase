import {Component, OnInit} from '@angular/core';
import {DeviceService} from './services/device.service';
import {SwUpdate} from '@angular/service-worker';
import {environment} from '../environments/environment';
// import {initializeApp} from '@angular/fire/app';
// import {initializeApp} from '../../node_modules/firebase';
// import {environment} from '../environments/environment';
// import {initializeApp} from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public connectionStatus: string;
  public installationPrompt;
  public version = environment.appVersion;

  constructor(private deviceService: DeviceService, private sw: SwUpdate) {
    this.deviceService.connectionStatus.subscribe(res => {
        this.connectionStatus = res;
    });
  }

  ngOnInit(): void {
    this.sw.available.subscribe((ev) => {
      console.log('New App version available:', ev);
      this.sw.activateUpdate()
          .then(() => {
            const res = confirm('New App version available');
            if (res) {
              window.location.reload();
            }
          });
    });

    this.sw.activated.subscribe((ev) => {
      console.log('New App version activated:', ev);
    });

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installationPrompt = e;
    });

    window.addEventListener('appinstalled', (evt) => {
      alert('app has been installed on you device');
      this.installationPrompt = null;
    });
  }

  public async installApp(): Promise<void> {
    const res = confirm('Application will be installed ');
    if (res) {
      const installPrompt = this.installationPrompt;
      installPrompt.prompt();
      const {outcome} = await installPrompt.userChoice;
      console.log('outcome', outcome);
      this.installationPrompt = null;
    }

  }

}
