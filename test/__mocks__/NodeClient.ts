export default {
  trackEvent: jest.fn(() => Promise.resolve({})),
  trackException: jest.fn(() => Promise.resolve({})),
  trackRequest: jest.fn(() => Promise.resolve({})),
  trackNodeHttpRequest: jest.fn(() => Promise.resolve({})),
  trackDependency: jest.fn(() => Promise.resolve({})),
  start: jest.fn(() => Promise.resolve({})),
  setup: jest.fn().mockImplementation(() => ({}))
};
