import {AssetsItem} from "game/assets-item";
import {Renderable} from "game/renderable";
import {
	ASSETS_URN,
	COIN_SIZE,
	COINS_BAR_COLOR,
	COINS_BAR_ICON_SIZE,
	COINS_BAR_SCORE_X,
	COINS_BAR_SCORE_Y, COINS_BAR_SHADOW_COLOR,
	COINS_BAR_X,
	COINS_BAR_Y, FINISH_BAR_PERCENT_X, FINISH_BAR_PERCENT_Y, FINISH_BAR_X, FINISH_BAR_Y, FONT_NAME_16,
	HP_BAR_BG_COLOR,
	HP_BAR_BORDER_COLOR,
	HP_BAR_HEALTH_COLORS,
	HP_BAR_HEIGHT,
	HP_BAR_SEGMENT_WIDTH,
	HP_BAR_SKEW,
	HP_BAR_WIDTH,
	HP_BAR_X,
	HP_BAR_Y,
	SHIP_MAX_HP
} from "game/config";
import {loadImage} from "game/helpers/images";
import {Ship} from "game/items/ship";
import {Interruptable} from "game/interruptable";
import {Coins} from "game/items/coins";

export class TopBar implements Renderable, AssetsItem, Interruptable {
	private coinImg?: HTMLImageElement;
	private finishImg?: HTMLImageElement;
	private hp = 0;
	private finishPercent = 0;

	constructor(
		private readonly ship: Ship,
		private readonly coins: Coins
	) {
	}

	reset(): void {
		this.hp = 0;
	}

	setFinishPercent(value: number): void {
		this.finishPercent = value;
	}

	async loadAssets(): Promise<void> {
		[this.coinImg, this.finishImg] = await Promise.all([
			loadImage(`${ASSETS_URN}/coin.gif`),
			loadImage(`${ASSETS_URN}/finish.gif`)
		]);
	}

	interrupt(): void {
		if (this.ship.getHP() !== this.hp) {
			const delta = this.ship.getHP() - this.hp;
			this.hp += Math.ceil(delta / 2);
		}
	}

	render(ctx: CanvasRenderingContext2D): void {
		this.drawHp(ctx);
		this.drawCoins(ctx);
		this.drawFinish(ctx);
	}

	private drawFinish(ctx: CanvasRenderingContext2D): void {
		ctx.drawImage(
			this.finishImg,
			FINISH_BAR_X, FINISH_BAR_Y
		);

		ctx.font = `16px "${FONT_NAME_16}"`;
		ctx.textBaseline = 'top';
		ctx.fillStyle = COINS_BAR_SHADOW_COLOR;
		ctx.fillText(`${this.finishPercent}%`, FINISH_BAR_PERCENT_X + 1, FINISH_BAR_PERCENT_Y + 1);

		ctx.fillStyle = COINS_BAR_COLOR;
		ctx.fillText(`${this.finishPercent}%`, FINISH_BAR_PERCENT_X, FINISH_BAR_PERCENT_Y);
	}

	private drawCoins(ctx: CanvasRenderingContext2D): void {
		ctx.drawImage(
			this.coinImg,
			0, 0,
			COIN_SIZE, COIN_SIZE,
			COINS_BAR_X, COINS_BAR_Y,
			COINS_BAR_ICON_SIZE, COINS_BAR_ICON_SIZE
		);

		ctx.font = `16px "${FONT_NAME_16}"`;
		ctx.textBaseline = 'top';
		ctx.fillStyle = COINS_BAR_SHADOW_COLOR;
		ctx.fillText(`${this.coins.getScore()}`, COINS_BAR_SCORE_X + 1, COINS_BAR_SCORE_Y + 1);

		ctx.fillStyle = COINS_BAR_COLOR;
		ctx.fillText(`${this.coins.getScore()}`, COINS_BAR_SCORE_X, COINS_BAR_SCORE_Y);

	}

	private drawHp(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = HP_BAR_BG_COLOR;
		TopBar.setHpPath(ctx);
		ctx.fill();

		const hp = this.hp / SHIP_MAX_HP;
		const segments = Math.floor(HP_BAR_WIDTH / HP_BAR_SEGMENT_WIDTH);
		const hpSegments = Math.round(segments * hp);
		ctx.fillStyle = HP_BAR_HEALTH_COLORS[Math.round(hp * (HP_BAR_HEALTH_COLORS.length - 1))];
		ctx.strokeStyle = HP_BAR_BG_COLOR;
		for (let s = 0; s < hpSegments; s++) {
			const x = HP_BAR_X + HP_BAR_SEGMENT_WIDTH * s;
			ctx.beginPath();
			ctx.moveTo(x + HP_BAR_SKEW, HP_BAR_Y);
			ctx.lineTo(x + HP_BAR_SEGMENT_WIDTH + HP_BAR_SKEW, HP_BAR_Y);
			ctx.lineTo(x + HP_BAR_SEGMENT_WIDTH, HP_BAR_Y + HP_BAR_HEIGHT);
			ctx.lineTo(x, HP_BAR_Y + HP_BAR_HEIGHT);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		ctx.strokeStyle = HP_BAR_BORDER_COLOR;
		TopBar.setHpPath(ctx);
		ctx.stroke();
	}

	private static setHpPath(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.moveTo(HP_BAR_X + HP_BAR_SKEW, HP_BAR_Y);
		ctx.lineTo(HP_BAR_X + HP_BAR_WIDTH + HP_BAR_SKEW, HP_BAR_Y);
		ctx.lineTo(HP_BAR_X + HP_BAR_WIDTH, HP_BAR_Y + HP_BAR_HEIGHT);
		ctx.lineTo(HP_BAR_X, HP_BAR_Y + HP_BAR_HEIGHT);
		ctx.closePath();
	}
}