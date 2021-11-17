/*
* Service to get/delete/create clients records
* Some parts are really odds and ugly, so should be rewrite once someone sees it :)
* I did some critical changes to late and dont have time to refactor and clean
* */

import { Injectable } from '@angular/core';
import {StorageDBService} from './storage-db.service';
import {DeviceService} from './device.service';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';

export interface IClient {
  id?: string;
  avatar?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birth?: string;
  income: number;
  comment?: string;
  email?: string;
  time?: number;
}

@Injectable({
  providedIn: 'root'
})
// @ts-ignore
export class ClientsService {
  public isLocalDBEnabled: boolean;

  constructor(private storageDB: StorageDBService,
              private deviceService: DeviceService,
              private fireBase: AngularFirestore
  ) {
    this.isLocalDBEnabled = window.localStorage.getItem('isLocalDBEnabled') === 'true';
    this.deviceService.connectionStatus.subscribe(res => {
      console.log('Connection state:', res);
      this.deleteDelayedClients();
    });
  }

  private deleteDelayedClients(): void {
    const data = window.localStorage.getItem('deleting') || '[]';
    const arr = JSON.parse(data);

    if (!arr.length) {
      return;
    }
    const promises = arr.map(id => {
      return new Promise(resolve => {
        this.fireBase.doc<void>(`clients/${id}`).delete()
            .then(res => {
              console.log('Client deleted', res, id);
              resolve();
            }).catch(console.log);
      });
    });

    Promise.all(promises).then(() => {
      window.localStorage.setItem('deleting', JSON.stringify([]));
      window.location.reload();
    });

  }

  public getClientsList(): Observable<Array<IClient>> {
    // If Offline mode and data should br taken from IndexedDB
    if (this.isLocalDBEnabled && !this.deviceService.checkOnline() ) {
      return new Observable<Array<IClient>>( observer => {
        this.storageDB.getAllClients().then(res => {
          observer.next(res);
        });
      });
    }

    // Get Clients list from Firebase
    return this.fireBase.collection('clients').valueChanges()
      .pipe(
          map((clients: Array<IClient>) => {
            return clients.sort((a, b) => a.time > b.time ? 1 : -1);
          }),
          tap((sortedClients) => {
            if (this.deviceService.checkOnline() ) {
              this.cleanClientTable();
              this.putClientsIntoLocalDB(sortedClients);
            }
          })
      );
  }

  // I used here window.localStore just to save time. It was faster than creating new table for IndexedDB and add logic for it
  public deleteClient(client): boolean {
    if (this.isLocalDBEnabled && !this.deviceService.checkOnline()) {
      const data = window.localStorage.getItem('deleting') || '[]';
      const arr = JSON.parse(data);
      const newArr = [...new Set([...arr, client.id])];
      window.localStorage.setItem('deleting', JSON.stringify(newArr));

      this.storageDB.deleteClient(client.id);
      return false;
    }

    this.fireBase.doc<void>(`clients/${client.id}`).delete()
        .then(res => {
          console.log('Client deleted', res, client);
        }).catch(console.log);
    return true;
  }

  private cleanClientTable(): void {
    this.storageDB.clearClients();
  }

  private putClientsIntoLocalDB(clients: Array<IClient>): void {
    this.storageDB.putClients(clients);
  }
}
