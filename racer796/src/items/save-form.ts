import {Renderable} from "game/renderable";
import {KeyboardController} from "game/keyboard-controllers/keyboard-controller";
import {ScreenItem} from "game/screen-item";
import {Renderer} from "game/renderer";
import {
	FONT_NAME_16,
	KEYBOARD_COLOR,
	KEYBOARD_FONT_SIZE,
	KEYBOARD_HIGHLIGHT_COLOR,
	KEYBOARD_KEY_PRESS_DELAY,
	KEYBOARD_PADDING,
	KEYBOARD_Y,
	NICKNAME_COLOR,
	NICKNAME_FONT_SIZE, NICKNAME_LOCAL_STORAGE_KEY,
	NICKNAME_MAXLENGTH,
	NICKNAME_Y,
	SCREEN_WIDTH,
	TITLE_COLOR,
	TITLE_FONT_SIZE,
	TITLE_Y
} from "game/config";
import {SaveFormController} from "game/keyboard-controllers/handlers/save-form-controller";
import {EventsDispatcher} from "game/events-dispatcher";
import {ScoreTable} from "game/models/score-table";

const KEYBOARD = [
	'QWERTYUIOP',
	'ASDFGHJKL\'',
	'ZXCVBNM.-_',
	'1234567890',
];

enum KEYS {
	BACKSPACE = '⟵',
	ENTER = '✓'
}

export class SaveForm implements Renderable, ScreenItem {
	private text = '';
	private letterWidth = 0;
	private titleWidth = 0;
	private offsetX = 0;
	private offsetXLastTime = 0;
	private offsetXLastValue = 0;
	private offsetY = 0;
	private offsetYLastTime = 0;
	private offsetYLastValue = 0;
	private applyLastChar = '';
	private applyLastTime = 0;
	private selectedChar = 'Q';
	private saveInProgress = false;
	private score = 0;
	private readonly keyboardHandler: SaveFormController;
	readonly events = new EventsDispatcher();

	constructor(
		private readonly renderer: Renderer,
		private readonly keyboardController: KeyboardController
	) {
		this.keyboardHandler = new SaveFormController(this);
	}

	attach(): void {
		this.text = String(
			window.localStorage.getItem(NICKNAME_LOCAL_STORAGE_KEY) || ''
		).substring(0, NICKNAME_MAXLENGTH);
		this.renderer.addItem(this);
		this.keyboardController.addHandler(this.keyboardHandler);
	}

	detach(): void {
		this.renderer.removeItem(this);
		this.keyboardController.removeHandler(this.keyboardHandler);
	}

	render(ctx: CanvasRenderingContext2D): void {
		this.drawTitle(ctx);
		this.drawInput(ctx);
		this.drawKeyboard(ctx);
	}

	setScore(score: number): void {
		this.score = score;
	}

	applyKey(): void {
		const time = Date.now();
		if (this.selectedChar === this.applyLastChar && time - this.applyLastTime < KEYBOARD_KEY_PRESS_DELAY) {
			return;
		}

		this.applyLastChar = this.selectedChar;
		this.applyLastTime = time;

		if (this.selectedChar === KEYS.BACKSPACE) {
			if (this.text.length > 0) {
				this.text = this.text.substring(0, this.text.length - 1);
			}
		} else if (this.selectedChar === KEYS.ENTER) {
			if (!this.saveInProgress) {
				this.saveInProgress = true;
				this.save().then(() => {
					this.saveInProgress = false;
				});
			}
		} else {
			if (this.text.length < NICKNAME_MAXLENGTH) {
				this.text += this.selectedChar;
			}
		}

		this.renderer.requestRender();
	}
	
	async save(): Promise<void> {
		if (this.text !== '') {
			window.localStorage.setItem(NICKNAME_LOCAL_STORAGE_KEY, this.text);
			await (new ScoreTable()).save(this.text, this.score);
		}
		this.events.trigger('saved');
	}

	moveFocus(dx: number, dy: number): void {
		const time = Date.now();
		if (dx === this.offsetXLastValue && time - this.offsetXLastTime < KEYBOARD_KEY_PRESS_DELAY) {
			dx = 0;
		} else {
			this.offsetXLastValue = dx;
			this.offsetXLastTime = time;
		}

		if (dy === this.offsetYLastValue && time - this.offsetYLastTime < KEYBOARD_KEY_PRESS_DELAY) {
			dy = 0;
		} else {
			this.offsetYLastValue = dy;
			this.offsetYLastTime = time;
		}

		this.offsetX = Math.max(0, Math.min(KEYBOARD[0].length, this.offsetX + dx));
		this.offsetY = Math.max(0, Math.min(KEYBOARD.length - 1, this.offsetY + dy));

		if (this.offsetX === KEYBOARD[0].length) {
			if (this.offsetY === 0) {
				this.selectedChar = KEYS.BACKSPACE;
			} else {
				this.selectedChar = KEYS.ENTER;
			}
		} else {
			this.selectedChar = KEYBOARD[this.offsetY].charAt(this.offsetX);
		}

		this.renderer.requestRender();
	}

