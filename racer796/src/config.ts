import {BarrierProps} from "game/items/walls";

export const IS_MOBILE = top.innerWidth < 900;

export const ASSETS_URN = './assets';

export const FONT_NAME_16 = 'DOSFont16';
export const FONT_NAME_8 = 'DOSFont8';

export const SCREEN_WIDTH = 320;
export const SCREEN_HEIGHT = 240;

export const CANVAS_WIDTH = SCREEN_WIDTH << (IS_MOBILE ? 0 : 1);
export const CANVAS_HEIGHT = SCREEN_HEIGHT << (IS_MOBILE ? 0 : 1);

export const SAVE_TOKEN_LENGTH = 256;
export const SAVE_MIN_KEY_LENGTH = 16;
export const SAVE_URL = '/addon/racer796/save';

export const TITLE_COLOR = '#8c97a6';
export const TITLE_Y = 8;
export const TITLE_FONT_SIZE = 16;

export const NICKNAME_MAXLENGTH = 12;
export const NICKNAME_COLOR = '#ffffff';
export const NICKNAME_Y = 56;
export const NICKNAME_FONT_SIZE = 32;
export const NICKNAME_LOCAL_STORAGE_KEY = 'r796name';

export const KEYBOARD_Y = 75;
export const KEYBOARD_FONT_SIZE = 32;
export const KEYBOARD_COLOR = '#8c97a6';
export const KEYBOARD_HIGHLIGHT_COLOR = '#ffffff';
export const KEYBOARD_PADDING = 2;
export const KEYBOARD_KEY_PRESS_DELAY = 100;

export const SCORE_TABLE_Y = 30;
export const SCORE_TABLE_ROWS = 11;
export const SCORE_TABLE_COLS = [120, 60, 90, 10];
export const SCORE_TABLE_COLOR = '#ffffff';
export const SCORE_TABLE_FONT_SIZE = 16;
export const SCORE_TABLE_INDENT = 2;
export const SCORE_LOAD_URL = '/addon/racer796/results';

export const MENU_SHIP_Y = -10;
export const MENU_SHIP_X = -20;
export const MENU_SHIP_ANGLE_STEP = 10;
export const MENU_SHIP_DEVIATION = 6;
export const MENU_SHIP_SPRITES = 2;
export const MENU_BG_COLOR = '#232331';
export const MENU_STARS_COUNT = 80;
export const MENU_STAR_COLOR = '#ffffff';
export const MENU_STAR_MOVE_SPEED = 15;
export const MENU_STARS_ANGLE = -69;
export const MENU_STARS_AREA_WIDTH = SCREEN_WIDTH + (SCREEN_WIDTH >> 1);
export const MENU_STARS_AREA_HEIGHT = SCREEN_HEIGHT << 1;
export const MENU_STARS_AREA_TRANSLATE_X = -100;
export const MENU_STARS_AREA_TRANSLATE_Y = SCREEN_HEIGHT;
export const MENU_ITEMS_Y = 190;
export const MENU_ITEMS_X = 210;
export const MENU_ITEMS_FONT_SIZE = 16;
export const MENU_ITEMS_COLOR = '#8c97a6';
export const MENU_ITEMS_SELECTED_COLOR = '#ffffff';
export const MENU_ITEMS_PADDING = 3;

export const COPYRIGHT_Y = MENU_ITEMS_Y;
export const COPYRIGHT_X = 20;
export const COPYRIGHT_FONT_SIZE = 32;
export const COPYRIGHT_COLOR = '#d0eaff';
export const COPYRIGHT_SHADOW_COLOR = '#4d5d6c';

export const BG_SHIFT_STEP = 0.05;

export const FOV_LENGTH = 800;
export const FLY_SPEED = 5;
export const FLY_SPEED_ACCELERATOR = 0.5;
export const FLY_SPEED_FINISH_ACCELERATOR = 0.1;

export const FAR_RECT_SCALE = 0.05;
export const NEAR_RECT_SCALE = 1.2;
export const NEAR_RECT_SHIFT_LIMITS = {
	top: -60,
	left: -110,
	bottom: 70,
	right: 110
};
export const FRAME_TIME = Math.round(1000 / 24);

