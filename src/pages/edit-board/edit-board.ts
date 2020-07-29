import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AngularFireDatabase } from "angularfire2/database";

/**
 * Generated class for the EditBoardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-board',
  templateUrl: 'edit-board.html',
})
export class EditBoardPage {

  private editBoardForm : FormGroup;
  title: AbstractControl;
  description: AbstractControl;
  loading : any;
  boardTitle: any;


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private afDatabase: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public toastCtrl : ToastController) {
      
    this.editBoardForm = this.formBuilder.group({
      title: [navParams.get('board').title, Validators.required],
      description:[navParams.get('board').description]
    });
    
    this.boardTitle = navParams.get('board').title;
    this.title = this.editBoardForm.controls['title'];
    this.description = this.editBoardForm.controls['description'];
    this.loading = this.loadingCtrl.create({content: 'Please Wait...'});;
  }

  editBoard() {
    this.loading.present();
    this.afDatabase.object('boards/'+this.navParams.get('key')+'/board').set({
      title: this.title.value,
      description: this.description.value,
      status: this.navParams.get('board').status,
      created_date: this.navParams.get('board').created_date
    }).then(() => {
      this.loading.dismiss();
      this.navCtrl.pop();
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditBoardPage');
  }

}
