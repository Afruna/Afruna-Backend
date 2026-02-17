import { body, param, query } from 'express-validator';

export const specialOffersRequestDTO = {
  id: [param('id').exists().isMongoId().withMessage('Valid special offer ID is required')],
  
  create: [
    body('product').exists().isMongoId().withMessage('Valid product ID is required'),
    body('discount').exists().isNumeric().withMessage('Discount is required and must be a number'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    body('status').optional().isBoolean().withMessage('Status must be a boolean'),
    body('tag').optional().isMongoId().withMessage('Tag must be a valid MongoDB ID'),
  ],
  
  update: [
    body('product').optional().isMongoId().withMessage('Product must be a valid MongoDB ID'),
    body('discount').optional().isNumeric().withMessage('Discount must be a number'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    body('status').optional().isBoolean().withMessage('Status must be a boolean'),
    body('tag').optional().isMongoId().withMessage('Tag must be a valid MongoDB ID'),
  ],
  
  query: [
    query('page').optional().isNumeric().withMessage('Page must be a number'),
    query('limit').optional().isNumeric().withMessage('Limit must be a number'),
    query('status').optional().isBoolean().withMessage('Status must be a boolean'),
    query('product').optional().isMongoId().withMessage('Product must be a valid MongoDB ID'),
  ],
};

export interface ISpecialOffersResponseDTO {
  _id: string;
  product: string;
  discount: number;
  startDate?: Date;
  endDate?: Date;
  status: boolean;
  tag?: string;
  discountId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SpecialOffersResponseDTO {
  static SpecialOffer = (data: any): ISpecialOffersResponseDTO => {
    return {
      _id: data._id.toString(),
      product: data.product?.toString() || null,
      discount: data.discount,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      tag: data.tag?.toString() || null,
      discountId: data.discountId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  };
} 