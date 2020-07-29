import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController, AlertController, NavParams, MenuController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireStorage } from "angularfire2/storage";
import { FileChooser } from '@ionic-native/file-chooser';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { FileTransfer } from '@ionic-native/file-transfer';
import { MyApp } from '../../app/app.component';

/**
 * Generated class for the CardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-card',
  templateUrl: 'card.html',
})
export class CardPage {

  private cardForm : FormGroup;

  cardKey: string = this.navParams.get('cardkey');
  boardKey: string = this.navParams.get('boardkey');
  color: string = this.navParams.get('color');
  discussionKey: string = this.boardKey+'/'+this.cardKey;
  cardPath: string = 'cards/'+this.boardKey+'/'+this.cardKey;
  addTaskVal: string = '';
  card: any;
  task: any;
  taskkey: any;
  min: number = new Date().getFullYear();
  max: number = new Date().getFullYear()+100;
  title: AbstractControl;
  memberskeys: any = '';
  members: any = '';
  membersVal: string[] = [];
  disabled: boolean = false;
  showMember: boolean = false;
  attachmentkeys: string[] = [];
  duedate: string = "";
  date2: Date;
  uids: string[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public menuCtrl: MenuController,
    public afAuth: AngularFireAuth,
    public afDb: AngularFireDatabase,
    private formBulder: FormBuilder,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, 
    public toastCtrl: ToastController,
    private fileChooser: FileChooser,
    private file: File,
    private filePath: FilePath,
    private afStorage: AngularFireStorage,
    public fileTransfer: FileTransfer,
    private app: MyApp) {

      let loading = this.loadingCtrl.create({content: 'Please wait...', cssClass: this.color});
      loading.present();

      this.afDb.object('boards/'+this.boardKey+'/members').valueChanges().subscribe(data => {
        if(data) {
          this.memberskeys = Object.keys(data);
          this.members = data;
        }
      });

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
      this.duedate = this.card.duedate;
      this.cardForm = this.formBulder.group({
        title: [this.card.title, [Validators.required]],
        description: [this.card.description],
        members: [this.membersVal],
        status: [this.card.status]
      });
      this.showMember = (this.membersVal)? true : false;
      this.title = this.cardForm.controls['title'];
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

  updateTitle() {
    let loading = this.loadingCtrl.create({content: 'Please wait...', cssClass: this.color});
    loading.present();
    if(!this.title.hasError('required')) {
      this.afDb.object(this.cardPath)
      .update({title: this.cardForm.controls['title'].value})
      .then(() => {

      })
      .catch(error => {
        console.log(error);
      });  
    }
    this.toastCtrl.create({message: 'Title Updated.', cssClass: 'success-toast', duration: 2000}).present();
    loading.dismiss();
  }

  updateDescription() {
    let loading = this.loadingCtrl.create({content: 'Please wait...', cssClass: this.color});
    loading.present();
    this.afDb.object(this.cardPath)
    .update({description: this.cardForm.controls['description'].value})
    .then(() => {

    })
    .catch(error => {
      console.log(error);
    });
    this.toastCtrl.create({message: 'Description Updated.', cssClass: 'success-toast', duration: 2000}).present();
    loading.dismiss();
  }

  updateDueDate() {
    let loading = this.loadingCtrl.create({content: 'Please wait...', cssClass: this.color});
    loading.present();
    this.afDb.object(this.cardPath)
    .update({duedate: this.duedate})
    .then(() => {

    })
    .catch(error => {
      console.log(error);
    });
    this.toastCtrl.create({message: 'Due Date Updated.', cssClass: 'success-toast', duration: 2000}).present();
    loading.dismiss();
  }

  updateStatus() {
    let loading = this.loadingCtrl.create({content: 'Please wait...', cssClass: this.color});
    loading.present();
    this.afDb.object(this.cardPath)
    .update({status: this.cardForm.controls['status'].value})
    .then(() => {
    })
    .catch(error => {
      console.log(error);
    });
    this.toastCtrl.create({message: 'Status Updated.', cssClass: 'success-toast', duration: 2000}).present();
    loading.dismiss();
  }
  
  updateMembers() {
    let loading = this.loadingCtrl.create({content: 'Please wait...', cssClass: this.color});
    loading.present();
    let members = this.cardForm.controls['members'].value;
    this.afDb.object(this.cardPath+'/members').remove();
    members.forEach(element => {
      console.log('members ', this.members);
      this.afDb.list(this.cardPath+'/members').push({uid: element});
    });
    this.toastCtrl.create({message: 'Members Updated.', cssClass: 'success-toast', duration: 2000}).present();
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
      cssClass: this.card.color,
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
            let loading = this.loadingCtrl.create({content: 'Please Wait...', cssClass: this.color});  
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

  deleteCard() {
    this.alertCtrl.create({
      title: 'Are you sure?',
      cssClass: this.card.color,
      message: 'Do you really want to delete '+this.card.title+' Card?',
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
            let loading = this.loadingCtrl.create({content: 'Please Wait...', cssClass: this.color});  
            loading.present();
            this.afDb.object(this.cardPath).remove()
            .then(result => {
              this.afDb.object('discussion/'+this.discussionKey).remove().catch(error => {
                console.log(error);
              });
              this.navCtrl.pop();
              loading.dismiss();
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
          console.log('buffer_error', err.toString());
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
        this.toastCtrl.create({message: 'Upload successfully.', cssClass: 'success-toast', duration: 2000}).present();
      }).catch(error => {
        console.log(error);
        this.toastCtrl.create({message: 'Uploading failed.', cssClass: 'error-toast', duration: 2000}).present();
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
    console.log('ionViewDidLoad CardPage');
  }

}
