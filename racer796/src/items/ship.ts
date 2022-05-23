import {Renderable} from "game/renderable";
import {Interruptable} from "game/interruptable";
import {loadImage} from "game/helpers/images";
import {
	ASSETS_URN,
	SCREEN_HEIGHT,
	SCREEN_WIDTH,
	SHIP_ANGLE_SPRITES,
	SHIP_ANGLE_STEP,
	SHIP_BLINK_DURATION,
	SHIP_FLIP_MAX_ANGLE, SHIP_MAX_HP,
	SHIP_MOVE_STEP,
	SHIP_MOVE_TO_FOV_COEFFICIENT,
	SHIP_SHIFT_Y,
	SHIP_SPRITE_SIZE,
	SHIP_TURN_MAX_ANGLE,
	SHIP_WAVE_ANGLE_STEP,
	SHIP_WAVE_SHIFT_LENGTH
} from "game/config";
import {FieldOfView} from "game/field-of-view";
import {Position} from "game/position";
import {AssetsItem} from "game/assets-item";

export class Ship implements Renderable, AssetsItem, Interruptable {
	private img: HTMLImageElement;
	private angle = 0;
	private scale = 0.5;
	private moveByX = 0;
	private lastMoveByX = 0;
	private moveByY = 0;
	private rotateMode = false;
	private offsetYAngle = 0;
	private offsetY = 0;
	private hp = SHIP_MAX_HP;

	constructor(
		private readonly fov: FieldOfView
	) {
	}

	reset(): void {
		this.hp = SHIP_MAX_HP;
		this.angle = 0;
		this.scale = 0.5;
		this.moveByX = 0;
		this.lastMoveByX = 0;
		this.moveByY = 0;
		this.offsetYAngle = 0;
		this.offsetY = 0;
		this.rotateMode = false;
	}

	damage(hp: number): void {
		this.hp = Math.max(0, this.hp - hp);
	}

	getHP(): number {
		return this.hp;
	}

	rotate(): void {
		this.rotateMode = true;
	}

	move(dx: number, dy: number): void {
		this.moveByX = Math.sign(dx);
		this.moveByY = Math.sign(dy);
	}

	interrupt(): void {
		if (this.moveByX !== 0 || this.moveByY !== 0) {
			this.fov.moveNearRect(
				SHIP_MOVE_STEP * this.moveByX,
				SHIP_MOVE_STEP * this.moveByY
			);
		}

		if (this.rotateMode) {
			this.angle = Math.max(
				-SHIP_FLIP_MAX_ANGLE,
				Math.min(
					SHIP_FLIP_MAX_ANGLE,
					this.angle + SHIP_ANGLE_STEP * -(this.lastMoveByX || this.moveByX || 1)
				)
			);
		} else if (this.moveByX !== 0 && Math.abs(this.angle) <= SHIP_TURN_MAX_ANGLE) {
			this.angle = Math.max(
				-SHIP_TURN_MAX_ANGLE,
				Math.min(
					SHIP_TURN_MAX_ANGLE,
					this.angle + SHIP_ANGLE_STEP * -this.moveByX
				)
			);
			this.lastMoveByX = this.moveByX;
		} else if (this.angle !== 0) {
			// correct angle back to 0 deg
			this.angle -= SHIP_ANGLE_STEP * Math.sign(this.angle);
		}

		this.moveByX = 0;
		this.moveByY = 0;
		this.rotateMode = false;

		this.offsetYAngle = (this.offsetYAngle + SHIP_WAVE_ANGLE_STEP) % 360;
		this.offsetY = Math.round(Math.sin(this.offsetYAngle * Math.PI / 180) * SHIP_WAVE_SHIFT_LENGTH);
	}

	async loadAssets(): Promise<void> {
		this.img = await loadImage(`${ASSETS_URN}/ship.gif`);
	}

	render(ctx: CanvasRenderingContext2D): void {
		const spritePos = this.getSpriteXY();
		const nearRect = this.fov.getNearRect();
		const sizeScaled = Math.floor(SHIP_SPRITE_SIZE * this.scale);
		const centerX = SCREEN_WIDTH >> 1;
		const centerY = SCREEN_HEIGHT >> 1;
		const centerViewX = nearRect.left + (nearRect.width >> 1);
		const centerViewY = nearRect.top + (nearRect.height >> 1);
		const shipShiftX = Math.round((centerX - centerViewX) * SHIP_MOVE_TO_FOV_COEFFICIENT);
		const shipShiftY = Math.round((centerY - centerViewY) * SHIP_MOVE_TO_FOV_COEFFICIENT);
		let x = centerX + shipShiftX - (sizeScaled >> 1);
		let y = centerY + shipShiftY + SHIP_SHIFT_Y - (sizeScaled >> 1) + this.offsetY;

		ctx.drawImage(
			this.img,
			spritePos.x, spritePos.y, SHIP_SPRITE_SIZE, SHIP_SPRITE_SIZE,
			x, y, sizeScaled, sizeScaled
		);
	}

	private getSpriteXY(): {x: number, y: number} {
		let minDelta = Number.MAX_VALUE;
		let bestSprite = 0;

		for (const [angle, sprite] of Array.from(SHIP_ANGLE_SPRITES.entries())) {
			const delta = Math.abs(this.angle - angle);
			if (delta < minDelta) {
				minDelta = delta;
				bestSprite = sprite;
			}
		}

		return {
			x: bestSprite * SHIP_SPRITE_SIZE,
			y: (Math.floor(Date.now() / SHIP_BLINK_DURATION) % 2) * SHIP_SPRITE_SIZE
		};
	}
}