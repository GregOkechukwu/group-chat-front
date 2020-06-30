import { Injectable, OnDestroy } from '@angular/core';
import { env } from '../../environments/environment';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Greeting, Message } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {

  private _stompClient : any = null;
  
  constructor() { 
    this.stompClient = Stomp.over(new SockJS(env.ROOTws));
    this.stompClient.connect();
  }

  get stompClient() {
    return this._stompClient;
  }

  set stompClient(stompClient : any) {
    this._stompClient = stompClient;
  }

  ngOnDestroy() {
    this.stompClient.disconnect();
  }

  publishMessage(destinationSuffix : string, body : Message | Greeting, headers : Object = {}) {
    this.stompClient.send(`/app/${destinationSuffix}`, headers, JSON.stringify(body));
  }

  subscribeToTopic(topicSuffix : string, doSomething : Function) {
    return this.stompClient.subscribe(`/topic/${topicSuffix}`, doSomething);
  }

  unsubscribeFromTopicSubscriptions(subscriptions : any[] = []) {
    for (const subscription of subscriptions) {
      if (subscription) {
        subscription.unsubscribe();
      } 
    }
  }
}