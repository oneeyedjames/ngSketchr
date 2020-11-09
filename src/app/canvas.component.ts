import { Component, Input, Output, EventEmitter,
	ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/switchMap';

export interface Point2D { x: number, y: number }

export interface Line2D { start: Point2D; end: Point2D; }

export interface DrawEvent {
	line: Line2D;
	color: string;
	size: number;
	time: number;
}

@Component({
	selector: 'app-canvas',
	templateUrl: './canvas.component.html',
	styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements AfterViewInit {
	private _bgColor: string;
	private _bgImage: string;
	private _bgStyle: string;

	private _color: string = '#000';
	private _size: number = 16;
	private _width: number = 640;
	private _height: number = 480;

	private context: CanvasRenderingContext2D;

	@ViewChild('canvas') canvas: ElementRef;

	get backgroundColor(): string {
		return this._bgColor || 'transparent';
	}

	get backgroundImage(): string {
		return this._bgImage ? 'url(\'' + this._bgImage + '\')' : 'none';
	}

	get backgroundStyle(): string {
		return this._bgStyle || 'auto';
	}

	get color(): string { return this._color; }
	get size(): number { return this._size; }
	get width(): number { return this._width; }
	get height(): number { return this._height; }

	@Input() set backgroundColor(color: string) { this._bgColor = color; }
	@Input() set backgroundImage(image: string) { this._bgImage = image; }
	@Input() set backgroundStyle(style: string) { this._bgStyle = style; }

	@Input() set width(width: number) {
		this._width = width;

		if (this.context)
			this.canvas.nativeElement.width = width;
	}

	@Input() set height(height: number) {
		this._height = height;

		if (this.context)
			this.canvas.nativeElement.height = height;
	}

	@Input() set color(color: string) {
		this._color = color;

		if (this.context)
			this.context.strokeStyle = color;
	}

	@Input() set size(size: number) {
		this._size = size;

		if (this.context)
			this.context.lineWidth = size;
	}

	@Output() draw = new EventEmitter<DrawEvent>();

	public ngAfterViewInit() {
		this.initContext(this.canvas.nativeElement);
		this.initObserver(this.canvas.nativeElement);
	}

	private initContext(canvas: HTMLCanvasElement) {
		canvas.width = this.width;
		canvas.height = this.height;

		this.context = canvas.getContext('2d');
		this.context.strokeStyle = this.color;
		this.context.lineWidth = this.size;
		this.context.lineCap = 'round';
	}

	private initObserver(canvas: HTMLCanvasElement) {
		Observable.fromEvent<MouseEvent>(canvas, 'mousedown')
		.switchMap((e: MouseEvent) => {
			return Observable.fromEvent<MouseEvent>(canvas, 'mousemove')
			.takeUntil(Observable.fromEvent<MouseEvent>(canvas, 'mouseup'))
			.takeUntil(Observable.fromEvent<MouseEvent>(canvas, 'mouseleave'))
			.pairwise();
		})
		.subscribe((value: [MouseEvent, MouseEvent]) => {
			const rect = canvas.getBoundingClientRect();
			const event = {
				line: {
					start: {
						x: value[0].clientX - rect.left,
						y: value[0].clientY - rect.top
					},
					end: {
						x: value[1].clientX - rect.left,
						y: value[1].clientY - rect.top
					}
				},
				color: this.color,
				size: this.size,
				time: Date.now()
			};

			this.doDraw(event.line.start, event.line.end);
			this.draw.emit(event);
		});
	}

	private doDraw(start: Point2D, end?: Point2D) {
		if (!this.context) return;

		this.context.beginPath();
		this.context.moveTo(start.x, start.y);
		this.context.lineTo(end.x, end.y);
		this.context.stroke();
	}

	public reset() {
		if (this.context)
			this.context.clearRect(0, 0, this.width, this.height);
	}

	public play(frames: DrawEvent[]): Promise<any> {
		const self = this;

		return new Promise((resolve, reject) => {
			if (frames.length == 0) reject('No frames to replay');

			self.reset();

			let index = 0;
			const length = frames.length;

			const draw = (frame: DrawEvent) => {
				if (frame.color != undefined) self.color = frame.color;
				if (frame.size != undefined) self.size = frame.size;
				if (frame.line != undefined) self.doDraw(frame.line.start, frame.line.end);
			}

			const next = () => {
				if (index < length) {
					let thisFrame = frames[index];
					let nextFrame = frames[++index];

					draw(thisFrame);

					if (nextFrame) {
						setTimeout(next, Math.min(1000,
							nextFrame.time - thisFrame.time));
					}
				} else {
					resolve();
				}
			}

			next();
		});
	}
}
