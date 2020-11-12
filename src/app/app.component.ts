import { Component, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { MatToolbar, MatDrawer } from '@angular/material';
import 'rxjs/add/observable/fromEvent';

import { CanvasComponent } from '../lib/canvas.module';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
	width = 640;
	height = 480;

	canUndo: boolean;
	canRedo: boolean;

	backgroundImage: string;

	@ViewChild('maintoolbar')
	toolbar: MatToolbar;

	@ViewChild('mainsidebar')
	sidebar: MatDrawer;

	@ViewChild('mycanvas')
	canvas: CanvasComponent;

	ngAfterViewInit() { this.resizeCanvas(); }

	@HostListener('window:resize', ['$event'])
	onResize(e) { this.resizeCanvas(); }

	private resizeCanvas() {
		let mainHeight = this.toolbar._elementRef.nativeElement.offsetHeight;

		this.width = window.innerWidth - this.sidebar._width;
		this.height = window.innerHeight - mainHeight;

		this.canvas.replay();
	}

	onFileChange(e) {
		if (e.target.files[0]) {
			let reader = new FileReader();
			reader.onload = () => {
				this.backgroundImage = reader.result as string;
			};
			reader.readAsDataURL(e.target.files[0]);
		}
	}

	reset() {
		if (confirm('Are you sure you want to reset?')) {
			this.canvas.reset();
		}
	}

	replay() {
		this.canvas.replay(50);
	}
}
