import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { auth } from 'firebase/app';

/**
 * Generated class for the ChangePasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
})
export class ChangePasswordPage {

  private ChangePasswordForm : FormGroup;
  oldpass: AbstractControl;
  newpass: AbstractControl;
  confirmpass: AbstractControl;
  opasswordType: string = 'password';
  otoggleEye: string = 'eye';
  npasswordType: string = 'password';
  ntoggleEye: string = 'eye';
  cpasswordType: string = 'password';
  ctoggleEye: string = 'eye';

  constructor( 
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public navParams: NavParams,
    public toast: ToastController,
    public loadingCtrl: LoadingController,
    private formBulder : FormBuilder) {

    this.ChangePasswordForm = this.formBulder.group({
      oldpass: ['', [Validators.required]],
      newpass: ['', [Validators.required, Validators.minLength(6)]],
      confirmpass: ['', [Validators.required, Validators.minLength(6)]]
    }, {validator: this.customValidation()});

    this.oldpass = this.ChangePasswordForm.controls['oldpass'];
    this.newpass = this.ChangePasswordForm.controls['newpass'];
    this.confirmpass = this.ChangePasswordForm.controls['confirmpass'];

  }

  customValidation() {
    return (group: FormGroup): {[key: string]: any} => {
      if (group.controls['newpass'].value !== group.controls['confirmpass'].value)
        return { mismatchedPasswords: true };
      if (group.controls['newpass'].value.length < 6 )
        return { minlen: true };
    }
  }

  changePassword() {
    let loading = this.loadingCtrl.create({content: 'Please wait...'});
    loading.present();    
    let credentials = auth.EmailAuthProvider.credential(this.afAuth.auth.currentUser.email, this.oldpass.value);
    this.afAuth.auth.currentUser.reauthenticateAndRetrieveDataWithCredential(credentials)
    .then((res) => {
      this.afAuth.auth.currentUser.updatePassword(this.newpass.value)
      .then((data) => {
        loading.dismiss();
        this.toast.create({message: "Password Changed.", cssClass: 'success-toast', duration: 2000}).present();
        this.navCtrl.pop();
      })
      .catch(error => {
        this.toast.create({message: "Change password failed.", cssClass: 'error-toast', duration: 2000}).present();
        loading.dismiss();
        console.log(error);
      });
    }).catch(error => {
      console.log(error);
      loading.dismiss();
      let message = error.message;
      if(error.code == 'auth/wrong-password')
      {
        message = 'Incorrect Password.'
      }
      this.toast.create({message: message, cssClass: 'error-toast', duration: 2000}).present();
    });

  }

  otogglePassword() {
    if(this.otoggleEye == 'eye'){
      this.otoggleEye = 'eye-off';
      this.opasswordType = 'text';
    } else {
      this.otoggleEye = 'eye';
      this.opasswordType = 'password';      
    }
  }

  ntogglePassword() {
    if(this.ntoggleEye == 'eye'){
      this.ntoggleEye = 'eye-off';
      this.npasswordType = 'text';
    } else {
      this.ntoggleEye = 'eye';
      this.npasswordType = 'password';      
    }
  }

  ctogglePassword() {
    if(this.ctoggleEye == 'eye'){
      this.ctoggleEye = 'eye-off';
      this.cpasswordType = 'text';
    } else {
      this.ctoggleEye = 'eye';
      this.cpasswordType = 'password';      
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChangePasswordPage');
  }

}
