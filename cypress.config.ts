import { defineConfig } from 'cypress';
import { addCucumberPreprocessorPlugin } from
      '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from
      '@badeball/cypress-cucumber-preprocessor/esbuild';
import createBundler from
      '@bahmutov/cypress-esbuild-preprocessor';
import path from 'path';

export default defineConfig({
  e2e: {
    specPattern: '**/*.feature',
    supportFile: 'cypress/support/e2e.ts',
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);
      const bundler = createBundler({
        plugins: [createEsbuildPlugin(config)]
      });
      on('file:preprocessor', bundler);

      const envJsonPath = path.resolve(
          __dirname,
          'cypress',
          'env',
          `${config.env.CYPRESS_ENV || 'dev'}.json`
      );
      const fileEnv = require(envJsonPath);

      return { ...config, ...fileEnv };
    }
  }
});
