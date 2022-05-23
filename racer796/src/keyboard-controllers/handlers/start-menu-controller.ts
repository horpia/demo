import {KeyboardHandler} from "game/keyboard-controllers/keyboard-handler";
import {StartMenu} from "game/items/start-menu";

export class StartMenuController implements KeyboardHandler {
	constructor(private readonly menu: StartMenu) {

	}

	handle(pressedKeys: Set<string>): void {
		if (pressedKeys.has('ArrowUp')) {
			this.menu.moveSelection(-1);
		} else if (pressedKeys.has('ArrowDown')) {
			this.menu.moveSelection(1);
		}
		if (pressedKeys.has('Enter') || pressedKeys.has('Space')) {
			this.menu.applyMenu();
		}
	}
}