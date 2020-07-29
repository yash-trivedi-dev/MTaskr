import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { HttpHeaders } from '@angular/common/http';
import { FCM_KEY } from '../../app/firebase.config';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

/*
  Generated class for the FcmProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FcmProvider {

  private pushObject: PushObject;

  constructor(
    public http: HttpClient,
    private push: Push,
    private afDb: AngularFireDatabase) {
      
  }

  init() {
      const options: PushOptions = {
          android: {
            sound: true,
            vibrate: true,
            topics: ['all'],
            forceShow: true
          }
      };
      this.pushObject = this.push.init(options);
      this.pushObject.on('notification').subscribe((notification: any) => console.log('Received a notification', notification));
      this.pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
  }

  register(uid) {

    const options: PushOptions = {
      android: {
        icon:"notification_icon",
        iconColor: "#f27525",
        sound: true,
        vibrate: true,
        topics: ['all'],
        forceShow: true
      }
    };

    this.push.init(options).on('registration').subscribe((registration: any) => {
        this.afDb.object('fcm/'+uid).set({registrationId: registration.registrationId});
    });
  }

  unregister(uid) {
    this.afDb.object('fcm/'+uid).remove();
  }

  sendPushNotification(body) {
    let options = new HttpHeaders().set('Content-Type','application/json');
    this.http.post("https://fcm.googleapis.com/fcm/send",body,{
      headers: options.set('Authorization', 'key='+FCM_KEY),
    }).subscribe();
  }

  sendMessage(to:string, title: string, message: string) {
    let body = {
      // "registration_ids":ids, //array of registration ids to send notification to multiple devices
      "to": to,
      "priority":"high",
      "notification":{
        "icon": "notification_icon",
        "color": "#f27525",
        "title":title,
        "body":message,
        "sound":"default",
      }
      // "data":{
        // "param1":"value1",
        // "param2":"value2"
      // }
    }
    this.sendPushNotification(body);
  }

  sendMessageToAll(title: string = 'all', message: string = 'Topic Notification Body') {
    let body = {
      "to":"/topics/all",
      "priority":"high",
      "notification":{
        "icon": "notification_icon",
        "color": "#f27525",
        "title":title,
        "body": message,
        "sound":"default"
      }
      // "data":{
        // "param1":"value1",
        // "param2":"value2"
      // }
    }
    this.sendPushNotification(body);
  }

}
