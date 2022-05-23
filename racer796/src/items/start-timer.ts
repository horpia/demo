import {Renderable} from "game/renderable";
import {Interruptable} from "game/interruptable";
import {
	FONT_NAME_16,
	GAME_OVER_COLOR_DURATION,
	GAME_OVER_SHADOW_COLORS,
	GAME_OVER_TEXT_COLORS,
	SCREEN_HEIGHT,
	SCREEN_WIDTH, START_TIMER_COLOR, START_TIMER_DURATION, START_TIMER_SHADOW
} from "game/config";

export class StartTimer implements Renderable, Interruptable {
	private size = 0;
	private value: string;
	private startTime: number;

	constructor() {
		this.reset();
	}

	reset(): void {
		this.value = 'READY!';
		this.size = 0;
		this.startTime = Date.now();
	}

	interrupt(): void {
		if (this.value === 'READY!' && Date.now() - this.startTime > START_TIMER_DURATION) {
			this.value = 'GO!';
			this.size = 0;
		}

		if (this.size < 4) {
			this.size++;
		}
	}

	render(ctx: CanvasRenderingContext2D): void {
		const fontSize = this.size * 8;
		const text = this.value;

		ctx.font = `${fontSize}px "${FONT_NAME_16}"`;
		ctx.textBaseline = 'top';
		const halfWidth = ctx.measureText(text).width >> 1;

		const x = (SCREEN_WIDTH >> 1) - halfWidth;
		const y = (SCREEN_HEIGHT >> 1) - fontSize;

		ctx.fillStyle = START_TIMER_SHADOW;
		ctx.fillText(text, x + 2, y + 2);

		ctx.fillStyle = START_TIMER_COLOR;
		ctx.fillText(text, x, y);
	}
}