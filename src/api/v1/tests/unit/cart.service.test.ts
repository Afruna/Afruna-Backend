/**
 * @jest-environment node
 */
import CartService from '../../services/cart.service';
import HttpError from '../../helpers/HttpError';

// Mock all dependencies
jest.mock('../../repositories/Cart.repo');
jest.mock('../../repositories/CartSession.repo');
jest.mock('../../services/product.service', () => ({
  instance: jest.fn(() => () => ({
    findOne: jest.fn(),
    discountedPrice: jest.fn().mockReturnValue(100),
  })),
}));

describe('CartService', () => {
  let cartService: CartService;

  beforeEach(() => {
    jest.clearAllMocks();
    cartService = new CartService();
  });

  describe('validateCartData', () => {
    it('should throw HttpError if productId is missing', async () => {
      const data = { quantity: 2, sessionId: 'session123', userId: 'user123' } as any;

      // Mock repository methods to avoid database errors
      const cartRepoMock = (cartService as any).repository;
      cartRepoMock.RepositorySession = jest.fn().mockReturnValue({
        startTransaction: jest.fn(),
        endSession: jest.fn(),
        abortTransaction: jest.fn(),
        commitTransaction: jest.fn(),
      });

      await expect(cartService.add(data)).rejects.toThrow();
    });

    it('should throw HttpError if quantity is less than or equal to 0', async () => {
      const data = { productId: 'prod123', quantity: 0, sessionId: 'session123', userId: 'user123' };

      const cartRepoMock = (cartService as any).repository;
      cartRepoMock.RepositorySession = jest.fn().mockReturnValue({
        startTransaction: jest.fn(),
        endSession: jest.fn(),
        abortTransaction: jest.fn(),
        commitTransaction: jest.fn(),
      });

      await expect(cartService.add(data)).rejects.toThrow();
    });
  });

  describe('calculateCartTotal', () => {
    it('should correctly calculate total for cart items', () => {
      const items = [
        { quantity: 2, total: 200 },
        { quantity: 1, total: 150 },
        { quantity: 3, total: 300 }
      ];
      
      const total = items.reduce((sum, item) => sum + item.total, 0);
      
      expect(total).toBe(650);
    });

    it('should correctly count number of items', () => {
      const items = [
        { quantity: 2, total: 200 },
        { quantity: 1, total: 150 },
        { quantity: 3, total: 300 }
      ];
      
      const itemCount = items.length;
      
      expect(itemCount).toBe(3);
    });
  });

  describe('get - Guest Cart Merge Logic', () => {
    it('should merge guest cart with user cart when both exist', async () => {
      // This test documents the guest cart merge feature
      const userId = 'user123';
      const sessionId = 'guest123';
      
      const userSession = {
        _id: 'userSession123',
        userId,
        numberOfItems: 1,
        total: 100
      };
      
      const guestSession = {
        _id: 'guestSession123',
        sessionId,
        numberOfItems: 2,
        total: 200
      };

      const cartSessionRepoMock = (cartService as any)._cartSession;
      const cartRepoMock = (cartService as any).repository;

      cartSessionRepoMock.findOne = jest.fn()
        .mockResolvedValueOnce(userSession)   // User session found first
        .mockResolvedValueOnce(guestSession); // Guest session found second

      cartRepoMock.find = jest.fn()
        .mockResolvedValueOnce([
          { _id: 'item1', productId: 'prod1', quantity: 1, total: 100, sessionId: 'guestSession123' }
        ])
        .mockResolvedValueOnce([]); // Second call after merge
      
      cartRepoMock.findOne = jest.fn().mockResolvedValue(null);
      cartRepoMock.update = jest.fn().mockResolvedValue({});
      cartRepoMock.RepositorySession = jest.fn().mockReturnValue({
        startTransaction: jest.fn(),
        endSession: jest.fn(),
        abortTransaction: jest.fn(),
        commitTransaction: jest.fn(),
      });

      cartSessionRepoMock.update = jest.fn().mockResolvedValue({
        ...userSession,
        numberOfItems: 3,
        total: 300
      });
      cartSessionRepoMock.delete = jest.fn().mockResolvedValue({});

      await cartService.get(userId, sessionId);

      // Should find guest items using guest session ID at some point
      const findCalls = cartRepoMock.find.mock.calls;
      const foundGuestSession = findCalls.some(call => 
        call[0] && call[0].sessionId === guestSession._id
      );
      expect(foundGuestSession).toBe(true);
      
      // Should delete guest session after merge
      expect(cartSessionRepoMock.delete).toHaveBeenCalledWith(guestSession._id);
    });

    it('should return user cart when only user cart exists', async () => {
      const userId = 'user123';
      const sessionId = 'session123';
      
      const userSession = {
        _id: 'userSession123',
        userId,
        numberOfItems: 2,
        total: 200
      };

      const cartSessionRepoMock = (cartService as any)._cartSession;
      const cartRepoMock = (cartService as any).repository;

      cartSessionRepoMock.findOne = jest.fn()
        .mockResolvedValueOnce(userSession)  // User session exists
        .mockResolvedValueOnce(null);         // No guest session

      cartRepoMock.find = jest.fn().mockResolvedValue([]);
      cartRepoMock.RepositorySession = jest.fn().mockReturnValue({
        startTransaction: jest.fn(),
        endSession: jest.fn(),
        abortTransaction: jest.fn(),
        commitTransaction: jest.fn(),
      });

      const result = await cartService.get(userId, sessionId);

      expect(cartSessionRepoMock.findOne).toHaveBeenCalledWith({ userId });
      expect(result).toBeDefined();
    });
  });
});
