export function formatDate(time: number): string {
	const date = new Date(time);
	return date.getFullYear()
		+ '-' + String(date.getMonth() + 1).padStart(2, '0')
		+ '-' + String(date.getDate()).padStart(2, '0');
}