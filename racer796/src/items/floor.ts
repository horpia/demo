import {Renderable} from "game/renderable";
import {Interruptable} from "game/interruptable";
import {FieldOfView} from "game/field-of-view";
import {Position} from "game/position";
import {
	FLOOR_HORIZON_HEIGHT,
	FLOOR_LIGHT_COLORS,
	FLOOR_LIGHT_SIZE,
	FLOOR_LINE_COLORS,
	FLOOR_LINE_LENGTH,
	FLOOR_SHADOW_COLOR,
	FOV_LENGTH,
	SCREEN_WIDTH
} from "game/config";
import {easeInExpo} from "game/helpers/easing";

type LineProps = {
	index: number,
	y: number,
	height: number,
	color: string,
	scale: number,
	fovScale: number,
};

export class Floor implements Renderable, Interruptable {
	private lastPosition = 0;
	private lines: LineProps[] = [];

	constructor(
		private readonly fov: FieldOfView,
		private readonly position: Position
	) {
		this.calcLines();
	}

	render(ctx: CanvasRenderingContext2D): void {
		this.drawHorizon(ctx);

		this.drawLines(ctx);

		this.drawShadow(ctx, true);
		this.drawShadow(ctx, false);

		this.drawRay(ctx, 0);
		this.drawRay(ctx, 0.25);
		this.drawRay(ctx, 0.5);
		this.drawRay(ctx, 0.75);
		this.drawRay(ctx, 1);
	}

	interrupt(): void {
		this.calcLines();
	}

	private drawLines(ctx: CanvasRenderingContext2D): void {
		for (const line of this.lines) {
			ctx.fillStyle = line.color;
			ctx.fillRect(0, line.y, SCREEN_WIDTH, line.height);
		}
		this.lastPosition = this.position.value;
	}

	private drawHorizon(ctx: CanvasRenderingContext2D): void {
		const farRect = this.fov.getFarRect()
		ctx.fillStyle = '#000';
		ctx.fillRect(0, farRect.bottom - FLOOR_HORIZON_HEIGHT, SCREEN_WIDTH, FLOOR_HORIZON_HEIGHT);
	}

	private drawShadow(ctx: CanvasRenderingContext2D, isLeft: boolean): void {
		const farRect = this.fov.getFarRect()
		const nearRect = this.fov.getNearRect();
		const farX = isLeft ? farRect.left : farRect.right;
		const nearX = isLeft ? nearRect.left : nearRect.right;
		const dx = (farX - nearX) * 2;
		const dy = (farRect.bottom - nearRect.bottom) * 2;

		ctx.fillStyle = FLOOR_SHADOW_COLOR;
		ctx.beginPath();
		ctx.moveTo(farX, farRect.bottom);
		ctx.lineTo(farX - dx, farRect.bottom - dy);
		ctx.lineTo(farX - dx, farRect.bottom);
		ctx.fill();
	}

	private drawRay(ctx: CanvasRenderingContext2D, pos: number): void {
		const farRect = this.fov.getFarRect()
		const nearRect = this.fov.getNearRect();

		const x1 = farRect.left + farRect.width * pos;
		const x2 = nearRect.left + nearRect.width * pos;
		const dx = x2 - x1;

		for (const line of this.lines) {
			let width = FLOOR_LIGHT_SIZE * line.scale;
			ctx.globalAlpha = Math.min(1, width);
			width = Math.min(FLOOR_LIGHT_SIZE, Math.max(1, Math.round(width)));
			const halfWidth = width >> 1;
			ctx.fillStyle = FLOOR_LIGHT_COLORS[line.index % FLOOR_LIGHT_COLORS.length];
			ctx.fillRect(x1 + (dx * line.scale) - halfWidth, line.y - halfWidth, width, width);
		}
	}

	private calcLines(): void {
		const farRect = this.fov.getFarRect();
		const nearRect = this.fov.getNearRect();
		const startY = Math.ceil(farRect.bottom);
		const fovHeight = Math.ceil(nearRect.bottom - startY);
		this.lines = [];

		const offset = this.position.value % (FLOOR_LINE_LENGTH << 1);
		const calcLine = (lineNo: number): LineProps => {
			let fovY = FLOOR_LINE_LENGTH * lineNo + offset;
			let scale = fovY / FOV_LENGTH;
			let fovScale = easeInExpo(scale);
			let y = Math.floor(startY + fovScale * fovHeight);
			return {
				index: lineNo,
				y,
				height: 0,
				scale: fovScale,
				fovScale: scale,
				color: FLOOR_LINE_COLORS[lineNo % FLOOR_LINE_COLORS.length]
			}
		};

		for (let lineNo = 0; lineNo <= 26; lineNo++) {
			const line = calcLine(lineNo);
			this.lines.push({
				...line,
				height: calcLine(lineNo + 1).y - line.y
			});
		}
	}
}