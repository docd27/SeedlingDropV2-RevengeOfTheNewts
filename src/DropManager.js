import Drop from './Drop';

export default class DropManager {
  /**
   * @param {import('p5')} p5
   */
  constructor(p5) {
    /** @type {Map<string, {image: import('p5').Image, drops: Set<Drop>}>} */
    this.collection = new Map();
    /** @type {Object.<number, Drop>} */
    this.zIndices = Object.create(null);
    this.minZIndex = 0;
  }

  /**
   * @param {Drop} drop
   * Add drop to the draw collection
   */
  add(drop) {
    if (!this.collection.has(drop.imageURL)) {
      this.collection.set(drop.imageURL,
        {image: drop.image, drops: new Set()});
    }
    this.collection.get(drop.imageURL).drops.add(drop);
    this.zIndices[drop.zIndex] = drop;
    this.updateZIndex();
  }

  /**
   * @param {Drop} drop
   * Remove drop from the draw collection
   */
  delete(drop) {
    this.collection.get(drop.imageURL).drops.delete(drop);
    if (this.collection.get(drop.imageURL).drops.size === 0) {
      this.collection.delete(drop.imageURL);
    }
    delete this.zIndices[drop.zIndex];
    this.updateZIndex();
  }

  /** POST: this.minZIndex = smallest active z index */
  updateZIndex() {
    // let minZ = +Infinity;
    // for (const [imageURL, {image, drops}] of this.collection) {
    //   for (const drop of drops) {
    //     minZ = Math.min(minZ, drop.zIndex);
    //   }
    // }
    // this.minZIndex = minZ;
    for (const zIndex in this.zIndices) {
      this.minZIndex = +zIndex;
      break;
    }
  }
}