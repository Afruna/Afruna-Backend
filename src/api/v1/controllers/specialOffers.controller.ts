import { Request } from 'express';
import Controller from '@controllers/controller';
import { SpecialOffersInterface } from '@models/SpecialOffers';
import Service from '@services/service';
import SpecialOffers from '@models/SpecialOffers';
import SpecialOffersRepository from '@repositories/SpecialOffers.repo';
import SpecialOffersService from '@services/specialOffers.service';
import { SpecialOffersResponseDTO } from '@dtos/specialOffers.dto';
import Tags from '@models/Tags';

// Concrete service for SpecialOffers
class ConcreteSpecialOffersService extends Service<SpecialOffersInterface, SpecialOffersRepository> {
  protected repository = new SpecialOffersRepository();
}

class SpecialOffersController extends Controller<SpecialOffersInterface> {
  service = new ConcreteSpecialOffersService();
  responseDTO = SpecialOffersResponseDTO.SpecialOffer;

  // Get all special offers with pagination and filtering
  get = this.control(async (req: Request) => {
    const query = this.safeQuery(req);
    
    // Handle date filtering
    if (query.startDate || query.endDate) {
      const dateFilter: any = {};
      if (query.startDate) {
        dateFilter.$gte = new Date(query.startDate as string);
      }
      if (query.endDate) {
        dateFilter.$lte = new Date(query.endDate as string);
      }
      query.createdAt = dateFilter;
      delete query.startDate;
      delete query.endDate;
    }

    return this.service.paginatedFind(query, undefined, [
      { path: 'product', model: 'Product', select: 'name price images' },
      { path: 'tag', model: 'Tags', select: 'name' }
    ]);
  });

  // Get a single special offer by ID
  getOne = this.control(async (req: Request) => {
    const result = await this.service.findOne(req.params.id);
    if (!result) throw new this.HttpError('Special offer not found', 404);
    return result;
  });

  // Create a new special offer
  create = this.control(async (req: Request) => {
    const data = req.body;
    
    // Validate date range if both dates are provided
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (startDate >= endDate) {
        throw new this.HttpError('Start date must be before end date', 400);
      }
    }

    // Enforce only one active seasonal offer at a time
    if (data.tag) {
      const tag = await Tags.findById(data.tag);
      if (tag && tag.type === 'seasonal' && data.status !== false) {
        const existingSeasonalOffer = await SpecialOffers.findOne({
          tag: tag._id,
          status: true
        });
        if (existingSeasonalOffer) {
          throw new this.HttpError('A seasonal offer is already active for this tag.', 400);
        }
        // Also check for any other active seasonal offer (with any tag of type seasonal)
        const otherActiveSeasonal = await SpecialOffers.findOne({
          status: true,
          tag: { $ne: tag._id }
        }).populate({ path: 'tag', match: { type: 'seasonal' } });
        if (otherActiveSeasonal && otherActiveSeasonal.tag) {
          throw new this.HttpError('Another seasonal offer is already active.', 400);
        }
      }
    }

    return this.service.create(data);
  });

  // Update a special offer
  update = this.control(async (req: Request) => {
    const data = req.body;
    
    // Validate date range if both dates are provided
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (startDate >= endDate) {
        throw new this.HttpError('Start date must be before end date', 400);
      }
    }

    // Enforce only one active seasonal offer at a time
    if (data.tag) {
      const tag = await Tags.findById(data.tag);
      if (tag && tag.type === 'seasonal' && data.status !== false) {
        const existingSeasonalOffer = await SpecialOffers.findOne({
          tag: tag._id,
          status: true,
          _id: { $ne: req.params.id }
        });
        if (existingSeasonalOffer) {
          throw new this.HttpError('A seasonal offer is already active for this tag.', 400);
        }
        // Also check for any other active seasonal offer (with any tag of type seasonal)
        const otherActiveSeasonal = await SpecialOffers.findOne({
          status: true,
          tag: { $ne: tag._id },
          _id: { $ne: req.params.id }
        }).populate({ path: 'tag', match: { type: 'seasonal' } });
        if (otherActiveSeasonal && otherActiveSeasonal.tag) {
          throw new this.HttpError('Another seasonal offer is already active.', 400);
        }
      }
    }

    const result = await this.service.update(req.params.id, data);
    if (!result) throw new this.HttpError('Special offer not found', 404);
    return result;
  });

  // Delete a special offer
  delete = this.control(async (req: Request) => {
    const result = await this.service.delete(req.params.id);
    if (!result) throw new this.HttpError('Special offer not found', 404);
    return result;
  });

  // Get special offers by product ID
  getByProduct = this.control(async (req: Request) => {
    const { productId } = req.params;
    const query = this.safeQuery(req);
    query.product = productId;
    
    return this.service.paginatedFind(query, undefined, [
      { path: 'product', model: 'Product', select: 'name price images' },
      { path: 'tag', model: 'Tags', select: 'name' }
    ]);
  });

  // Get active special offers
  getActive = this.control(async (req: Request) => {
    const query = this.safeQuery(req);
    query.status = true;
    
    // Filter by current date if startDate and endDate are set
    const now = new Date();
    query.$and = [
      { status: true },
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: now } }
        ]
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: now } }
        ]
      }
    ];
    
    return this.service.paginatedFind(query, undefined, [
      { path: 'product', model: 'Product', select: 'name price images' },
      { path: 'tag', model: 'Tags', select: 'name' }
    ]);
  });

  // Get special offers by tag
  getByTag = this.control(async (req: Request) => {
    const { tagId } = req.params;
    const query = this.safeQuery(req);
    query.tag = tagId;
    
    return this.service.paginatedFind(query, undefined, [
      { path: 'product', model: 'Product', select: 'name price images' },
      { path: 'tag', model: 'Tags', select: 'name' }
    ]);
  });

  // Toggle special offer status
  toggleStatus = this.control(async (req: Request) => {
    const specialOffer = await this.service.findOne(req.params.id);
    if (!specialOffer) throw new this.HttpError('Special offer not found', 404);
    
    const newStatus = !specialOffer.status;
    const result = await this.service.update(req.params.id, { status: newStatus });
    return result;
  });

  // Get special offers statistics
  // getStats = this.control(async (req: Request) => {
  //   const stats = await this.service.getStats();
  //   return stats;
  // });

  // Get all special offers grouped by tag
  getGroupedByTag = this.control(async (req: Request) => {
    const result = await SpecialOffersService.instance().getOffersGroupedByTag();
    return result;
  });

  // Get all special offers for a given tag
  getOffersByTag = this.control(async (req: Request) => {
    const { tagId } = req.params;
    const result = await SpecialOffersService.instance().getOffersByTag(tagId);
    return result;
  });

  // Get all tags
  getAllTags = this.control(async (req: Request) => {
    const tags = await Tags.find({});
    return tags;
  });

  // Get the current active seasonal tag and all special offers under it
  getActiveSeasonalTagAndOffers = this.control(async (req: Request) => {
    const result = await SpecialOffersService.instance().getActiveSeasonalTagAndOffers();
    return result;
  });
}

export default SpecialOffersController; 