export const HP_BAR_WIDTH = 100;
export const HP_BAR_HEIGHT = 6;
export const HP_BAR_SKEW = 4;
export const HP_BAR_SEGMENT_WIDTH = 4;
export const HP_BAR_X = 20.5;
export const HP_BAR_Y = 10.5;
export const HP_BAR_BG_COLOR = '#2a2c34';
export const HP_BAR_BORDER_COLOR = '#141518';
export const HP_BAR_HEALTH_COLORS = ['#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc66', '#ffff99'];

export const GAME_OVER_TEXT_COLORS = ['#ff0000', '#ff5500'];
export const GAME_OVER_SHADOW_COLORS = ['#660000', '#990000'];
export const GAME_OVER_COLOR_DURATION = 500;
export const GAME_OVER_SCREEN_DELAY = 2000;

export const FINISH_TEXT_COLORS = ['#ccffff', '#33ff99', '#ffff33', '#ff99ff'];
export const FINISH_SHADOW_COLORS = ['#993300', '#003399', '#660066', '#006633'];
export const FINISH_COLOR_DURATION = 100;
export const FINISH_SCREEN_DELAY = 2000;

export const START_TIMER_COLOR = '#ffffff';
export const START_TIMER_SHADOW = '#2a2c34';
export const START_TIMER_DURATION = 1300;

export const COIN_SIZE = 20;
export const COIN_SPRITES = 4;
export const COIN_SPRITE_DURATION = 250;
export const COIN_FADEOUT_STEPS = 10;

export const COINS_BAR_X = 250;
export const COINS_BAR_Y = 10;
export const COINS_BAR_ICON_SIZE = COIN_SIZE >> 1;
export const COINS_BAR_COLOR = '#ffffff';
export const COINS_BAR_SHADOW_COLOR = '#2a2c34';
export const COINS_BAR_SCORE_X = 265;
export const COINS_BAR_SCORE_Y = 6;

export const FINISH_BAR_X = 150;
export const FINISH_BAR_Y = 9;
export const FINISH_BAR_PERCENT_X = FINISH_BAR_X + 21;
export const FINISH_BAR_PERCENT_Y = 6;

export const FLOOR_LINE_LENGTH = 40;
export const FLOOR_SHADOW_COLOR = '#2a2c34';
export const FLOOR_LINE_COLORS = ['#41464f', '#353941'];
export const FLOOR_LIGHT_COLORS = ['#97deff', '#a3ff97'];
export const FLOOR_LIGHT_SIZE = 4;
export const FLOOR_HORIZON_HEIGHT = 6;

export const WALL_DISTANCE = 40;
export const WALL_COLORS = ['#bbb', '#ddd'];
export const WALL_START_SCALE = 0.05;
export const WALL_SEQUENCE = [0, 1, 2, 8, 4, 3, 2, 2, 1, 4, 3, 8, 8, 0, 2, 1, 4];
export const WALL_ANIMATED = new Map<number,{sprites:number, duration: number}>([
	[6, {sprites: 2, duration: 500}],
	[12, {sprites: 3, duration: 1000}],
]);
export const WALL_BRIGHTNESS_FACTOR = 1000;
export const WALL_SHIP_POSITION = 0.94; // 0..1

export const SHIP_MAX_HP = 200;
export const SHIP_MOVE_STEP = 7;
export const SHIP_SPRITE_SIZE = 240;
export const SHIP_ANGLE_STEP = 7.5;
export const SHIP_TURN_MAX_ANGLE = 30;
export const SHIP_FLIP_MAX_ANGLE = 90;
export const SHIP_BLINK_DURATION = 40;
export const SHIP_MOVE_TO_FOV_COEFFICIENT = 0.2;
export const SHIP_SHIFT_Y = 50;
export const SHIP_ANGLE_SPRITES = new Map<number, number>([
	[0, 0],
	[15, 1],
	[30, 2],
	[45, 3],
	[60, 4],
	[75, 5],
	[-15, 6],
	[-30, 7],
	[-45, 8],
	[-60, 9],
	[-75, 10],
]);
export const SHIP_WAVE_ANGLE_STEP = 10;
export const SHIP_WAVE_SHIFT_LENGTH = 4;

export const COLLISION_AREA_SIZE = 20;
export const COLLISION_AREA_MIN_PIXELS = 3;
export const COLLISION_AREA_DAMAGE_HP = 30;

export const EXPLOSION_SPRITES = 8;
export const EXPLOSION_FRAME_DURATION = 80;
export const EXPLOSION_SIZE = 120;

export const START_WAIT_FRAMES = 40;
export const PATH_DISTANCE_FROM_START = 10;
export const PATH_DISTANCE_TO_FINISH = 5;

