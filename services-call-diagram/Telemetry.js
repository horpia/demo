
export class Telemetry {
	#scripts = [];
	/**
	 * @type {Map<string,array>}
	 */
	#logsByName = new Map();
	/**
	 * @type {ServicesDiagram}
	 */
	#diagram;
	#el;

	/**
	 * @param {ServicesDiagram} diagram
	 */
	constructor(diagram) {
		this.#diagram = diagram;
		this.#el = document.createElement('div');
		this.#load();
	}

	get element() {
		return this.#el;
	}

	async #load() {
		this.#scripts = await (await fetch('./data.json')).json();
		for (const {name, title, log} of this.#scripts) {
			this.#logsByName.set(name, log);
			this.#el.appendChild(this.#createButton(title, name));
		}
	}

	#createButton(title, scriptName) {
		const el = document.createElement('div');
		el.textContent = title;
		el.dataset.name = scriptName;
		el.onclick = () => this.#selectScript(scriptName);
		return el;
	}

	#selectScript(scriptName) {
		this.#el.querySelector('.selected')?.classList?.remove('selected');
		this.#el.querySelector(`div[data-name="${scriptName}"]`).classList.add('selected');
		this.#diagram.playTelemetry(this.#logsByName.get(scriptName));
	}
}