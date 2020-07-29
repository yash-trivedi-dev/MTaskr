import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, LoadingController, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { HeaderColor } from '@ionic-native/header-color';
import { FcmProvider } from '../providers/fcm/fcm';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('myNav') nav: NavController
  public rootPage:any;
  private avatar: string = "";
  public counter: number = 0;

  constructor(
    platform: Platform,
    private statusBar: StatusBar,
    splashScreen: SplashScreen,
    private afAuth: AngularFireAuth,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private afDb: AngularFireDatabase,
    private headerColor: HeaderColor,
    private fcm: FcmProvider) {

      this.fcm.init();

      this.headerColor.tint('#f27525');
      this.afAuth.authState.take(1).subscribe((user) => {
        this.rootPage = (user)? 'BoardsPage' : 'LoginPage';
        if(user) { this.getAvatar(user.uid); }
      });

      platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
        splashScreen.hide();
        statusBar.styleDefault();
        platform.registerBackButtonAction(() => {
          if(!this.nav.canGoBack()) {
            if (this.counter == 0) {
              this.toastCtrl.create({message: "Press again to exit", duration: 3000}).present();
              this.counter++;
              setTimeout(() => { this.counter = 0 }, 3000);
            } else {
              platform.exitApp();
            }
          } else {
            this.nav.pop();
          }
        }, 0);
      });
  }

  openPage(page: string) {
    this.nav.push(page);
  }

  getAvatar(uid) {
    this.afDb.object('profile/'+uid).valueChanges().subscribe(data => {
      this.avatar = data['avatar'];
    });
  }

  changeStatusBarColor(color: string) {
    switch(color) {
      case 'primary':
        this.statusBar.backgroundColorByHexString('#AD541B');
        break;
      
      case 'yellow':
        this.statusBar.backgroundColorByHexString('#AD7A24');
        break;
      
      case 'green':
        this.statusBar.backgroundColorByHexString('#007F33');
        break;
      
      case 'blue':
        this.statusBar.backgroundColorByHexString('#005B87');
        break;
      
      case 'pink':
        this.statusBar.backgroundColorByHexString('#912336');
        break;
      
      case 'gray':
        this.statusBar.backgroundColorByHexString('#33363B');
        break;
      
      default:
        this.statusBar.backgroundColorByHexString('#AD541B');
        break;
    }
    
  }

  logout(){
    let uid = this.afAuth.auth.currentUser.uid;
    let loading = this.loadingCtrl.create({content: 'Please wait...'});
    loading.present();
    this.afAuth.auth.signOut().then((data) => {
      this.fcm.unregister(uid);
      this.nav.setRoot('LoginPage');
      loading.dismiss();
      this.toastCtrl.create({
          message: "Logout",
          cssClass: 'success-toast',
          duration: 2000
        }).present();
    }).catch((error) => {
      console.log(error);
    });
  }

}

