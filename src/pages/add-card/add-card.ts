import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AngularFireDatabase } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";

/**
 * Generated class for the AddCardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-card',
  templateUrl: 'add-card.html',
})
export class AddCardPage {
  private addCardForm : FormGroup;
  title: AbstractControl;
  description: AbstractControl;
  loading : any;
  boardKey: string = this.navParams.get('boardKey');

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private afDatabase: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    public loadingCtrl: LoadingController,
    public toastCtrl : ToastController) {
    this.addCardForm = this.formBuilder.group({
      title: ['', Validators.required],
      description:['']
    });

    console.log(this.afAuth.auth.currentUser.uid);

    this.title = this.addCardForm.controls['title'];
    this.description = this.addCardForm.controls['description'];
    this.loading = this.loadingCtrl.create({content: 'Please Wait...'});;
  }

  addCard() {
    this.loading.present();
    this.afDatabase.list('cards/'+this.navParams.get('boardKey'))
    .push({
      title: this.title.value,
      description: this.description.value,
      status: 'todo',
      color: 'primary',
      created_date: Date.now(),
      total_tasks: 0,
      completed_tasks: 0,
      owner: this.afAuth.auth.currentUser.uid
    })
    .then(() => {
      this.loading.dismiss();
      this.navCtrl.pop();
      this.toastCtrl.create({
        message: this.title.value+" Added.",
        duration: 2000
      });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddCardPage');
  }

}
