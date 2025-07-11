import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import hpp from 'hpp';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import methodOverride from 'method-override';
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session';
import passport from 'passport';
import AuthRoute from '@routes/auth.route';
import UsersRoute from '@routes/user.route';
import CartRoute from '@routes/cart.route';
import CategoryRoute from '@routes/category.route';
import ServiceCategoryRoute from '@routes/serviceCategory.route';
import ConversationRoute from '@routes/conversation.route';
import MessageRoute from '@routes/message.route';
import OrderRoute from '@routes/order.route';
import ProductRoute from '@routes/product.route';
import ReviewRoute from '@routes/review.route';
import TransactionRoute from '@routes/transaction.route';
import WalletRoute from '@routes/wallet.route';
import WishlistRoute from '@routes/wishlist.route';
import AdminRoute from '@routes/admin.route';
import ProvideRoute from '@routes/provide.route';
import BookingRoute from '@routes/booking.route';
import AuthVendorRoute from '@routes/auth.vendor.route';
import { UserRole } from '@interfaces/User.Interface';
import { logger } from '@utils/logger';
import { errorHandler } from '@middlewares/errorHandler';
import docs from '@middlewares/docs';
import { rateLimiter } from '@middlewares/rateLimiter';
import Route from '@routes/route';
import * as Config from '@config';
import db from '@helpers/db';
import MainCategoryRoute from '@routes/main.category.route';
import VendorRoute from '@routes/vendor.route';
import AddressRoute from '@routes/address.route';
import { PaystackController } from '@controllers/paystack.controller';
import BusinessInfoRoute from '@routes/business.info.route';
import BusinessAddressRoute from '@routes/business.address.route';
import ShippingInfoRoute from '@routes/shipping.info.route';
import PaymentInfoRoute from '@routes/payment.info.route';
import BusinessDetailRoute from '@routes/business.detail.route';
import CustomerCareDetailRoute from '@routes/customer-care.detail.route';
import ReturnAddressRoute from '@routes/return.address.route';
import AdditionalInfoRoute from '@routes/additional.info.route';
import StoreFrontRoute from '@routes/store.front.route';
import LegalRepRoute from '@routes/legal.rep.route';
import MeansIdentificationRoute from '@routes/means.identification.route';
import NotificationRoute from '@routes/notification.route';
import ChatRoute from '@routes/chat.route';
import CardRoute from '@routes/card.route';
import SearchHistoryRoute from '@routes/search.history.route';
import ServiceProfileRoute from '@routes/service.profile.route';
import QuoteRoute from '@routes/quote.route';
import Category2Route from '@routes/category2.route';
import PayoutRoute from '@routes/payout.route';
import ShipbubbleWebhookRoute from '@routes/shipbubble.webhook.route';
import SpecialOffersRoute from '@routes/specialOffers.route';

// Create MongoDBStore instance
const MongoDBStoreInstance = MongoDBStore(session);

class App {
  private app: Application;
  useSocket = Config.OPTIONS.USE_SOCKETS;
  useAnalytics = Config.OPTIONS.USE_ANALYTICS;
  io?: Server;
  private apiVersion = '/api/v1';
  private routes: Record<string, Route<any>> = {
    '': new AuthRoute(),
    users: new UsersRoute(true),
    authVendor: new AuthVendorRoute(),
    carts: new CartRoute(),
    categories: new CategoryRoute(),
    maincategories: new MainCategoryRoute(),
    serviceCategories: new ServiceCategoryRoute(),
    conversations: new ConversationRoute(),
    messages: new MessageRoute(),
    orders: new OrderRoute(),
    products: new ProductRoute(),
    reviews: new ReviewRoute(),
    transactions: new TransactionRoute(),
    wallets: new WalletRoute(),
    wishlists: new WishlistRoute(),
    admin: new AdminRoute(),
    services: new ProvideRoute(),
    chats: new ChatRoute(),
    vendors: new VendorRoute(),
    address: new AddressRoute(),
    businessInfo: new BusinessInfoRoute(),
    businessDetail: new BusinessDetailRoute(),
    businessAddress: new BusinessAddressRoute(),
    returnAddress: new ReturnAddressRoute(),
    customerCareDetail: new CustomerCareDetailRoute(),
    shippingInfo: new ShippingInfoRoute(),
    paymentInfo: new PaymentInfoRoute(),
    additionalInfo: new AdditionalInfoRoute(),
    storeFront: new StoreFrontRoute(),
    legalRep: new LegalRepRoute(),
    meansOfIdentification: new MeansIdentificationRoute(),
    notifications: new NotificationRoute(),
    bookings: new BookingRoute(),
    cards: new CardRoute(),
    searchHistory: new SearchHistoryRoute(),
    serviceProfile: new ServiceProfileRoute(),
    quotes: new QuoteRoute(),
    category2: new Category2Route(),
    payouts: new PayoutRoute(),
    webhook: new ShipbubbleWebhookRoute(),
    'special-offers': new SpecialOffersRoute(),
  };
  httpServer;

