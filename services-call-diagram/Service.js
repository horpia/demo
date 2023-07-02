
export class Service {
	static HEIGHT_IF_TITLE = 30;

	x = 0;
	y = 0;
	width = 100;
	#height = 0;
	#title = '';
	#titleIndent;
	#highlighted = false;
	#highlightedConnection = null;
	#counter = 0;

	/**
	 * @type {Connection[]}
	 */
	#connectionsFrom = [];
	/**
	 * @type {Connection[]}
	 */
	#connectionsTo = [];

	constructor(title = '') {
		this.#title = title;
		this.#height = title !== '' ? Service.HEIGHT_IF_TITLE : 0;
		this.width = title.length < 10 ? 100 : 200;
	}

	get title() {
		return this.#title;
	}

	resetCounter() {
		this.#counter = 0;
	}

	increaseCounter() {
		this.#counter++;
	}

	isEndPoint() {
		return this.#connectionsFrom.length === 0;
	}

	setHighlight(flag, connection = null) {
		this.#highlighted = flag;
		this.#highlightedConnection = connection;
	}

	/**
	 * @param {Connection} connection
	 */
	attachFromConnection(connection) {
		this.#connectionsFrom.push(connection);
		this.#calcHeight();
	}

	/**
	 * @param {Connection} connection
	 */
	attachToConnection(connection) {
		this.#connectionsTo.push(connection);
		this.#calcHeight();
	}

	/**
	 * @return {{x: number, width: number, y: number, height: number}}
	 */
	getRect() {
		return {x: this.x, y: this.y, width: this.width, height: this.#height};
	}

	getFromConnectionsCount() {
		return this.#connectionsFrom.length;
	}

	/**
	 * @return {Connection|null}
	 */
	getLastFromConnection() {
		return this.#connectionsFrom[this.#connectionsFrom.length - 1] || null;
	}

	/**
	 * @param {Connection} connection
	 * @return {{x: number, y: number}}
	 */
	getConnectionFromPoint(connection) {
		const conPos = Math.max(0, this.#connectionsFrom.indexOf(connection));
		const conSize = this.#height / this.#connectionsFrom.length;
		return {
			x: this.x + this.width,
			y: this.y + Math.round(conPos * conSize + conSize / 2),
		};
	}

	/**
	 * @param {Service} service
	 * @return {Connection|null}
	 */
	getConnectionToService(service) {
		for (const con of this.#connectionsFrom) {
			if (con.destination === service) {
				return con;
			}
		}

		return null;
	}

	/**
	 * @param {Connection} fromConnection
	 * @return {Connection}
	 */
	getSameOutputConnection(fromConnection) {
		return this.#connectionsFrom[this.#connectionsTo.indexOf(fromConnection)];
	}

	/**
	 * @param {Connection} connection
	 * @return {{x: number, y: number}}
	 */
	getConnectionToPoint(connection) {
		const conPos = Math.max(0, this.#connectionsTo.indexOf(connection));
		const conSize = this.#height / this.#connectionsTo.length;
		return {
			x: this.x,
			y: this.y + Math.round(conPos * conSize + conSize / 2),
		};
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		if (this.#title === '' && this.#connectionsFrom.length === this.#connectionsTo.length) {
			const step = this.#height / this.#connectionsTo.length;
			for (let i = 0; i < this.#connectionsTo.length; i++) {
				let y = this.y + Math.round(step * i + step / 2);
				ctx.strokeStyle = this.#connectionsTo[i] === this.#highlightedConnection ? '#F00' : '#888';
				ctx.lineWidth = this.#connectionsTo[i] === this.#highlightedConnection ? 2 : 1;
				ctx.beginPath();
				ctx.moveTo(this.x, y);
				ctx.lineTo(this.x + this.width, y);
				ctx.stroke();
			}
			return;
		}

		ctx.strokeStyle = this.#highlighted ? '#F00' : '#888';
		ctx.lineWidth = this.#highlighted ? 2 : 1;
		ctx.beginPath();
		ctx.rect(this.x - 0.5, this.y - 0.5, this.width, this.#height);
		ctx.stroke();

		if (this.#titleIndent === undefined) {
			this.#calcTitleIndent(ctx);
		}

		ctx.fillStyle = this.#highlighted ? '#F00' : '#000';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.#title, this.x + this.#titleIndent, this.y + this.#height / 2);

		if (this.#counter > 0) {
			ctx.fillStyle = '#F00';
			ctx.textBaseline = 'middle';
			ctx.fillText(`${this.#counter}`, this.x + 5, this.y + this.#height / 2);
		}
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	#calcTitleIndent(ctx) {
		const titleWidth = ctx.measureText(this.#title).width;
		this.#titleIndent = Math.round(this.width / 2 - titleWidth / 2);
	}

	#calcHeight() {
		this.#height = Math.max(
			this.#title !== '' ? Service.HEIGHT_IF_TITLE : 0,
			Math.max(this.#connectionsFrom.length, this.#connectionsTo.length) * 6
		);
	}
}
