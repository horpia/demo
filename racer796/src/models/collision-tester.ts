import {COLLISION_AREA_MIN_PIXELS, COLLISION_AREA_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH} from "game/config";
import {Ship} from "game/items/ship";

interface RenderHandler {
	(ctx: CanvasRenderingContext2D): void;
}

interface CollisionArea {
	x: number,
	y: number,
	strength: number
}

export class CollisionTester {
	private readonly collisionTestCanvas: HTMLCanvasElement;

	constructor() {
		this.collisionTestCanvas = document.createElement('canvas');
		this.collisionTestCanvas.width = SCREEN_WIDTH;
		this.collisionTestCanvas.height = SCREEN_HEIGHT;
	}

	testWithCoins(coins: RenderHandler, ship: Ship): boolean {
		const ctx = this.collisionTestCanvas.getContext('2d');
		ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

		ctx.globalCompositeOperation = 'source-over';

		ctx.save();
		coins(ctx);
		ctx.restore();

		ctx.globalCompositeOperation = 'source-in';

		ctx.save();
		ship.render(ctx);
		ctx.restore();

		const rgba = ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).data;
		let cnt = 0;

		for (let i = 3; i < rgba.length; i += 4) {
			if (rgba[i] >= 200) {
				cnt++;
			}
		}

		return cnt > 3;
	}

	testWithBarrier(barrier: RenderHandler, ship: Ship): CollisionArea[] {
		const ctx = this.collisionTestCanvas.getContext('2d');
		ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

		ctx.globalCompositeOperation = 'source-over';

		ctx.save();
		barrier(ctx);
		ctx.restore();

		ctx.globalCompositeOperation = 'source-in';

		ctx.save();
		ship.render(ctx);
		ctx.restore();

		const rgba = ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).data;
		const areas = new Map<number, number>();
		const areaSizeHalf = COLLISION_AREA_SIZE >> 1;
		const areaSquare = COLLISION_AREA_SIZE ** 2;

		for (let i = 3; i < rgba.length; i += 4) {
			if (rgba[i] < 200) {
				continue;
			}
			const j = i >> 2;
			const y = Math.floor(j / SCREEN_WIDTH);
			const x = j - (y * SCREEN_WIDTH);
			const areaY = (Math.floor(y / COLLISION_AREA_SIZE) * COLLISION_AREA_SIZE) + areaSizeHalf;
			const areaX = (Math.floor(x / COLLISION_AREA_SIZE) * COLLISION_AREA_SIZE) + areaSizeHalf;
			const areaId = ((areaY & 0xFFFF) << 16) | (areaX & 0xFFFF);
			areas.set(areaId, (areas.get(areaId) || 0) + 1);
		}

		const out = [];
		for (const [areaId, cnt] of Array.from(areas.entries())) {
			if (cnt >= COLLISION_AREA_MIN_PIXELS) {
				out.push({
					x: areaId & 0xFFFF,
					y: (areaId >> 16) & 0xFFFF,
					strength: Math.min(1, cnt / areaSquare)
				});
			}
		}

		return out;
	}
}