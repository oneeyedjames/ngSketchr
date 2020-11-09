import { Component, ViewChild } from '@angular/core';
import 'rxjs/add/observable/fromEvent';

import { CanvasComponent, DrawEvent } from './canvas.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'app';
	color = 'black';
	size = 16;

	backgroundColor: string;
	backgroundImage: string;
	backgroundStyle: string = 'auto';

	colors = ['black', 'red', 'green', 'blue'];
	sizes = { large: 32, medium: 24, small: 16 };

	frames: DrawEvent[] = [];

	@ViewChild('mycanvas')
	canvas: CanvasComponent;

	setColor(color: string, size?: number) {
		this.color = color;

		if (size != undefined)
			this.size = size;
	}

	setSize(size: number) {
		this.size = size;
	}

	onDraw(e: DrawEvent) {
		this.frames.push(e);
	}

	onFileChange(e) {
		let reader = new FileReader();
		reader.onload = () => {
			this.backgroundImage = reader.result as string;
		};

		reader.readAsDataURL(e.target.files[0]);
	}

	reset() {
		if (confirm('Are you sure you want to reset?')) {
			this.frames = [];
			this.canvas.reset();
		}
	}

	replay() {
		this.canvas.play(this.frames);
	}
}
