import { Test, TestingModule } from '@nestjs/testing';
import { WithCacheController } from './with-cache.controller';
import { WithCacheService } from './with-cache.service';

describe('WithCacheController', () => {
  let withCacheController: WithCacheController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WithCacheController],
      providers: [WithCacheService],
    }).compile();

    withCacheController = app.get<WithCacheController>(WithCacheController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(withCacheController.getHello()).toBe('Hello World!');
    });
  });
});
