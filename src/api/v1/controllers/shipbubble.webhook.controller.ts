import { Request, Response } from 'express';
import OrderService from '@services/order.service';

class ShipbubbleWebhookController {
  static async handleWebhook(req: Request, res: Response) {
    try {
      const event = req.body;
      console.log('Received Shipbubble webhook:', event);

      // Example: event.order_id, event.status
      const { order_id, status } = event;
      if (!order_id || !status) {
        return res.status(400).json({ message: 'Missing order_id or status' });
      }

      // Find and update the order by sb_order_id
      const order = await OrderService.instance().findOne({ sb_order_id: order_id });
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Update the order's deliveryStatus (or another relevant field)
      await OrderService.instance().update(
        { sb_order_id: order_id },
        { deliveryStatus: status }
      );

      return res.status(200).json({ message: 'Order status updated' });
    } catch (err) {
      console.error('Error handling Shipbubble webhook:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default ShipbubbleWebhookController; 