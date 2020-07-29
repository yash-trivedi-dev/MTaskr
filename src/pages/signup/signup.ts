import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { IonicPage, NavController, ToastController, NavParams, LoadingController } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { FcmProvider } from '../../providers/fcm/fcm';

/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  private signupForm : FormGroup;
  name: AbstractControl;
  email: AbstractControl;
  password: AbstractControl;
  confirmPassword: AbstractControl;
  loading: any;
  passwordType: string = 'password';
  toggleEye: string = 'eye';
  cpasswordType: string = 'password';
  ctoggleEye: string = 'eye';

  constructor(
    private afDatabase: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private toast: ToastController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private formBulder : FormBuilder,
    private fcm: FcmProvider ) {

    this.signupForm = this.formBulder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    }, {validator: this.customValidation()});

    this.name = this.signupForm.controls['name'];
    this.email = this.signupForm.controls['email'];
    this.password = this.signupForm.controls['password'];
    this.confirmPassword = this.signupForm.controls['confirmPassword'];
    this.loading = this.loadingCtrl.create({content: 'Please wait...'});
  }

  async signup() {

    this.loading.present();

    this.afAuth.auth.createUserWithEmailAndPassword(this.email.value, this.password.value)
    .then((result) => {
      this.fcm.register(result.user.uid);
      this.afDatabase.object(`profile/${result.user.uid}`)
      .set({
        username: this.email.value.split('@')[0],
        name: this.name.value,
        email: this.email.value,
        avatar: "https://ui-avatars.com/api/?name="+this.name.value+"&length=1&size=350"
      })
      .then(() => {
        this.loading.dismiss();
        this.navCtrl.setRoot('BoardsPage');
        this.toast.create({message: "Successfully Signup.",cssClass: 'success-toast',duration: 2000}).present();
      }).catch((error) => {
        this.toast.create({
          message: "Signup Failed.",
          cssClass: 'error-toast',
          duration: 2000
        }).present();
        console.log(error);
        this.loading.dismiss();
      }); 
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
      console.log(error);
      this.toast.create({ message: message, cssClass:'error-toast', duration: 3000 }).present();
      this.loading.dismiss();
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

  ctogglePassword() {
    if(this.ctoggleEye == 'eye'){
      this.ctoggleEye = 'eye-off';
      this.cpasswordType = 'text';
    } else {
      this.ctoggleEye = 'eye';
      this.cpasswordType = 'password';      
    }
  }

  customValidation() {
    return (group: FormGroup): {[key: string]: any} => {
      if (group.controls['password'].value !== group.controls['confirmPassword'].value)
        return { mismatchedPasswords: true };
      if (group.controls['password'].value.length < 6 )
        return { minlen: true };
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }

}
