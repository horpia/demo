import {Canvas} from "game/canvas";
import {Renderable} from "game/renderable";

export class Renderer {
	private requestId: number | undefined;
	private started = false;
	private list: Renderable[] = [];
	private renderRequested = true;

	constructor(private readonly canvas: Canvas) {
	}

	start(): void {
		this.stop();
		this.started = true;
		this.requestId = requestAnimationFrame(this.render);
	}

	stop(): void {
		if (this.requestId !== undefined) {
			cancelAnimationFrame(this.requestId);
		}

		this.started = false;
	}

	addItem(item: Renderable): void {
		if (this.list.includes(item)) {
			return;
		}

		this.list.push(item);
		this.renderRequested = true;
	}

	removeItem(item: Renderable): void {
		let i = this.list.indexOf(item);
		if (i < 0) {
			return;
		}

		this.list.splice(i, 1);

		this.renderRequested = true;
	}

	requestRender(): void {
		this.renderRequested = true;
	}

	private render = (): void => {
		if (this.requestId !== undefined) {
			cancelAnimationFrame(this.requestId);
		}

		if (this.renderRequested) {
			this.renderRequested = false;
			this.canvas.clear();
			this.list.forEach(item => this.canvas.draw(item));
			this.canvas.finishFrame();
		}

		if (this.started) {
			this.requestId = requestAnimationFrame(this.render);
		}
	};
}