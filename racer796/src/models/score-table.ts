import {SAVE_MIN_KEY_LENGTH, SAVE_TOKEN_LENGTH, SAVE_URL, SCORE_LOAD_URL} from "game/config";

export interface ScoreRecord {
	name: string,
	score: number,
	created_at: number
}

export class ScoreTable {
	async getList(): Promise<ScoreRecord[]> {
		try {
			const res = await fetch(SCORE_LOAD_URL);
			return await res.json();
		} catch (e) {}
		return [];
	}

	async save(name: string, score: number): Promise<void> {
		const key = ScoreTable.generateKey();
		const srcToken = ScoreTable.generateSrcToken(key);
		const token = ScoreTable.shiftToken(score, srcToken);

		const keyStr = encodeURIComponent(window.btoa(String.fromCharCode.apply(null, key)));
		const tokenStr = encodeURIComponent(window.btoa(String.fromCharCode.apply(null, token)));

		try {
			const res = await fetch(SAVE_URL, {
				method: 'POST',
				mode: 'cors',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: `name=${name}&key=${keyStr}&token=${tokenStr}`
			});
			await res.json();
		} catch (e) {}
	}

	private static generateKey(): Uint8Array {
		const len = SAVE_MIN_KEY_LENGTH + Math.ceil(Math.random() * 10);
		const arr = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			arr[i] = Math.floor(Math.random() * 256);
		}
		return arr;
	}

	private static generateSrcToken(key: Uint8Array): Uint8Array {
		const ua = navigator.userAgent.split('').map(v => v.charCodeAt(0));
		const out = new Uint8Array(SAVE_TOKEN_LENGTH);

		for (let i = 0; i < SAVE_TOKEN_LENGTH; i++) {
			let code = key[i % key.length];
			out[i] = (code + (ua[i % ua.length] + i)) % 256;
		}

		return out;
	}

	private static shiftToken(score: number, token: Uint8Array): Uint8Array {
		const out = new Uint8Array(SAVE_TOKEN_LENGTH);
		for (let i = 0; i < SAVE_TOKEN_LENGTH; i++) {
			out[i] = (token[i] + score) % 256;
		}

		return out;
	}
}