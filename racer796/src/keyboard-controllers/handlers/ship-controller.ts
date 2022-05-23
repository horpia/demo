import {KeyboardHandler} from "game/keyboard-controllers/keyboard-handler";
import {Ship} from "game/items/ship";

export class ShipController implements KeyboardHandler {
	constructor(private readonly ship: Ship) {

	}

	handle(pressedKeys: Set<string>): void {
		let dx = 0;
		let dy = 0;

		if (pressedKeys.has('ArrowLeft')) {
			dx = 1;
		} else if (pressedKeys.has('ArrowRight')) {
			dx = -1;
		}

		if (pressedKeys.has('ArrowUp')) {
			dy = 1;
		} else if (pressedKeys.has('ArrowDown')) {
			dy = -1;
		}

		if (dx !== 0 || dy !== 0) {
			this.ship.move(dx, dy);
		}

		if (pressedKeys.has('Space')) {
			this.ship.rotate();
		}
	}
}