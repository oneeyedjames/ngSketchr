import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CanvasComponent } from './canvas.component';
export { CanvasComponent, BackgroundMode, DrawEvent, Point2D, Line2D } from './canvas.component';

@NgModule({
	declarations: [
		CanvasComponent
	],
	imports: [
		BrowserModule
	],
	exports: [
		CanvasComponent
	],
	providers: []
})
export class CanvasModule {}
