import { Component } from '@angular/core';
import { IonicPage, ToastController, ActionSheetController, AlertController, LoadingController, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireStorage } from "angularfire2/storage";
import { FileChooser } from '@ionic-native/file-chooser';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { MyApp } from '../../app/app.component';

/**
 * Generated class for the SharedCardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shared-card',
  templateUrl: 'shared-card.html',
})
export class SharedCardPage {

  boardKey: string = this.navParams.get('boardKey');
  cardKey: string = this.navParams.get('cardKey');
  color: string = this.navParams.get('color');
  discussionKey: string = this.boardKey+'/'+this.cardKey;
  cardPath: string = 'cards/'+this.boardKey+'/'+this.cardKey;
  addTaskVal: string = '';
  card: any;
  task: any;
  taskkey: any;
  memberskeys: any[] = [];
  members: any = '';
  membersVal: string[] = [];
  attachmentkeys: string[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public afDb: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public actionCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public toast: ToastController,
    private fileChooser: FileChooser,
    private file: File,
    private filePath: FilePath,
    private afStorage: AngularFireStorage,
    private app: MyApp) {

    let loading = this.loadingCtrl.create({content: 'Please wait...', cssClass: this.color});
    loading.present();

    this.afDb.database.ref(this.cardPath).on('value', data => {      
      if(data.val()) {
        this.card = data.val();
        this.task = '';
        if(data.val().tasks) {
          this.taskkey = Object.keys(data.val().tasks);
          this.task = data.val().tasks;
        }

        if(data.val().members) {
          Object.keys(data.val().members).forEach((element) => {
            this.membersVal.push(data.val().members[element].uid);
          });
        }

        if(data.val().attachments) {
          this.attachmentkeys = Object.keys(data.val().attachments);
        }
      }
    });

    this.afDb.object('boards/'+this.boardKey+'/members').valueChanges().subscribe(data => {
      if(data) {
        this.membersVal.forEach(uid => {
          Object.keys(data).forEach(key => {
            if(data[key].uid == uid) {
              this.memberskeys.push(key);
            }
          });
        });
        this.members = data;
      }
    });

    loading.dismiss();

  }

  addTask() {
    let loading = this.loadingCtrl.create({content: 'Please wait...', cssClass: this.color});
    loading.present();
    this.afDb.list(this.cardPath+'/tasks')
    .push({title: this.addTaskVal, checked: false})
    .then(() => {
      this.afDb.object(this.cardPath)
      .update({total_tasks: ++this.card.total_tasks})
      .catch(error => { console.log(error); })
      this.addTaskVal = '';
    });
    loading.dismiss();
  }
  checkTask(key, val) {
    this.afDb.object(this.cardPath+'/tasks/'+key)
    .update({checked: !val})
    .then(() => {

      this.afDb.object(this.cardPath)
      .update({completed_tasks: ((!val)? ++this.card.completed_tasks : --this.card.completed_tasks) })
      .catch(error => { console.log(error); });

    })
    .catch(error => {
      console.log(error);
    });    
  }

  deleteTask(key, task) {

    this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'Do you really want to delete '+task.title+' Task?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: 'Delete',
          role: 'delete',
          handler: data => {
            let loading = this.loadingCtrl.create({content: 'Please wait...', cssClass: this.color});  
            loading.present();
            this.afDb.object(this.cardPath+'/tasks/'+key).remove()
            .then(result => {
              loading.dismiss();
              this.afDb.object(this.cardPath)
              .update({
                completed_tasks: (task.checked)? --this.card.completed_tasks : this.card.completed_tasks,
                total_tasks: --this.card.total_tasks
              })
              .catch(error => { console.log(error); });
            }).catch(error => {
              console.log(error);
              loading.dismiss();
            });
          }
        }
      ]
    }).present();
  }

  addAttachment() {
    this.fileChooser.open().then((uri) => {
      this.filePath.resolveNativePath(uri).then(filePath => {
        let dirPathSegments = filePath.split('/');
        let fileName = dirPathSegments[dirPathSegments.length-1];
        dirPathSegments.pop();
        let dirPath = dirPathSegments.join('/');
        this.file.readAsDataURL(dirPath, fileName).then(async (data) => {
          await this.upload(data, fileName);
        }).catch((err) => {
          alert('buffer_error'+err.toString());
        });
      });
    });
  }

  upload(data, name) {
    let uploadLoading = this.loadingCtrl.create({content: 'Uploading...', cssClass: this.color});
    uploadLoading.present();
    let fileRef = this.afStorage.storage.ref('attachments/'+this.boardKey+'/'+this.cardKey+'/'+name);
    let upload = fileRef.putString(data, 'data_url');
    upload.on('state_changed', data => {}, 
    error => {
      console.log(error);
      uploadLoading.dismiss();
    }, () => {
      upload.snapshot.ref.getDownloadURL()
      .then(url => {
        this.afDb.list(this.cardPath+'/attachments').push({name: name, url: url});
        uploadLoading.dismiss();
        this.toast.create({message: 'Upload successfully.', cssClass: 'success-toast', duration: 2000}).present();
      }).catch(error => {
        console.log(error);
        this.toast.create({message: 'Uploading failed.', cssClass: 'error-toast', duration: 2000}).present();
        uploadLoading.dismiss();
      });
    });
  }

  disscussionPage() {
    this.navCtrl.push('DiscussionPage', 
      {
        key: this.discussionKey,
        color: this.card.color,
        members: this.membersVal,
        owner: this.card.owner,
        cardTitle: this.card.title
    });
  }

  ionViewDidLoad() {
    this.app.changeStatusBarColor(this.color);
    console.log('ionViewDidLoad SharedCardPage');
  }

}
