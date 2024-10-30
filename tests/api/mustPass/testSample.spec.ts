import { test, expect } from '@playwright/test';
import { api_token, baseUrl, resetConfigVariables, getConfigVariables, login, user_logins } from '../testConfig'

test.beforeAll(async () => {
  resetConfigVariables();
});

test.beforeAll('BeforeAll',async () =>{
  // This must be present on all tests files
  // It can be commented out if the test is intended to be run on every environment
  // Add the name(s) of the environment these tests will run on

  const envNames: string[] = ["test","prod"]; // The ENV the tests WILL run on (will NOT run on any other)
  test.skip(!envNames.includes(process.env.CI_ENVIRONMENT_NAME ? process.env.CI_ENVIRONMENT_NAME : "") , `This group of test(s) will only run if the CI ENV name matches (${envNames.join(", ")}).`);
});

test.describe.serial('Customer Tests', async () => {

  // Regardless of ENV Name, another way to skip tests in the pipeline
  test.skip(process.env.CI !== undefined, "This group of tests will only run in local env, where .CI is undefined.");

  test.describe.configure({ retries: 2 }); // will retry 2 times if any test fail

  test("POST - Login - Good Creds", async ({ request }, testInfo) => {

    const username = user_logins[1].username;
    const password = user_logins[1].password;
    
    const response = await login(username, password);
    const responseStr = JSON.stringify(response, null, 2)
    testInfo.annotations.push({ type: 'Response', description: responseStr });

    const expectedStatus = 200;
    const status = getConfigVariables('status');
    expect(status).toBe(expectedStatus);
    testInfo.annotations.push({type: 'Assertion', description: `Expected status: ${expectedStatus}, Actual status: ${status}`
    });

    const authToken = getConfigVariables('authToken');
    expect(authToken).toEqual(expect.any(String));
    testInfo.annotations.push({type: 'Assertion', description: `authToken is a ${typeof authToken}`
    });

  });  
    
  test("GET - Customer Profile (/users/:billing)", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');

      console.log("Timeout Value: ", timeoutValue); // Log messages are useful during dev and also available in the HTML Report in the "stdout"

      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId');

      if (!authToken || !billingId) {
        throw new Error('Auth token or billing ID is missing');
      }

      const requestURL = `${baseUrl.mob}/users/${billingId}`;
      testInfo.annotations.push({ type: 'Request [GET]', description: requestURL });

      const response = await request.get(requestURL, {
        timeout: timeoutValue
        ,headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios,
          "auth_token": authToken,
          'Authorization': `Bearer Reason object`,
        }
      });
      
      console.log("Received Status: ", response.status());

      const status = response.status();
      const responseBody = await response.json();
      const responseStr = JSON.stringify(responseBody, null, 2)
      testInfo.annotations.push({ type: 'Response', description: responseStr });
      
      const expectedStatus = 200;
      expect(status).toBe(expectedStatus);
      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected status: ${expectedStatus}, Actual status: ${status}`
      });

      expect(typeof responseBody.customerId).toBe('string');
      expect(typeof responseBody.paymentOptions).toBe('object');
      expect(Array.isArray(responseBody.paymentOptions.creditCards)).toBe(true);
      expect(typeof responseBody.paymentOptions.creditCards[0].token).toBe('string');
      expect(typeof responseBody.paymentOptions.creditCards[0].expirationDate).toBe('string');

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
});