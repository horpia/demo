import {AssetsItem} from "game/assets-item";
import {loadImage} from "game/helpers/images";
import {ASSETS_URN, CANVAS_HEIGHT, CANVAS_WIDTH, IS_MOBILE} from "game/config";
import {Canvas} from "game/canvas";
import {KeyboardController} from "game/keyboard-controllers/keyboard-controller";
import {Joystick} from "game/ui/joystick";
import {UIElement} from "game/ui-element";
import {ApplyButton} from "game/ui/apply-button";
import {MuteButton} from "game/ui/mute-button";

export class Machine implements AssetsItem, UIElement {
	private img?: HTMLImageElement;
	private readonly joystick: Joystick;
	private readonly applyButton: ApplyButton;
	private readonly muteButton: MuteButton;
	private readonly el: HTMLElement;
	private readonly bg: HTMLElement;
	private readonly cont: HTMLElement;

	constructor(
		private readonly canvas: Canvas,
		private readonly keyboardController: KeyboardController
	) {
		this.cont = document.createElement('div');
		this.el = document.createElement('div');
		this.bg = document.createElement('div');
		this.el.appendChild(this.bg);
		this.cont.appendChild(this.el);
		this.joystick = new Joystick(this.keyboardController);
		this.applyButton = new ApplyButton(this.keyboardController);
		this.muteButton = new MuteButton(this.keyboardController);
	}

	getElement(): HTMLElement {
		return this.cont;
	}

	async loadAssets(): Promise<void> {
		[this.img] = await Promise.all([
			await loadImage(IS_MOBILE ? `${ASSETS_URN}/machine2.png` : `${ASSETS_URN}/machine.png`),
			this.joystick.loadAssets(),
			this.applyButton.loadAssets(),
			this.muteButton.loadAssets(),
		]);
	}

	getSize(): number[] {
		return [
			this.el.offsetWidth,
			this.el.offsetHeight
		];
	}

	build(): void {
		this.cont.draggable = false;
		this.cont.addEventListener('contextmenu', (e) => e.preventDefault());
		this.cont.addEventListener('touchstart', (e) => e.preventDefault(), {passive: false});
		this.cont.style.cssText = `
			user-select: none;
			max-width: 100vw;
			overflow: hidden;
		`;

		this.el.style.cssText = `
			position: relative;
			width: ${this.img.naturalWidth}px;
			height: ${this.img.naturalHeight}px;
		`;

		const canvasEl = this.canvas.getElement();
		this.el.appendChild(canvasEl);
		canvasEl.style.cssText = `
			position: absolute;
			z-index: 1;
			margin: ${IS_MOBILE ? 44 : 40}px 0 0 ${IS_MOBILE ? 124 : 128}px;
		`;

		this.bg.style.cssText = `
			position: absolute;
			background-color: #3a3a3a;
			width: ${CANVAS_WIDTH + 10}px;
			height: ${CANVAS_HEIGHT + 10}px;
			margin: ${IS_MOBILE ? 39 : 35}px 0 0 ${IS_MOBILE ? 119 : 123}px;
		`;

		this.el.appendChild(this.img);

		this.img.style.cssText = `
			position: relative;
			z-index: 2;
		`;

		this.joystick.build();
		this.el.appendChild(this.joystick.getElement());

		this.applyButton.build();
		this.el.appendChild(this.applyButton.getElement());

		this.muteButton.build();
		this.el.appendChild(this.muteButton.getElement());

		window.addEventListener('resize', this.updateInnerScroll.bind(this));
		window.addEventListener('load', this.updateInnerScroll.bind(this));

		let timerValue = 0;
		const timerId = window.setInterval(() => {
			this.updateInnerScroll();
			if (++timerValue > 100) {
				clearInterval(timerId);
			}
		}, 50);
	}

	update(): void {
		this.updateInnerScroll();
	}

	private updateInnerScroll(): void {
		this.el.style.marginLeft = `${(this.cont.offsetWidth - this.el.offsetWidth) >> 1}px`;
	}
}