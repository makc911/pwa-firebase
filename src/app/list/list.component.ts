import { Component, OnInit } from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {ClientsService, IClient} from '../services/clients.service';
import {StorageDBService} from '../services/storage-db.service';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  public clientsList: Array<IClient> = [];
  public isLocalDBEnabled = false;
  public selectedClient: IClient;
  private clientsDoc: AngularFirestoreDocument<Array<IClient>>;
  // public displayedColumns: string[] = ['fullName', 'firstName', 'lastName', 'phone', 'income', 'actions'];
  public displayedColumns: string[] = ['fullName', 'income', 'actions'];

  constructor(private fireBase: AngularFirestore, private clientsService: ClientsService, private storageDB: StorageDBService) { }

  private generateNewClient(): IClient {
    const lastName = `Snow ${ (Math.random() * 100 + 1).toFixed(0)}`;
    return {
      fullName: `John ${lastName}`,
      firstName: 'John',
      lastName,
      income: Math.random() * 2000000 + 500000,
      comment: `Test comment ${(Math.random() * 100 + 1).toFixed(0)}`,
      id: this.fireBase.createId(),
      phone: `+38067555-${(Math.random() * 10000 + 1).toFixed(0)}`,
      time: Date.now()
    };
  }

  async ngOnInit(): Promise<void> {
    this.isLocalDBEnabled = window.localStorage.getItem('isLocalDBEnabled') === 'true';
    await this.storageDB.dataBaseReady;
    this.clientsService.getClientsList().subscribe(clients => this.clientsList = clients);
  }

  public handleToggle(event): void{
    setTimeout(() => {
      window.localStorage.setItem('isLocalDBEnabled', String(this.isLocalDBEnabled));
      this.clientsService.isLocalDBEnabled = this.isLocalDBEnabled;
    }, 0);
  }

  public addNewRecord(): void {
    const newClient = this.generateNewClient();

    this.fireBase.doc<IClient>(`clients/${newClient.id}`).set(newClient)
        .then(res => {
          console.log('Set is ok', res);
        })
        .catch(err => console.log);
  }

  public deleteRecord(client: IClient): void {
    if (this.selectedClient?.id === client.id) {
      this.selectedClient = null;
    }
    const res = this.clientsService.deleteClient(client);
    if (!res) {
      this.clientsList = this.clientsList.filter(i => i.id !== client.id);
    }
  }

  public selectClient(client: IClient): void {
    this.selectedClient = client;
  }
}
