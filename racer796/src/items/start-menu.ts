import {Renderable} from "game/renderable";
import {Interruptable} from "game/interruptable";
import {AssetsItem} from "game/assets-item";
import {ScreenItem} from "game/screen-item";
import {Renderer} from "game/renderer";
import {KeyboardController} from "game/keyboard-controllers/keyboard-controller";
import {StartMenuController} from "game/keyboard-controllers/handlers/start-menu-controller";
import {loadImage} from "game/helpers/images";
import {
	ASSETS_URN, COPYRIGHT_COLOR, COPYRIGHT_FONT_SIZE, COPYRIGHT_SHADOW_COLOR, COPYRIGHT_X, COPYRIGHT_Y,
	FONT_NAME_16, FONT_NAME_8,
	MENU_BG_COLOR,
	MENU_ITEMS_COLOR,
	MENU_ITEMS_FONT_SIZE,
	MENU_ITEMS_PADDING,
	MENU_ITEMS_SELECTED_COLOR,
	MENU_ITEMS_X,
	MENU_ITEMS_Y,
	MENU_SHIP_ANGLE_STEP,
	MENU_SHIP_DEVIATION,
	MENU_SHIP_SPRITES,
	MENU_SHIP_X,
	MENU_SHIP_Y,
	MENU_STAR_COLOR,
	MENU_STAR_MOVE_SPEED,
	MENU_STARS_ANGLE,
	MENU_STARS_AREA_HEIGHT,
	MENU_STARS_AREA_TRANSLATE_X,
	MENU_STARS_AREA_TRANSLATE_Y,
	MENU_STARS_AREA_WIDTH,
	MENU_STARS_COUNT,
	SCREEN_HEIGHT,
	SCREEN_WIDTH
} from "game/config";
import {Interrupter} from "game/interrupter";
import {AssetsLoader} from "game/assets-loader";
import {EventsDispatcher} from "game/events-dispatcher";

interface Star {
	x: number,
	y: number,
	z: number
}

export class StartMenu implements Renderable, Interruptable, AssetsItem, ScreenItem {
	private readonly keyboardHandler: StartMenuController;
	private img?: HTMLImageElement;
	private sprite = 0;
	private angle = 0;
	private stars: Set<Star> = new Set<Star>();
	private readonly starsAngle: number;
	private selectedMenu = 0;
	readonly events = new EventsDispatcher();

	constructor(
		private readonly renderer: Renderer,
		private readonly interrupter: Interrupter,
		private readonly loader: AssetsLoader,
		private readonly keyboardController: KeyboardController
	) {
		this.keyboardHandler = new StartMenuController(this);
		this.loader.addItem(this);

		this.starsAngle = MENU_STARS_ANGLE * Math.PI / 180;
	}

	async loadAssets(): Promise<void> {
		this.img = await loadImage(`${ASSETS_URN}/ship2.gif`);
	}

	moveSelection(dy: number): void {
		this.selectedMenu = Math.min(1, Math.max(0, this.selectedMenu + dy));
	}

	applyMenu(): void {
		if (this.selectedMenu === 0) {
			this.events.trigger('game');
		} else {
			this.events.trigger('top-scores');
		}
	}

	attach(): void {
		this.renderer.addItem(this);
		this.interrupter.addItem(this);
		this.keyboardController.addHandler(this.keyboardHandler);
		this.generateStartupStars();
	}

	detach(): void {
		this.renderer.removeItem(this);
		this.interrupter.removeItem(this);
		this.keyboardController.removeHandler(this.keyboardHandler);
	}

	interrupt(): void {
		this.angle = (this.angle + MENU_SHIP_ANGLE_STEP) % 360;
		this.sprite = (this.sprite + 1) % MENU_SHIP_SPRITES;
		this.moveStars();
		this.renderer.requestRender();
	}

	render(ctx: CanvasRenderingContext2D): void {
		StartMenu.drawBg(ctx);
		this.drawStars(ctx);
		this.drawShip(ctx);
		this.drawMenuItems(ctx);
		StartMenu.drawCopyright(ctx);
	}

