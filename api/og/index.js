const fs = require('fs');
const { parse } = require('url');
const fetch = require('node-fetch');
const { createCanvas, loadImage, registerFont } = require('canvas');

// Hack to get the libuuid, etc. included in the serverless function
console.log(fs.readdirSync(__dirname + '/../../lib'));

/* Load Archivo font */
registerFont(__dirname + '/fonts/archivo_bold.ttf', {
	family: 'Archivo',
	weight: 'bold',
});

/* Dimensions */
const WIDTH = 1400;
const HEIGHT = 800;

/* Styles */
const color = '#ffffff';
const backgroundColor = '#000000';

const logoPromise = loadImage(__dirname + '/images/import.png');
const arrowPromise = loadImage(__dirname + '/images/arrow.png');

async function fetchImage(url) {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`${url} failed ${res.status}`);
	}
	const image = await loadImage(await res.buffer());
	return image;
}

async function handler(req, res) {
	const {
		pathname,
		query: { debug },
	} = parse(req.url, true);
	let [org, repo] = pathname.split('/').slice(3);

	if (!repo) {
		repo = org;
		org = null;
	}

	const ops = [logoPromise];
	if (org) {
		const avatarUrl = `https://github.com/${org}.png`;
		ops.push(fetchImage(avatarUrl), arrowPromise);
	}
	const [logo, avatar, arrow] = await Promise.all(ops);

	const canvas = createCanvas(WIDTH, HEIGHT);
	const ctx = canvas.getContext('2d');
	ctx.patternQuality = 'best';

	// Measure title dimensions
	ctx.font = 'bold 4.4em Archivo';
	const text = ctx.measureText(repo);
	const textWidth = text.width;
	const textHeight =
		text.actualBoundingBoxAscent + text.actualBoundingBoxDescent;

	const logoWidth = logo.width * 0.465;
	const logoHeight = logo.height * 0.465;

	const avatarWidth = logoHeight;
	const avatarHeight = logoHeight;

	const padding = 40;

	const boundingBoxWidth = textWidth + logoWidth + padding;
	//const boundingBoxHeight = Math.max(textHeight, logoHeight, avatarHeight);
	const boundingBoxHeight = Math.max(textHeight, logoHeight);
	const boundingBoxX = WIDTH / 2 - boundingBoxWidth / 2;
	const boundingBoxY = HEIGHT / 2 - boundingBoxHeight / 2;

	// Draw background
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	if (debug) {
		// Draw bounding box (debug)
		ctx.fillStyle = 'red';
		ctx.fillRect(
			boundingBoxX,
			boundingBoxY,
			boundingBoxWidth,
			boundingBoxHeight
		);
	}

	ctx.fillStyle = 'blue';
	//ctx.fillRect(WIDTH / 2, 0, 1, HEIGHT);
	//ctx.fillRect(0, HEIGHT / 2, WIDTH, 1);

	let logoX = boundingBoxX;
	let logoY = boundingBoxY;
	let titleX = boundingBoxX + logoWidth + padding;
	let titleY = HEIGHT / 2;
	let textBaseline = 'middle';

	if (avatar) {
		// Draw avatar
		let avatarX = WIDTH / 2 + padding * 2;
		let avatarY = HEIGHT / 2 - avatarHeight - padding;
		ctx.drawImage(avatar, avatarX, avatarY, avatarWidth, avatarHeight);

		// Draw arrow
		let arrowWidth = arrow.width * 0.5;
		let arrowHeight = arrow.height * 0.5;
		let arrowX = WIDTH / 2 - arrowWidth / 2;
		let arrowY = HEIGHT / 2 - arrowHeight / 2 - avatarHeight / 2 - padding;
		ctx.drawImage(arrow, arrowX, arrowY, arrowWidth, arrowHeight);

		// Adjust title
		textBaseline = 'top';
		titleX = WIDTH / 2 - textWidth / 2;
		titleY += padding;

		// Adjust logo
		logoX = WIDTH / 2 - logoWidth - padding * 2;
		logoY = HEIGHT / 2 - logoHeight - padding;
	}

	// Draw logo
	ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

	// Draw title
	ctx.textBaseline = textBaseline;
	ctx.fillStyle = color;
	ctx.fillText(repo, titleX, titleY);

	res.setHeader('Content-Type', 'image/png');
	res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
	canvas.createPNGStream().pipe(res);
}

module.exports = handler;
