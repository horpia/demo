import {AssetsItem} from "game/assets-item";
import {UIElement} from "game/ui-element";
import {KeyboardHandler} from "game/keyboard-controllers/keyboard-handler";
import {loadImage} from "game/helpers/images";
import {ASSETS_URN, IS_MOBILE, VIRTUAL_KEY_TIMEOUT} from "game/config";
import {KeyboardController} from "game/keyboard-controllers/keyboard-controller";

export class ApplyButton implements AssetsItem, UIElement, KeyboardHandler {
	private readonly cont: HTMLElement;
	private readonly el: HTMLElement;
	private img?: HTMLImageElement;
	private spriteWidth = 0;
	private spriteHeight = 0;
	private spriteIndex = 0;
	private keyTimerId = 0;

	constructor(private readonly keyboardController: KeyboardController) {
		this.cont = document.createElement('div');
		this.el = document.createElement('div');
		this.cont.appendChild(this.el);
		this.keyboardController.addHandler(this);
		this.assignPointerEvents();
	}

	async loadAssets(): Promise<void> {
		this.img = await loadImage(`${ASSETS_URN}/button.png`);
		this.spriteWidth = this.img.naturalWidth / 2;
		this.spriteHeight = this.img.naturalHeight;
	}

	build(): void {
		this.cont.style.cssText = `
			position: absolute;
			width: 161px;
			height: 115px;
			top: ${IS_MOBILE ? 341 : 580}px;
			left: ${IS_MOBILE ? 372 : 526}px;
			z-index: 4;
		`;
		this.el.style.cssText = `
			width: ${this.spriteWidth}px;
			height: ${this.spriteHeight}px;
			background-image: URL(${ASSETS_URN}/button.png);
			background-repeat: no-repeat;
			background-position: 0 0;
			margin: 28px 0 0 20px;
			z-index: 4;
		`;
	}

	getElement(): HTMLElement {
		return this.cont;
	}

	handle(pressedKeys: Set<string>): void {
		let spriteIndex = 0;
		if (pressedKeys.has('Space') || pressedKeys.has('Enter') || pressedKeys.has('Escape')) {
			spriteIndex = 1;
		}

		if (spriteIndex !== this.spriteIndex) {
			this.spriteIndex = spriteIndex;
			this.el.style.backgroundPosition = `-${this.spriteWidth * spriteIndex}px 0`;
		}
	}

	private assignPointerEvents(): void {
		if ('ontouchstart' in document) {
			this.cont.addEventListener('touchstart', this.handlePointerDown, {passive: false});
			this.cont.addEventListener('touchend', this.handlePointerUp, {passive: false, capture: true});
		} else {
			this.cont.addEventListener('mousedown', this.handlePointerDown);
			this.cont.addEventListener('mouseup', this.handlePointerUp);
		}
	}

	private handlePointerDown = (e: Event): void => {
		e.preventDefault();
		clearTimeout(this.keyTimerId);
		document.dispatchEvent(new CustomEvent('custom-keydown', {detail: 'Space'}));
	}

	private handlePointerUp = (): void => {
		clearTimeout(this.keyTimerId);
		this.keyTimerId = window.setTimeout(() => {
			document.dispatchEvent(new CustomEvent('custom-keyup', {detail: 'Space'}));
		}, VIRTUAL_KEY_TIMEOUT);
	}
}