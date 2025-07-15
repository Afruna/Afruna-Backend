import SpecialOffers from '@models/SpecialOffers';
import Tags from '@models/Tags';
import Product from '@models/Product';
import { Types } from 'mongoose';

class SpecialOffersService {
  static instance() {
    if (!this._instance) this._instance = new SpecialOffersService();
    return this._instance;
  }
  private static _instance: SpecialOffersService;

  /**
   * Returns all special offers grouped by tag, with tag details and an array of populated product details for each tag.
   */
  async getOffersGroupedByTag() {
    // Step 1: Get all special offers, populating tag and product
    const offers = await SpecialOffers.find({})
      .populate('tag')
      .populate({ path: 'product', model: Product });

    // Step 2: Group offers by tag
    const tagMap = new Map<string, { tag: any; products: any[] }>();
    for (const offer of offers) {
      if (!offer.tag) continue; // skip offers without a tag
      const tagId = offer.tag._id.toString();
      if (!tagMap.has(tagId)) {
        tagMap.set(tagId, { tag: offer.tag, products: [] });
      }
      // Add the product (with offer details) to the group
      tagMap.get(tagId)!.products.push({ ...offer.product?._doc });
    }
    // Step 3: Return as array
    return Array.from(tagMap.values());
  }

  /**
   * Returns all special offers for a given tag, with populated product details.
   */
  async getOffersByTag(tagId: string) {
    const offers = await SpecialOffers.find({ tag: tagId })
      .populate('tag')
      .populate({ path: 'product', model: Product });
    // Return just the products, each with specialOffer details
    return offers.map(offer => ({ ...offer.product?._doc, specialOffer: offer }));
  }
}

export default SpecialOffersService;
