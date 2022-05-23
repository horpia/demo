import {Renderable} from "game/renderable";
import {Interruptable} from "game/interruptable";
import {
	FONT_NAME_16,
	GAME_OVER_COLOR_DURATION,
	GAME_OVER_SHADOW_COLORS,
	GAME_OVER_TEXT_COLORS,
	SCREEN_HEIGHT,
	SCREEN_WIDTH
} from "game/config";

export class GameOverText implements Renderable, Interruptable {
	private size = 0;

	interrupt(): void {
		if (this.size < 4) {
			this.size++;
		}
	}

	render(ctx: CanvasRenderingContext2D): void {
		const fontSize = this.size * 8;
		const text = 'GAME OVER';
		const colorIndex = Math.floor(Date.now() / GAME_OVER_COLOR_DURATION) % GAME_OVER_SHADOW_COLORS.length;

		ctx.font = `${fontSize}px "${FONT_NAME_16}"`;
		ctx.textBaseline = 'top';
		const halfWidth = ctx.measureText(text).width >> 1;

		const x = (SCREEN_WIDTH >> 1) - halfWidth;
		const y = (SCREEN_HEIGHT >> 1) - fontSize;

		ctx.fillStyle = GAME_OVER_SHADOW_COLORS[colorIndex];
		ctx.fillText(text, x + 2, y + 2);

		ctx.fillStyle = GAME_OVER_TEXT_COLORS[colorIndex];
		ctx.fillText(text, x, y);
	}
}