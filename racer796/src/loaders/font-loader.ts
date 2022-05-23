import {AssetsItem} from "game/assets-item";
import {ASSETS_URN, FONT_NAME_16, FONT_NAME_8} from "game/config";

export class FontLoader implements AssetsItem {
	async loadAssets(): Promise<void> {
		const font16 = new FontFace(FONT_NAME_16, `url(${ASSETS_URN}/ModernDOS8x14.woff2)`);
		const font8 = new FontFace(FONT_NAME_8, `url(${ASSETS_URN}/ModernDOS8x8.woff2)`);
		await Promise.all([font16.load(), font8.load()]);
		// @ts-ignore
		document.fonts.add(font16);
		// @ts-ignore
		document.fonts.add(font8);
	}
}