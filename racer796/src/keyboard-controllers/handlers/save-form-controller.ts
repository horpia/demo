import {KeyboardHandler} from "game/keyboard-controllers/keyboard-handler";
import {SaveForm} from "game/items/save-form";

export class SaveFormController implements KeyboardHandler {
	constructor(private readonly form: SaveForm) {

	}

	handle(pressedKeys: Set<string>): void {
		if (pressedKeys.has('ArrowLeft')) {
			this.form.moveFocus(-1, 0);
		} else if (pressedKeys.has('ArrowRight')) {
			this.form.moveFocus(1, 0);
		}

		if (pressedKeys.has('ArrowUp')) {
			this.form.moveFocus(0, -1);
		} else if (pressedKeys.has('ArrowDown')) {
			this.form.moveFocus(0, 1);
		}

		if (pressedKeys.has('Space') || pressedKeys.has('Enter')) {
			this.form.applyKey();
		}
	}
}