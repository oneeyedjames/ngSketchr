import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { CanvasModule } from '../lib/canvas.module';

import { AppComponent } from './app.component';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		FormsModule,
		BrowserModule,
		CanvasModule
	],
	providers: [],
	bootstrap: [
		AppComponent
	]
})
export class AppModule {}
