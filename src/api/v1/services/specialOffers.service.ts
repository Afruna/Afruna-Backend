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
   * Excludes offers where the current date is past the tag's endDate.
   */
  async getOffersGroupedByTag() {
    const currentDate = new Date();
    
    // Step 1: Get all special offers, populating tag and product
    const offers = await SpecialOffers.find({})
      .populate('tag')
      .populate({ path: 'product', model: Product });

    // Step 2: Group offers by tag, filtering out expired offers
    const tagMap = new Map<string, { tag: any; products: any[] }>();
    for (const offer of offers) {
      if (!offer.tag) continue; // skip offers without a tag
      
      // Check if the tag has expired
      const tagEndDate = new Date(offer.tag.endDate);
      if (currentDate > tagEndDate) continue; // skip expired offers
      
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
   * Excludes offers where the current date is past the tag's endDate.
   */
  async getOffersByTag(tagId: string) {
    const currentDate = new Date();
    
    // First check if the tag exists and is not expired
    const tag = await Tags.findById(tagId);
    if (!tag) return [];
    
    const tagEndDate = new Date(tag.endDate);
    if (currentDate > tagEndDate) return []; // return empty array if tag is expired
    
    const offers = await SpecialOffers.find({ tag: tagId })
      .populate('tag')
      .populate({ path: 'product', model: Product });
    // Return only the populated product objects
    return offers
      .map(offer => offer.product)
      .filter(product => !!product);
  }

  /**
   * Returns the current active seasonal tag and all special offers (with products) under it.
   * Excludes offers where the current date is past the tag's endDate.
   */
  async getActiveSeasonalTagAndOffers() {
    const currentDate = new Date();
    
    // Find the active seasonal tag
    const activeSeasonalTag = await Tags.findOne({ type: 'seasonal', status: 'active' });
    if (!activeSeasonalTag) return { tag: null, offers: [] };
    
    // Check if the tag has expired
    const tagEndDate = new Date(activeSeasonalTag.endDate);
    if (currentDate > tagEndDate) return { tag: null, offers: [] }; // return empty if tag is expired
    
    // Find all special offers under this tag, with populated product
    const offers = await SpecialOffers.find({ tag: activeSeasonalTag._id })
      .populate('tag')
      .populate({ path: 'product', model: Product });
    return { tag: activeSeasonalTag, offers };
  };
}

export default SpecialOffersService;
