import {Service} from "./Service.js";
import {Group} from "./Group.js";
import {Connection} from "./Connection.js";

export class ServicesDiagram {
	static INDENT = 20;
	static CONNECTIONS_WIDTH = 50;

	/**
	 * @type {CanvasRenderingContext2D}
	 */
	#ctx = this.#createCanvas();

	/**
	 * @type {Service[][]}
	 */
	#services = [];

	/**
	 * @type {Connection[]}
	 */
	#connections = [];

	/**
	 * @type {Group[]}
	 */
	#groups = [];

	/**
	 * @type {Map<string,Service>}
	 */
	#servicesByName = new Map();

	/**
	 * @type {Map<string,number>}
	 */
	#servicesColumn = new Map();

	#totalRequests = 0;
	#currentTime = 0;
	#startTime = 0;
	#logToPlay = [];
	#playerTimer = 0;

	constructor() {
		this.#addService(0, 'client');
		this.#addService(1, 'nginx');
		this.#addService(2, 'php', 'php-fpm');
		this.#addService(3, 'MySQLMaster', 'MySQL Master');
		this.#addService(3, 'MySQLSlave1', 'MySQL Slave');

		this.#addService(4, 'MySQLSecondaryMaster', 'MySQL Master');
		this.#addService(4, 'MySQLSecondarySlave1', 'MySQL Slave');

		this.#addService(3, 'RedisClusterHot', 'Primary Redis Cluster');
		this.#addService(3, 'RedisSingleMain', 'Redis Single');
		this.#addService(3, 'RedisSingleStories', 'Redis for Stories');

		this.#addService(4, 'session', 'Redis for Sessions');
		this.#addService(4, 'RedisSingleAnalytics', 'Redis for Analytics');
		this.#addService(4, 'RedisClusterVisited', 'Redis for Visited Stories');
		this.#addService(4, 'RedisForErrors', 'Redis for Errors');

		this.#addService(3, 'AerospikeFeeds', 'Aerospike for Feeds');
		this.#addService(3, 'AerospikeNoTtlSsd', 'Aerospike Hot Storage');
		this.#addService(4, 'AerospikeNoTtlHdd', 'Aerospike Cold Storage');
		this.#addService(4, 'disk', 'File System');

		this.#addConnection('client', 'nginx');
		this.#addConnection('nginx', 'php');
		this.#addConnection('php', 'MySQLMaster');
		this.#addConnection('php', 'MySQLSlave1');

		this.#addConnection('php', 'MySQLSecondaryMaster');
		this.#addConnection('php', 'MySQLSecondarySlave1');

		this.#addConnection('php', 'RedisClusterHot');
		this.#addConnection('php', 'RedisSingleMain');
		this.#addConnection('php', 'RedisSingleStories');

		this.#addConnection('php', 'session');
		this.#addConnection('php', 'RedisSingleAnalytics');
		this.#addConnection('php', 'RedisClusterVisited');
		this.#addConnection('php', 'RedisForErrors');
		this.#addConnection('php', 'AerospikeNoTtlHdd');
		this.#addConnection('php', 'disk');

		this.#addConnection('php', 'AerospikeFeeds');
		this.#addConnection('php', 'AerospikeNoTtlSsd');

		this.#addGroup('Primary MySQL Cluster', ['MySQLMaster', 'MySQLSlave1']);
		this.#addGroup('Secondary MySQL Cluster', ['MySQLSecondaryMaster', 'MySQLSecondarySlave1']);

		this.#calcPositions();

		this.#render();
	}

	get canvas() {
		return this.#ctx.canvas;
	}

	playTelemetry(log) {
		clearInterval(this.#playerTimer);
		this.#totalRequests = 0;
		this.#startTime = log[0][1];
		const endTime = log[log.length - 1][1];
		this.#currentTime = 0;
		this.#resetCounters();
		this.#logToPlay = [
			[1, this.#startTime, 'client', 'nginx'],
			[0, this.#startTime, 'nginx'],
			[1, this.#startTime, 'nginx', 'php'],
			...log,
			[1, endTime, 'nginx', 'php'],
			[0, endTime, 'nginx'],
			[1, endTime, 'client', 'nginx'],
		];

		this.#playerTimer = setInterval(() => {
			if (this.#logToPlay.length === 0) {
				this.#cancelHighlight();
				this.#render();
				clearInterval(this.#playerTimer);
				return;
			}
			this.#logToPlay.shift();
			this.#highlightItemLogEntry();
		}, 1000 / 24);

		this.#highlightItemLogEntry();
	}

	#highlightItemLogEntry() {
		this.#cancelHighlight();

		if (this.#logToPlay.length === 0) {
			this.#render();
			return;
		}

		const log = this.#logToPlay[0];
		this.#currentTime = log[1];
		if (log[0] === 0) {
			const srv = this.#servicesByName.get(log[2]);
			if (!srv) {
				console.error(`Unknown service "${log[2]}"`);
				return;
			}

			if (srv.isEndPoint()) {
				this.#totalRequests++;
				srv.increaseCounter();
			}

			srv.setHighlight(true);
		} else {
			this.#highlightConnection(log[2], log[3]);
		}

		this.#render();
	}

	#cancelHighlight() {
		for (const services of this.#services) {
			for (const service of services) {
				service.setHighlight(false);
			}
		}

		for (const con of this.#connections) {
			con.setHighlight(false);
		}
	}

