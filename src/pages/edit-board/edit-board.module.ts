import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditBoardPage } from './edit-board';

@NgModule({
  declarations: [
    EditBoardPage,
  ],
  imports: [
    IonicPageModule.forChild(EditBoardPage),
  ],
})
export class EditBoardPageModule {}
