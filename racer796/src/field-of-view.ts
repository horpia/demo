import {FAR_RECT_SCALE, NEAR_RECT_SCALE, NEAR_RECT_SHIFT_LIMITS, SCREEN_HEIGHT, SCREEN_WIDTH} from "game/config";
import {EventsDispatcher} from "game/events-dispatcher";

export type Rect = {
	left: number,
	right: number,
	top: number,
	bottom: number,
	width: number,
	height: number
};

export class FieldOfView {
	private readonly centerX: number;
	private readonly centerY: number;
	private readonly farRect: number[];
	private readonly nearRect: number[];
	private shiftX = 0;
	private shiftY = 0;
	private farShiftX = 0;
	private farShiftY = 0;
	readonly events = new EventsDispatcher();

	constructor() {
		this.centerX = SCREEN_WIDTH >> 1;
		this.centerY = SCREEN_HEIGHT >> 1;
		const farHalfWidth = (SCREEN_WIDTH * FAR_RECT_SCALE) >> 1;
		const farHalfHeight = (SCREEN_HEIGHT * FAR_RECT_SCALE) >> 1;
		this.farRect = [
			this.centerX - farHalfWidth,
			this.centerY - farHalfHeight,
			this.centerX + farHalfWidth,
			this.centerY + farHalfHeight,
		];

		const nearHalfWidth = (SCREEN_WIDTH * NEAR_RECT_SCALE) >> 1;
		const nearHalfHeight = (SCREEN_HEIGHT * NEAR_RECT_SCALE) >> 1;
		this.nearRect = [
			this.centerX - nearHalfWidth,
			this.centerY - nearHalfHeight,
			this.centerX + nearHalfWidth,
			this.centerY + nearHalfHeight,
		];
	}

	reset(): void {
		this.shiftX = 0;
		this.shiftY = 0;
		this.farShiftX = 0;
		this.farShiftY = 0;
	}

	moveNearRect(deltaX: number = 0, deltaY: number = 0): void {
		this.shiftX = Math.min(
			NEAR_RECT_SHIFT_LIMITS.right,
			Math.max(NEAR_RECT_SHIFT_LIMITS.left, this.shiftX + deltaX)
		);

		this.shiftY = Math.min(
			NEAR_RECT_SHIFT_LIMITS.bottom,
			Math.max(NEAR_RECT_SHIFT_LIMITS.top, this.shiftY + deltaY)
		);
		this.events.trigger('change');
	}

	moveFarRect(deltaX: number = 0, deltaY: number = 0): void {
		this.farShiftX += deltaX;
		this.farShiftY += deltaY;
		this.events.trigger('change');
	}

	getFarRect(): Rect {
		const rectArr = this.farRect;
		return {
			left: rectArr[0] + this.farShiftX,
			top: rectArr[1] + this.farShiftY,
			right: rectArr[2] + this.farShiftX,
			bottom: rectArr[3] + this.farShiftY,
			width: rectArr[2] - rectArr[0],
			height: rectArr[3] - rectArr[1],
		};
	}

	getNearRect(): Rect {
		const rectArr = this.nearRect;
		return {
			left: rectArr[0] + this.shiftX,
			top: rectArr[1] + this.shiftY,
			right: rectArr[2] + this.shiftX,
			bottom: rectArr[3] + this.shiftY,
			width: rectArr[2] - rectArr[0],
			height: rectArr[3] - rectArr[1],
		};
	}
}