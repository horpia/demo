import {AssetsLoader} from "game/assets-loader";
import {Interrupter} from "game/interrupter";
import {KeyboardController} from "game/keyboard-controllers/keyboard-controller";
import {Canvas} from "game/canvas";
import {Renderer} from "game/renderer";
import {FontLoader} from "game/loaders/font-loader";
import {Game} from "game/game";
import {ScreenItem} from "game/screen-item";
import {SaveForm} from "game/items/save-form";
import {TopResults} from "game/items/top-results";
import {StartMenu} from "game/items/start-menu";
import {Machine} from "game/ui/machine";

export class Main {
	private currentItem?: ScreenItem;
	private readonly loader = new AssetsLoader();
	private readonly interrupter = new Interrupter();
	private readonly keyboardController = new KeyboardController();
	private readonly render: Renderer;
	private readonly game: Game;
	private readonly saveForm: SaveForm;
	private readonly topResults: TopResults;
	private readonly startMenu: StartMenu;
	private readonly canvas: Canvas;
	private readonly machine: Machine;

	constructor() {
		this.canvas = new Canvas();
		this.machine = new Machine(this.canvas, this.keyboardController);

		this.render = new Renderer(this.canvas);
		this.loader.addItem(new FontLoader());
		this.loader.addItem(this.machine);

		this.game = new Game(this.interrupter, this.render, this.loader, this.keyboardController);
		this.game.events.addListener('save', this.openSaveForm.bind(this));
		this.game.events.addListener('close', this.openStartMenu.bind(this));

		this.saveForm = new SaveForm(this.render, this.keyboardController);
		this.saveForm.events.addListener('saved', this.openTopResults.bind(this));

		this.topResults = new TopResults(this.render, this.loader, this.keyboardController);
		this.topResults.events.addListener('close', this.openStartMenu.bind(this));

		this.startMenu = new StartMenu(this.render, this.interrupter, this.loader, this.keyboardController);
		this.startMenu.events.addListener('game', this.openGame.bind(this));
		this.startMenu.events.addListener('top-scores', this.openTopResults.bind(this));
	}

	appendTo(el: HTMLElement): void {
		el.appendChild(this.machine.getElement());
		this.machine.update();
		if (window.frameElement) {
			// @ts-ignore
			window.frameElement.dispatchEvent(new parent.CustomEvent('custom-load', {
				detail: this.machine.getSize()
			}));
		}
	}

	async start(): Promise<void> {
		await this.loader.load();

		this.canvas.build();
		this.machine.build();

		this.keyboardController.attach();
		this.interrupter.addItem(this.keyboardController);

		this.render.start();
		this.interrupter.start();

		this.openStartMenu();
	}

	private attachItem(item: ScreenItem): void {
		if (this.currentItem) {
			this.detachCurrentItem();
		}

		this.currentItem = item;
		item.attach();
	}

	private detachCurrentItem(): void {
		if (!this.currentItem) {
			return;
		}

		this.keyboardController.clearPressedKeys();
		this.currentItem.detach();
		this.currentItem = undefined;
	}

	private openGame(): void {
		this.game.reset();
		this.attachItem(this.game);
	}

	private openSaveForm(score: number): void {
		this.saveForm.setScore(score);
		this.attachItem(this.saveForm);
	}

	private openTopResults(): void {
		this.attachItem(this.topResults);
	}

	private openStartMenu(): void {
		this.attachItem(this.startMenu);
	}
}