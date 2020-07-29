import { Component } from '@angular/core';
import { IonicPage, ToastController, ActionSheetController, AlertController, LoadingController, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { FcmProvider } from '../../providers/fcm/fcm';

/**
 * Generated class for the SharedBoardsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shared-boards',
  templateUrl: 'shared-boards.html',
})
export class SharedBoardsPage {

  board: any;
  boardkeys: any;
  showBoard: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDb: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public actionCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public toast: ToastController,
    private fcm: FcmProvider) {

      let loading = this.loadingCtrl.create({content: 'Please wait...'});
      loading.present();
      console.log(this.afAuth.auth.currentUser.uid);
      this.afDb.object('boards').valueChanges().subscribe(data => {
        this.board = null;
        this.boardkeys = [];
        this.showBoard = false;
        if(data) {
          this.board = data;
          Object.keys(data).forEach((key) => {
            if(data[key].members) {
              Object.keys(data[key].members).forEach((i) => {
                if(data[key].members[i].uid == this.afAuth.auth.currentUser.uid) {
                  this.boardkeys.push(key);
                  this.showBoard = true;
                  this.afDb.object('profile/'+this.board[key].owner).valueChanges().subscribe(user => {
                    this.board[key].username = user['username'];
                  });
                }
              })
            }
          });
        }
      });
      loading.dismiss();
  }

  boardActions(board, key) {
    let boardAlert = this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'Do you want leave '+board.board.title+' ?',
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
            this.leaveBoard(board, key);
          }
        }
      ]
    });

    this.actionCtrl.create({
      title: 'Modify Board',
      buttons: [
        {
          text: 'Leave Board',
          icon: 'exit',
          handler: () => {
            boardAlert.present()
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

  leaveBoard(board, bkey) {
    console.log(board);
    let loading = this.loadingCtrl.create({content: 'Please wait...'});
    loading.present();
    Object.keys(board.members).forEach(mkey => {
      if(board.members[mkey].uid == this.afAuth.auth.currentUser.uid) {
        this.afDb.object('boards/'+bkey+'/members/'+mkey).remove()
        .then(() => {
          this.afDb.object('fcm/'+board.owner).valueChanges().subscribe(data => {
            if(data) {
              this.afDb.object('profile/'+this.afAuth.auth.currentUser.uid).valueChanges().subscribe(user => {
                if(user) {
                  this.fcm.sendMessage(data['registrationId'], user['username']+' left your board '+board.board.title, '');
                }
              });
            }
          });
          this.afDb.object('cards/'+bkey).valueChanges().subscribe(data => {
            if(data) {
              Object.keys(data).forEach(cardkey => {
                if(data[cardkey].members) {
                  Object.keys(data[cardkey].members).forEach(key => {
                    if (data[cardkey].members[key].uid == this.afAuth.auth.currentUser.uid) {
                      this.afDb.object('cards/'+cardkey+'/members/'+key).remove()
                      .then(() => {})
                      .catch(error => { console.log(error); });
                    }
                  });
                }
              });
            }
          });
        })
        .catch(error => {
          console.log();
        });
      }
    });
    loading.dismiss();
    this.toast.create({message: 'You left from '+board.board.title, cssClass: 'success-toast', duration: 2000}).present();
   
  }

  openCardsPage(key, board) {
    if(board.status == "open") {
      this.navCtrl.push('SharedCardsPage', {boardkey: key});
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SharedBoardsPage');
  }

}