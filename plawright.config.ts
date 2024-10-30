require("dotenv").config({ path: ".env.local" });
import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: require.resolve('./global-setup.ts'),
  // globalTeardown: require.resolve('./global-teardown.ts'),  // Not currently used
  timeout: 60000,
  // retries: 0, // This option can be set in each project below
  // workers: 1, // This option would need to be set inside each individual .spec.ts file

  testDir: './tests', // Will run all .spec.ts files in this root folder and all sub folders

  // testMatch: 'testSample.spec.ts', // Specific test file(s) to use for this project [can use regular expression to filter].
  // testIgnore: 'testSample.spec.ts', // Specific test(s) file to ignore [can use regular expression to filter].
  // testMatch/Ignore are used in the individual projects below and support reg-ex for filtering
  // grep/grepInvert can also be used to filter the tests
  // grep: /cart/ // Will run tests that have "cart" in test.describe title
  // grepInvert: /cart/ // Will run tests that do NOT have "cart" in the test.describe title

  reporter: [['html', { open: 'always' }]], // Will automatically open a browser window with the test report (only for local).

  projects: [
    // { name: 'setup', testMatch: '**/*.setup.ts' }, // This regex will also pick up auth.setup.ts (not desired right now)
    { name: 'setup', testMatch: 'global-setup.ts' }, // The Global Setup file contains the general login that is saved in the ENV - seems to use in-memory
    {
      // This project runs all tests under the api folder and sub folders, basically all our tests
      // This is the default project that is picked up by the automated pipeline run based on tye YML config
      name: 'api',
      use: { browserName: 'chromium' },
      dependencies: ['setup'], // Not all tests may need the 'global setup', but if any tests need it in the folder, it must be included here

      testDir: 'tests/api',
      testIgnore: 'testSample.spec.ts',
      // testMatch: '{testSample.spec.ts,delivery_cart.spec.ts}', // Run multiple files specifically
      // grep: /prod/,
      // grepInvert: /test/
    },
    {
      // This project runs the sample test, which currently only runs in local env
      name: 'sample',
      use: { browserName: 'chromium' },
      retries: 2, // Will retry tests that failed X number of times.

      testDir: './tests/api/mustPass',
      testMatch: 'testSample.spec.ts',
    },
    {
      // This project runs all test files in the mustPass sub-folder
      name: 'mustpass',
      use: { browserName: 'chromium' },
      dependencies: ['setup'],

      testDir: 'tests/api/mustPass',
      testIgnore: 'testSample.spec.ts',
    },
    {
      // This project runs all test files in the cart sub-folder
      name: 'cart',
      use: { browserName: 'chromium' },
      dependencies: ['setup'],
      
      testDir: 'tests/api/cart',
    },
    {
      // This project will run the Rapid PickUp Cart test in the cart folder 
      name: 'cart_rpu',
      use: { browserName: 'chromium' },
      dependencies: ['setup'],
      
      testDir: 'tests/api/cart',
      testMatch: 'cart.spec.ts',
    },
    {
      // This project will run the Delivery Cart test in the cart folder
      name: 'cart_delivery',
      use: { browserName: 'chromium' },
      dependencies: ['setup'],
      
      testDir: 'tests/api/cart',
      testMatch: 'delivery_cart.spec.ts',
    },
    {
      // This project will run the Login test in the mustPass folder
      name: 'login',
      use: { browserName: 'chromium' },
      dependencies: ['setup'],
      
      testDir: 'tests/api/mustpass',
      testMatch: 'testLogin.spec.ts',
    },
  ]  
});