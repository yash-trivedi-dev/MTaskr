import { Component } from '@angular/core';
import { IonicPage, LoadingController, ToastController, NavController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

/**
 * Generated class for the ForgotPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {

  private forgotForm : FormGroup;
  email: AbstractControl;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afDb: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private formBulder : FormBuilder) {
      this.forgotForm = this.formBulder.group({
        email: ['', [Validators.required, Validators.email]]
      });
      this.email = this.forgotForm.controls['email'];
  }

  sendRestEmail() {
    let loading = this.loadingCtrl.create({content: 'Please wait...'});
    loading.present();
    this.afAuth.auth.sendPasswordResetEmail(this.email.value)
    .then((res) => {
      console.log(res);
      loading.dismiss();
      this.toastCtrl.create({message: "Rest Password email sent", cssClass: 'success-toast', duration: 2000}).present();
    })
    .catch(error => {
      console.log(error);
      loading.dismiss();

      if(error.code === "auth/user-not-found") {
        this.toastCtrl.create({message: this.email.value+' not Found.', cssClass: 'error-toast', duration: 2000}).present();
      }

      if(error.code === "auth/invalid-email") {
        this.toastCtrl.create({message: 'Email Address is invalid.', cssClass: 'error-toast', duration: 2000}).present();
      }

    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForgotPasswordPage');
  }

}
