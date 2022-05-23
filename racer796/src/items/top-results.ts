import {Renderable} from "game/renderable";
import {ScreenItem} from "game/screen-item";
import {Renderer} from "game/renderer";
import {KeyboardController} from "game/keyboard-controllers/keyboard-controller";
import {TopResultsController} from "game/keyboard-controllers/handlers/top-results-controller";
import {
	ASSETS_URN,
	FONT_NAME_16, SCORE_TABLE_COLOR,
	SCORE_TABLE_COLS, SCORE_TABLE_FONT_SIZE, SCORE_TABLE_INDENT,
	SCORE_TABLE_ROWS, SCORE_TABLE_Y,
	SCREEN_WIDTH,
	TITLE_COLOR,
	TITLE_FONT_SIZE,
	TITLE_Y
} from "game/config";
import {ScoreRecord, ScoreTable} from "game/models/score-table";
import {formatDate} from "game/helpers/datetime";
import {EventsDispatcher} from "game/events-dispatcher";
import {AssetsItem} from "game/assets-item";
import {loadImage} from "game/helpers/images";
import {AssetsLoader} from "game/assets-loader";

export class TopResults implements Renderable, ScreenItem, AssetsItem {
	private readonly keyboardHandler: TopResultsController;
	private titleWidth = 0;
	private recs: ScoreRecord[] = [];
	private scrollY = 0;
	private readonly tableWidth: number;
	private readonly tableX: number;
	private loading = false;
	private bg?: HTMLImageElement;
	readonly events = new EventsDispatcher();

	constructor(
		private readonly renderer: Renderer,
		private readonly loader: AssetsLoader,
		private readonly keyboardController: KeyboardController
	) {
		this.loader.addItem(this);
		this.keyboardHandler = new TopResultsController(this);
		this.tableWidth = SCORE_TABLE_COLS.reduce((acc, v) => acc + v, 0);
		this.tableX = (SCREEN_WIDTH >> 1) - (this.tableWidth >> 1);
	}

	async loadAssets(): Promise<void> {
		this.bg = await loadImage(`${ASSETS_URN}/station-bg.gif`);
	}

	attach(): void {
		this.renderer.addItem(this);
		this.keyboardController.addHandler(this.keyboardHandler);
		this.load().then();
	}

	detach(): void {
		this.renderer.removeItem(this);
		this.keyboardController.removeHandler(this.keyboardHandler);
	}

	render(ctx: CanvasRenderingContext2D): void {
		ctx.drawImage(this.bg, 0, 0);

		this.drawTitle(ctx);
		this.drawTable(ctx);
		this.drawArrows(ctx);
	}

	scroll(dy: number): void {
		this.scrollY = Math.max(0, Math.min(Math.max(0, this.recs.length - SCORE_TABLE_ROWS), this.scrollY + dy));
		this.renderer.requestRender();
	}

	close(): void {
		this.events.trigger('close');
	}

	private async load(): Promise<void> {
		this.loading = true;
		this.recs = await new ScoreTable().getList();
		this.loading = false;
		this.renderer.requestRender();
	}

	private drawTitle(ctx: CanvasRenderingContext2D): void {
		const text = 'TOP SCORES';
		ctx.font = `${TITLE_FONT_SIZE}px "${FONT_NAME_16}"`;

		if (this.titleWidth === 0) {
			this.titleWidth = ctx.measureText(text).width;
		}

		ctx.textBaseline = 'top';
		ctx.fillStyle = TITLE_COLOR;
		ctx.fillText(text, (SCREEN_WIDTH >> 1) - (this.titleWidth >> 1), TITLE_Y);
	}

	private drawTable(ctx: CanvasRenderingContext2D): void {
		ctx.font = `${SCORE_TABLE_FONT_SIZE}px "${FONT_NAME_16}"`;
		ctx.textBaseline = 'top';
		ctx.fillStyle = SCORE_TABLE_COLOR;

		const rowHeight = SCORE_TABLE_FONT_SIZE + SCORE_TABLE_INDENT;

		if (this.loading) {
			ctx.fillText('loading...', this.tableX, SCORE_TABLE_Y);
			return;
		} else if (this.recs.length === 0) {
			ctx.fillText('no results yet...', this.tableX, SCORE_TABLE_Y);
			return;
		}

		for (let r = 0; r < SCORE_TABLE_ROWS; r++) {
			if (!this.recs[this.scrollY + r]) {
				break;
			}

			let x = this.tableX;
			let y = SCORE_TABLE_Y + r * rowHeight;
			const rec = this.recs[this.scrollY + r];

			ctx.fillText(rec.name, x, y);

			x += SCORE_TABLE_COLS[0];
			ctx.fillText(String(rec.score), x, y);

			x += SCORE_TABLE_COLS[1];
			ctx.fillText(String(formatDate(rec.created_at * 1000)), x, y);
		}
	}

	private drawArrows(ctx: CanvasRenderingContext2D): void {
		ctx.font = `${SCORE_TABLE_FONT_SIZE}px "${FONT_NAME_16}"`;
		ctx.textBaseline = 'top';
		ctx.fillStyle = SCORE_TABLE_COLOR;

		const rowHeight = SCORE_TABLE_FONT_SIZE + SCORE_TABLE_INDENT;

		if (this.scrollY > 0) {
			ctx.fillText('▲', this.tableX + this.tableWidth - SCORE_TABLE_COLS[3], SCORE_TABLE_Y);
		}

		if (this.scrollY < this.recs.length - SCORE_TABLE_ROWS) {
			ctx.fillText(
				'▼',
				this.tableX + this.tableWidth - SCORE_TABLE_COLS[3],
				SCORE_TABLE_Y + (SCORE_TABLE_FONT_SIZE + SCORE_TABLE_INDENT) * (SCORE_TABLE_ROWS - 1)
			);
		}
	}
}