	#resetCounters() {
		for (const services of this.#services) {
			for (const service of services) {
				service.resetCounter();
			}
		}
	}

	#highlightConnection(from, to) {
		const srvFrom = this.#servicesByName.get(from);
		if (!srvFrom) {
			console.error(`Unknown service "${from}"`);
			return;
		}

		const srvTo = this.#servicesByName.get(to);
		if (!srvFrom) {
			console.error(`Unknown service "${to}"`);
			return;
		}

		let con = srvFrom.getConnectionToService(srvTo);
		if (con === null) {
			return;
		}
		con.setHighlight(true);

		while (con.to !== con.destination) {
			con.to.setHighlight(true, con);
			con = con.to.getSameOutputConnection(con);
			con.setHighlight(true);
		}
	}

	/**
	 * @param {number} col
	 * @param {string} name
	 * @param {string} title
	 */
	#addService(col, name, title = '') {
		while (this.#services.length < col + 1) {
			this.#services.push([]);
		}

		const srv = new Service(title || name);
		this.#services[col].push(srv);
		this.#servicesByName.set(name, srv);
		this.#servicesColumn.set(name, col);
	}

	/**
	 * @param {string} from
	 * @param {string} to
	 */
	#addConnection(from, to) {
		const c1 = this.#servicesColumn.get(from);
		const c2 = this.#servicesColumn.get(to);
		if (c2 - c1 <= 0) {
			throw new Error('Invalid services connection order')
		}

		let srvFrom = this.#servicesByName.get(from);
		let srvTo = this.#servicesByName.get(to);

		for (let c = c1 + 1; c < c2; c++) {
			const lastCon = srvFrom.getLastFromConnection();
			if (!lastCon || lastCon.to.title !== '') {
				let srvNew = new Service();
				this.#services[c].splice(this.#services[c].indexOf(lastCon.to) + 1, 0, srvNew);
				this.#connections.push(new Connection(srvFrom, srvNew, srvTo));
				srvFrom = srvNew;
			} else {
				this.#connections.push(new Connection(srvFrom, lastCon.to, srvTo));
				srvFrom = lastCon.to;
			}
		}

		this.#connections.push(new Connection(srvFrom, srvTo));
	}

	/**
	 * @param {string} title
	 * @param services
	 */
	#addGroup(title, services) {
		this.#groups.push(new Group(services.map(name => this.#servicesByName.get(name)), title));
	}

	#calcPositions() {
		let x = ServicesDiagram.INDENT;
		for (let col = 0; col < this.#services.length; col++) {
			const services = this.#services[col];
			if (services.length === 0) {
				continue;
			}

			let totalHeight = -ServicesDiagram.INDENT;
			let colWidth = 0;
			let totalConnections = 0;
			for (const service of services) {
				const {height, width} = service.getRect();
				colWidth = Math.max(colWidth, width);
				totalHeight += height + ServicesDiagram.INDENT;
				totalConnections += service.getFromConnectionsCount();
			}

			if (col === 0) {
				x = -(colWidth + ServicesDiagram.CONNECTIONS_WIDTH) + ServicesDiagram.INDENT;
			}

			let y = (this.#ctx.canvas.height >> 1) - (totalHeight >> 1);

			for (const service of services) {
				service.x = x;
				service.y = y;
				service.width = colWidth;
				y += service.getRect().height + ServicesDiagram.INDENT;
			}

			x += colWidth + ServicesDiagram.CONNECTIONS_WIDTH * Math.min(3, Math.ceil(totalConnections / 4));
		}
	}

	#render() {
		this.#renderBackground();

		for (const group of this.#groups) {
			this.#ctx.save();
			group.render(this.#ctx);
			this.#ctx.restore();
		}

		for (const services of this.#services) {
			for (const service of services) {
				this.#ctx.save();
				service.render(this.#ctx);
				this.#ctx.restore();
			}
		}

		for (const connection of this.#connections) {
			this.#ctx.save();
			connection.render(this.#ctx);
			this.#ctx.restore();
		}

		this.#renderCounters();
	}

	#renderBackground() {
		this.#ctx.fillStyle = '#fff';
		this.#ctx.fillRect(0, 0, this.#ctx.canvas.width, this.#ctx.canvas.height);
	}

	#renderCounters() {
		this.#ctx.save();
		this.#ctx.fillStyle = '#888';
		this.#ctx.font = '24px Helvetica, Arial, sans-serif';
		this.#ctx.fillText(`Requests: ${this.#totalRequests}`, 20, 100);
		const time = Math.round(this.#currentTime - this.#startTime) / 100000;
		this.#ctx.fillText(`Time: ${time}s`, 20, 140);
		this.#ctx.restore();
	}

	#createCanvas() {
		const c = document.createElement('canvas');
		c.width = 1100;
		c.height = 600;
		const ctx = c.getContext('2d');
		ctx.font = '14px Helvetica, Arial, sans-serif';
		return ctx;
	}
}
