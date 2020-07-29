import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddBoardPage } from './add-board';

@NgModule({
  declarations: [
    AddBoardPage,
  ],
  imports: [
    IonicPageModule.forChild(AddBoardPage),
  ],
})
export class AddBoardPageModule {}
