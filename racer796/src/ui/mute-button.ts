import {AssetsItem} from "game/assets-item";
import {UIElement} from "game/ui-element";
import {KeyboardHandler} from "game/keyboard-controllers/keyboard-handler";
import {loadImage} from "game/helpers/images";
import {ASSETS_URN, IS_MOBILE} from "game/config";
import {KeyboardController} from "game/keyboard-controllers/keyboard-controller";

export class MuteButton implements AssetsItem, UIElement, KeyboardHandler {
	private readonly cont: HTMLElement;
	private readonly el: HTMLElement;
	private img?: HTMLImageElement;
	private spriteWidth = 0;
	private spriteHeight = 0;
	private spriteIndex = 0;
	private broken = false;
	private animationIndices: number[] = [2, 3, 4, 5, 6, 7, 8, 7, 6, 7, 8, 7, 7, 8];

	constructor(private readonly keyboardController: KeyboardController) {
		this.cont = document.createElement('div');
		this.el = document.createElement('div');
		this.cont.appendChild(this.el);
		this.keyboardController.addHandler(this);
		this.assignPointerEvents();
	}

	async loadAssets(): Promise<void> {
		this.img = await loadImage(`${ASSETS_URN}/button2.png`);
		this.spriteWidth = this.img.naturalWidth / 9;
		this.spriteHeight = this.img.naturalHeight;
	}

	build(): void {
		this.cont.style.cssText = `
			position: absolute;
			width: ${this.spriteWidth}px;
			height: ${this.spriteHeight}px;
			top: ${IS_MOBILE ? 236 : 475}px;
			left: ${IS_MOBILE ? 223 : 375}px;
			z-index: 4;
		`;
		this.el.style.cssText = `
			width: ${this.spriteWidth}px;
			height: ${this.spriteHeight}px;
			background-image: URL(${ASSETS_URN}/button2.png);
			background-repeat: no-repeat;
			background-position: 0 0;
			z-index: 4;
		`;
	}

	getElement(): HTMLElement {
		return this.cont;
	}

	handle(pressedKeys: Set<string>): void {
		if (this.broken) {
			return;
		}

		let spriteIndex = 0;
		if (pressedKeys.has('KeyM')) {
			spriteIndex = 1;
		}

		if (this.spriteIndex !== spriteIndex) {
			if (this.spriteIndex === 1 && spriteIndex === 0) {
				this.broken = true;
				const timerId = window.setInterval(() => {
					const index = this.animationIndices.shift();
					this.el.style.backgroundPosition = `-${this.spriteWidth * index}px 0`;

					if (this.animationIndices.length === 0) {
						clearInterval(timerId);
					}
				}, 41);
			} else {
				this.spriteIndex = spriteIndex;
				this.el.style.backgroundPosition = `-${this.spriteWidth * spriteIndex}px 0`;
			}
		}
	}

	private assignPointerEvents(): void {
		if ('ontouchstart' in document) {
			this.cont.addEventListener('touchstart', this.handlePointerDown);
			this.cont.addEventListener('touchend', this.handlePointerUp);
		} else {
			this.cont.addEventListener('mousedown', this.handlePointerDown);
			this.cont.addEventListener('mouseup', this.handlePointerUp);
		}
	}

	private handlePointerDown = (): void => {
		document.dispatchEvent(new CustomEvent('custom-keydown', {detail: 'KeyM'}))
	}

	private handlePointerUp = (): void => {
		document.dispatchEvent(new CustomEvent('custom-keyup', {detail: 'KeyM'}))
	}
}