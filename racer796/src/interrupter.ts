import {Interruptable} from "game/interruptable";
import {FRAME_TIME} from "game/config";

export class Interrupter {
	private started = false;
	private timerId = 0;
	private list: Set<Interruptable> = new Set<Interruptable>();

	start(): void {
		this.stop();
		this.started = true;
		this.timerId = window.setTimeout(this.interrupt, FRAME_TIME);
	}

	stop(): void {
		window.clearTimeout(this.timerId);
		this.started = false;
	}

	addItem(item: Interruptable): void {
		this.list.add(item);
	}

	removeItem(item: Interruptable): void {
		this.list.delete(item);
	}

	private interrupt = (): void => {
		window.clearTimeout(this.timerId);

		this.list.forEach(item => item.interrupt());

		if (this.started) {
			this.timerId = window.setTimeout(this.interrupt, FRAME_TIME);
		}
	};
}