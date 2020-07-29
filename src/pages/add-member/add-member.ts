import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { FcmProvider } from '../../providers/fcm/fcm';

/**
 * Generated class for the AddMemberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-member',
  templateUrl: 'add-member.html',
})
export class AddMemberPage {

  boardkey: string = this.navParams.get('boardkey');
  title: string = this.navParams.get('boardTitle');
  currentUser: string;
  searchkeys: string[];
  member: any;
  boardMember: any;
  boardMemberKeys: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afDb: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public afAuth: AngularFireAuth,
    private fcm: FcmProvider) {

    this.afAuth.authState.take(1).subscribe((user) => { 
      this.currentUser = user.uid 
      this.afDb.object('boards/'+this.boardkey+'/members').valueChanges().subscribe((data) => {
        if(data) {
          this.boardMember = data;
          this.boardMemberKeys = Object.keys(data);
        }
      });
    });
  }

  onInput(value: string, $event) {
    let loading = this.loadingCtrl.create({content: 'Please wait...'});
    loading.present();
      this.afDb.database.ref('profile').orderByChild('username').startAt(value.toLowerCase()).endAt(value.toLowerCase()+'\uf8ff').on("value", (data) => {        
        this.searchkeys = [];
        if(data.val()) {
          this.searchkeys = Object.keys(data.val());
          this.member = data.val();
          this.searchkeys.forEach((s) => {
            if(this.boardMemberKeys) {
              this.boardMemberKeys.forEach((e) => {
                if(this.boardMember[e].uid == s) {
                  this.member[s].add = false;
                } else {
                  this.member[s].add = true;
                }
              });
            } else {
              this.member[s].add = true;
            }
          });
        }
        loading.dismiss();
      });
  }

  addMember(key, username) {
    let loading = this.loadingCtrl.create({content: 'Please wait...'});
    loading.present();
    this.afDb.list('boards/'+this.boardkey+'/members').push({uid : key, username: username})
    .then(() => {
      this.afDb.object('fcm/'+key).valueChanges().subscribe(data => {
        if(data) {
          this.fcm.sendMessage(data['registrationId'], 'Add in '+this.title, 'you are member of board '+this.title);
        }
      });
      this.member[key].add = false;
      loading.dismiss();
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad AddMemberPage');
  }
}
