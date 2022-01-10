const POINT_RADIUS = 5;
const POINT_EPSILON = 0.01;
/**
 * Extra area for fading smoke cells
 */
const PADDING = 50;
/**
 * Additional value for width and height. Necessary for fading smoke cells when they are jump from start to end
 */
const ADDITIONAL_SIZE = 50;

/**
 * @typedef {Object} T_SmokeOptions
 * @property {number} [windAngle=0]
 * @property {number} [rotAngle=0]
 * @property {number} [speed=1]
 * @property {number} [thickness=100]
 * @property {number} [length=100]
 * @property {boolean} [debug=false]
 * @property {boolean} [clearBeforeRender=true]
 */

/**
 * @typedef {Object} T_SmokeCellsList
 * @property {number} rows
 * @property {number} cols
 * @property {number} cellSize
 * @property {Map<number,T_SmokeCell[]>} neighbours
 * @property {Map<number,T_SmokeCell[]>} outsideNeighbours
 * @property {T_SmokeCell[]} cells
 * @property {T_SmokeCell[][]} matrix
 */

/**
 * @typedef {Object} T_SmokeCell
 * @property {number} x
 * @property {number} y
 * @property {number} initX
 * @property {number} initY
 * @property {number} px
 * @property {number} py
 * @property {number} px1
 * @property {number} py1
 * @property {number} px2
 * @property {number} py2
 * @property {number} px3
 * @property {number} py3
 * @property {number} o Opacity
 * @property {number} ao Animated Opacity
 * @property {T_SmokeCell[]} n Neighbours
 */

export class Smoke {
	/**
	 * @param {T_SmokeOptions} props
	 */
	constructor(props) {
		/**
		 * @type {T_SmokeOptions}
		 * @private
		 */
		this._props = {
			debug: false,
			thickness: 100,
			length: 200,
			windAngle: 0,
			rotAngle: 45,
			speed: 3,
			clearBeforeRender: true,
			...props
		};

		/**
		 * @type {{padding: number, centerY: number, centerX: number, width: number, boundaryCircles: *[], height: number}}
		 * @private
		 */
		this._geom = {
			width: 0,
			height: 0,
			centerX: 0,
			centerY: 0,
			padding: PADDING,
			boundaryCircles: [],
		};

		/**
		 * @type {{x: number, y: number}}
		 * @private
		 */
		this._offset = {
			x: 0,
			y: 0,
		};

		/**
		 * @type {{duration: number, dx: number, dy: number, time: number}}
		 * @private
		 */
		this._animation = {
			time: 0,
			duration: 60,
			dx: 0,
			dy: 0,
		};

		this._calcGeom();

		/**
		 * @type {T_SmokeCellsList}
		 * @private
		 */
		this._cells = this._generateCells();

		this._calculateAnimation();

		this._update(true);
	}

