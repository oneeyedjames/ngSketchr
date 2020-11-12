import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CanvasModule } from '../lib/canvas.module';

import { MaterialModule } from './material.module';
import { AppComponent } from './app.component';
import { DialogComponent } from './dialog.component';

@NgModule({
	declarations: [
		AppComponent,
		DialogComponent
	],
	imports: [
		FormsModule,
		BrowserModule,
		BrowserAnimationsModule,
		CanvasModule,
		MaterialModule
	],
	providers: [],
	bootstrap: [
		AppComponent
	],
	entryComponents: [
		DialogComponent
	]
})
export class AppModule {}
