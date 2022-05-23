export interface KeyboardHandler {
	handle(pressedKeys: Set<string>): void;
}