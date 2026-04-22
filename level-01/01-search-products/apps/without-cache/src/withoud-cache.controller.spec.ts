import { Test, TestingModule } from '@nestjs/testing';
import { WithoudCacheController } from './withoud-cache.controller';
import { WithoudCacheService } from './withoud-cache.service';

describe('WithoudCacheController', () => {
  let withoudCacheController: WithoudCacheController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WithoudCacheController],
      providers: [WithoudCacheService],
    }).compile();

    withoudCacheController = app.get<WithoudCacheController>(WithoudCacheController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(withoudCacheController.getHello()).toBe('Hello World!');
    });
  });
});
