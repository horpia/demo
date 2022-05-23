import {Renderable} from "game/renderable";
import {loadImage} from "game/helpers/images";
import {ASSETS_URN, BG_SHIFT_STEP} from "game/config";
import {Position} from "game/position";
import {AssetsItem} from "game/assets-item";

export class SpaceBackground implements Renderable, AssetsItem {
	private img?: HTMLImageElement;

	constructor(private readonly position: Position) {
	}

	render(ctx: CanvasRenderingContext2D): void {
		const offset = Math.floor(this.position.value * BG_SHIFT_STEP) % this.img.naturalHeight;

		if (offset === 0) {
			ctx.drawImage(this.img, 0, 0);
		} else {
			ctx.drawImage(
				this.img,
				0, offset, this.img.naturalWidth, this.img.naturalHeight - offset,
				0, 0, this.img.naturalWidth, this.img.naturalHeight - offset
			);
			ctx.drawImage(
				this.img,
				0, 0, this.img.naturalWidth, offset,
				0, this.img.naturalHeight - offset, this.img.naturalWidth, offset
			);
		}
	}

	async loadAssets(): Promise<void> {
		this.img = await loadImage(`${ASSETS_URN}/space-bg.gif`);
	}
}