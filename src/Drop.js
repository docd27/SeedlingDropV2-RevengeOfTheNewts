import { Vector } from 'p5';

export default class Drop {
  /**
   * @param {import('p5')} p5
   * @param {import('p5').Image} image
   * @param {string} imageURL Tracked but not used
   * @param {Number} zIndex positive integer
   */
  constructor(p5, image, imageURL, zIndex) {
    this.p5 = p5;
    this.image = image;
    this.imageURL = imageURL;
    this.imageWidthHalf = image.width / 2;
    this.imageHeightHalf = image.height / 2;
    this.landed = false;
    this.zIndex = zIndex;
    this.position = p5.createVector(
      p5.random(0, p5.windowWidth - image.width),
      -100,
    );
    this.velocity = Vector.fromAngle(
      p5.random(p5.PI * 0.1, p5.PI * 0.9),
      p5.random(3, 7),
    );
  }

  // draw() {
  //   this.p5.push();
  //   // this.p5.texture(this.image);
  //   this.p5.translate(this.position.x, this.position.y, 0);
  //   this.p5.plane(this.image.width, this.image.height, 1, 1);
  //   this.p5.pop();

  //   // this.p5.image(
  //   //   this.image,
  //   //   this.position.x,
  //   //   this.position.y,
  //   // );
  // }

  update() {
    const { position, velocity, p5, image, landed } = this;
    if (landed) return;
    position.add(velocity);
    if (position.x <= this.imageWidthHalf) {
      velocity.mult(-1, 1);
      position.x = this.imageWidthHalf;
    } else if ((position.x + this.imageWidthHalf) >= p5.windowWidth) {
      velocity.mult(-1, 1);
      position.x = p5.windowWidth - this.imageWidthHalf;
    }

    if (position.y + this.imageHeightHalf >= p5.windowHeight) {
      position.y = p5.windowHeight - this.imageHeightHalf;
      this.landed = true;
    }
  }
}