import {Renderable} from "game/renderable";
import {CANVAS_HEIGHT, CANVAS_WIDTH, SCREEN_HEIGHT, SCREEN_WIDTH} from "game/config";
import {UIElement} from "game/ui-element";

export class Canvas implements UIElement {
	private readonly displayCanvas: HTMLCanvasElement;
	private readonly bufferCanvas: HTMLCanvasElement;
	private readonly displayCtx: CanvasRenderingContext2D;
	private readonly bufferCtx: CanvasRenderingContext2D;

	constructor() {
		this.displayCanvas = document.createElement('canvas');
		this.displayCanvas.width = CANVAS_WIDTH;
		this.displayCanvas.height = CANVAS_HEIGHT;

		this.displayCtx = this.displayCanvas.getContext('2d', {alpha: false});
		this.displayCtx.imageSmoothingEnabled = false;
		// @ts-ignore
		this.displayCtx.mozImageSmoothingEnabled = false;
		// @ts-ignore
		this.displayCtx.webkitImageSmoothingEnabled = false;

		this.bufferCanvas = document.createElement('canvas');
		this.bufferCanvas.width = SCREEN_WIDTH;
		this.bufferCanvas.height = SCREEN_HEIGHT;
		this.bufferCanvas.style.cssText = 'font-smooth: never;  -webkit-font-smoothing : none;';
		this.bufferCtx = this.bufferCanvas.getContext('2d', {alpha: false});
		this.bufferCtx.imageSmoothingEnabled = false;
		// @ts-ignore
		this.bufferCtx.mozImageSmoothingEnabled = false;
		// @ts-ignore
		this.bufferCtx.webkitImageSmoothingEnabled = false;
	}

	build(): void {
	}

	getElement(): HTMLElement {
		return this.displayCanvas;
	}

	clear(): void {
		this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
	}

	draw(item: Renderable): void {
		this.bufferCtx.save();
		item.render(this.bufferCtx);
		this.bufferCtx.restore();
	}

	finishFrame(): void {
		this.displayCtx.drawImage(this.bufferCanvas, 0, 0, this.displayCanvas.width, this.displayCanvas.height);
	}
}