export const BARRIERS_DISTANCE_LINES = 2;
export const BARRIERS_COUNT = 100;
export const BARRIERS_COOL_DOWN_BUFFER_LENGTH = 8;
export const BARRIERS_THRESHOLD_SHAPE_CELL_VALUE = 5
export const BARRIERS_LINE_HEIGHT = 60;

export const BARRIER_TRAFFIC_LIGHTS: BarrierProps =  {img: 12, shape: []};
export const BARRIER_FINISH: BarrierProps =  {img: 13, shape: []};

export const BARRIERS: Array<BarrierProps> = [
	{
		img: 5,
		shape: [
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		]
	},
	{
		img: 6,
		shape: [
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
		]
	},
	{
		img: 7,
		col: 0,
		x: 10,
		shape: [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[1, 0, 0, 0],
		]
	},
	{
		img: 7,
		col: 1,
		x: 10,
		shape: [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 1, 0, 0],
		]
	},
	{
		img: 7,
		col: 2,
		x: 10,
		shape: [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 1, 0],
		]
	},
	{
		img: 7,
		col: 3,
		x: 10,
		shape: [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 1],
		]
	},
	{
		img: 9,
		col: 1,
		x: 40,
		shape: [
			[0, 0, 0, 0],
			[0, 1, 1, 1],
			[0, 1, 0, 0],
		]
	},
	{
		img: 9,
		col: 2,
		x: 40,
		shape: [
			[0, 0, 0, 0],
			[0, 0, 1, 1],
			[0, 0, 1, 0],
		]
	},
	{
		img: 9,
		col: 3,
		x: 40,
		shape: [
			[0, 0, 0, 0],
			[0, 0, 0, 1],
			[0, 0, 0, 1],
		]
	},
	{
		img: 9,
		col: 0,
		x: 40,
		flipped: true,
		shape: [
			[0, 0, 0, 0],
			[1, 0, 0, 0],
			[1, 0, 0, 0],
		]
	},
	{
		img: 9,
		col: 1,
		x: 40,
		flipped: true,
		shape: [
			[0, 0, 0, 0],
			[1, 1, 0, 0],
			[0, 1, 0, 0],
		]
	},
	{
		img: 9,
		col: 2,
		x: 40,
		flipped: true,
		shape: [
			[0, 0, 0, 0],
			[1, 1, 1, 0],
			[0, 0, 1, 0],
		]
	},
	{
		img: 10,
		col: 1,
		x: 40,
		shape: [
			[0, 1, 1, 1],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
		]
	},
	{
		img: 10,
		col: 2,
		x: 40,
		shape: [
			[0, 0, 1, 1],
			[0, 0, 1, 0],
			[0, 0, 1, 0],
		]
	},
	{
		img: 10,
		col: 3,
		x: 40,
		shape: [
			[0, 0, 0, 1],
			[0, 0, 0, 1],
			[0, 0, 0, 1],
		]
	},
	{
		img: 10,
		col: 0,
		x: 40,
		flipped: true,
		shape: [
			[1, 0, 0, 0],
			[1, 0, 0, 0],
			[1, 0, 0, 0],
		]
	},
	{
		img: 10,
		col: 1,
		x: 40,
		flipped: true,
		shape: [
			[1, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
		]
	},
	{
		img: 10,
		col: 2,
		x: 40,
		flipped: true,
		shape: [
			[1, 1, 1, 0],
			[0, 0, 1, 0],
			[0, 0, 1, 0],
		]
	},
	{
		img: 11,
		col: 1,
		x: 60,
		shape: [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 1, 1, 1],
		]
	},
	{
		img: 11,
		col: 2,
		x: 60,
		shape: [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 1, 1],
		]
	},
	{
		img: 11,
		col: 3,
		x: 60,
		shape: [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 1],
		]
	},
	{
		img: 11,
		col: 0,
		x: 60,
		flipped: true,
		shape: [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[1, 0, 0, 0],
		]
	},
	{
		img: 11,
		col: 1,
		x: 60,
		flipped: true,
		shape: [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[1, 1, 0, 0],
		]
	},
	{
		img: 11,
		col: 2,
		x: 60,
		flipped: true,
		shape: [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[1, 1, 1, 0],
		]
	},
];

export const JOYSTICK_NEUTRAL_RADIUS = 10;
export const VIRTUAL_KEY_TIMEOUT = 40;

