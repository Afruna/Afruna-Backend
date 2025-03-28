import { ORDER_REDIRECT, WALLET_REDIRECT } from "@config";
import CardService from "@services/card.service";
import OrderService from "@services/order.service";
import PaymentService from "@services/payment.service";
import TransactionService from "@services/transaction.service";
import { listBanks } from "@utils/paystack";
import { Request, Response, NextFunction } from "express";

export class PaystackController {
    service = new TransactionService();
    serviceOrder = new OrderService();
    paymentService = new PaymentService();
    cardService = new CardService();
    
    async verify(req: Request, res: Response, next: NextFunction) {
        try
        {
        console.log("Trans Ref", req.query)
        const response = await this.service.verifyPayment(<string>req.query.reference);



        const reference = <string>req.query.reference;

        let payment = await this.paymentService.findOne({_id: reference})

        // const payment = await this.paymentService.findOne({_id: response.reference})

        switch(response.metadata.type)
        {
            case "product":
                
                res.status(301).redirect(`${ORDER_REDIRECT}?orderId=${payment.referenceId}`)
            break;

            case "wallet":
                res.status(301).redirect(`${WALLET_REDIRECT}?userId=${response.metadata.userId}`)
            break;
        }

        // if (response.status !== 'success') {
        //   res.redirect(`https://www.freexitnow.com`); //failure
        // }
        // else
        // {
        //   res.redirect(`https://www.afruna.com`); //Pass
        // }
        }
        catch(err)
        {
        console.log(err.message)
        res.redirect(`https://www.afruna.com`); //failure
        }
    }

    async listBanks(req: Request, res: Response, next: NextFunction)  {
        const result = await listBanks()
        return res.json(result);
    };
}