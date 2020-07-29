import { Component } from '@angular/core';
import { IonicPage, ToastController, ActionSheetController, AlertController, LoadingController, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { MyApp } from '../../app/app.component';
import { FcmProvider } from '../../providers/fcm/fcm';

/**
 * Generated class for the SharedCardsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shared-cards',
  templateUrl: 'shared-cards.html',
})
export class SharedCardsPage {

  cards: string = 'todo';
  boardKey: string = this.navParams.get('boardkey');
  cardKeys: string[];
  card: any;
  todoKeys: string[];
  doingKeys: string[];
  doneKeys: string[];
  todo: boolean;
  doing: boolean;
  done: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDb: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public actionCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public toast: ToastController,
    private app: MyApp,
    private fcm: FcmProvider) {

    let loading = this.loadingCtrl.create({content: 'Please wait...'});
    loading.present();
    this.afDb.object('cards/'+this.boardKey).valueChanges().subscribe(data => {
      this.todo = false;
      this.doing = false;
      this.done = false;
      if(data) {
        this.card = data;
        this.todoKeys = [];
        this.doingKeys = [];
        this.doneKeys = [];
        Object.keys(data).forEach(cardkey => {
          if(data[cardkey].members) {
            Object.keys(data[cardkey].members).forEach(key => {
              if (data[cardkey].members[key].uid == this.afAuth.auth.currentUser.uid) {
                
                if(data[cardkey].status == 'todo') {
                  this.todoKeys.push(cardkey);
                  this.todo = true;
                }
                if(data[cardkey].status == 'doing') {
                  this.doingKeys.push(cardkey);
                  this.doing = true;
                }
                if(data[cardkey].status == 'done') {
                  this.doneKeys.push(cardkey);
                  this.done = true;
                }
                
              }
            });
          }
        });
      }
    });
    loading.dismiss();

  }

  cardActions(key, card) {

    let cardAlert = this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'Do you want leave '+card.title+' ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Leave',
          handler: () => {
            this.leaveCard(card, key);
          }
        }
      ]
    });

    this.actionCtrl.create({
      title: 'Modify Card',
      buttons: [
        {
          text: 'Leave Card',
          icon: 'exit',
          handler: () => {
            cardAlert.present();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    }).present();

  }

  leaveCard(card, ckey) {
    let loading = this.loadingCtrl.create({content: 'Please wait...'});
    loading.present();
    Object.keys(card.members).forEach(mkey => {
      if(card.members[mkey].uid == this.afAuth.auth.currentUser.uid) {
        this.afDb.object('cards/'+this.boardKey+'/'+ckey+'/members/'+mkey).remove().then(() => {
          this.afDb.object('fcm/'+card.owner).valueChanges().subscribe(data => {
            if(data) {
              this.afDb.object('profile/'+this.afAuth.auth.currentUser.uid).valueChanges().subscribe(user => {
                if(user) {
                  this.fcm.sendMessage(data['registrationId'], user['username']+' left your card '+card.title, '');
                }
              });
            }
          });
        }).catch(error => { console.log(error); });
      }
    });
    loading.dismiss();
    this.toast.create({message: 'You left from '+card.title, cssClass: 'success-toast', duration: 2000}).present();
  }

  openCard(key, card) {
    this.navCtrl.push('SharedCardPage', { boardKey: this.boardKey, cardKey: key, color: card.color });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SharedCardsPage');
  }

  ionViewDidEnter() {
    this.app.changeStatusBarColor('primary');
    console.log('ionViewDidEnter CardsPage');
  }

}
