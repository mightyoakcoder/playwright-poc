import { test, expect } from '@playwright/test';
import { api_token, baseUrl, resetConfigVariables, getConfigVariables, login, user_logins } from '../testConfig'

test.beforeAll(async () => {
  resetConfigVariables();
});

test.beforeAll('BeforeAll',async () =>{
  // This must be present on all tests files
  // It can be commented out if the test is intended to be run on every environment
  // Add the name(s) of the environment these tests will run on

  const envNames: string[] = ["test"]; // The ENV the tests WILL run on (will NOT run on any other)
  test.skip(!envNames.includes(process.env.CI_ENVIRONMENT_NAME ? process.env.CI_ENVIRONMENT_NAME : "") , `This group of test(s) will only run if the CI ENV name matches (${envNames.join(", ")}).`);
});

test.describe.serial('Customer Tests', async () => {

  test.describe.configure({ retries: 2 });
  // A unique username fixes the random 401 failures
  const username = user_logins[2].username;
  const password = user_logins[2].password;
    
  test("GET - Customer Profile (/users/:billing)", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      const loginResponse = await login(username, password);
    
      if (!loginResponse.authToken || !loginResponse.billingId) {
        throw new Error('Auth token or billing ID is missing');
      }
      
      // Get the Token/ID from Config
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId'); 

      const headers = {
        'Content-Type': 'application/json',
        'api_token': api_token.ios,
        "auth_token": authToken,
        'Authorization': `Bearer Reason object`,
      }

      const response = await request.get(`${baseUrl.mob}/users/${billingId}`, {
        timeout: timeoutValue
        ,headers: headers
      });
      
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

  test("GET - Customer Order History (/users/:billingId/orderHistory)", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      // const loginResponse = await login(username, password); // Test are serial | we do not need to login again
      // Get the Token/ID from Config
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId'); 
      if (!authToken || !billingId) {
        throw new Error('Auth token or billing ID is missing');
      }
      

      const headers = {
        'Content-Type': 'application/json',
        'api_token': api_token.ios,
        "auth_token": authToken,
        'Authorization': `Bearer Reason object`,
      }
      
      const response = await request.get(`${baseUrl.mob}/users/${billingId}/orderHistory`, {
        timeout: timeoutValue
        ,headers: headers
      });
      
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

      for (const validResponse of responseBody) {
        // Validate orderId
        expect(typeof validResponse.orderId).toBe('number');
    
        // Validate iposOrderId
        expect(typeof validResponse.iposOrderId).toBe('string');
    
        // Validate summary object
        expect(typeof validResponse.summary).toBe('object');
        expect(typeof validResponse.summary.status).toBe('string');
        expect(typeof validResponse.summary.destination).toBe('string');
        expect(typeof validResponse.summary.destinationId).toBe('number');
        // Validate other fields in summary as needed
    
        // Validate dates object
        expect(typeof validResponse.dates).toBe('object');
        expect(typeof validResponse.dates.ordStart).toBe('string');
        expect(typeof validResponse.dates.ordFulfill).toBe('string');
        // Validate other fields in dates as needed
    
        // Validate cafes array
        expect(Array.isArray(validResponse.cafes)).toBe(true);
        expect(typeof validResponse.cafes[0].id).toBe('number');
        expect(typeof validResponse.cafes[0].type).toBe('string');
        // Validate other fields in cafes as needed
    
        // Validate customer object
        expect(typeof validResponse.customer).toBe('object');
        expect(typeof validResponse.customer.id).toBe('number');
        expect(typeof validResponse.customer.firstName).toBe('string');
        expect(typeof validResponse.customer.loyaltyNum).toBe('number');
        expect(typeof validResponse.customer.smsOptIn).toBe('boolean');
        // Validate other fields in customer as needed
    
        // Validate items array
        expect(Array.isArray(validResponse.items)).toBe(true);
        expect(typeof validResponse.items[0].sequenceNum).toBe('number');
        expect(typeof validResponse.items[0].itemId).toBe('number');
        expect(typeof validResponse.items[0].type).toBe('string');
        expect(typeof validResponse.items[0].name).toBe('string');
    
        // Validate payment object
        expect(typeof validResponse.payment).toBe('object');
        expect(Array.isArray(validResponse.payment.creditCards)).toBe(true);
        
      }
      
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
  
  test("GET - Customer Payment Methods (/users/:billingId/paymentmethods)", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      // const loginResponse = await login(username, password); // Test are serial | we do not need to login again
      // Get the Token/ID from Config
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId'); 
      if (!authToken || !billingId) {
        throw new Error('Auth token or billing ID is missing');
      }

      const headers = {
        'Content-Type': 'application/json',
        'api_token': api_token.ios,
        "auth_token": authToken,
        'Authorization': `Bearer Reason object`,
      }
      
      const response = await request.get(`${baseUrl.mob}/users/${billingId}/paymentmethods`, {
        timeout: timeoutValue
        ,headers: headers
      });
      
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
     
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
});