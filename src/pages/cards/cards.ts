import { Component } from '@angular/core';
import { ActionSheetController, IonicPage, NavController, NavParams, MenuController, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { MyApp } from '../../app/app.component';

/**
 * Generated class for the CardsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cards',
  templateUrl: 'cards.html',
})
export class CardsPage {

  title: string = this.navParams.get('board').title;
  boardKey: string = this.navParams.get('boardKey');
  board: any = this.navParams.get('board');
  members: any = this.navParams.get('members');
  cards: string = 'todo';
  card: any;
  todokeys: any;
  doingkeys: any;
  donekeys: any;
  todo: any;
  doing: any;
  done: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDb: AngularFireDatabase,
    public menuCtrl: MenuController,
    public actionCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private app: MyApp ) {

    let loading = this.loadingCtrl.create({content: "Please wait..."});
    loading.present();
    this.afDb.database.ref('cards/'+this.boardKey).orderByChild('status').equalTo('todo').on('value', data => {
      this.todo = '';
      this.todokeys = this.getKeys(data.val());
      this.todo = this.formatData(data.val());
    });

    this.afDb.database.ref('cards/'+this.boardKey).orderByChild('status').equalTo('doing').on('value', data => {
      this.doing = '';
      this.doingkeys = this.getKeys(data.val());
      this.doing = this.formatData(data.val());
    });

    this.afDb.database.ref('cards/'+this.boardKey).orderByChild('status').equalTo('done').on('value', data => {
      this.done = '';
      this.donekeys = this.getKeys(data.val());
      this.done = this.formatData(data.val());
    });
    loading.dismiss();          
  }

  swipeSegment(e) {
    console.log(e);
  }

  getKeys(data) {
    if(data) {
      return Object.keys(data);
    } else {
      return false;
    }
  }

  formatData(data) {
    if( data ) {
      return data;
    } else {
      return false;
    }
  }

  cardActions(key, card) {

    let statusAlert = this.alertCtrl.create({
      title: 'Status',
      inputs: [
        {
          label: 'Todo',
          value: 'todo',
          type: 'radio',
          checked: (card.status == 'todo')? true : false
        },
        {
          label: 'Doing',
          value: 'doing',
          type: 'radio',
          checked: (card.status == 'doing')? true : false
        },
        {
          label: 'Done',
          value: 'done',
          type: 'radio',
          checked: (card.status == 'done')? true : false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Change',
          handler: data => {
            let loading = this.loadingCtrl.create({content: 'Please wait...'});
            loading.present();
            this.afDb.object('cards/'+this.boardKey+'/'+key).update({status: data})
            .then(() => {
              loading.dismiss();
            })
            .catch(error => { 
              console.log(error);
              loading.dismiss();
            });            
          }
        }
      ]
    });

    let colorAlert = this.alertCtrl.create({
      title: 'Colors',
      cssClass: 'colors',
      inputs: [
        {
          // label: 'Default',
          value: 'primary',
          type: 'radio',
          id: 'primary',
          checked: (card.color == 'primary')? true : false
        },
        {
          // label: 'Yellow',
          value: 'yellow',
          type: 'radio',
          id: 'yellow',
          checked: (card.color == 'yellow')? true : false
        },
        {
          // label: 'Blue',
          value: 'blue',
          type: 'radio',
          id: 'blue',
          checked: (card.color == 'blue')? true : false
        },
        {
          // label: 'Green',
          value: 'green',
          type: 'radio',
          id: 'green',
          checked: (card.color == 'green')? true : false
        },
        {
          // label: 'Pink',
          value: 'pink',
          type: 'radio',
          id: 'pink',
          checked: (card.color == 'pink')? true : false
        }
        ,
        {
          // label: 'Gray',
          value: 'gray',
          type: 'radio',
          id: 'gray',
          checked: (card.color == 'gray')? true : false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Change',
          handler: data => {
            let loading = this.loadingCtrl.create({content: 'Please wait...'});
            loading.present();
            this.afDb.object('cards/'+this.boardKey+'/'+key).update({color: data})
            .then(() => {
              loading.dismiss();
            })
            .catch(error => { 
              console.log(error);
              loading.dismiss();
            });            
          }
        }
      ]
    });

    let cardAlert = this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'Do you really want to delete '+card.title+' Card?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: 'Delete',
          role: 'delete',
          handler: data => {
            let loading = this.loadingCtrl.create({content: 'Please Wait...'});  
            loading.present();
            this.afDb.object('cards/'+this.boardKey+'/'+key).remove()
            .then(result => {
              this.afDb.object('discussion/'+this.boardKey+'/'+key).remove().catch(error => { console.log(error); });
              this.toastCtrl.create({message: card.title+' is Deleted.', cssClass: 'success-toast', duration: 2000}).present();
              loading.dismiss();
            }).catch(error => {
              this.toastCtrl.create({message: 'Delete '+card.title+' failed.', cssClass: 'error-toast', duration: 2000}).present();
              console.log(error);
              loading.dismiss();
            });
          }
        }
      ]
    });

    this.actionCtrl.create({
      title: 'Modify '+card.title,
      buttons: [
        {
          text: 'Change Status',
          icon: 'options',
          handler: () => {
            statusAlert.present();
          }
        },
        {
          text: 'Change Color',
          icon: 'color-palette',
          handler: () => {
            colorAlert.present();
          }
        },
        {
          text: 'Delete',
          icon: 'trash',
          handler: () => {
            cardAlert.present();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    }).present();
  }

  openMembersListPage() {
    this.navCtrl.push('MembersListPage', {boardTitle: this.title, boardkey: this.boardKey, members: this.members});
  }

  openCard(key, card) {
    this.navCtrl.push('CardPage', {cardkey: key, boardkey: this.boardKey, color: card.color});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CardsPage');
  }

  ionViewDidEnter() {
    this.app.changeStatusBarColor('primary');
    console.log('ionViewDidEnter CardsPage');
  }

}
