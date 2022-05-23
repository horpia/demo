import {Renderable} from "game/renderable";
import {AssetsItem} from "game/assets-item";
import {
	ASSETS_URN,
	BARRIERS_LINE_HEIGHT, COIN_FADEOUT_STEPS,
	COIN_SIZE,
	COIN_SPRITE_DURATION,
	COIN_SPRITES
} from "game/config";
import {loadImage} from "game/helpers/images";
import {FieldOfView} from "game/field-of-view";

export class Coins implements Renderable, AssetsItem {
	private img?: HTMLImageElement;
	private lineX = 0;
	private lineY = 0;
	private scale = 1;
	private coins: number[][];
	private score = 0;

	constructor(
		private readonly fov: FieldOfView
	) {
	}

	reset(): void {
		this.score = 0;
	}

	async loadAssets(): Promise<void> {
		this.img = await loadImage(`${ASSETS_URN}/coin.gif`);
	}

	getScore(): number {
		return this.score;
	}

	setProps(lineX: number, lineY: number, scale: number, coins: number[][]): void {
		this.lineX = lineX;
		this.lineY = lineY;
		this.scale = scale;
		this.coins = coins;
	}

	render(ctx: CanvasRenderingContext2D): void {
		if (!this.img || !this.coins) {
			return;
		}

		const nearRect = this.fov.getNearRect();

		const cellWidth = (nearRect.width >> 2) * this.scale;
		const cellWidthHalf = cellWidth >> 1;
		const cellHeight = BARRIERS_LINE_HEIGHT * this.scale;
		const cellHeightHalf = cellHeight >> 1;
		const coinSize = COIN_SIZE * this.scale;
		const coinSizeHalf = coinSize / 2;
		const coinSpriteX = COIN_SIZE * (Math.floor(Date.now() / COIN_SPRITE_DURATION) % COIN_SPRITES);

		main: for (let i = 0; i < this.coins.length; i++) {
			for (let j = 0; j < this.coins[i].length; j++) {
				if (this.coins[i][j] === 0) {
					continue;
				}

				let shift = 0;
				let scale = 1;

				if (this.coins[i][j] > 1) {
					if (this.coins[i][j] === 2) {
						this.score++;
					}
					
					shift = this.coins[i][j] * 10;
					scale = Math.min(1, Math.max(0, 1 - (this.coins[i][j] / COIN_FADEOUT_STEPS)));
					this.coins[i][j]++;
				}

				if (scale <= 0) {
					break main;
				}

				ctx.drawImage(
					this.img,
					coinSpriteX,
					0,
					COIN_SIZE, COIN_SIZE,
					this.lineX + j * cellWidth + cellWidthHalf - coinSizeHalf * scale,
					this.lineY - (2 - i) * cellHeight - cellHeightHalf - coinSizeHalf * scale - shift,
					coinSize * scale,
					coinSize * scale
				);
				break main;
			}
		}
	}
}