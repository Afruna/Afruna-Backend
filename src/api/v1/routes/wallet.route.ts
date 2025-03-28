/* eslint-disable import/no-unresolved */
import WalletController from '@controllers/wallet.controller';
import { walletRequestDTO } from '@dtos/wallet.dto';
import Route from '@routes/route';
import { WalletInterface } from '@interfaces/Wallet.Interface';

export default class WalletRoute extends Route<WalletInterface> {
  controller = new WalletController('wallet');
  dto = walletRequestDTO;
  initRoutes() {
    this.router.route('/').get(this.authorize(), this.controller.getOne);
    this.router.route('/vendor').get(this.authorizeVendor(), this.controller.getByVendor);
    this.router
      .route('/bank') 
      .get( this.controller.getBank)
      .post(this.authorize(), this.validator(this.dto.addBank), this.controller.addBank);

      
    this.router.route('/bank/:accountId').delete(this.authorize(), this.validator(this.dto.removeBank), this.controller.removeBank);
    this.router
      .route('/bank/confirm')
      .post(this.validator(this.dto.confirmAccount), this.controller.resolveAccountNumber);
    this.router.route('/withdraw').post(this.authorize(), this.validator(this.dto.withdraw), this.controller.withdraw);
        this.router.route('/deposit').post(this.authorize(), this.validator(this.dto.fundWallet), this.controller.depositToWallet);
        this.router
          .route('/deposit/verify')
          .post(this.authorize(), this.validator(this.dto.verifyFunding), this.controller.verifyFunding);

    return this.router;
  }
}