	private generateStartupStars(): void {
		this.stars.clear();
		for (let i = 0; i < MENU_STARS_COUNT; i++) {
			this.addStar();
		}
	}

	private moveStars(): void {
		for (const star of Array.from(this.stars)) {
			star.x += star.z * MENU_STAR_MOVE_SPEED;
			if (star.x > MENU_STARS_AREA_WIDTH) {
				this.stars.delete(star);
			}
		}

		for (let i = this.stars.size; i < MENU_STARS_COUNT; i++) {
			this.addStar(true);
		}
	}

	private addStar(fromStart = false): void {
		this.stars.add({
			x: fromStart ? 0 : MENU_STARS_AREA_WIDTH * Math.random(),
			y: MENU_STARS_AREA_HEIGHT * Math.random(),
			z: 0.2 + (Math.random() * 0.8)
		});
	}

	private drawStars(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		ctx.translate(MENU_STARS_AREA_TRANSLATE_X, MENU_STARS_AREA_TRANSLATE_Y);
		ctx.rotate(this.starsAngle);
		ctx.fillStyle = MENU_STAR_COLOR;

		for (const star of Array.from(this.stars)) {
			ctx.globalAlpha = star.z;
			ctx.fillRect(star.x, star.y, 2, 2);
		}
		ctx.restore();
	}

	private static drawBg(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = MENU_BG_COLOR;
		ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	}

	private drawShip(ctx: CanvasRenderingContext2D): void {
		const y = Math.round(Math.sin(this.angle * Math.PI / 180) * MENU_SHIP_DEVIATION);
		const width = this.img.naturalWidth / MENU_SHIP_SPRITES;
		ctx.drawImage(
			this.img,
			width * this.sprite,
			0,
			width,
			this.img.naturalHeight,
			MENU_SHIP_X,
			MENU_SHIP_Y + y,
			width,
			this.img.naturalHeight
		);
	}

	private drawMenuItems(ctx: CanvasRenderingContext2D): void {
		const menu = ['START', 'TOP SCORES'];
		let y = MENU_ITEMS_Y;
		const itemHeight = MENU_ITEMS_FONT_SIZE + MENU_ITEMS_PADDING;

		ctx.font = `${MENU_ITEMS_FONT_SIZE}px "${FONT_NAME_16}"`;
		ctx.textBaseline = 'top';

		for (let i = 0; i < menu.length; i++) {
			if (i === this.selectedMenu) {
				ctx.fillStyle = MENU_ITEMS_SELECTED_COLOR;
			} else {
				ctx.fillStyle = MENU_ITEMS_COLOR;
			}

			ctx.fillText(menu[i], MENU_ITEMS_X, y);
			y += itemHeight;
		}

		ctx.fillStyle = MENU_ITEMS_SELECTED_COLOR;
		ctx.textAlign = 'right';
		ctx.fillText('>', MENU_ITEMS_X - MENU_ITEMS_PADDING, MENU_ITEMS_Y + (this.selectedMenu * itemHeight));
		ctx.textAlign = 'left';
	}

	private static drawCopyright(ctx: CanvasRenderingContext2D): void {
		ctx.font = `${COPYRIGHT_FONT_SIZE}px "${FONT_NAME_16}"`;
		ctx.textBaseline = 'top';
		ctx.fillStyle = COPYRIGHT_SHADOW_COLOR;
		ctx.fillText('RACER-796', COPYRIGHT_X + 2, COPYRIGHT_Y + 2);

		ctx.fillStyle = COPYRIGHT_COLOR;
		ctx.fillText('RACER-796', COPYRIGHT_X, COPYRIGHT_Y);

		ctx.font = `${MENU_ITEMS_FONT_SIZE}px "${FONT_NAME_8}"`;
		ctx.fillStyle = MENU_ITEMS_COLOR;
		ctx.fillText('© floor796', COPYRIGHT_X, COPYRIGHT_Y + COPYRIGHT_FONT_SIZE - 8);

	}
}