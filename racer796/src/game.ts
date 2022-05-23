import {Interruptable} from "game/interruptable";
import {Interrupter} from "game/interrupter";
import {Renderer} from "game/renderer";
import {AssetsLoader} from "game/assets-loader";
import {KeyboardController} from "game/keyboard-controllers/keyboard-controller";
import {FieldOfView} from "game/field-of-view";
import {Position} from "game/position";
import {SpaceBackground} from "game/items/space-background";
import {Floor} from "game/items/floor";
import {Ship} from "game/items/ship";
import {Walls} from "game/items/walls";
import {ShipController} from "game/keyboard-controllers/handlers/ship-controller";
import {
	BARRIER_TRAFFIC_LIGHTS, BARRIERS_COUNT,
	COLLISION_AREA_DAMAGE_HP, FINISH_SCREEN_DELAY,
	FLY_SPEED,
	FLY_SPEED_ACCELERATOR, FLY_SPEED_FINISH_ACCELERATOR, GAME_OVER_SCREEN_DELAY,
	START_WAIT_FRAMES, WALL_ANIMATED
} from "game/config";
import {Explosion} from "game/items/explosion";
import {TopBar} from "game/items/top-bar";
import {Coins} from "game/items/coins";
import {GameOverText} from "game/items/game-over-text";
import {FinishText} from "game/items/finish-text";
import {StartTimer} from "game/items/start-timer";
import {Renderable} from "game/renderable";
import {ScreenItem} from "game/screen-item";
import {EventsDispatcher} from "game/events-dispatcher";

export class Game implements Interruptable, ScreenItem {
	private fly = false;
	private readonly fieldOfView: FieldOfView;
	private readonly position: Position;
	private readonly shipController: ShipController;
	private readonly spaceBg: SpaceBackground;
	private readonly floor: Floor;
	private readonly ship: Ship;
	private readonly coins: Coins;
	private readonly walls: Walls;
	private readonly topBar: TopBar;
	private readonly gameOver: GameOverText;
	private readonly finishText: FinishText;
	private readonly startTimerText?: StartTimer;
	private startTimer = 0;
	private startTime = 0;
	private isFinish = false;
	private speed = 0;
	readonly events = new EventsDispatcher();

	constructor(
		private readonly interrupter: Interrupter,
		private readonly renderer: Renderer,
		private readonly assetsLoader: AssetsLoader,
		private readonly keyboardController: KeyboardController
	) {
		const fieldOfView = new FieldOfView();
		this.fieldOfView = fieldOfView;
		this.position = new Position();
		this.spaceBg = new SpaceBackground(this.position);
		this.floor = new Floor(fieldOfView, this.position);
		this.ship = new Ship(fieldOfView);
		this.coins = new Coins(fieldOfView);
		this.walls = new Walls(fieldOfView, this.position, this.ship, this.coins);
		this.shipController = new ShipController(this.ship);
		this.topBar = new TopBar(this.ship, this.coins);
		this.gameOver = new GameOverText();
		this.finishText = new FinishText();
		this.startTimerText = new StartTimer();

		this.assetsLoader.addItem(this.spaceBg);
		this.assetsLoader.addItem(this.walls);
		this.assetsLoader.addItem(this.ship);
		this.assetsLoader.addItem(new Explosion(0, 0, 1));
		this.assetsLoader.addItem(this.topBar);
		this.assetsLoader.addItem(this.coins);

		this.walls.events.addListener('explosion', ([x, y, strength, countDamage]) => {
			void this.addExplosion(x, y, strength, countDamage);
		});

		this.walls.events.addListener('finish', () => {
			if (!this.fly) {
				return;
			}
			this.isFinish = true;
			this.keyboardController.removeHandler(this.shipController);
			this.addItem(this.finishText);
			setTimeout(() => {
				this.events.trigger('save', this.coins.getScore());
			}, FINISH_SCREEN_DELAY);
		});
	}

	reset(): void {
		this.startTimer = 0;
		this.isFinish = false;
		this.speed = 0;
		this.fieldOfView.reset();
		this.fieldOfView.moveNearRect(0, -70);
		this.position.value = 0;
		this.walls.reset();
		this.ship.reset();
		this.coins.reset();
		this.topBar.reset();
		this.startTimerText.reset();
	}

	attach(): void {
		this.interrupter.addItem(this);
		this.fly = true;

		this.startTime = Date.now();

		this.renderer.addItem(this.spaceBg);
		this.addItem(this.floor);
		this.addItem(this.walls);
		this.addItem(this.topBar);
		this.addItem(this.startTimerText);

		this.interrupter.addItem(this.ship);
	}

	detach(): void {
		this.fly = false;
		this.keyboardController.removeHandler(this.shipController);

		this.renderer.removeItem(this.spaceBg);
		this.removeItem(this.floor);
		this.removeItem(this.walls);
		this.removeItem(this.topBar);
		this.removeItem(this.gameOver);
		this.removeItem(this.finishText);

		this.interrupter.removeItem(this.ship);

		if (this.startTimerText) {
			this.removeItem(this.startTimerText);
		}
	}

	interrupt(): void {
		this.renderer.requestRender();

		this.topBar.setFinishPercent(this.walls.pathPercent);

		if (!this.fly || !this.position) {
			return;
		}

		if (this.startTimer < START_WAIT_FRAMES) {
			if (++this.startTimer === START_WAIT_FRAMES) {
				this.keyboardController.addHandler(this.shipController);
				this.position.value = FLY_SPEED_ACCELERATOR;
			}
			this.walls.readyValue = Math.floor(
				(this.startTimer / START_WAIT_FRAMES) * (WALL_ANIMATED.get(BARRIER_TRAFFIC_LIGHTS.img).sprites - 1)
			);
		} else {
			if (this.startTimerText) {
				this.removeItem(this.startTimerText);
			}

			if (this.isFinish) {
				this.speed = Math.max(0, this.speed - FLY_SPEED_FINISH_ACCELERATOR);
			} else if (this.speed < FLY_SPEED) {
				this.speed = Math.min(FLY_SPEED, this.speed + FLY_SPEED_ACCELERATOR);
			}

			if (this.speed > 0) {
				this.position.value = (this.position.value + Math.floor(this.speed)) % 100000;
			}
		}
	}

	destroyShip(): void {
		if (!this.fly) {
			return;
		}

		this.fly = false;
		this.keyboardController.removeHandler(this.shipController);
		this.addItem(this.gameOver);
		this.walls.explodeShip();

		setTimeout(() => {
			this.events.trigger('close');
		}, GAME_OVER_SCREEN_DELAY);
	}

	private addItem(item: Renderable & Interruptable): void {
		this.renderer.addItem(item);
		this.interrupter.addItem(item);
	}

	private removeItem(item: Renderable & Interruptable): void {
		this.renderer.removeItem(item);
		this.interrupter.removeItem(item);
	}

	private async addExplosion(x: number, y: number, strength: number, countDamage: boolean): Promise<void> {
		if (countDamage) {
			this.ship.damage(Math.round(strength * COLLISION_AREA_DAMAGE_HP));
			if (this.ship.getHP() <= 0) {
				if (this.fly) {
					this.destroyShip();
				}
				return;
			}
		}

		const explosion = new Explosion(x, y, Math.max(0.4, strength));
		await explosion.loadAssets();
		this.addItem(explosion);

		explosion.events.addListener('end', () => {
			this.removeItem(explosion);
		});
	}
}