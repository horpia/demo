
export function easeInExpo(y: number): number {
	return y === 0 ? 0 : Math.pow(2, 10 * y - 10);
}