  constructor() {
    this.app = express();
    if (this.useSocket) {
      this.httpServer = createServer(this.app);
      this.io = new Server(this.httpServer, {
        cors: {
          origin: '*',
        },
      });

      this.io.on('connection', (socket) => {
        console.log('a new client connected')
      });
    }
    this.initMiddlewares();
    this.initRoutes();
    this.initErrorHandlers();

    
  }

  private initRoutes() {
    if (Config.OPTIONS.USE_MULTER_DISK_STORAGE) {
      this.app.use(`${this.apiVersion}/${Config.MULTER_STORAGE_PATH}`, express.static(Config.CONSTANTS.ROOT_PATH));
    }
    Object.entries(this.routes).forEach(([url, route]) => {
      this.app.use(`${this.apiVersion}/${url}`, route.initRoutes());
    });
    this.app.use('/docs', docs);
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({ message: 'WELCOME' });
    });

    const controller = new PaystackController();
    this.app.get('/paystack-callback', (req, res, next) => controller.verify(req, res, next));
    this.app.get('/list-banks', (req, res, next) => controller.listBanks(req, res, next));
  }

  private initMiddlewares() {
    this.app.set('trust proxy', 1);
    this.app.use(
      cors({
        origin: ['http://localhost:3000', 'https://www.afruna.com', 'https://afruna.com', 'http://localhost:3001', 'https://vendor-service-portal.vercel.app', 'https://vendor.afruna.com'
          , 'https://auth.afruna.com', "https://admin.afruna.com", 'https://staging.afruna.com', 'https://staging.vendor.afruna.com', 'https://staging.admin.afruna.com'
        ],
        credentials: true,
        exposedHeaders: ['set-cookie'],
      }),
    );
    // this.app.use(
    //   cors({
    //     origin: "*",
    //     credentials: true,
    //     exposedHeaders: ['set-cookie'],
    //   }),
    // );

    // Initialize session middleware before passport
    //this.initCookieSession(Config.DB_URI);

    // Configure session middleware
    this.app.use(session({
      secret: 'your-session-secret',
      resave: false,
      saveUninitialized: true
    }));

    // Initialize Passport.js
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(xss());
    this.app.use(mongoSanitize());
    this.app.use(compression());
    this.app.use(methodOverride());

    if (Config.NODE_ENV !== 'development') {
      this.app.use(`${this.apiVersion}`, rateLimiter);
    }

    if (this.useSocket) {
      this.app.use((req, res, next) => {
        req.io = this.io!;
        next();
      });
    }
  }

  private initErrorHandlers() {
    this.app.use(errorHandler);
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({ msg: 'Route not found' });
    });
  }

  private initCookieSession(connectionString: string) {
    const Session: session.SessionOptions = {
      secret: Config.JWT_KEY,
      resave: false,
      saveUninitialized: false,
      store: new MongoDBStoreInstance({
        uri: connectionString,
        collection: 'userSessions',
      }),
      proxy: true,
      cookie: {
        domain: '.afruna.com',
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    };
    this.app.use(session(Session));
  }

  public listen(port: number, connectionString: string) {
    const server = this.useSocket ? this.httpServer! : this.app;

    db(connectionString);
    server.listen(port, () => {
      logger.info(`running on port ${port}`);
    });
  }

  public instance() {
    return this.app;
  }
}

export default App;
