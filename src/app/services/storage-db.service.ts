/*
* Service to work with IndexedDB
* This server is to big just because it was created with features plans to scale it and DB migration
* */


import { Injectable } from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {environment} from '../../environments/environment';
import {IClient} from './clients.service';

@Injectable({
  providedIn: 'root'
})
// @ts-ignore
export class StorageDBService {
  private clientsStorage = {
    name: 'clients',
    params: {}
  };

  private dataBase$: ReplaySubject<boolean>;
  private readonly dbName = 'clientsApp';
  private readonly dbVersion = environment.dbVersion;
  private db: IDBDatabase;

  constructor() {
    this.dataBase$ = new ReplaySubject<boolean>(1);
    this.initIndexedDB(this.dbName, this.dbVersion);
  }

  public get dataBaseReady(): Promise<boolean> {
    return new Promise<boolean>(resolve => this.dataBase$.asObservable().subscribe(resolve));
  }

  // Client table ----------------------------------------------
  public async clearClients(): Promise<void> {
    return this.clearTable(this.clientsStorage.name);
  }

  public async getClientById(id: string): Promise<Array<IClient>> {
    return this.getDataById(id, this.clientsStorage.name);
  }

  public getAllClients(): Promise<Array<IClient>> {
    const transaction = this.db.transaction(this.clientsStorage.name, 'readonly');
    const clients = transaction.objectStore(this.clientsStorage.name);
    const request = clients.getAll();

    return this.createRequestPromise<Array<IClient>>(request, `[${this.clientsStorage.name}] GET ALL`);

  }

  public async putClients(payload: Array<IClient>): Promise<Array<string>> {
    const transaction = this.db.transaction(this.clientsStorage.name, 'readwrite');
    const clients = transaction.objectStore(this.clientsStorage.name);

    const requests = payload.map(client => {
      const request = clients.put({payload: client}, client.id);
      return this.createRequestPromise<string>(request, `[${this.clientsStorage.name}] PUT`);
    });

    return Promise.all(requests);
  }

  public async deleteClient(id: string): Promise<void> {
    const transaction = this.db.transaction(this.clientsStorage.name, 'readwrite');
    const clients = transaction.objectStore(this.clientsStorage.name);
    const request = clients.delete(id);
    return this.createRequestPromise<void>(request, `[${this.clientsStorage.name}] DELETE`);
  }

  // -----------------------------------------------------------

  private async clearTable(name: string): Promise<void> {
    const transaction = this.db.transaction(name, 'readwrite');
    const table = transaction.objectStore(name);
    const request = table.clear();

    return this.createRequestPromise(request, `[${name}] CLEAR_TABLE`);
  }

  private async getDataById<T>(id: string, table: string): Promise<T> {
    const transaction = this.db.transaction(table, 'readonly');
    const store = transaction.objectStore(table);
    const request = store.get(id);

    return this.createRequestPromise<T>(request, `[${table}] GET`);
  }


  private createRequestPromise<T>(request: IDBRequest, text?: string): Promise<T> {
    return new Promise(resolve => {
      request.onsuccess = () => {
        console.log(
            '%c%s', 'color: #d1b04d; font: 0.75rem Tahoma;',
            `${text || ''} IndexedDB request successful`,
            request.result
        );

        let res;

        if (Array.isArray(request.result)) {
          res = request.result.map(i => i.payload || i);
        } else {
          res = request.result?.payload ? request.result.payload : request.result;
        }

        resolve(res);
      };

      request.onerror = () => {
        console.warn(
            '%c%s', 'color: #b44138; font: 0.75rem Tahoma;',
            `${text || ''} IndexedDB request failed`,
            request.error);
        resolve(null);
      };
    });
  }



  private async initDBTStores(db): Promise<void> {
      if (!db.objectStoreNames.contains(this.clientsStorage.name)) {
        db.createObjectStore(this.clientsStorage.name, this.clientsStorage.params);
      }
  }

  private initIndexedDB(name: string, version: number): void {
    const openRequest = indexedDB.open(name, version);

    openRequest.onupgradeneeded = async (event: any) => {
      this.db = event.target.result;
      const txn = event.target.transaction;
      const {oldVersion} = event;

      switch (oldVersion) {
        case 0: // no any DB detected, need init
          await this.initDBTStores(this.db);
          break;
        case 1: // existed DB version 1, need update to v2
          console.log('New version, need migrate from v1, run migration');
          // tslint:disable-next-line:no-switch-case-fall-through
        case 2: // existed DB version 1, need update to v2
          console.log('New version, need migrate from v2, run migration');
          // tslint:disable-next-line:no-switch-case-fall-through
        case 3: // existed DB version 1, need update to v2
          console.log('New version, need migrate from v3, run migration');
      }
    };

    openRequest.onerror = () => {
      console.warn('Open IndexedDB error', openRequest.error);
      alert('Open IndexedDB error. Please reboot application.');
    };

    openRequest.onsuccess = () => {
      this.db = openRequest.result;
      this.dataBase$.next(true);
      this.db.onversionchange = () => {
        this.db.close();
        alert('Database version is expired. Please reboot application');
      };
    };

    openRequest.onblocked = () => {
      alert('Database is blocked. Please reboot application');
    };
  }
}