	private drawTitle(ctx: CanvasRenderingContext2D): void {
		const text = 'ENTER YOUR NAME';
		ctx.font = `${TITLE_FONT_SIZE}px "${FONT_NAME_16}"`;

		if (this.titleWidth === 0) {
			this.titleWidth = ctx.measureText(text).width;
		}

		ctx.textBaseline = 'top';
		ctx.fillStyle = TITLE_COLOR;
		ctx.fillText(text, (SCREEN_WIDTH >> 1) - (this.titleWidth >> 1), TITLE_Y);
	}

	private drawInput(ctx: CanvasRenderingContext2D): void {
		ctx.font = `${NICKNAME_FONT_SIZE}px "${FONT_NAME_16}"`;

		if (this.letterWidth === 0) {
			this.letterWidth = ctx.measureText('A').width;
		}

		const width = NICKNAME_MAXLENGTH * this.letterWidth;
		const startX = (SCREEN_WIDTH >> 1) - (width >> 1);

		ctx.strokeStyle = NICKNAME_COLOR;
		ctx.lineWidth = 1;

		for (let i = 0; i < NICKNAME_MAXLENGTH; i++) {
			const x = startX + (i * this.letterWidth);
			ctx.beginPath();
			ctx.moveTo(x + 1, NICKNAME_Y + 0.5);
			ctx.lineTo(x + this.letterWidth - 2, NICKNAME_Y + 0.5);
			ctx.stroke();
		}

		ctx.textBaseline = 'bottom';
		ctx.fillStyle = NICKNAME_COLOR;
		ctx.fillText(this.text, startX, NICKNAME_Y);
	}

	private drawKeyboard(ctx: CanvasRenderingContext2D): void {
		ctx.font = `${KEYBOARD_FONT_SIZE}px "${FONT_NAME_16}"`;
		ctx.textBaseline = 'top';

		ctx.fillStyle = KEYBOARD_COLOR;
		ctx.strokeStyle = KEYBOARD_COLOR;
		this.drawKeys(false, ctx);

		ctx.strokeStyle = KEYBOARD_HIGHLIGHT_COLOR;
		ctx.fillStyle = KEYBOARD_HIGHLIGHT_COLOR;
		this.drawKeys(true, ctx);
	}

	private drawKeys(onlySelected: boolean, ctx: CanvasRenderingContext2D): void {
		const centerX = SCREEN_WIDTH >> 1;
		const padding = KEYBOARD_PADDING << 1;
		const keyWidth = this.letterWidth + padding + padding;
		const keyHeight = KEYBOARD_FONT_SIZE + padding;
		const width = (KEYBOARD[0].length + 2) * keyWidth;
		const startX = centerX - (width >> 1);

		let y = KEYBOARD_Y;

		for (let i = 0; i < KEYBOARD.length; i++) {
			const keys = KEYBOARD[i];
			for (let j = 0; j < keys.length; j++) {
				const char = keys.charAt(j);
				if (onlySelected && char !== this.selectedChar) {
					continue;
				}
				ctx.fillText(keys.charAt(j), startX + j * keyWidth + padding, y + KEYBOARD_PADDING);
				ctx.strokeRect(startX + j * keyWidth - 0.5, y - 0.5, keyWidth, keyHeight);
			}

			y += keyHeight;
		}

		let x = startX + KEYBOARD[0].length * keyWidth - 0.5;
		if (!onlySelected || this.selectedChar === '⟵') {
			ctx.strokeRect(x, KEYBOARD_Y - 0.5, keyWidth << 1, keyHeight);
			ctx.fillText(KEYS.BACKSPACE, x + padding, KEYBOARD_Y - KEYBOARD_PADDING + 4);
		}

		if (!onlySelected || this.selectedChar === '✓') {
			ctx.strokeRect(x, KEYBOARD_Y + keyHeight - 0.5, keyWidth << 1, keyHeight * 3);
			ctx.fillText(KEYS.ENTER, x + (this.letterWidth >> 1) + padding, KEYBOARD_Y + keyHeight * 2 + KEYBOARD_PADDING);
		}
	}
}