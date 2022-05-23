import {AssetsItem} from "game/assets-item";
import {loadImage} from "game/helpers/images";
import {ASSETS_URN, IS_MOBILE, JOYSTICK_NEUTRAL_RADIUS} from "game/config";
import {KeyboardController} from "game/keyboard-controllers/keyboard-controller";
import {UIElement} from "game/ui-element";
import {KeyboardHandler} from "game/keyboard-controllers/keyboard-handler";

const KEYS_BY_DIRS: Record<number, string[]> = {
	0: ['ArrowDown'],
	1: ['ArrowDown', 'ArrowRight'],
	2: ['ArrowRight'],
	3: ['ArrowUp', 'ArrowRight'],
	4: ['ArrowUp'],
	5: ['ArrowUp', 'ArrowLeft'],
	6: ['ArrowLeft'],
	7: ['ArrowDown', 'ArrowLeft'],
	8: ['ArrowDown'],
};

export class Joystick implements AssetsItem, UIElement, KeyboardHandler {
	private readonly cont: HTMLElement;
	private readonly el: HTMLElement;
	private img?: HTMLImageElement;
	private spriteWidth = 0;
	private spriteHeight = 0;
	private spriteIndex = 0;
	private touchX = 0;
	private touchY = 0;
	private touchId = 0;
	private pressedVirtualKeys: Set<string> = new Set<string>();

	constructor(private readonly keyboardController: KeyboardController) {
		this.cont = document.createElement('div');
		this.el = document.createElement('div');
		this.cont.appendChild(this.el);
		this.keyboardController.addHandler(this);
		this.assignPointerEvents();
	}

	getElement(): HTMLElement {
		return this.cont;
	}

	async loadAssets(): Promise<void> {
		this.img = await loadImage(`${ASSETS_URN}/joystick.png`);
		this.spriteWidth = this.img.naturalWidth / 9;
		this.spriteHeight = this.img.naturalHeight;
	}

	build(): void {
		this.cont.style.cssText = `
			position: absolute;
			width: 183px;
			height: 202px;
			top: ${IS_MOBILE ? 254 : 493}px;
			left: ${IS_MOBILE ? 59 : 211}px;
			z-index: 3;
		`;

		this.el.style.cssText = `
			width: ${this.spriteWidth}px;
			height: ${this.spriteHeight}px;
			background-image: URL(${ASSETS_URN}/joystick.png);
			background-repeat: no-repeat;
			background-position: 0 0;
			margin: 10px 0 0 41px;
		`;
	}

	handle(pressedKeys: Set<string>): void {
		let spriteIndex = 0;
		if (pressedKeys.has('ArrowUp') && pressedKeys.has('ArrowRight')) {
			spriteIndex = 2;
		} else if (pressedKeys.has('ArrowUp') && pressedKeys.has('ArrowLeft')) {
			spriteIndex = 4;
		} else if (pressedKeys.has('ArrowDown') && pressedKeys.has('ArrowLeft')) {
			spriteIndex = 6;
		} else if (pressedKeys.has('ArrowDown') && pressedKeys.has('ArrowRight')) {
			spriteIndex = 8;
		} else if (pressedKeys.has('ArrowUp')) {
			spriteIndex = 3;
		} else if (pressedKeys.has('ArrowDown')) {
			spriteIndex = 7;
		} else if (pressedKeys.has('ArrowRight')) {
			spriteIndex = 1;
		} else if (pressedKeys.has('ArrowLeft')) {
			spriteIndex = 5;
		}

		if (spriteIndex !== this.spriteIndex) {
			this.spriteIndex = spriteIndex;
			this.el.style.backgroundPosition = `-${this.spriteWidth * spriteIndex}px 0`;
		}
	}

	private assignPointerEvents(): void {
		if ('ontouchstart' in document) {
			this.cont.addEventListener('touchstart', this.handleTouchStart, {passive: false});
			this.cont.addEventListener('touchmove', this.handleTouchMove, {passive: false});
			this.cont.addEventListener('touchend', this.handleTouchEnd, {passive: false});
		} else {
			this.cont.addEventListener('mousedown', this.handleMouseDown);
		}
	}

	private handleTouchStart = (e: TouchEvent): void => {
		if (this.touchId !== 0) {
			return;
		}

		const touch = e.targetTouches[0];
		this.touchId = touch.identifier;
		this.touchX = touch.clientX;
		this.touchY = touch.clientY;
	}

	private handleTouchMove = (e: TouchEvent): void => {
		e.preventDefault();
		e.stopPropagation();

		const touch = this.getTouchById(e.targetTouches);
		if (!touch) {
			return;
		}

		this.pressVirtualKeys(
			this.touchX - touch.clientX,
			this.touchY - touch.clientY
		);
	}

	private handleTouchEnd = (e: TouchEvent): void => {
		const touch = this.getTouchById(e.targetTouches);
		if (!touch) {
			this.touchId = 0;
			this.releaseAllVirtualKeys();
		}
	}

	private handleMouseDown = (e: MouseEvent): void => {
		this.touchX = e.clientX;
		this.touchY = e.clientY;

		document.addEventListener('mousemove', this.handleMouseMove, {capture: true});
		document.addEventListener('mouseup', this.handleMouseUp, {capture: true});
	}

	private handleMouseMove = (e: MouseEvent): void => {
		this.pressVirtualKeys(
			this.touchX - e.clientX,
			this.touchY - e.clientY
		);
	}

	private handleMouseUp = (): void => {
		this.releaseAllVirtualKeys();
		document.removeEventListener('mousemove', this.handleMouseMove, {capture: true});
		document.removeEventListener('mouseup', this.handleMouseUp, {capture: true});
	}

	private pressVirtualKeys(dx: number, dy: number): void {
		if (Math.abs(dx) < JOYSTICK_NEUTRAL_RADIUS && Math.abs(dy) < JOYSTICK_NEUTRAL_RADIUS) {
			this.releaseAllVirtualKeys();
			return;
		}

		const dir = Math.round((180 + (Math.atan2(dx, dy) * 180 / Math.PI)) / 45);

		const newVirtualKeys = KEYS_BY_DIRS[dir];
		for (const keyName of Array.from(this.pressedVirtualKeys)) {
			if (!newVirtualKeys.includes(keyName)) {
				this.pressedVirtualKeys.delete(keyName);
				document.dispatchEvent(new CustomEvent('custom-keyup', {detail: keyName}));
			}
		}

		for (const keyName of newVirtualKeys) {
			if (!this.pressedVirtualKeys.has(keyName)) {
				this.pressedVirtualKeys.add(keyName);
				document.dispatchEvent(new CustomEvent('custom-keydown', {detail: keyName}));
			}
		}
	}

	private releaseAllVirtualKeys(): void {
		for (const keyName of Array.from(this.pressedVirtualKeys)) {
			document.dispatchEvent(new CustomEvent('custom-keyup', {detail: keyName}));
		}

		this.pressedVirtualKeys.clear();
	}

	private getTouchById(list: TouchList): (Touch | undefined) {
		for (let i = 0; i < list.length; i++) {
			if (list[i].identifier === this.touchId) {
				return list[i];
			}
		}

		return undefined;
	}
}