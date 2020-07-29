import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SharedCardsPage } from './shared-cards';

@NgModule({
  declarations: [
    SharedCardsPage,
  ],
  imports: [
    IonicPageModule.forChild(SharedCardsPage),
  ],
})
export class SharedCardsPageModule {}
