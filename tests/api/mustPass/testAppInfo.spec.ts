import { test, expect } from '@playwright/test';
import { api_token, baseUrl, resetConfigVariables, getConfigVariables, login } from '../testConfig'

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

test.describe.parallel('App Info Tests', async () => {
  
  test("POST - iOS App Config", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');

      const response = await request.post(`${baseUrl.mob}/applicationConfig`, {
        timeout: timeoutValue
        ,headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios,
        },
        data: {
          "version": "4.26.1"
        }
      });
      
      const status = response.status();
      const responseBody = await response.json();
      const responseStr = JSON.stringify(responseBody, null, 2)
      testInfo.annotations.push({ type: 'Response', description: responseStr });
      
      const expectedStatus = 200;

      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected status: ${expectedStatus}, Actual status: ${status}`
      });

      expect(status).toBe(expectedStatus);
      
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });

  test("POST - Android App Config", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');

      const response = await request.post(`${baseUrl.mob}/applicationConfig`, {
        timeout: timeoutValue
        ,headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.android,
        },
        data: {
          "version": "4.27.3"
        }
      });
      
      const status = response.status();
      const responseBody = await response.json();
      const responseStr = JSON.stringify(responseBody, null, 2)
      testInfo.annotations.push({ type: 'Response', description: responseStr });
      
      const expectedStatus = 200;

      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected status: ${expectedStatus}, Actual status: ${status}`
      });

      expect(status).toBe(expectedStatus);
      
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });

  test("POST - Kiosk App Config", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');

      const response = await request.post(`${baseUrl.mob}/applicationConfig`, {
        timeout: timeoutValue
        ,headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.kiosk,
        },
        data: {
          "version": "0.0.1"
        }
      });
      
      const status = response.status();
      const responseBody = await response.json();
      const responseStr = JSON.stringify(responseBody, null, 2)
      testInfo.annotations.push({ type: 'Response', description: responseStr });
      
      const expectedStatus = 200;

      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected status: ${expectedStatus}, Actual status: ${status}`
      });

      expect(status).toBe(expectedStatus);
      
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });

  test("GET - version", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
  
      const response = await request.get(`${baseUrl.mob}/version`, {
        timeout: timeoutValue
        ,headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios
        }
      });
      const status = response.status();
      const responseBody = await response.json();
      const responseStr = JSON.stringify(responseBody, null, 2)
      testInfo.annotations.push({ type: 'Response', description: responseStr });
      
      const expectedStatus = 200;

      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected status: ${expectedStatus}, Actual status: ${status}`
      });

      expect(status).toBe(expectedStatus);
  
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });

  test("GET - heartbeat", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
  
      const response = await request.get(`${baseUrl.mob}/heartbeat`, {
        timeout: timeoutValue
        ,headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios
        }
      });
      const text = await response.text();
      expect(text).toBe('OK');

      const status = response.status();
      testInfo.annotations.push({ type: 'Response', description: text });
      
      const expectedStatus = 200;

      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected status: ${expectedStatus}, Actual status: ${status}`
      });

      expect(status).toBe(expectedStatus);
  
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
});