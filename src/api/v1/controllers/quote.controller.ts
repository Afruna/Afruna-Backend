/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import QuoteService from '@services/quote.service';
import { QuoteInterface } from '@interfaces/Quote.Interface';
import Controller from '@controllers/controller';
import Message from '@models/Message';
import Quote from '@models/Quote';
import Provide from '@models/Provide';
// import { ConversationResponseDTO } from '@dtos/Conversation.dto';

class QuoteController extends Controller<QuoteInterface> {
  service = new QuoteService();
  responseDTO = undefined; // ConversationResponseDTO.Conversation;

  // get = this.control((req: Request) => {
  //   return this.service.(<string>req.user?._id.toString());
  // });

  createQuote = this.control((req: Request) => {
    return this.service.createQuote({ ...req.body, vendorId: req.vendor._id});
  });

  findAllByUser = this.control((req: Request) => {
    return this.service.find({userId: req.user?._id}, { populate: {
      path: 'serviceId',
      model: 'Service',
      populate: {
        path: 'vendorid',
        model: 'Vendor',
      },
    }});
  });

  findAllByVendor = this.control((req: Request) => {
    return this.service.find({vendorId: req.vendor?._id}, { populate: {
      path: 'serviceId',
      model: 'Service',
      populate: {
        path: 'vendorId',
        model: 'Vendor',
        select: '-password'
      },
    }});
  });

  getServiceProfile = this.control(async (req: Request) => {
    return this.service.findOne(req.params.serviceProfileId);
  });

  delete = this.control((req: Request) => {
    const { quoteId } = req.params;
    if (!quoteId) {
      throw new Error('Quote ID is required');
    }
    this.service.delete(quoteId);
    let messageBinded = Message.findOneAndDelete({quote: quoteId})
    return { message: 'Quote deleted successfully' };
  }
  );

  update = this.control(async (req: Request) => {
    const { quoteId } = req.params;
    if (!quoteId) {
      throw new Error('Quote ID is required');
    }

    let quote = await Quote.findById(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }
    const service = await Provide.findById(req.body.serviceId);
    if (!service) {
      throw new Error('Service not found');
    }
    const data = {
      ...req.body,
      serviceTitle: service.name,
    }
    let messageBinded = await Message.findOneAndUpdate({quote: quoteId}, {quoteData: data})
    return this.service.update(quoteId, req.body);
  });
}

export default QuoteController;
