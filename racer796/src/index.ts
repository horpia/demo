import {Main} from "game/main";

document.addEventListener('DOMContentLoaded', async () => {
	const main = new Main();
	await main.start();

	main.appendTo(document.querySelector('#cont'));
});
