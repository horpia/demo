export class Group {
	static PADDING = 12;
	static TEXT_HEIGHT = 20;
	/**
	 * @type {Service[]}
	 */
	#services;
	#x;
	#y;
	#width;
	#height;
	#title = 'unknown';

	/**
	 * @param {Service[]} services
	 * @param {string} title
	 */
	constructor(services, title) {
		this.#services = services;
		this.#title = title;
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		if (this.#x === undefined) {
			this.#calcSize();
		}

		ctx.strokeStyle = '#888';
		ctx.setLineDash([5, 3]);
		ctx.beginPath();
		ctx.rect(this.#x - 0.5, this.#y - 0.5, this.#width, this.#height);
		ctx.stroke();

		ctx.fillStyle = '#888';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.#title, this.#x + Group.PADDING, this.#y + Group.PADDING / 2 + Group.TEXT_HEIGHT / 2);
	}

	#calcSize() {
		let x0 = Number.MAX_VALUE;
		let y0 = Number.MAX_VALUE;
		let x1 = -Number.MAX_VALUE;
		let y1 = -Number.MAX_VALUE;
		for (const service of this.#services) {
			const {x, y, width, height} = service.getRect();
			x0 = Math.min(x0, x);
			y0 = Math.min(y0, y);

			x1 = Math.max(x1, x + width);
			y1 = Math.max(y1, y + height);
		}

		this.#x = x0 - Group.PADDING;
		this.#y = y0 - Group.PADDING - Group.TEXT_HEIGHT;
		this.#width = x1 - x0 + (Group.PADDING * 2);
		this.#height = y1 - y0 + (Group.PADDING * 2) + Group.TEXT_HEIGHT;
	}
}
