import { Router } from 'express';
import ShipbubbleWebhookController from '@controllers/shipbubble.webhook.controller';

const router = Router();

router.post('/webhook/shipbubble', ShipbubbleWebhookController.handleWebhook);

export default class ShipbubbleWebhookRoute {
  initRoutes() {
    return router;
  }
} 