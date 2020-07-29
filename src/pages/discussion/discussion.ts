import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { FcmProvider } from '../../providers/fcm/fcm';

/**
 * Generated class for the DiscussionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-discussion',
  templateUrl: 'discussion.html',
})
export class DiscussionPage {
  @ViewChild(Content) content: Content;

  discussionPath: string = 'discussion/'+this.navParams.get('key');
  members:string[] = this.navParams.get('members');
  owner:string = this.navParams.get('owner');
  cardTitle:string = this.navParams.get('cardTitle');
  allMembers:string[];
  color: string = this.navParams.get('color');
  email: string;
  username: string;
  messageVal: string = '';
  message: any;
  messagesKey: any;
  fcmData: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDb: AngularFireDatabase,
    private fcm: FcmProvider) {

      this.afAuth.authState.take(1).subscribe((user) => {
        this.email = user.email;
        this.afDb.database.ref('profile/'+user.uid).once('value', (data) => {
          this.username = data.val().username;
        })
        .catch(error => {
          console.log(error);
        });

      });

      this.afDb.object(this.discussionPath).valueChanges().subscribe(data => {
        if(data) {
          this.messagesKey = Object.keys(data);
          this.message = data;
          this.content.scrollToBottom();
        }
      });

      this.afDb.object('fcm').valueChanges().subscribe(data => {
        this.fcmData = data;
      });
  }

  addMessage() {
    if(this.messageVal) {
      this.afDb.list(this.discussionPath)
      .push({
        author: this.afAuth.auth.currentUser.email,
        username: this.username,
        message: this.messageVal,
        time: Date.now()
      })
      .then(() => {
        this.sendNotification(this.messageVal, this.username);
        this.content.scrollToBottom();
        this.messageVal = '';
      });
    }
  }

  sendNotification(msg: string, username: string) {
    if(this.afAuth.auth.currentUser.uid != this.owner) {
      this.fcm.sendMessage(this.fcmData[this.owner].registrationId, this.cardTitle, username+": "+msg);
    }
    this.members.forEach((uid)=> {
      if(this.afAuth.auth.currentUser.uid != uid) {
        if(this.fcmData[uid]) {
          this.fcm.sendMessage(this.fcmData[uid].registrationId, this.cardTitle, username+": "+msg);        
        }
      }
    });
  }

  ionViewDidLoad() {
    this.content.scrollToBottom();
    console.log('ionViewDidLoad DiscussionPage');
  }
}
