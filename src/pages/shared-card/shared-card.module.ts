import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SharedCardPage } from './shared-card';

@NgModule({
  declarations: [
    SharedCardPage,
  ],
  imports: [
    IonicPageModule.forChild(SharedCardPage),
  ],
})
export class SharedCardPageModule {}
