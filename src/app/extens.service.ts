import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { WebsocketService } from './websocket.service';
let ParametrosConfiguracion = require('../appSettings.json');
const Url_Socket = ParametrosConfiguracion.UrlServices.WebSocket;
export interface Message {
  _id: any,
  ext: number,
  status: string,
  updated_at: any
  connected_num: string;
  duration: number;
}

@Injectable()
export class ExtensService {
  public message: Subject<Message>;
  public data2: any;
  constructor(private wsService: WebsocketService) {
    this.message = <Subject<Message>>wsService
      .connect(Url_Socket + '/paneloperator/poextens')
      .map((response: MessageEvent): Message => {
        debugger;
        let data = JSON.parse(response.data);
        return data;
      })
  }

}
