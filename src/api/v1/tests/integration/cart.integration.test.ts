import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import session from 'express-session';
import CartRoute from '@routes/cart.route';
import Product from '@models/Product';
import Vendor from '@models/Vendor';
import User from '@models/User';
import { Types } from 'mongoose';

// Mock authentication middleware
jest.mock('@middlewares/jwt', () => ({
  authorize: () => (req: any, res: any, next: any) => {
    req.user = req.headers['x-test-user'] ? JSON.parse(req.headers['x-test-user'] as string) : null;
    next();
  },
}));

// Mock cart session middleware
jest.mock('@middlewares/session', () => ({
  cartSessionMiddleware: (req: any, res: any, next: any) => {
    req.session = {
      cartId: req.headers['sessionId'] || 'test-session-id',
    };
    next();
  },
}));

describe('Cart API Integration Tests', () => {
  let app: express.Application;
  let mongod: MongoMemoryServer;
  let authToken: string;
  let testUser: any;
  let testProduct: any;
  let testVendor: any;

  beforeAll(async () => {
    // Setup MongoDB Memory Server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use(
      session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: true,
      })
    );

    // Setup routes
    const cartRoute = new CartRoute();
    app.use('/api/v1/carts', cartRoute.router);

    // Create test data
    testVendor = await Vendor.create({
      firstname: 'Test',
      lastname: 'Vendor',
      email: 'vendor@test.com',
      phoneNumber: '1234567890',
      password: 'password123',
      shopName: 'Test Shop',
      vendorType: 'MARKET_SELLER',
    });

    testProduct = await Product.create({
      name: 'Test Product',
      price: 1000,
      quantity: 10,
      sold: 0,
      isOutOfStock: false,
      vendorId: testVendor._id,
      vendor: testVendor._id,
      images: ['image1.jpg'],
      coverPhoto: ['cover.jpg'],
      status: 'ACTIVE',
    });

    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'user@test.com',
      password: 'password123',
    });

    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    // Clean up cart data
    await mongoose.connection.collection('carts').deleteMany({});
    await mongoose.connection.collection('cartsessions').deleteMany({});
  });

  describe('POST /api/v1/carts/', () => {
    it('should add item to cart as guest', async () => {
      const response = await request(app)
        .post('/api/v1/carts/')
        .set('sessionId', 'guest-session-123')
        .send({
          productId: testProduct._id.toString(),
          quantity: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should add item to cart as authenticated user', async () => {
      const response = await request(app)
        .post('/api/v1/carts/')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-test-user', JSON.stringify({ _id: testUser._id }))
        .set('sessionId', 'user-session-123')
        .send({
          productId: testProduct._id.toString(),
          quantity: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should return 400 when product is out of stock', async () => {
      await Product.findByIdAndUpdate(testProduct._id, { isOutOfStock: true });

      const response = await request(app)
        .post('/api/v1/carts/')
        .set('sessionId', 'guest-session-123')
        .send({
          productId: testProduct._id.toString(),
          quantity: 1,
        });

      expect(response.status).toBe(400);

      // Reset product
      await Product.findByIdAndUpdate(testProduct._id, { isOutOfStock: false });
    });
  });

  describe('GET /api/v1/carts/', () => {
    it('should get cart for guest user', async () => {
      // First add an item
      await request(app)
        .post('/api/v1/carts/')
        .set('sessionId', 'guest-session-123')
        .send({
          productId: testProduct._id.toString(),
          quantity: 1,
        });

      // Then get cart
      const response = await request(app)
        .get('/api/v1/carts/')
        .set('sessionId', 'guest-session-123');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should merge guest cart with user cart on login', async () => {
      // Add item as guest
      await request(app)
        .post('/api/v1/carts/')
        .set('sessionId', 'guest-session-123')
        .send({
          productId: testProduct._id.toString(),
          quantity: 1,
        });

      // Get cart as authenticated user with same sessionId
      const response = await request(app)
        .get('/api/v1/carts/')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-test-user', JSON.stringify({ _id: testUser._id }))
        .set('sessionId', 'guest-session-123');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('DELETE /api/v1/carts/:productId', () => {
    it('should delete item from cart', async () => {
      // First add an item
      await request(app)
        .post('/api/v1/carts/')
        .set('sessionId', 'delete-test-session')
        .send({
          productId: testProduct._id.toString(),
          quantity: 1,
        });

      // Then delete it
      const response = await request(app)
        .delete(`/api/v1/carts/${testProduct._id}`)
        .set('sessionId', 'delete-test-session');

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/carts/', () => {
    it('should clear entire cart', async () => {
      // Add items first
      await request(app)
        .post('/api/v1/carts/')
        .set('sessionId', 'clear-test-session')
        .send({
          productId: testProduct._id.toString(),
          quantity: 2,
        });

      // Clear cart
      const response = await request(app)
        .delete('/api/v1/carts/')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-test-user', JSON.stringify({ _id: testUser._id }));

      expect(response.status).toBe(200);
    });
  });
});
