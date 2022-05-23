const loadedImages = new Map<string, HTMLImageElement>();

export function loadImage(url: string): Promise<HTMLImageElement> {
	if (loadedImages.has(url)) {
		return Promise.resolve(loadedImages.get(url));
	}

	return new Promise((resolve: (i: HTMLImageElement) => void, reject: () => void) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.src = url;
		img.onerror = () => reject();
		img.onload = () => resolve(img);
		loadedImages.set(url, img);
	});
}

export function flipImage(img: HTMLImageElement, byX: boolean, byY: boolean): Promise<HTMLImageElement> {
	const c = document.createElement('canvas');
	c.width = img.naturalWidth;
	c.height = img.naturalHeight;
	const ctx = c.getContext('2d');
	ctx.translate(
		byX ? img.naturalWidth : 0,
		byY ? img.naturalHeight : 0
	)
	ctx.scale(byX ? -1 : 1, byY ? -1 : 1);
	ctx.drawImage(img, 0, 0);

	return new Promise((resolve) => {
		const img2 = new Image();
		img2.src = c.toDataURL('image/png');
		img2.onload = () => resolve(img2);
	});
}
