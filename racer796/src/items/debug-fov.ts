import {FieldOfView} from "game/field-of-view";
import {Renderable} from "game/renderable";

export class DebugFov implements Renderable {
	private needRender = false;

	constructor(private readonly fov: FieldOfView) {
		this.fov.events.addListener('change', () => {
			this.needRender = true;
		});
	}

	render(ctx: CanvasRenderingContext2D) {
		this.drawFarRect(ctx);
		this.drawNearRect(ctx);
	}

	private drawFarRect(ctx: CanvasRenderingContext2D): void {
		const farRect = this.fov.getFarRect();
		ctx.strokeStyle = '#ff0000';
		ctx.beginPath();
		ctx.moveTo(farRect.left, farRect.top);
		ctx.lineTo(farRect.right, farRect.top);
		ctx.lineTo(farRect.right, farRect.bottom);
		ctx.lineTo(farRect.left, farRect.bottom);
		ctx.lineTo(farRect.left, farRect.top);
		ctx.stroke();
	}

	private drawNearRect(ctx: CanvasRenderingContext2D): void {
		const nearRect = this.fov.getNearRect();
		ctx.strokeStyle = '#00ff00';
		ctx.beginPath();
		ctx.moveTo(nearRect.left, nearRect.top);
		ctx.lineTo(nearRect.right, nearRect.top);
		ctx.lineTo(nearRect.right, nearRect.bottom);
		ctx.lineTo(nearRect.left, nearRect.bottom);
		ctx.lineTo(nearRect.left, nearRect.top);
		ctx.stroke();
	}
}