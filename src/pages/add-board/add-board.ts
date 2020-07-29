import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AngularFireDatabase } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
// import { dateDataSortValue } from 'ionic-angular/umd/util/datetime-util';

/**
 * Generated class for the AddBoardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-board',
  templateUrl: 'add-board.html',
})
export class AddBoardPage {
  private addBoardForm : FormGroup;
  title: AbstractControl;
  description: AbstractControl;
  loading : any;
  data: {};
  members: {};
  currentUser: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private afDatabase: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public toastCtrl : ToastController,
    public afAuth: AngularFireAuth) {

    this.afAuth.authState.take(1).subscribe((user) => { this.currentUser = user.uid });
    
    this.addBoardForm = this.formBuilder.group({
      title: ['', Validators.required],
      description:[''],

    });

    this.title = this.addBoardForm.controls['title'];
    this.description = this.addBoardForm.controls['description'];
    this.loading = this.loadingCtrl.create({content: 'Please Wait...'});

  }

  

  addBoard() {

    this.loading.present();
    this.afDatabase.list('boards').push({
      'owner': this.currentUser,
      board: {
        title: this.title.value,
        description: this.description.value,
        status: 'open',
        created_date: Date.now()
      }
    }).then(() => {
      this.loading.dismiss();
      this.navCtrl.pop();
      this.toastCtrl.create({
        message: this.title.value+" Added.",
        duration: 2000
      });
    });
  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddBoardPage');
  }

}
