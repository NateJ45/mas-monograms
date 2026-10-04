// temporary: run the repo specs against the 4416 dev server (deleted after use)
import base from './playwright.config';
export default {
  ...base,
  use: { ...base.use, baseURL: 'http://localhost:4416' },
  webServer: undefined,
  workers: 2,
};
