import {
	BARRIER_FINISH,
	BARRIER_TRAFFIC_LIGHTS,
	BARRIERS,
	BARRIERS_COOL_DOWN_BUFFER_LENGTH,
	BARRIERS_COUNT, 
	BARRIERS_THRESHOLD_SHAPE_CELL_VALUE, PATH_DISTANCE_FROM_START, PATH_DISTANCE_TO_FINISH
} from "game/config";
import {BarrierProps} from "game/items/walls";

export type PathLine = {
	barrier?: BarrierProps,
	coins: number[][]
}

export class PathGenerator {
	private barrierMap: number[][];
	private lastBarriers: BarrierProps[] = [];

	generate(): PathLine[] {
		this.barrierMap = [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		];

		let barrierCount = BARRIERS_COUNT;
		const path: PathLine[] = [];

		while (barrierCount-- > 0) {
			path.push(PathGenerator.createPathLine());
			this.increaseBarrierMap();

			path.push(PathGenerator.createPathLine(this.pickBarrier()));
			this.increaseBarrierMap();
		}

		for (let i = 0; i < PATH_DISTANCE_TO_FINISH; i++) {
			path.push(PathGenerator.createPathLine());
		}

		this.createCoins(path);

		for (let i = 0; i < PATH_DISTANCE_FROM_START; i++) {
			path.unshift(PathGenerator.createPathLine());
		}

		path[0].barrier = BARRIER_TRAFFIC_LIGHTS;

		path.push(PathGenerator.createPathLine(BARRIER_FINISH));

		return path;
	}

	private static createPathLine(barrier: BarrierProps = undefined): PathLine {
		return {
			coins: [
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
			barrier
		};
	}

	private createCoins(path: PathLine[]): void {
		let offset = 0;
		while (offset < path.length) {
			let lastLineNo = offset + 2 + Math.round(Math.random() * 5);
			let buffer = [
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			];

			for (let i = offset; i < path.length && i <= lastLineNo; i++) {
				if (path[i].barrier === undefined) {
					continue;
				}
				const barrier = path[i].barrier;
				for (let j = 0; j < barrier.shape.length; j++) {
					for (let k = 0; k < barrier.shape[j].length; k++) {
						if (barrier.shape[j][k] === 1) {
							buffer[j][k] = 1;
						}
					}
				}
			}

			let index: number | undefined;
			let line: number;
			for (let i = 2; i >= 0; i--) {
				index = buffer[i].map((v, i) => v > 0 ? -1 : i)
					.filter(v => v >= 0)
					.sort(() => -2 + Math.ceil(Math.random() * 4))
					.shift();

				if (index !== undefined) {
					line = i;
					break;
				}
			}

			if (index !== undefined) {
				for (let i = offset; i < path.length && i <= lastLineNo; i++) {
					path[i].coins[line][index] = 1;
				}
			}

			offset = lastLineNo;
		}
	}

	private increaseBarrierMap(): void {
		for (let i = 0; i < this.barrierMap.length; i++) {
			for (let j = 0; j < this.barrierMap[i].length; j++) {
				this.barrierMap[i][j]++;
			}
		}
	}

	private pickBarrier(): BarrierProps {
		let list: BarrierProps[] = [];
		main: for (const barrier of BARRIERS) {
			for (let i = 0; i < barrier.shape.length; i++) {
				for (let j = 0; j < barrier.shape[i].length; j++) {
					if (barrier.shape[i][j] === 1 && this.barrierMap[i][j] < BARRIERS_THRESHOLD_SHAPE_CELL_VALUE) {
						continue main;
					}
				}
			}

			list.push(barrier);
		}

		if (list.length === 0) {
			list.push(...BARRIERS);
		}

		list = list.filter(b => !this.lastBarriers.includes(b));

		if (list.length === 0) {
			list.push(...BARRIERS);
		}

		const barrier = list[Math.floor(list.length * Math.random())];

		this.lastBarriers.push(barrier);

		if (this.lastBarriers.length > BARRIERS_COOL_DOWN_BUFFER_LENGTH) {
			this.lastBarriers.splice(0, 1);
		}

		for (let i = 0; i < barrier.shape.length; i++) {
			for (let j = 0; j < barrier.shape[i].length; j++) {
				if (barrier.shape[i][j] === 1) {
					this.barrierMap[i][j] = 0;
				}
			}
		}

		return barrier;
	}
}