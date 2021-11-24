// @ts-nocheck
import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/internal-compatibility';
import * as Rx from 'rxjs/Rx';
import { Observable, Observer, Subject } from 'rxjs/Rx';
import { Web } from 'sip.js';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }

  private subject: Rx.Subject<MessageEvent>;

  public connect(url: string): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("Conectado con éxito:" + url);
    }
    return this.subject;
  }

  private create(url: string): Rx.Subject<MessageEvent> {
    let ws = new WebSocket("ws://dev.services.callcont.bancanegocios.info/paneloperator/poextens");
    // let observable = Rx.Observable.create(obs: Rx.Observer<MessageEvent>)=> {
    //   ws.onmessage = obs.next.bind(obs);
    //   ws.onerror = obs.error.bind(obs);
    //   ws.onclose = obs.complete.bind(obs);
    //   return ws.close.bind(ws);
    // }
    let observable = new Observable((observer: Observer<MessageEvent>) => {
      ws.onmessage = observer.next.bind(observer);
      ws.onerror = observer.error.bind(observer);
      ws.onclose = observer.complete.bind(observer);
      return ws.close.bind(ws);
    })

    let observer = {
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    }
    return Rx.Subject.create(observer, observable);
  }
}
