import { Component } from '@angular/core';
import { ActionSheetController, IonicPage, NavController, NavParams, MenuController, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { MyApp } from '../../app/app.component';

/**
 * Generated class for the BoardsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-boards',
  templateUrl: 'boards.html',
})
export class BoardsPage {

  boards: any;
  board: any;
  boardkeys: string[];
  show: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDb: AngularFireDatabase,
    public menuCtrl: MenuController,
    public actionCtrl: ActionSheetController,
    public alertCtrl:AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public app: MyApp ) {

      let loading = this.loadingCtrl.create({content: 'Please Wait...'});  
      loading.present();
      this.afAuth.authState.take(1).subscribe((user) => {
        this.app.getAvatar(user.uid);
        this.afDb.database.ref('boards').orderByChild('owner').equalTo(user.uid).on("value", (data) => {
          this.show = 0;
          if(data.val()) {
            this.board = data.val();
            this.boardkeys = Object.keys(data.val());
            this.show = 1;
          }
          loading.dismiss();
        });
      });
      
  }

  boardActions(board, key) {
    let deleteAlert = this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'Do you really want to delete '+board.title+' Board?',
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
            this.afDb.object('boards/'+key).remove()
            .then(result => {
              this.afDb.object('cards/'+key).remove().catch(error => { console.log(error); });
              this.toastCtrl.create({message: board.title+' is Deleted.', cssClass: 'success-toast', duration: 2000}).present();
              loading.dismiss();
            }).catch(error => {
              this.toastCtrl.create({message:'Delete '+board.title+' Failed.', cssClass: 'error-toast', duration: 2000}).present();
              console.log(error);
              loading.dismiss();
            });
          }
        }
      ]
    });
    this.actionCtrl.create({
      title: 'Modify '+board.title,
      buttons: [
        {
          text: 'Edit',
          icon: 'create',
          handler: () => {
            this.navCtrl.push('EditBoardPage', {key: key, board: board});
          }
        },
        {
          text: (board.status == "open")? 'Close Board' : 'Open Board' ,
          icon: (board.status == "open")? 'radio-button-off' : 'radio-button-on',
          handler: () => {
            board.status = (board.status == "open")? 'close' : 'open';
            this.afDb.object('boards/'+key+'/board').set(board)
            .then(() => {
              this.toastCtrl.create({message: board.title+ ' ' +board.status, cssClass: 'succcess-toast', duration: 2000}).present();
            }) 
            .catch(error => {
              this.toastCtrl.create({message: 'Change status failed.', cssClass: 'error-toast', duration: 2000}).present();
              console.log(error);
            });
          }
        },
        {
          text: 'Delete',
          icon: 'trash',
          handler: () => {
            deleteAlert.present();
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

  toggleMenu() {
    this.menuCtrl.enable(true, "boardsPageMenu");
    this.menuCtrl.toggle('right');
    this.menuCtrl.swipeEnable(false);
  }

  cardsPage(key: string, board: any, members: any) {
    if(board.status == "open") {
      this.navCtrl.push('CardsPage', {boardKey: key, board: board, members: members});
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BoardsPage');
  }

}
