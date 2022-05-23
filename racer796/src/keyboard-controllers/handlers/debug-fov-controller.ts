import {KeyboardHandler} from "game/keyboard-controllers/keyboard-handler";
import {FieldOfView} from "game/field-of-view";

export class DebugFovController implements KeyboardHandler {
	constructor(private readonly fov: FieldOfView) {

	}


	handle(pressedKeys: Set<string>): void {
		if (!pressedKeys.has('Shift')) {
			return;
		}

		if (pressedKeys.has('ArrowLeft')) {
			this.fov.moveNearRect(-10);
		} else if (pressedKeys.has('ArrowRight')) {
			this.fov.moveNearRect(10);
		}

		if (pressedKeys.has('ArrowUp')) {
			this.fov.moveNearRect(0, -10);
		} else if (pressedKeys.has('ArrowDown')) {
			this.fov.moveNearRect(0, 10);
		}
	}
}