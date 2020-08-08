/* eslint-disable no-param-reassign */

import tmi from 'tmi.js';
import Drop from './Drop';
import ImageManager from './ImageManager';
import DropManager from './DropManager';
import FontInconsolata from '../assets/fonts/Inconsolata-Regular.ttf';
import {promisify} from 'util';
import { Renderer, Shader } from 'p5';


import lightingShader from '../shaders/lighting.glsl';
import lightingShaderVert from '../shaders/lighting.vert';
import lightingShaderFrag from '../shaders/lighting.frag';


const goFaster = true;
/** Z-sorted draws: slow
 * Ideally implement Order-independent transparency: depth-peeling etc
*/
const zSort = false;

const client = new tmi.Client({
	connection: {
		secure: true,
		reconnect: true
	},
	channels: [ 'codinggarden' ]
});

client.connect();

/**
 * @param {import('p5')} p5
 */
export default function sketch(p5) {
  // const drops = [];
  const imageManager = new ImageManager(p5);
  const dropManager = new DropManager(p5);

  if (goFaster) p5.disableFriendlyErrors = true;

  let testShader;

  let dropZCounter = 0;
  /**
   * @param {string} imageUrl
   */
  async function doDrop(imageUrl) {
    const dropZIndex = dropZCounter += 10;
    const image = await imageManager.getImage(imageUrl);
    dropManager.add(new Drop(p5, image, imageUrl, dropZIndex));
  }


  for (let i = 0; i < 200; i++) {
    doDrop(`https://static-cdn.jtvnw.net/emoticons/v1/303046121/4.0`); // codinggAah
    doDrop(`https://static-cdn.jtvnw.net/emoticons/v1/302039277/4.0`); // codinggBeans
    doDrop(`https://static-cdn.jtvnw.net/emoticons/v1/301988022/4.0`); // codinggYerba
    doDrop(`https://cors-anywhere.herokuapp.com/https://cdn.betterttv.net/emote/5ada077451d4120ea3918426/3x`); // blob
    doDrop(`https://cors-anywhere.herokuapp.com/https://cdn.betterttv.net/emote/5abc0096a05ad63caeccbe58/3x`); // coggers
    doDrop(`https://cors-anywhere.herokuapp.com/https://cdn.betterttv.net/emote/59f06613ba7cdd47e9a4cad2/3x`); // partyparrot
  }

  client.on('message', async (channel, tags, message, self) => {
    if (message.startsWith('!drop') && tags.emotes) {
      const emoteIds = Object.keys(tags.emotes);
      const emoteId = p5.random(emoteIds);
      doDrop(`https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/4.0`);
    }
  });

  const debugColor = p5.color(255, 0, 0, 255);
  let debugFont;
  p5.loadFont(FontInconsolata, f => debugFont = f);
  p5.setup = async () => {
    p5.frameRate(144);


    /*
      P5 transparency ordering issue
      https://github.com/processing/p5.js/issues/3736
    */
    // if (!zSort) p5.setAttributes('depth', false);
    // if (!zSort) p5.setAttributes('alpha', false);
    p5.setAttributes('perPixelLighting', false);
    console.log(p5._renderer);

    const renderer = p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
    // // @ts-ignore
    // if (!zSort) renderer.drawingContext.disable(renderer.drawingContext.DEPTH_TEST);
    if (!zSort) {
      renderer.drawingContext.disable(renderer.drawingContext.SAMPLE_ALPHA_TO_COVERAGE);
      // renderer.drawingContext.enable(renderer.drawingContext.ALPHA_TEST);
    }


    p5.ortho(0, p5.windowWidth, -p5.windowHeight, 0, 200000, -200000);
    // testShader = p5.createShader();

  };


  let debugText = '';

  let output = false;

  p5.draw = () => {
    if (!testShader) {
      testShader = new Shader(p5._renderer,
        lightingShader + lightingShaderVert,
        lightingShaderFrag,
      );
    }
    p5._renderer._defaultLightShader = testShader;
    p5.orbitControl();
    p5.clear();
    // p5.translate(-p5.windowWidth/2, -p5.windowHeight/2);
    if (debugFont) {
      p5.fill(debugColor);
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.textSize(32);
      p5.textFont(debugFont);
      p5.text(`FPS: ${p5.frameRate().toFixed(1)}\n${debugText}`, 0, 0);
    }

    p5.noFill();
    p5.noStroke();

    if (zSort) {
      /** Z-sorted draws, slow! */
      for (const zIndex in dropManager.zIndices) {
        const drop = dropManager.zIndices[zIndex];
        const {image, position} = drop;
        p5.push();
          p5.texture(image);

          p5.translate(position.x, position.y, -zIndex);
          p5.plane(image.width, image.height, 1, 1);
        p5.pop();
        drop.update();
      }
    } else {
      const batches = [];
      for (const [imageURL, {image, drops}] of dropManager.collection) {
        p5.push();
        p5.texture(image);
        for (const drop of drops) {
          p5.push();
            p5.translate(drop.position.x, drop.position.y, drop.zIndex - dropManager.minZIndex);
            p5.plane(image.width, image.height, 1, 1);
          p5.pop();
          drop.update();
        }
        batches.push(drops.size);
        p5.pop();
      }

      if (!output) {
        output = true;
      console.log(p5);
      }
      debugText = `Draws: ${batches.join(',')}`;
    }
  };
}
