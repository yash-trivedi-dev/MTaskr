import { Component } from '@angular/core';
import { IonicPage, AlertController, LoadingController, ToastController, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FcmProvider } from '../../providers/fcm/fcm';

/**
 * Generated class for the MembersListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-members-list',
  templateUrl: 'members-list.html',
})
export class MembersListPage {

  boardKey: string = this.navParams.get('boardkey');
  title: string = this.navParams.get('boardTitle');
  membersKeys: any = [];
  members: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afDb: AngularFireDatabase,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private fcm: FcmProvider) {

      let loading = this.loadingCtrl.create({content: 'Please wait...'});
      loading.present();
      this.afDb.object('boards/'+this.boardKey+'/members').valueChanges().subscribe(data => {
        this.membersKeys = [];
        if(data) {
          this.membersKeys = Object.keys(data);
          this.members = data;
          this.afDb.object('profile').valueChanges().subscribe(data => {
            if(data) {
              Object.keys(this.members).forEach(key => {
                  this.members[key].email = data[this.members[key].uid].email;
                  this.members[key].avatar = data[this.members[key].uid].avatar;
              });
            }
          });
        }
      });
      loading.dismiss();
  }

  removeMember(key, username, uid) {
    this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'Do you want to remove '+username+'?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            let loading = this.loadingCtrl.create({content: 'Please wait...'});
            loading.present();
            this.afDb.object('boards/'+this.boardKey+'/members/'+key).remove()
            .then(res => {
              this.afDb.object('fcm/'+uid).valueChanges().subscribe(data => {
                if(data) {
                  this.fcm.sendMessage(data['registrationId'], 'You were removed from '+this.title, 'you are no longer member of board'+this.title);
                }
              });
              this.afDb.object('cards/'+this.boardKey).valueChanges().subscribe(data => {
                if(data) {
                  Object.keys(data).forEach(cardkey => {
                    if(data[cardkey].members) {
                      Object.keys(data[cardkey].members).forEach(key => {
                        if (data[cardkey].members[key].uid == uid) {
                          this.afDb.object('cards/'+cardkey+'/members/'+key).remove()
                          .then(() => {
                          })
                          .catch(error => { console.log(error); });
                        }
                      });
                    }
                  });
                }
              });

            })
            .catch(error => {
              console.log(error);
            });
            loading.dismiss();
            this.toastCtrl.create({message: username+' removed.', cssClass: 'success-toast', duration: 2000}).present();
          }
        }
      ]
    }).present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MembersListPage');
  }

}
