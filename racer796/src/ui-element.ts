export interface UIElement {
	getElement(): HTMLElement;
	build(): void;
}