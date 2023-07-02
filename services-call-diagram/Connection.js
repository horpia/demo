
export class Connection {
	/**
	 * @type {Service}
	 */
	#service1;

	/**
	 * @type {Service}
	 */
	#service2;

	/**
	 * @type {Service}
	 */
	#destinationService;

	/**
	 * @type {boolean}
	 */
	#highlighted = false;

	constructor(service1, service2, destinationService = null) {
		this.#service1 = service1;
		this.#service2 = service2;
		this.#destinationService = destinationService || service2;

		this.#service1.attachFromConnection(this);
		this.#service2.attachToConnection(this);
	}

	get from() {
		return this.#service1;
	}

	get to() {
		return this.#service2;
	}

	get destination() {
		return this.#destinationService;
	}

	setHighlight(flag) {
		this.#highlighted = flag;
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		const c1 = this.#service1.getConnectionFromPoint(this);
		const c2 = this.#service2.getConnectionToPoint(this);
		const center = c1.x + (c2.x - c1.x) / 2;

		ctx.strokeStyle = this.#highlighted ? '#F00' : '#888';
		ctx.lineWidth = this.#highlighted ? 2 : 1;
		ctx.beginPath();
		ctx.moveTo(c1.x, c1.y);
		ctx.bezierCurveTo(center, c1.y, center, c2.y, c2.x, c2.y);
		ctx.stroke();
	}
}