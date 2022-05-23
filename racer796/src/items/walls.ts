import {Renderable} from "game/renderable";
import {Interruptable} from "game/interruptable";
import {
	ASSETS_URN, BARRIER_FINISH, BARRIER_TRAFFIC_LIGHTS,
	BARRIERS_LINE_HEIGHT,
	COIN_SIZE,
	COIN_SPRITE_DURATION,
	COIN_SPRITES,
	COLLISION_AREA_MIN_PIXELS,
	COLLISION_AREA_SIZE,
	FOV_LENGTH,
	SCREEN_HEIGHT,
	SCREEN_WIDTH,
	WALL_ANIMATED,
	WALL_BRIGHTNESS_FACTOR,
	WALL_COLORS,
	WALL_DISTANCE,
	WALL_SEQUENCE,
	WALL_SHIP_POSITION,
	WALL_START_SCALE
} from "game/config";
import {FieldOfView} from "game/field-of-view";
import {Position} from "game/position";
import {easeInExpo} from "game/helpers/easing";
import {flipImage, loadImage} from "game/helpers/images";
import {AssetsItem} from "game/assets-item";
import {Ship} from "game/items/ship";
import {EventsDispatcher} from "game/events-dispatcher";
import {PathGenerator} from "game/models/path-generator";
import {PathLine} from "game/models/path-generator";
import {Coins} from "game/items/coins";
import {CollisionTester} from "game/models/collision-tester";

type WallProps = {
	id: number,
	y: number,
	left: number,
	right: number,
	sizeScale: number,
	fovScale: number,
	position: number,
	brightness: number,
	color: string,
	imgLeft?: number,
	imgRight?: number,
	pathItem: PathLine,
	testCollision: boolean,
};

export type BarrierProps = {
	img: number,
	col?: number,
	x?: number,
	flipped?: boolean,
	shape: number[][]
};

enum WallPosition {
	LEFT,
	CENTER,
	RIGHT
}

export class Walls implements Renderable, Interruptable, AssetsItem {
	private lastPosition = -1;
	private walls: WallProps[] = [];
	private readonly images: HTMLImageElement[] = [];
	private readonly imagesFlipped: HTMLImageElement[] = [];
	private path: PathLine[];
	private collisionTester: CollisionTester;
	private initPathLength: number = 0;
	private passedPathItems: number = 0;
	readyValue = 0;
	readonly events = new EventsDispatcher();

	constructor(
		private readonly fov: FieldOfView,
		private readonly position: Position,
		private readonly ship: Ship,
		private readonly coins: Coins
	) {
		this.reset();
	}

	get pathPercent(): number {
		if (this.initPathLength === 0) {
			return 0;
		}
		return Math.min(100, Math.round(this.passedPathItems / this.initPathLength * 100));
	}

	reset(): void {
		this.walls = [];
		this.lastPosition = -1;
		this.path = new PathGenerator().generate();
		this.passedPathItems = 0;
		this.initPathLength = this.path.length;
		this.collisionTester = new CollisionTester();
		this.calcWalls();
	}

	async loadAssets(): Promise<void> {
		const promises: Promise<HTMLImageElement>[] = [];
		for (let i = 1; i <= 14; i++) {
			promises.push(loadImage(`${ASSETS_URN}/build${i}.gif`));
		}

		this.images.push(...await Promise.all(promises));

		this.imagesFlipped.push(...await Promise.all(
			this.images.map(img => flipImage(img, true, false))
		));
	}

	interrupt() {
		if (this.lastPosition !== this.position.value) {
			this.calcWalls();
		}
	}

	render(ctx: CanvasRenderingContext2D) {
		let shipDrawn = this.ship.getHP() <= 0;

		for (let i = this.walls.length - 1; i >= 0; i--) {
			const wall = this.walls[i];

			if (!shipDrawn && wall.sizeScale > WALL_SHIP_POSITION) {
				if (wall.testCollision) {
					this.passedPathItems++;
					wall.testCollision = false;

					if (wall.pathItem?.coins) {
						this.testCollisionWithCoins(wall);
					}

					if (wall.pathItem?.barrier) {
						this.testCollisionWithBarrier(wall);

						if (wall.pathItem.barrier === BARRIER_FINISH) {
							this.events.trigger('finish');
						}
					}
				}

				shipDrawn = true;
				this.drawShip(ctx);
			}

			ctx.save();
			ctx.filter = `brightness(${wall.brightness}%)`;

			if (wall.imgLeft !== undefined) {
				this.drawWall(ctx, wall, wall.imgLeft, WallPosition.LEFT);
			}

			if (wall.imgRight !== undefined) {
				this.drawWall(ctx, wall, wall.imgRight, WallPosition.RIGHT);
			}

			if (wall.pathItem?.barrier) {
				this.drawWall(ctx, wall, wall.pathItem.barrier.img, WallPosition.CENTER, wall.pathItem.barrier);
			}

			if (wall.pathItem?.coins) {
				this.drawCoins(wall, ctx);
			}

			ctx.restore();
		}

		if (!shipDrawn) {
			this.drawShip(ctx);
		}
	}

	explodeShip(): void {
		this.testCollisionWithBarrier();
	}

