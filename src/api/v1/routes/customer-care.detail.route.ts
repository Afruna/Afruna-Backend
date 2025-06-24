/* eslint-disable import/no-unresolved */
import CustomerCareDetailController from '@controllers/customer-care.detail.controller';
import { customerCareDetailRequestDTO } from '@dtos/customer.care.detail.dto';
import { CustomerCareDetailInterface } from '@interfaces/CustomerCare.Detail.Interface';
import Route from '@routes/route';

class CustomerCareDetailRoute extends Route<CustomerCareDetailInterface> {
  controller = new CustomerCareDetailController('customerCareDetail');
  dto = customerCareDetailRequestDTO;
  initRoutes() {
    this.router
      .route('/')
      .get(this.authorizeVendor(), this.controller.getByVendorId)
      .post(
        this.authorizeVendor(),
        this.validator(this.dto.create),
        this.controller.create,
      );

    this.router
      .route('/:customerCareDetailId')
      .put(this.controller.update)
      .delete(this.authorize(), this.validator(this.dto.id), this.controller.delete);

    

    return this.router;
  }
}
export default CustomerCareDetailRoute;
