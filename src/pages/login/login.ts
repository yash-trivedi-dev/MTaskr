import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { auth } from 'firebase/app';
import { FcmProvider } from '../../providers/fcm/fcm';


/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private loginForm : FormGroup;
  email: AbstractControl;
  password: AbstractControl;
  passwordType: string = 'password';
  toggleEye: string = 'eye';

  constructor( 
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public navParams: NavParams,
    public toast: ToastController,
    public loadingCtrl: LoadingController,
    private formBulder : FormBuilder,
    private fcm: FcmProvider) {

    this.loginForm = this.formBulder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.email = this.loginForm.controls['email'];
    this.password = this.loginForm.controls['password'];

  }

  async login() {
    let loading = this.loadingCtrl.create({content: 'Please wait...'});
    loading.present(); 

    this.afAuth.auth.signInWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password)
    .then((data) => {
      console.log("login ", data.user.uid);
      this.fcm.register(data.user.uid);
      console.log('register');
      this.navCtrl.setRoot('BoardsPage');
      loading.dismiss();
      this.toast.create({message: "Successfully Login", cssClass: 'success-toast', duration: 2000}).present();
    })
    .catch((error) => {
      let message;
      if(error.code == "auth/network-request-failed")
      {
        message = "No inernet connection."
      }
      else if(error.code == "auth/user-not-found" || error.code == "auth/wrong-password")
      {
        message = "email or password is incorrect."
      }
      else
      {
        message = error.message;
      }
      this.toast.create({message: message, cssClass: 'error-toast', duration: 3000}).present();
      loading.dismiss();
    });

  }

  togglePassword() {
    if(this.toggleEye == 'eye'){
      this.toggleEye = 'eye-off';
      this.passwordType = 'text';
    } else {
      this.toggleEye = 'eye';
      this.passwordType = 'password';      
    }
  }

  googleLogin() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
    .then(() => {
      this.navCtrl.setRoot('BoardsPage');
    })
    .catch(error => {
      console.log(error);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

}
