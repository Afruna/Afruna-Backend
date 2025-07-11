import { Request } from 'express';
import Controller from '@controllers/controller';
import { SpecialOffersInterface } from '@models/SpecialOffers';
import SpecialOffersService from '@services/specialOffers.service';
import { SpecialOffersResponseDTO } from '@dtos/specialOffers.dto';

class SpecialOffersController extends Controller<SpecialOffersInterface> {
  service = SpecialOffersService.instance();
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
  getStats = this.control(async (req: Request) => {
    const stats = await this.service.getStats();
    return stats;
  });
}

export default SpecialOffersController; 