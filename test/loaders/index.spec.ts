import express from 'express';
import { Container } from 'typedi';
import { resetMocks, startGlobals } from '../helpers/globalMocks';

jest.mock('../../src/loaders/insight');

describe('Loaders', () => {
  const app = express();

  beforeEach(() => {});

  afterAll(() => {
    resetMocks();
  });

  it('se deben cargar config logger y express', async () => {
    await startGlobals(app);
    expect(Container.get('logger')).toBeDefined();
    expect(Container.get('InsightClient')).toBeDefined();
  });
});
