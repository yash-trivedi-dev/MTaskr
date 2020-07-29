import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BoardsPage } from './boards';

@NgModule({
  declarations: [
    BoardsPage,
  ],
  imports: [
    IonicPageModule.forChild(BoardsPage),
  ],
})
export class BoardsPageModule {}
