import {KeyboardHandler} from "game/keyboard-controllers/keyboard-handler";
import {SaveForm} from "game/items/save-form";
import {TopResults} from "game/items/top-results";

export class TopResultsController implements KeyboardHandler {
	constructor(private readonly table: TopResults) {

	}

	handle(pressedKeys: Set<string>): void {
		if (pressedKeys.has('ArrowUp')) {
			this.table.scroll(-1);
		} else if (pressedKeys.has('ArrowDown')) {
			this.table.scroll(1);
		}

		if (pressedKeys.has('Space') || pressedKeys.has('Enter') || pressedKeys.has('Escape')) {
			this.table.close();
		}
	}
}