	animate() {
		this._animation.time = (this._animation.time + 1) % this._animation.duration;

		if (this._animation.time === 0) {
			this._offset.x = 0;
			this._offset.y = 0;
		} else {
			this._offset.x += this._animation.dx;
			this._offset.y += this._animation.dy;
		}

		this._update(this._animation.time === 0);
	}

	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} [x=0]
	 * @param {number} [y=0]
	 */
	render(ctx, x = 0, y = 0) {
		if (this._props.clearBeforeRender) {
			ctx.clearRect(
				x - this._geom.centerX,
				y - this._geom.centerY,
				this._geom.width,
				this._geom.height
			);
		}

		ctx.save();

		this._drawSmoke(ctx, x, y);

		if (this._props.debug) {
			this._drawCells(ctx, x, y);
			this._drawBoundaryCircles(ctx, x, y);
		}

		ctx.restore();
	}

	/**
	 * @private
	 */
	_calcGeom() {
		const width = this._props.thickness + (PADDING << 1);
		const height = this._props.length + (PADDING << 1);
		const angle = this._props.rotAngle * Math.PI / 180;
		const sin = Math.abs(Math.sin(angle));
		this._geom.width = Math.floor(width + (height - width) * sin) + ADDITIONAL_SIZE;
		this._geom.height = Math.floor(height + (width - height) * sin) + ADDITIONAL_SIZE;
		this._geom.centerX = this._geom.width >> 1;
		this._geom.centerY = this._geom.height >> 1;

		// calculate boundary circles
		const radius = this._props.thickness >> 1;
		const lengthHalf = (this._props.length >> 1) - radius;
		const count = Math.ceil(this._props.length / radius) - 1;
		const step = (this._props.length - radius) / count;

		for (let i = 0; i < count; i++) {
			const dist = lengthHalf - step * i;
			this._geom.boundaryCircles.push({
				x: this._geom.centerX + Math.sin(angle) * dist,
				y: this._geom.centerY + Math.cos(angle) * dist,
				r: radius,
			});
		}
	}

	/**
	 * @param {boolean} [initState=false]
	 * @private
	 */
	_update(initState = false) {
		if (initState) {
			this._setInitialCellsPosition();
		} else {
			this._updateCellsPosition();
		}
		this._updatePointsPosition();
		this._updateNeighbours();
		this._updateNeighboursMatrix();
		this._updatePointsOpacity(initState);
	}

	/**
	 * @return {T_SmokeCellsList}
	 * @private
	 */
	_generateCells() {
		let w = Math.max(0, this._geom.width - (this._geom.padding << 1));
		let h = Math.max(0, this._geom.height - (this._geom.padding << 1));

		if (w === 0 || h === 0) {
			return {
				cols: 0,
				rows: 0,
				cellSize: 0,
				matrix: [],
				neighbours: new Map(),
				outsideNeighbours: new Map(),
				cells: []
			};
		}

		const cellSize = 1 << (POINT_RADIUS - 1);
		const cols = Math.ceil(w / cellSize);
		const rows = Math.ceil(h / cellSize);

		const cells = [];
		const matrix = [];
		let y = this._geom.padding;

		for (let r = 0; r < rows; r++) {
			let x = this._geom.padding;
			matrix[r] = [];

			for (let c = 0; c < cols; c++) {
				const cell = {
					x,
					y,
					initX: x,
					initY: y,
					px: 0,
					py: 0,
					px1: Math.random() * cellSize,
					py1: Math.random() * cellSize,
					px2: Math.random() * cellSize,
					py2: Math.random() * cellSize,
					px3: Math.random() * cellSize,
					py3: Math.random() * cellSize,
					o: 0,
					n: []
				};
				matrix[r][c] = cell;
				cells.push(cell);
				x += cellSize;
			}

			y += cellSize;
		}

		return {
			cols,
			rows,
			cellSize,
			matrix,
			neighbours: new Map(),
			outsideNeighbours: new Map(),
			cells
		};
	}

	/**
	 * @private
	 */
	_calculateAnimation() {
		const angleRad = this._props.windAngle * Math.PI / 180;
		let dx = Math.sin(angleRad) * this._props.speed;
		let dy = Math.cos(angleRad) * this._props.speed;
		let repeatCols = Math.round((dx * this._animation.duration) / this._cells.cellSize);
		let repeatRows = Math.round((dy * this._animation.duration) / this._cells.cellSize);
		this._animation.dx = (repeatCols * this._cells.cellSize) / this._animation.duration;
		this._animation.dy = (repeatRows * this._cells.cellSize) / this._animation.duration;

		while (repeatRows < 0) {
			repeatRows += this._cells.rows;
		}

		while (repeatCols < 0) {
			repeatCols += this._cells.cols;
		}

		for (let r = 0; r < this._cells.rows; r++) {
			for (let c = 0; c < this._cells.cols; c++) {
				const copy2Row = (r + repeatRows) % this._cells.rows;
				const copy2Col = (c + repeatCols) % this._cells.cols;

				const cell1 = this._cells.matrix[r][c];
				const cell2 = this._cells.matrix[copy2Row][copy2Col];
				cell2.px3 = cell1.px1;
				cell2.py3 = cell1.py1;
			}
		}
	}

	/**
	 * @private
	 */
	_setInitialCellsPosition() {
		for (const cell of this._cells.cells) {
			cell.x = cell.initX;
			cell.y = cell.initY;
		}
	}

	/**
	 * @private
	 */
	_updateCellsPosition() {
		const x1 = this._offset.x + this._geom.padding;
		const y1 = this._offset.y + this._geom.padding;
		const x2 = x1 + (this._geom.width - this._geom.padding * 2);
		const y2 = y1 + (this._geom.height - this._geom.padding * 2);
		const colsWidth = this._cells.cols * this._cells.cellSize;
		const rowsHeight = this._cells.rows * this._cells.cellSize;

		for (const cell of this._cells.cells) {
			if (cell.x + this._cells.cellSize <= x1) {
				cell.x += colsWidth;
				cell.o = 0;
			} else if (cell.x >= x2) {
				cell.x -= colsWidth;
				cell.o = 0;
			}

			if (cell.y + this._cells.cellSize <= y1) {
				cell.y += rowsHeight;
				cell.o = 0;
			} else if (cell.y >= y2) {
				cell.y -= rowsHeight;
				cell.o = 0;
			}
		}
	}

	/**
	 * @private
	 */
	_updatePointsPosition() {
		const halfDuration = this._animation.duration >> 1;
		let v = this._animation.time / halfDuration;

		if (v <= 1) {
			for (const cell of this._cells.cells) {
				cell.px = cell.x + cell.px1 + (cell.px2 - cell.px1) * v;
				cell.py = cell.y + cell.py1 + (cell.py2 - cell.py1) * v;
			}
		} else {
			v--;
			for (const cell of this._cells.cells) {
				cell.px = cell.x + cell.px2 + (cell.px3 - cell.px2) * v;
				cell.py = cell.y + cell.py2 + (cell.py3 - cell.py2) * v;
			}
		}
	}

	/**
	 * @private
	 */
	_updateNeighboursMatrix() {
		this._cells.neighbours.clear();
		this._cells.outsideNeighbours.clear();

		const radiusPow = POINT_RADIUS - 1;

		let maxCol = 0;
		let minCol = Number.MAX_VALUE;
		let maxRow = 0;
		let minRow = Number.MAX_VALUE;

		for (const cell of this._cells.cells) {
			const col = cell.x >> radiusPow;
			const row = cell.y >> radiusPow;
			const idx = (row << 16) + col;

			if (col > maxCol) {
				maxCol = col;
			}

			if (col < minCol) {
				minCol = col;
			}

			if (row > maxRow) {
				maxRow = row;
			}

			if (row < minRow) {
				minRow = row;
			}

			this._cells.neighbours.set(idx, [cell, ...cell.n]);
		}

		let cellSizeHalf = this._cells.cellSize >> 1;
		const maxDist = (1 << POINT_RADIUS) * 2;

		for (let r = minRow - 2; r <= maxRow + 2; r++) {
			for (let c = minCol - 2; c <= maxCol + 2; c++) {
				const idx = (r << 16) + c;
				if (this._cells.neighbours.has(idx)) {
					continue;
				}

				const py = r * this._cells.cellSize + cellSizeHalf;
				const px = c * this._cells.cellSize + cellSizeHalf;
				const n = [];

				for (const cell of this._cells.cells) {
					const dx = cell.px - px;
					const dy = cell.py - py;
					if (Math.abs(dx) > maxDist || Math.abs(dy) > maxDist) {
						continue;
					}

					n.push(cell);
				}

				this._cells.outsideNeighbours.set(idx, n);
			}
		}
	}

	/**
	 * @private
	 */
	_updateNeighbours() {
		const maxDist = (1 << POINT_RADIUS) * 2;
		for (const cell1 of this._cells.cells) {
			cell1.n = [];

			for (const cell2 of this._cells.cells) {
				if (cell1 === cell2) {
					continue;
				}

				const dx = cell1.px - cell2.px;
				const dy = cell1.py - cell2.py;
				if (Math.abs(dx) > maxDist || Math.abs(dy) > maxDist) {
					continue;
				}

				cell1.n.push(cell2);
			}
		}
	}

	/**
	 * @param {boolean} [initState=false]
	 * @private
	 */
	_updatePointsOpacity(initState = false) {
		const minDist = (this._props.thickness >> 1) - (this._geom.padding >> 1);
		const fadeSize = this._geom.padding >> 1;
		let opacity;

		for (const cell of this._cells.cells) {
			const x = cell.px - this._offset.x;
			const y = cell.py - this._offset.y;

			let bestDist = Number.MAX_VALUE;
			for (const cir of this._geom.boundaryCircles) {
				const dx = x - cir.x;
				const dy = y - cir.y;
				bestDist = Math.min(bestDist, Math.sqrt(dx * dx + dy * dy));
			}

			if (bestDist >= minDist) {
				opacity = Math.max(0, 1 - ((bestDist - minDist) / fadeSize));
			} else {
				opacity = 1;
			}

			cell.o = opacity;
		}
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} fromX
	 * @param {number} fromY
	 * @private
	 */
	_drawSmoke(ctx, fromX, fromY) {
		let minX = 0;
		let minY = 0;
		let maxX = this._geom.width;
		let maxY = this._geom.height;

		let drawFromX = fromX - this._geom.centerX;
		if (drawFromX < 0) {
			minX = -drawFromX;
			drawFromX = 0;
		}

		let drawFromY = fromY - this._geom.centerY;
		if (drawFromY < 0) {
			minY = -drawFromY;
			drawFromY = 0;
		}

		let drawToX = drawFromX + this._geom.width;
		if (drawToX > ctx.canvas.width) {
			maxX -= drawToX - ctx.canvas.width;
			drawToX = ctx.canvas.width;
		}

		let drawToY = drawFromY + this._geom.height;
		if (drawToY > ctx.canvas.height) {
			maxY -= drawToY - ctx.canvas.height;
			drawToY = ctx.canvas.height;
		}

		const data = ctx.getImageData(drawFromX, drawFromY, drawToX - drawFromX, drawToY - drawFromY);
		const rgba = data.data;
		const radiusPow = POINT_RADIUS - 1;
		const maxDistance = 1 << POINT_RADIUS;

		for (let y = minY; y < maxY; y++) {
			const row = ((y + this._offset.y) >> radiusPow) << 16;
			let cells, lastCol = -1;

			for (let x = minX; x < maxX; x++) {
				const col = (x + this._offset.x) >> radiusPow;
				if (col !== lastCol) {
					lastCol = col;
					const matIdx = row + col;

					cells = this._cells.neighbours.get(matIdx)
						|| this._cells.outsideNeighbours.get(matIdx);

				}

				if (!cells) {
					continue;
				}

				let light = 0;

				for (const cell of cells) {
					const dx = cell.px - (x + this._offset.x);
					const dy = cell.py - (y + this._offset.y);
					if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance) {
						continue;
					}

					let dist = Math.sqrt(dx * dx + dy * dy) / maxDistance;
					dist = 1 - (dist > 1 ? 1 : dist);

					if (dist < POINT_EPSILON) {
						continue;
					}

					light += dist * cell.o;
				}

				const idx = ((y - minY) * this._geom.width + (x - minX)) << 2;
				rgba[idx + 3] = Math.min(255, Math.round(light / 10 * 255));
			}
		}

		ctx.putImageData(data, drawFromX, drawFromY);
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} x
	 * @param {number} y
	 * @private
	 */
	_drawCells(ctx, x, y) {
		x -= this._geom.centerX;
		y -= this._geom.centerY;

		ctx.save();
		ctx.strokeStyle = '#ff0000';
		ctx.fillStyle = '#0000ff';
		ctx.beginPath();

		for (const cell of this._cells.cells) {
			ctx.rect(
				x + cell.x - this._offset.x,
				y + cell.y - this._offset.y,
				this._cells.cellSize,
				this._cells.cellSize
			);
		}

		ctx.stroke();

		for (const cell of this._cells.cells) {
			ctx.fillRect(
				x + cell.px - 1 - this._offset.x,
				y + cell.py - 1 - this._offset.y,
				2,
				2
			);
		}

		ctx.restore();
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} x
	 * @param {number} y
	 * @private
	 */
	_drawBoundaryCircles(ctx, x, y) {
		x -= this._geom.centerX;
		y -= this._geom.centerY;

		ctx.save();
		ctx.fillStyle = '#ff00ff';
		ctx.fillRect(x + this._geom.centerX - 5, y + this._geom.centerY - 5, 10, 10);

		ctx.strokeStyle = '#00ff00';

		for (const circle of this._geom.boundaryCircles) {
			ctx.beginPath();
			ctx.arc(
				x + circle.x,
				y + circle.y,
				circle.r,
				0,
				Math.PI * 2
			);
			ctx.stroke();
		}

		ctx.restore();
	}
}
