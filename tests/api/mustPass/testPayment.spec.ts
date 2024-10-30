import { test, expect } from '@playwright/test';
import { api_token, baseUrl, resetConfigVariables, getConfigVariables, login, setConfigVariables } from '../testConfig'

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

test.describe.serial('Payment Tests', async () => {
  // This test uses a giftCard blob that is hard coded
  // Need to get a new giftCard blob and potentially put it somewhere else (ENV) to be more dynamic

  test.skip("1" == "1", "Need a new giftCard blob for these tests.");

  test("POST - Giftcard Balance Inquiry (/payment/v2/balanceinquiry)", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');

      const headers = {
        'Content-Type': 'application/json',
        'api_token': api_token.ios,
      }

      const response = await request.post(`${baseUrl.mob}/payment/v2/balanceinquiry`, {
        timeout: timeoutValue
        ,headers: headers,
        data: {
          "giftCard" : "hoksh9Iij3yVqb0fUBv6skgSrGMdsiEOtG\/7xV4WI6Jnzyyo9cAg4\/OMsAGTuY1ASrWCkSWztmxBUrJvrB+yRE49FI4LHGbWnZsKvuYemtiydtMQIz6LSUp8y7ailUfubYBIK8ap4gFKEKID8yMmX+YzYtcJMJHZiDyJhUdbpZGb0fljGUv5pYjzmry3658Hm14qo8dxVtqeo481JecS9ncJMbY5WFba\/Cr\/\/XyCoPvcGCSujatrxhcbGT8dStUhE0wnjr5syD6PrpYo03Hgt325EJUewBuvL6mVKmLscfPM7KF6\/nX2sfFRBceM18ltSS9z3u+Qc844JyEFh3mNbg=="
        }
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
      
      setConfigVariables('giftCardData', responseBody)
      expect(Array.isArray(responseBody.giftCardBalance)).toBe(true);
      const giftCard = responseBody.giftCardBalance[0];
      const expectedGiftCardStructure = {
        giftCardNo: 'string',
        giftCardBalance: 'number',
        cardExpirationDate: 'string',
        status: 'string',
        isPromoCard: 'boolean',
        payTypeId: 'number'
      };

      for (const [key, type] of Object.entries(expectedGiftCardStructure)) {
        expect (typeof giftCard[key]).toBe(type);
        testInfo.annotations.push({
          type: 'Data Validation',
          description: `${key} is a ${typeof giftCard[key]}`
        });
      }

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
  
});