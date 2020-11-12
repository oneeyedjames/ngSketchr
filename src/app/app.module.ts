import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CanvasModule } from '../lib/canvas.module';

import { MaterialModule } from './material.module';
import { AppComponent } from './app.component';

@NgModule({
	declarations: [
		AppComponent
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
	]
})
export class AppModule {}