	private testCollisionWithBarrier(wall?: WallProps): void {
		this.collisionTester.testWithBarrier(
			(ctx: CanvasRenderingContext2D) => {
				if (wall) {
					this.drawWall(ctx, wall, wall.pathItem.barrier.img, WallPosition.CENTER, wall.pathItem.barrier);
				} else {
					// fullscreen barrier to explode ship completely
					ctx.fillStyle = 'red';
					ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
				}
			},
			this.ship
		).forEach(area => {
			this.events.trigger('explosion', [area.x, area.y, area.strength, !!wall]);
		});
	}

	private testCollisionWithCoins(wall?: WallProps): void {
		const res = this.collisionTester.testWithCoins(
			(ctx: CanvasRenderingContext2D) => {
				this.coins.setProps(wall.left, wall.y, wall.sizeScale, wall.pathItem.coins);
				this.coins.render(ctx);
			},
			this.ship
		);

		if (res) {
			// mark coin as fetched
			wall.pathItem.coins = wall.pathItem.coins.map(line => line.map(cell => cell === 1 ? 2 : cell));
			this.events.trigger('get-coin');
		}
	}

	private drawCoins(wall: WallProps, ctx: CanvasRenderingContext2D): void {
		ctx.save();
		this.coins.setProps(wall.left, wall.y, wall.sizeScale, wall.pathItem.coins);
		this.coins.render(ctx);
		ctx.restore();
	}

	private drawShip(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		this.ship.render(ctx);
		ctx.restore();
	}

	private drawWall(
		ctx: CanvasRenderingContext2D,
		wall: WallProps,
		imgIndex: number,
		pos: WallPosition,
		barrier?: BarrierProps
	): void {
		const {sprites, duration} = WALL_ANIMATED.get(imgIndex) || {sprites: 1, duration: 1};

		const scale = wall.sizeScale * (pos === WallPosition.CENTER ? 1 : 1.4);
		const img = (pos === WallPosition.RIGHT || barrier?.flipped)
			? this.imagesFlipped[imgIndex]
			: this.images[imgIndex];
		const spriteWidth = img.naturalWidth / sprites;
		let spriteX = (Math.floor(Date.now() / duration) % sprites) * spriteWidth;
		const width = Math.floor(spriteWidth * scale);
		const height = Math.floor(img.naturalHeight * scale);
		let x = wall.left;
		let y = wall.y - height;

		if (imgIndex === BARRIER_TRAFFIC_LIGHTS.img) {
			spriteX = Math.min(sprites - 1, this.readyValue) * spriteWidth;
		}

		if (barrier?.col > 0) {
			const nearRect = this.fov.getNearRect();
			const farRect = this.fov.getFarRect();
			const trackWidth = ((nearRect.width - farRect.width) / 4) * wall.sizeScale;
			x += Math.round(trackWidth * barrier.col);
			if (barrier?.flipped) {
				x -= width;
				x -= Math.round(barrier.x ? barrier.x * wall.sizeScale : 0);
			} else {
				x += Math.round(barrier.x ? barrier.x * wall.sizeScale : 0);
			}
		}

		if (pos === WallPosition.LEFT) {
			x = wall.left - width;
		} else if (pos === WallPosition.RIGHT) {
			x = wall.right;
		}

		ctx.drawImage(
			img,
			spriteX, 0, spriteWidth, img.naturalHeight,
			x,
			y,
			width,
			height
		);
	}

	private calcWalls(): void {
		if (this.images.length === 0) {
			return;
		}

		const farRect = this.fov.getFarRect();
		const nearRect = this.fov.getNearRect();
		const startY = Math.ceil(farRect.bottom);
		const fovHeight = Math.ceil(nearRect.bottom - startY);

		const minId = Math.floor(this.position.value / WALL_DISTANCE);
		const wallsCount = Math.ceil(FOV_LENGTH / WALL_DISTANCE);
		const maxId = minId + wallsCount;

		// remove wall that out from Field Of View
		this.walls = this.walls.filter(wall => wall.id >= minId && wall.id <= maxId);

		const maxAddedId = Math.max(0, ...this.walls.map(wall => wall.id));

		for (let id = maxAddedId + 1; id <= maxId; id++) {
			this.walls.push({
				id,
				y: 0,
				left: 0,
				right: 0,
				sizeScale: 1,
				fovScale: 1,
				brightness: 100,
				position: id * WALL_DISTANCE,
				color: WALL_COLORS[id % WALL_COLORS.length],
				imgLeft: WALL_SEQUENCE[id % WALL_SEQUENCE.length],
				imgRight: WALL_SEQUENCE[(id + 4) % WALL_SEQUENCE.length],
				pathItem: this.path.shift(),
				testCollision: true
			});
		}

		for (const wall of this.walls) {
			const pos = 1 - (wall.position - this.position.value) / FOV_LENGTH;
			const scale = easeInExpo(pos);
			wall.fovScale = scale;
			wall.brightness = Math.round(Math.min(100, scale * WALL_BRIGHTNESS_FACTOR));
			wall.sizeScale = WALL_START_SCALE + (1 - WALL_START_SCALE) * scale;
			wall.y = startY + scale * fovHeight;
			wall.left = farRect.left + scale * (nearRect.left - farRect.left);
			wall.right = farRect.right + scale * (nearRect.right - farRect.right);
		}
	}
}