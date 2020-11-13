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
	path: Line2D[];
	color: string;
	size: number;
	time?: number;
}

export type BackgroundMode = 'fit' | 'fill';

@Component({
	selector: 'app-canvas',
	templateUrl: './canvas.component.html',
	styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements AfterViewInit {
	private _width: number = 640;
	private _height: number = 480;

	private _bgColor: string;
	private _bgImage: string;
	private _bgMode: BackgroundMode;

	private _color: string = 'black';
	private _size: number = 16;

	private context: CanvasRenderingContext2D;

	private stroke: Line2D[] = [];

	private undoStack: DrawEvent[] = [];
	private redoStack: DrawEvent[] = [];

	get modes() { return { fit: 'contain', fill: 'cover' }; }

	@ViewChild('canvas') canvas: ElementRef;

	get backgroundColor(): string { return this._bgColor; }
	get backgroundImage(): string { return this._bgImage; }
	get backgroundMode(): BackgroundMode { return this._bgMode; }

	@Input() set backgroundColor(color: string) {
		this._bgColor = color;
		this.backgroundColorChange.emit(color);
	}

	@Input() set backgroundImage(image: string) {
		this._bgImage = image;
		this.backgroundImageChange.emit(image);
	}

	@Input() set backgroundMode(mode: BackgroundMode) {
		this._bgMode = mode;
		this.backgroundModeChange.emit(mode);
		this.replay();
	}

	@Output() backgroundColorChange = new EventEmitter<string>();
	@Output() backgroundImageChange = new EventEmitter<string>();
	@Output() backgroundModeChange = new EventEmitter<BackgroundMode>();

	get color(): string { return this._color; }
	get size(): number { return this._size; }
	get width(): number { return this._width; }
	get height(): number { return this._height; }

	@Input() set color(color: string) {
		this._color = color;
		this.colorChange.emit(color);
	}

	@Input() set size(size: number) {
		this._size = size;
		this.sizeChange.emit(size);
	}

	@Input() set width(width: number) {
		this._width = width;

		if (this.context) {
			this.canvas.nativeElement.width = width;
			this.initContext(this.canvas.nativeElement);
		}

		this.widthChange.emit(width);
	}

	@Input() set height(height: number) {
		this._height = height;

		if (this.context) {
			this.canvas.nativeElement.height = height;
			this.initContext(this.canvas.nativeElement);
		}

		this.heightChange.emit(height);
	}

	@Output() colorChange = new EventEmitter<string>();
	@Output() sizeChange = new EventEmitter<number>();
	@Output() widthChange = new EventEmitter<number>();
	@Output() heightChange = new EventEmitter<number>();

	@Output('draw') drawEvent = new EventEmitter<DrawEvent>();

	@Output() canUndo = new EventEmitter<boolean>();
	@Output() canRedo = new EventEmitter<boolean>();

	get downloadUri(): string {
		return this.canvas.nativeElement.toDataURL('image/png');
	}

	public ngAfterViewInit() {
		this.initContext(this.canvas.nativeElement);
		this.initObserver(this.canvas.nativeElement);
	}

	private initContext(canvas: HTMLCanvasElement) {
		canvas.width = this.width;
		canvas.height = this.height;

		this.context = canvas.getContext('2d');
		this.context.lineCap = 'round';
	}

	private initObserver(canvas: HTMLCanvasElement) {
		Observable.fromEvent<MouseEvent>(canvas, 'mousedown')
		.switchMap((event: MouseEvent) => {
			return Observable.fromEvent<MouseEvent>(canvas, 'mousemove')
			.takeUntil(Observable.fromEvent<MouseEvent>(canvas, 'mouseup'))
			.takeUntil(Observable.fromEvent<MouseEvent>(canvas, 'mouseleave'))
			.pairwise();
		})
		.subscribe((value: [MouseEvent, MouseEvent]) => {
			const rect = canvas.getBoundingClientRect();
			const line = {
				start: {
					x: value[0].clientX - rect.left,
					y: value[0].clientY - rect.top
				},
				end: {
					x: value[1].clientX - rect.left,
					y: value[1].clientY - rect.top
				}
			};

			this.stroke.push(line);
			this.drawLine(line);
		});

		Observable.fromEvent<MouseEvent>(canvas, 'mousedown')
		.subscribe((event: MouseEvent) => this.onStartDraw());

		Observable.fromEvent<MouseEvent>(canvas, 'mouseup')
		.subscribe((event: MouseEvent) => this.onEndDraw());

		Observable.fromEvent<MouseEvent>(canvas, 'mouseleave')
		.subscribe((event: MouseEvent) => this.onEndDraw());
	}

	private drawLine(line: Line2D) {
		if (this.context) {
			this.context.strokeStyle = this.color;
			this.context.lineWidth = this.size;
			this.context.beginPath();
			this.context.moveTo(line.start.x, line.start.y);
			this.context.lineTo(line.end.x, line.end.y);
			this.context.stroke();
		}
	}

	private onStartDraw() {
		this.stroke = [];
	}

	private onEndDraw() {
		if (this.stroke.length) {
			const event: DrawEvent = {
				path: this.stroke,
				color: this.color,
				size: this.size
			};

			this.stroke = [];

			this.redoStack = [];
			this.undoStack.push(event);

			this.canUndo.emit(true);
			this.canRedo.emit(false);

			this.drawEvent.emit(event);
		}
	}

	private clear() {
		if (this.context) {
			this.context.clearRect(0, 0, this.width, this.height);
		}
	}

	public undo() {
		if (this.undoStack.length) {
			this.redoStack.push(this.undoStack.pop());

			this.replay();

			this.canUndo.emit(this.undoStack.length > 0);
			this.canRedo.emit(true);
		}
	}

	public redo() {
		if (this.redoStack.length) {
			this.undoStack.push(this.redoStack.pop());

			this.replay();

			this.canUndo.emit(true);
			this.canRedo.emit(this.redoStack.length > 0);
		}
	}

	public reset() {
		this._bgColor = null;
		this._bgImage = null;

		this.undoStack = [];
		this.redoStack = [];

		this.clear();

		this.canUndo.emit(false);
		this.canRedo.emit(false);
	}

	public async replay(fps?: number, index?: number): Promise<void> {
		if (!this.context) return;

		index = index == undefined ? 0 : index;
		if (index == 0) this.clear();

		if (this.undoStack.length == 0) return;

		if (index < this.undoStack.length) {
			const delay = fps == undefined || fps <= 0 ? 0 : 1000 / fps;

			let event = this.undoStack[index];

			this.replayEvent(event, delay).then(() => {
				return this.replay(fps, index + 1);
			});
		}
	}

	private async replayEvent(event: DrawEvent, delay: number): Promise<void> {
		if (!this.context) return;

		this.color = event.color;
		this.size = event.size;

		if (delay > 0) {
			return new Promise<void>((resolve) => {
				let index = 0;
				let interval = setInterval(() => {
					if (index < event.path.length) {
						let line = event.path[index++];
						this.drawLine(line);
					} else {
						clearInterval(interval);
						resolve();
					}
				}, delay);
			});
		} else {
			for (let line of event.path) {
				this.drawLine(line);
			}
		}
	}

	public async export(filename = 'image.png', type = 'image/png') {
		const canvas = document.createElement('canvas') as HTMLCanvasElement;

		canvas.width = this.width;
		canvas.height = this.height;

		const context = canvas.getContext('2d');
		context.lineCap = 'round';

		if (this.backgroundColor) {
			context.fillStyle = this.backgroundColor;
			context.fillRect(0, 0, this.width, this.height);
		}

		if (this.backgroundImage) {
			await new Promise<void>((resolve, reject) => {
				const image = new Image();
				image.onload = () => {
					const xScale = canvas.width / image.width;
					const yScale = canvas.height / image.height;

					let scale: number;
					switch (this.backgroundMode) {
						case 'fit':
							scale = Math.min(xScale, yScale);
							break;
						case 'fill':
							scale = Math.max(xScale, yScale);
							break;
					}

					const dWidth = image.width * scale;
					const dHeight = image.height * scale;

					const dx = (canvas.width - dWidth) / 2;
					const dy = (canvas.height - dHeight) / 2;

					context.drawImage(image, 0, 0,
						image.width, image.height,
						dx, dy, dWidth, dHeight);

					resolve();
				}
				image.onerror = reject;
				image.src = this.backgroundImage;
			});
		}

		for (let frame of this.undoStack) {
			context.strokeStyle = frame.color;
			context.lineWidth = frame.size;

			for (let line of frame.path) {
				context.beginPath();
				context.moveTo(line.start.x, line.start.y);
				context.lineTo(line.end.x, line.end.y);
				context.stroke();
			}
		}

		const link = document.createElement('a')
		link.href = canvas.toDataURL(type);
		link.download = filename;
		link.click();
	}
}
