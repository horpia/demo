import {Renderable} from "game/renderable";
import {Interruptable} from "game/interruptable";
import {AssetsItem} from "game/assets-item";
import {loadImage} from "game/helpers/images";
import {ASSETS_URN, EXPLOSION_FRAME_DURATION, EXPLOSION_SIZE, EXPLOSION_SPRITES} from "game/config";
import {EventsDispatcher} from "game/events-dispatcher";

export class Explosion implements Renderable, Interruptable, AssetsItem {
	private frame = 0;
	private lastTime = 0;
	private readonly size: number;
	private img: HTMLImageElement;
	readonly events = new EventsDispatcher();

	constructor(
		private readonly x: number,
		private readonly y: number,
		private readonly scale: number
	) {
		this.size = Math.floor(EXPLOSION_SIZE * this.scale);
	}

	interrupt(): void {
		const now = Date.now();
		if (now - this.lastTime < EXPLOSION_FRAME_DURATION) {
			return;
		}

		this.lastTime = now;
		this.frame++;
		if (this.frame >= EXPLOSION_SPRITES) {
			this.events.trigger('end');
		}
	}

	async loadAssets(): Promise<void> {
		this.img = await loadImage(`${ASSETS_URN}/expl1.gif`);
	}

	render(ctx: CanvasRenderingContext2D): void {
		const sizeHalf = this.size >> 1;
		ctx.drawImage(
			this.img,
			this.frame * EXPLOSION_SIZE, 0, EXPLOSION_SIZE, EXPLOSION_SIZE,
			this.x - sizeHalf, this.y - sizeHalf, this.size, this.size
		);
	}
}