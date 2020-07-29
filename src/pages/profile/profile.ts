import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController, AlertController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireStorage } from "angularfire2/storage";
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { Crop } from '@ionic-native/crop';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  name: string = '';
  username: string = '';
  avatar: string = '';
  email: string = '';

  profilekeys: string[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDb: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController,
    private file: File,
    private filePath: FilePath,
    private fileChooser: FileChooser,
    private crop: Crop,
    private afStorage: AngularFireStorage ) {

      this.afDb.object('profile/'+this.afAuth.auth.currentUser.uid).valueChanges().subscribe((data) => {
        
        if(data) {
          this.name = data['name'];
          this.username = data['username'];
          this.avatar = data['avatar'];
          this.email = data['email'];
        }
      });
  }

  updateProfile() {
    this.alertCtrl.create({
      title: 'Change Avatar?',
      message: 'Do you want to change avatar?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: 'Change',
          handler: data => {

            this.fileChooser.open().then((uri) => {
              this.filePath.resolveNativePath(uri).then(filePath => {
                let fileArray = filePath.split('.');
                if(fileArray[fileArray.length - 1] == 'jpg' || fileArray[fileArray.length - 1] == 'png') {
                  this.crop.crop(filePath, {
                    quality: 70,
                    targetWidth: 500,
                    targetHeight: 500
                  })
                  .then(
                    newImage => {
                      let dirPathSegments = newImage.split('/');
                      let fileName = dirPathSegments[dirPathSegments.length-1].split('?')[0];
                      dirPathSegments.pop();
                      let dirPath = dirPathSegments.join('/');
                      console.log('dirpath', dirPath);
                      console.log('filename', fileName);
                      this.file.readAsDataURL(dirPath, fileName).then(async (data) => {
                        await this.upload(data, fileName);
                      }); 
                      console.log('new image path is: ' + newImage)}
                  ).catch(error => {
                    console.error('Error cropping image', error)
                  });
                } else {
                  this.toastCtrl.create({message: 'Only images are allowed.', cssClass: 'error-toast', duration: 2000}).present();
                }
              });
            });
          }
        }
      ]
    }).present();
  }

  upload(data, name) {
    let uploadLoading = this.loadingCtrl.create({content: 'Uploading...'});
    uploadLoading.present();
    let fileRef = this.afStorage.storage.ref('profiles/'+this.afAuth.auth.currentUser.uid+'/'+name);
    let upload = fileRef.putString(data, 'data_url');
    upload.on('state_changed', data => {}, 
    error => {
      console.log(error);
      uploadLoading.dismiss();
    }, () => {
      upload.snapshot.ref.getDownloadURL()
      .then(url => {
        this.afDb.object('profile/'+this.afAuth.auth.currentUser.uid).update({avatar: url});
        uploadLoading.dismiss();
        this.toastCtrl.create({message: 'Changed successfully.', cssClass: 'success-toast', duration: 2000}).present();
      }).catch(error => {
        console.log(error);
        this.toastCtrl.create({message: 'Change failed.', cssClass: 'error-toast', duration: 2000}).present();
        uploadLoading.dismiss();
      });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
