import {Interruptable} from "game/interruptable";
import {KeyboardHandler} from "game/keyboard-controllers/keyboard-handler";

export class KeyboardController implements Interruptable {
	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
	 * @private
	 */
	private pressedKeys: Set<string> = new Set<string>();
	private handlers: Set<KeyboardHandler> = new Set<KeyboardHandler>();

	clearPressedKeys(): void {
		this.pressedKeys.clear();
	}

	addHandler(handler: KeyboardHandler): void {
		this.handlers.add(handler);
	}

	removeHandler(handler: KeyboardHandler): void {
		this.handlers.delete(handler);
	}

	interrupt(): void {
		this.handlers.forEach(handler => handler.handle(this.pressedKeys));
	}

	attach(): void {
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
		document.addEventListener('custom-keydown', this.handleKeyDown);
		document.addEventListener('custom-keyup', this.handleKeyUp);
	}

	detach(): void {
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('keyup', this.handleKeyUp);
		document.removeEventListener('custom-keydown', this.handleKeyDown);
		document.removeEventListener('custom-keyup', this.handleKeyUp);
	}

	private handleKeyUp = (e: KeyboardEvent | CustomEvent): void => {
		if (e instanceof KeyboardEvent) {
			this.pressedKeys.delete(e.code);
		} else if (e instanceof CustomEvent) {
			this.pressedKeys.delete(e.detail);
		}
	}

	private handleKeyDown = (e: KeyboardEvent | CustomEvent): void => {
		if (e instanceof KeyboardEvent) {
			this.pressedKeys.add(e.code);
		} else if (e instanceof CustomEvent) {
			this.pressedKeys.add(e.detail);
		}
	}
}