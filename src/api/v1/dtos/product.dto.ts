import { ProductInterface } from '@interfaces/Product.Interface';
import { logger } from '@utils/logger';
import { body, check, param, query } from 'express-validator';

export const productRequestDTO = {
  id: [param('productId').exists()],
  interval: [param('interval').exists().isIn(['daily', 'weekly', 'monthly', 'yearly'])],
  create: [
    body('name').exists().withMessage('name is required'),
    body('desc').exists().withMessage('desc is required'),
    body('quantity').exists().isInt().withMessage('quantity is required'),
    body('categoryId').exists().withMessage('categoryId is required'),
    body('mainCategoryId').exists().withMessage('MainCategoryId is required'),
    body('price').exists().withMessage('price is required'),
    body('discount').exists().withMessage('discount is required'),
    body('skuNumber').exists().withMessage('Sku Number is required'),
    body('weight').exists().withMessage('Weight is required'),
    body('images').optional(),
    body('coverPhoto').optional(),
    body('options').optional(),

    // body('metaData').exists().withMessage('metaData is required').isArray().withMessage('metaData must be an array'),
    // body('deliveryLocations')
    //   .exists()
    //   .withMessage('deliveryLocations is required')
    //   .isArray()
    //   .withMessage('deliveryLocations must be an array'),

    // body('sold').not().exists().withMessage('sold is a forbidden field'),
    // body('isOutOfStock').not().exists().withMessage('isOutOfStock is a forbidden field'),
    // body('isPromoted').not().exists().withMessage('isPromoted is a forbidden field'),
    //body('vendorId').not().exists().withMessage('vendorId is a forbidden field'),
    // body('ratings').not().exists().withMessage('ratings is a forbidden field'),
    // body('ratedBy').not().exists().withMessage('ratedBy is a forbidden field'),
    // body('customId').not().exists().withMessage('customId is a forbidden field'),
    // body('totalScore').not().exists().withMessage('totalScore is a forbidden field'),
  ],
  status: [
    body('productId').exists().withMessage('product Id is required'),
    body('status').exists().withMessage('status is required'),
  ],
  update: [
    body('name').optional(),
    body('desc').optional(),
    body('quantity').not().exists().withMessage('quantity is a forbidden field'),
    body('categoryId').optional(),
    body('price').optional(),
    body('discount').optional(),
    body('images').optional(),
    body('coverPhoto').optional(),
    body('options').not().exists().withMessage('options is a forbidden field'),
    body('condition').optional(),
    body('brand').optional(),
    body('metaData').optional().isString().withMessage('metaData must be a string'),
    body('deliveryLocations').optional().isArray()
    .withMessage('deliveryLocations must be an array'),

    body('sold').not().exists().withMessage('sold is a forbidden field'),
    body('isOutOfStock').not().exists().withMessage('isOutOfStock is a forbidden field'),
    body('isPromoted').not().exists().withMessage('isPromoted is a forbidden field'),
    body('categoryId').not().exists().withMessage('categoryId is a forbidden field'),
    body('vendorId').not().exists().withMessage('vendorId is a forbidden field'),
    body('ratings').not().exists().withMessage('ratings is a forbidden field'),
    body('ratedBy').not().exists().withMessage('ratedBy is a forbidden field'),
    body('customId').not().exists().withMessage('customId is a forbidden field'),
    body('totalScore').not().exists().withMessage('totalScore is a forbidden field'),
  ],
};

export interface IProductResponseDTO {
  _id: string;
  name: string;
  desc: string;
  price: number;
  discount: number;
  ratings: number;
  sold: number;
  categoryId: string | null;
  isPromoted: boolean;
  vendorId: string | null;
  vendor: string | null;
  coverPhoto: string[];
  images: string[];
  condition: string;
  brand: string | null;
  deliveryLocations: string[];
  isOutOfStock: boolean;
  totalScore: number;

}


export class ProductResponseDTO {
  static Product = <T extends { data: Array<ProductInterface>; totalDocs: number }>(
    data: ProductInterface | Array<ProductInterface> | T,
  ): IProductResponseDTO | Array<IProductResponseDTO> | T => {
    
    // Function to transform a single product document
    const fn = (_: ProductInterface): IProductResponseDTO => {
      return {
        _id: _._id!.toString(), // Convert _id to string
        name: _.name!,
        desc: _.desc!,
        price: _.price!,
        discount: _.discount!,
        ratings: _.ratings!,
        sold: _.sold!,
        categoryId: _.categoryId?.toString() || null, // Convert to string or null if not present
        isPromoted: _.isPromoted!,
        vendorId: _.vendorId?.toString() || null, // Convert vendorId to string or null if not present
        vendor: _.vendor?.toString() || null, // Convert vendor to string or null if not present
        coverPhoto: _.coverPhoto || [],
        images: _.images || [],
        condition: _.condition!,
        brand: _.brand || null,
        deliveryLocations: _.deliveryLocations || [],
        isOutOfStock: _.isOutOfStock!,
        totalScore: _.totalScore!,
        // createdAt: _.createdAt!,
        // updatedAt: _.updatedAt!
      };
    };
    
    // Check if the data is a paginated result
    if ('totalDocs' in data) {
      (<any>data).data = data.data.map((_) => fn(_));
      return data;
    } else {
      // Transform either a single object or an array of objects
      const result = Array.isArray(data) ? data.map((_) => fn(_)) : fn(data);
      return result;
    }
  };
}
