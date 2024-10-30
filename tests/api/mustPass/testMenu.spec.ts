import { test, expect } from '@playwright/test';
import { api_token, baseUrl, resetConfigVariables, setConfigVariables, getConfigVariables } from '../testConfig'

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

test.describe.serial('Menu Tests', async () => {

  const cafeId = 600668

  test("GET - App Clip Menu (/appclip/:id/menu)", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');

      const headers = {
        'Content-Type': 'application/json',
        'api_token': api_token.ios,
      }

      const response = await request.get(`${baseUrl.mob}/appclip/${cafeId}/menu?deviceTime=20240702T123300}`, {
        timeout: timeoutValue
        ,headers: headers
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

  test("GET - Menu Version (/:id/menu/version)", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');

      const headers = {
        'Content-Type': 'application/json',
        'api_token': api_token.ios,
      }
      
      const response = await request.get(`${baseUrl.mob}/${cafeId}/menu/version?fulfillmentDate=2024-07-02`, {
        timeout: timeoutValue
        ,headers: headers
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
      
      const menuData = {
        collectionName: responseBody.collectionName,
        aggregateVersion: responseBody.aggregateVersion,
        aggregateVersionId: responseBody.aggregateVersionId,
        customizationVersion: responseBody.customizationVersion,
        nutritionVersion: responseBody.nutritionVersion,
        schedulesVersion: responseBody.schedulesVersion,
        searchVersion: responseBody.searchVersion
      };
      setConfigVariables('menuData', menuData);

      const keysToValidate = {
        collectionName: 'string',
        aggregateVersionId: 'string',
        aggregateVersion: 'string',
        customizationVersion: 'string',
        nutritionVersion: 'string',
        schedulesVersion: 'string',
        searchVersion: 'string'
      };

      for (const [key, type] of Object.entries(keysToValidate)) {
        expect(responseBody[key]).toEqual(expect.any(String));
        testInfo.annotations.push({
          type: 'Data Validation:',
          description: `${key} is a ${typeof responseBody[key]}`
        });
      }

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });

  test("POST - Menu By Nutrition Version (/:lang/v2/nutrition/:nutritionVersion/:id) ", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');

      const menuData = getConfigVariables('menuData');
      
      const headers = {
        'Content-Type': 'application/json',
        'api_token': api_token.ios,
      }
      
      const response = await request.post(`${baseUrl.mob}/en-US/v2/nutrition/${menuData.nutritionVersion}/${cafeId}`, {
        timeout: timeoutValue
        ,headers: headers,
        data: {
          "items" : [
            {
              "promotional" : false,
              "childItems" : [
                {
                  "name" : "Chips",
                  "calories" : 150,
                  "type" : "SIDE",
                  "promotional" : false,
                  "isNoSideOption" : false,
                  "quantity" : 1,
                  "parentId" : 0,
                  "itemId" : 474
                }
              ],
              "quantity" : 1,
              "parentId" : 0,
              "portion" : "Whole",
              "name" : "Chicken Bacon Rancher",
              "type" : "PRODUCT",
              "calories" : 870,
              "itemId" : 648625,
              "isNoSideOption" : false
            }
          ],
          "context" : {
            "destination" : "RPU",
            "orderConfiguration" : "IOS_ECOM_RPU",
            "cafeId" : 500000,
            "cartPricing" : false,
            "orderFulfillmentDT" : "2024-07-02T14:34:17-04:00",
            "customer" : {
              "id" : 73963994,
              "subscriptions" : [
        
              ],
              "loyaltyNum" : 620013567808
            }
          }
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

      const keysToValidate = {
        collectionName: 'string',
        aggregateVersionId: 'string',
        aggregateVersion: 'string',
        customizationVersion: 'string',
        nutritionVersion: 'string',
        schedulesVersion: 'string',
        searchVersion: 'string'
      };

      for (const [key, type] of Object.entries(keysToValidate)) {
        expect(menuData[key]).toEqual(expect.any(String));
        testInfo.annotations.push({
          type: 'Data Validation',
          description: `${key} is a ${typeof menuData[key]}`
        });
      }

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });

  test("GET - Menu By Aggregate Version (/:id/menu/aggregate/:version) ", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');

      const menuData = getConfigVariables('menuData');
      
      const headers = {
        'Content-Type': 'application/json',
        'api_token': api_token.ios,
      }
      
      const response = await request.get(`${baseUrl.mob}/${cafeId}/menu/aggregate/${menuData.aggregateVersionId}`, {
        timeout: timeoutValue,
        headers: headers,
        
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

      const keysToValidate = {
        collectionName: 'string',
        aggregateVersionId: 'string',
        aggregateVersion: 'string',
        customizationVersion: 'string',
        nutritionVersion: 'string',
        schedulesVersion: 'string',
        searchVersion: 'string'
      };

      for (const [key, type] of Object.entries(keysToValidate)) {
        expect(menuData[key]).toEqual(expect.any(String));
        testInfo.annotations.push({
          type: 'Data Validation',
          description: `${key} is a ${typeof menuData[key]}`
        });
      }

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
});