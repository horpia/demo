type EventHandler = (params: any) => void;

export class EventsDispatcher {
	private handlers: Map<string, Set<EventHandler>> = new Map<string, Set<EventHandler>>();

	addListener(eventName: string, handler: EventHandler): void {
		if (!this.handlers.has(eventName)) {
			this.handlers.set(eventName, new Set());
		}

		this.handlers.get(eventName).add(handler);
	}

	removeListener(eventName: string, handler: EventHandler): void {
		if (!this.handlers.has(eventName)) {
			return;
		}

		this.handlers.get(eventName).delete(handler);
	}

	trigger(eventName: string, params: any = null): void {
		const handlers = this.handlers.get(eventName);
		if (!handlers) {
			return;
		}

		handlers.forEach(handler => handler(params));
	}
}