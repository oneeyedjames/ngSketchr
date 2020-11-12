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
	template: '<canvas #canvas></canvas>'
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

	@ViewChild('canvas') canvas: ElementRef;

	get backgroundColor(): string { return this._bgColor; }
	get backgroundImage(): string { return this._bgImage; }
	get backgroundMode(): BackgroundMode { return this._bgMode; }

	@Input() set backgroundColor(color: string) {
		this._bgColor = color;
		this.backgroundColorChange.emit(color);
		this.replay();
	}

	@Input() set backgroundImage(image: string) {
		this._bgImage = image;
		this.backgroundImageChange.emit(image);
		this.replay();
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

	private drawBackgroundColor() {
		if (this.context) {
			this.context.fillStyle = this.backgroundColor;
			this.context.fillRect(0, 0, this.width, this.height);
		}
	}

	private async drawBackgroundImage(): Promise<void> {
		if (!this.context) return;

		return new Promise<void>((resolve, reject) => {
			let image = new Image();
			image.onload = () => {
				let canvas = this.canvas.nativeElement;
				let xScale = canvas.width / image.width;
				let yScale = canvas.height / image.height;

				let scale: number;
				console.log(this.backgroundMode);
				switch (this.backgroundMode) {
					case 'fit':
						scale = Math.min(xScale, yScale);
						break;
					case 'fill':
						scale = Math.max(xScale, yScale);
						break;
				}

				let dWidth = image.width * scale;
				let dHeight = image.height * scale;

				let dx = (canvas.width - dWidth) / 2;
				let dy = (canvas.height - dHeight) / 2;

				this.context.drawImage(image, 0, 0,
					image.width, image.height,
					dx, dy, dWidth, dHeight);

				resolve();
			}
			image.onerror = reject;
			image.src = this.backgroundImage;
		});
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

		if (index == 0) {
			this.clear();

			if (this.backgroundColor)
				this.drawBackgroundColor();

			if (this.backgroundImage)
				await this.drawBackgroundImage();
		}

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
}
