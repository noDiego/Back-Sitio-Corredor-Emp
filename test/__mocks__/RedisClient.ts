export default {
  setCache: jest.fn(() => Promise.resolve(true)),
  getCache: jest.fn(() => Promise.resolve(false)),
  cleanCache: jest.fn(() => Promise.resolve(true))
};
