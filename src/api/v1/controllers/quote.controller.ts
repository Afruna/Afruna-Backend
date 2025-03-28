/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import QuoteService from '@services/quote.service';
import { QuoteInterface } from '@interfaces/Quote.Interface';
import Controller from '@controllers/controller';
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
}

export default QuoteController;
