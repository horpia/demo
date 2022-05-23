import {AssetsItem} from "game/assets-item";

export class AssetsLoader {
	private items: Set<AssetsItem> = new Set<AssetsItem>();

	addItem(item: AssetsItem): void {
		this.items.add(item);
	}

	async load(): Promise<void> {
		await Promise.all(Array.from(this.items).map(item => item.loadAssets()));
	}
}