/* eslint-disable no-console, import/no-extraneous-dependencies */

const Jimp = require('jimp');
const ApiBuilder = require('claudia-api-builder'),
  api = new ApiBuilder();
const fs = require('fs');
const path = require('path');


const estatDelCel = require('./estatCelIcons.json');
// const sun = 'icons/cloudy_day.png'

const SCREEN_WIDTH = 600;
const SCREEN_HEIGHT = 800;

module.exports = api;

const loadData = () => {
  const comarcal = require('./comarcal.json');

}

const writeTemp = async (image, temp, inFont, x, y) => {
  const font = await Jimp.loadFont(inFont);

  image.print(font, x, y, `${temp.toString()}`);
}

const todayMin = async (base, temp) => {
  await writeTemp(base, temp, Jimp.FONT_SANS_128_BLACK, SCREEN_WIDTH / 4 - 64, 320);
}

const todayMax = async (base, temp) => {
  await writeTemp(base, temp, Jimp.FONT_SANS_128_BLACK, 3 * SCREEN_WIDTH / 4 - 64, 320);
}


const getIcon = async (id, size) => {
  const icon = await Jimp.read(path.join(__dirname, getEstatDelCelIcon(id)));
  await icon
    .autocrop()
    .resize(Jimp.AUTO, size);
  
  return icon;
}

const getBigIcon = async (id) => {
  return await getIcon(id, 200);
}

const getEstatDelCelIcon = (id) => {
  const estat = estatDelCel.filter( estat => estat.codi === id.toString());
  if (estat.length === 0) {
    return estatDelCel[0].icon; // First elem is question mark
  } else {
    return estat[0].icon;
  }
}

const getImage = async () => {
  // const wAssets = new WeatherAssets(256, 64);
  const base = await createBase();

  let id = Math.floor(Math.random() * Math.floor(estatDelCel.length));
  const morningIcon = await getBigIcon(id);

  id = Math.floor(Math.random() * Math.floor(estatDelCel.length));
  const afternoonIcon = await getBigIcon(id);

  base
    .blit(morningIcon, (SCREEN_WIDTH / 2 - morningIcon.getWidth() / 2), 50)
    .blit(afternoonIcon, (SCREEN_WIDTH / 2 - afternoonIcon.getWidth() / 2), 550)
    .colorType(0);

  await todayMin(base, 20);
  await todayMax(base, 21);

  return await base.getBufferAsync(Jimp.MIME_PNG);
}

api.get('/hello', async () => {
  return await getImage();
}, { success: { contentType: 'image/png', contentHandling: 'CONVERT_TO_BINARY'}});


const createBase = async () => {
  return await new Jimp(SCREEN_WIDTH, SCREEN_HEIGHT, 0xffffffff);
}

const main = async () => {
  // console.log(await getImage());
  fs.writeFileSync('out.png', await getImage());
}

if (process.env.NODE_ENV === 'DEV') {
  // main();
  loadData();
}