import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SharedBoardsPage } from './shared-boards';

@NgModule({
  declarations: [
    SharedBoardsPage,
  ],
  imports: [
    IonicPageModule.forChild(SharedBoardsPage),
  ],
})
export class SharedBoardsPageModule {}
