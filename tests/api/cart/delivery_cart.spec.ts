import { test, expect } from '@playwright/test';
import { api_token, baseUrl, resetConfigVariables, getConfigVariables, setConfigVariables, login, user_logins, userProfile } from '../testConfig'

test.beforeAll(() => {
  resetConfigVariables();
});

test.beforeAll('BeforeAll',async () =>{
  // This must be present on all tests files
  // It can be commented out if the test is intended to be run on every environment
  // Add the name(s) of the environment these tests will run on

  const envNames: string[] = ["test","prod"]; // The ENV the tests WILL run on (will NOT run on any other)
  test.skip(!envNames.includes(process.env.CI_ENVIRONMENT_NAME ? process.env.CI_ENVIRONMENT_NAME : "") , `This group of test(s) will only run if the CI ENV name matches (${envNames.join(", ")}).`);
});

test.describe('Delivery Cart Flow', async () => {

  const cafeId = 600668
  const username = user_logins[3].username;
  const password = user_logins[3].password;

  // We can not use Global Setup here because cart RPU already uses that login
  // Which causes a conflict with multiple create carts

  test("POST - Login", async ({ request }, testInfo) => {
    try {
      const loginResponse = await login(username, password);

      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId');

      const expectedStatus = 200;
      const status = getConfigVariables('status');
      expect(status).toBe(expectedStatus);
      testInfo.annotations.push({type: 'Assertion', description: `Expected status: ${expectedStatus}, Actual status: ${status}`
      });

      if (!authToken || !billingId) {
        throw new Error('Auth token or billing ID is missing');
      }

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
 
  test("GET - Customer Profile", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId');

      if (authToken == undefined || billingId == undefined){
        testInfo.annotations.push({ type: 'Assertion', description: `Test skipped due to mising Config Variables. Likely caused by a failed test previously in sequence.` });
        test.skip();
      }
      const expectedStatus = 200;
      console.log("Expected Status:", expectedStatus);
      
      const requestURL = `${baseUrl.mob}/users/${billingId}`;
      testInfo.annotations.push({ type: 'Request [GET]', description: requestURL });

      const response = await request.get(requestURL, {
        timeout: timeoutValue
        ,headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios,
          'auth_token': authToken,
          'Authorization': `Bearer Reason object`,
        },
      });

      const status = response.status();
      const responseBody = await response.json();
      const responseStr = JSON.stringify(responseBody, null, 2);
      testInfo.annotations.push({ type: 'Response', description: responseStr });

      if (responseBody.paymentOptions){
        // We only set the customer if we have a payment token
        if (responseBody.paymentOptions.creditCards[0].token){
          setConfigVariables('customer', responseBody);
        }
      }
      // const customer = getConfigVariables('customer');
      // console.log("payment token: ", customer.paymentOptions.creditCards[0].token);

      expect(responseBody.paymentOptions.creditCards[0]).not.toBeUndefined();
      const paymentToken = responseBody.paymentOptions.creditCards[0].token;
      expect(paymentToken).toEqual(expect.any(String));
      testInfo.annotations.push({
        type: 'Assertion',
        description: `Payment Token is a ${typeof paymentToken}`
      });      

      
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

  test("POST - Delivery Cart Create", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId');     

      if (authToken == undefined || billingId == undefined){
        testInfo.annotations.push({ type: 'Assertion', description: `Test skipped due to mising Config Variables. Likely caused by a failed test previously in sequence.` });
        test.skip();
      }
      const customer = getConfigVariables('customer');
      if (customer == undefined){
        testInfo.annotations.push({type: 'Assertion',description: `Test skipped due to mising customer. Issue with Customer Profile test.`});
        test.skip();
      }  
      const expectedStatus = 201;

      // Get a fullfillment date in the future [must be appropriate format or we possibly encounter 422 errors | also due to time of day possibly]
      // `2024-07-08T14:51:25-05:00`
      var dt = new Date();
      dt.setDate(dt.getDate() + 5);
      var timestamp = dt.toISOString();
      // const order_fullfillment_dt = timestamp.split('.')[0] + "-05:00";;
      const order_fullfillment_dt = timestamp.substring(0,10) + "T14:05:05-05:00"; // always 2 PM to prevent time of day issues
      // console.log(`Fullfilment Date: ${order_fullfillment_dt}`);      

      const requestURL = `${baseUrl.mob}/cart`;
      testInfo.annotations.push({ type: 'Request [POST]', description: requestURL });

      const response = await request.post(requestURL, {
        timeout: timeoutValue
        ,headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios,
          'auth_token': authToken,
          'Authorization': `Bearer Reason object`,
        },
        data: {
          "serviceFeeSupported": true,
          "cafes": [
              {
                  "pagerNum": 0,
                  "id": 600668
              }
          ],
          "deliveryInfo": {
              "distance": "0.37",
              "address1": "3630 S Geyer Rd",
              "countryDivision": "MO",
              "address2": "",
              "phone": `${customer.phone}`,
              "addressType": "Unknown",
              "instructions": "",
              "postalCode": "63127",
              "city": "Saint Louis",
              "contactless": false
          },
          "subtotalWithSavings": true,
          "cartSummary": {
              "deliveryFee": "1.00", // Do we want to hard code a fee, or let the api call handle that?
              "languageCode": "en-US",
              "clientType": "MOBILE_IOS",
              "specialInstructions": "",
              "destination": "DELIVERY",
              "priority": "ASAP",
              "leadTime": 30
          },
          "futureMenuEnabled": true,
          "customer": {
              "id": billingId
              ,"identityProvider": `${customer.loginType}`
              ,"lastName": `${customer.lastName}`
              ,"firstName": `${customer.firstName}`
              ,"loyaltyNum": `${customer.loyaltyNum}`
              ,"email": `${customer.email}`
              ,"phone": `${customer.phone}`
          }
      }
      });

      const status = response.status();
      const responseBody = await response.json();
      
      const responseStr = JSON.stringify(responseBody, null, 2);
      testInfo.annotations.push({ type: 'Response', description: responseStr });
      
      if (status == expectedStatus){ setConfigVariables('cart', responseBody); }
      
      const expectedCartStatus = "CREATED";
      const cartStatus = responseBody.cartStatus;
      expect(status).toBe(expectedStatus);
      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected Cart Status: ${expectedCartStatus}, Actual Cart Status: ${cartStatus}`
      });
      
      const cartId = responseBody.cartId;
      // console.log(`Cart ID: ${cartId}`);

      expect(cartId).toEqual(expect.any(String));
      testInfo.annotations.push({
        type: 'Assertion',
        description: `Cart ID is a ${typeof cartId}`
      });    

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

  test("POST - Add Item", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId');

      const expectedStatus = 200;

      const cart = getConfigVariables('cart');
      if (cart == undefined){
        testInfo.annotations.push({type: 'Assertion',description: `Test skipped due to mising cart. Issue with Create Cart test.`});
        test.skip();
      }  
      const cartId = cart.cartId;
      
      const requestURL = `${baseUrl.mob}/cart/${cartId}/item?summary=true`;
      testInfo.annotations.push({ type: 'Request [POST]', description: requestURL });

      const response = await request.post(requestURL, {
        timeout: timeoutValue
        ,headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios,
          'auth_token': authToken,
          'Authorization': `Bearer Reason object`,
        },
        data: {
          "items": [
            {
              "itemId": 648625,
              "type": "PRODUCT",
              "name": "Chicken Bacon Rancher",
              "quantity": 3
          }              
          ]
      }
      });
      
      const status = response.status();
      const responseBody = await response.json();
      
      const responseStr = JSON.stringify(responseBody, null, 2);
      testInfo.annotations.push({ type: 'Response', description: responseStr });

      if (status == expectedStatus){ setConfigVariables('cart', responseBody); } // Confirm this works as intended.    
      
      const expectedCartStatus = "IN_PROGRESS";
      const cartStatus = responseBody.cartStatus;
      expect(status).toBe(expectedStatus);
      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected Cart Status: ${expectedCartStatus}, Actual Cart Status: ${cartStatus}`
      });
      
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
    
  test("POST - Add Item 2", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId');

      const expectedStatus = 200;

      const cart = getConfigVariables('cart');
      if (cart == undefined){
        testInfo.annotations.push({type: 'Assertion',description: `Test skipped due to mising cart. Issue with Create Cart test.`});
        test.skip();
      }  
      const cartId = cart.cartId;
      
      const requestURL = `${baseUrl.mob}/cart/${cartId}/item?summary=true`;
      testInfo.annotations.push({ type: 'Request [POST]', description: requestURL });

      const response = await request.post(requestURL,{
          timeout: timeoutValue,
          headers: {
            "Content-Type": "application/json",
            api_token: api_token.ios,
            auth_token: authToken,
            Authorization: `Bearer Reason object`,
          },
          data: {
            "items": [
              {
                "itemId": 648957,
                "type": "PRODUCT",
                "name": "Green Goddess Chicken Cobb Salad",
                "quantity": 2
              }              
            ]
          }
        }
      );
      
      const status = response.status();
      const responseBody = await response.json();
      const responseStr = JSON.stringify(responseBody, null, 2);
      testInfo.annotations.push({ type: 'Response', description: responseStr });

      if (status == expectedStatus){ setConfigVariables('cart', responseBody); }
      
      const expectedCartStatus = "IN_PROGRESS";
      const cartStatus = responseBody.cartStatus;
      expect(status).toBe(expectedStatus);
      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected Cart Status: ${expectedCartStatus}, Actual Cart Status: ${cartStatus}`
      });
      
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

  test("GET - Check That Delivery Pricing Rules Are Present", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId');

      const expectedStatus = 200;

      const cart = getConfigVariables('cart');
      if (cart == undefined){
        testInfo.annotations.push({type: 'Assertion',description: `Test skipped due to mising cart. Issue with Create Cart test.`});
        test.skip();
      }  
      const cartId = cart.cartId;

      const requestURL = `${baseUrl.mob}/cart/${cartId}/summary`;
      testInfo.annotations.push({ type: 'Request [GET]', description: requestURL });

      const response = await request.get(requestURL, {
        timeout: timeoutValue,
        headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios,
          'auth_token': authToken,
          'Authorization': `Bearer Reason object`,
        }
      });
      
      const status = response.status();
      const responseBody = await response.json();
      const responseStr = JSON.stringify(responseBody, null, 2);
      testInfo.annotations.push({ type: 'Response', description: responseStr });

      if (status == expectedStatus){ setConfigVariables('cart', responseBody); }
      
      const items = responseBody.items;
      let itemIdsWithDeliveryRule: { itemId: number; ruleName: string }[] = [];
      let basePrice: { basePrice: number }[] = []
      let adjPrice: { adjPrice: number }[] = []

      items.forEach(item => {
        if (item.pricingRules && Array.isArray(item.pricingRules)) {
          item.pricingRules.forEach(rule => {
            if (rule.ruleName.includes('ECOM_DELIVERY_')) {
              itemIdsWithDeliveryRule.push({ itemId: item.itemId, ruleName: rule.ruleName });
            }
            if (rule.basePrice) {
              basePrice.push({basePrice: rule.basePrice})
            }
            if (rule.adjPrice) {
              adjPrice.push({adjPrice: rule.adjPrice})
            }
          })
        }
      })
     
      const containsECOM_DELIVERY = itemIdsWithDeliveryRule.some(item => item.ruleName.includes("ECOM_DELIVERY_"));

      expect(containsECOM_DELIVERY).toBe(true);
      testInfo.annotations.push({
        type: 'Assertion',
        description: `ruleName(s): ${JSON.stringify(itemIdsWithDeliveryRule, null, 2)}`
      })

      const basePrices = basePrice.map(item => item.basePrice)
      const adjPrices = adjPrice.map(item => item.adjPrice)
      const adjPricesGreaterThanBasePrices = adjPrices.every((adj, index) => adj > basePrices[index]);

      expect(adjPricesGreaterThanBasePrices).toBe(true);
      
      const assertionDescription = adjPrices.map((adj, index) => {
        return `AdjPrice ${index + 1}: ${adj} is greater than Base Price ${index + 1}: ${basePrices[index]}`;
    }).join(', ');
    
    testInfo.annotations.push({
        type: 'Assertion',
        description: assertionDescription
      })

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
  
  test("DEL - Delete Item", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId');

      const expectedStatus = 200;

      const cart = getConfigVariables('cart');
      if (cart == undefined){
        testInfo.annotations.push({type: 'Assertion',description: `Test skipped due to mising cart. Issue with Create Cart test.`});
        test.skip();
      }  
      const cartId = cart.cartId;
      const itemNum = 2;
      
      const requestURL = `${baseUrl.mob}/cart/${cartId}/item/${itemNum}?summary=true`;
      testInfo.annotations.push({ type: 'Request [DEL]', description: requestURL });

      const response = await request.delete(requestURL, {
        timeout: timeoutValue,
        headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios,
          'auth_token': authToken,
          'Authorization': `Bearer Reason object`,
        }
      });
      
      const status = response.status();
      const responseBody = await response.json();
      const responseStr = JSON.stringify(responseBody, null, 2);
      testInfo.annotations.push({ type: 'Response', description: responseStr });

      if (status == expectedStatus){ setConfigVariables('cart', responseBody); }
      
      const expectedCartStatus = "IN_PROGRESS";
      const cartStatus = responseBody.cartStatus;
      expect(status).toBe(expectedStatus);
      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected Cart Status: ${expectedCartStatus}, Actual Cart Status: ${cartStatus}`
      });
      
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

  test("POST - Discount Code", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId');

      const expectedStatus = 200;

      const cart = getConfigVariables('cart');
      if (cart == undefined){
        testInfo.annotations.push({type: 'Assertion',description: `Test skipped due to mising cart. Issue with Create Cart test.`});
        test.skip();
      }  
      const cartId = cart.cartId;
      
      const requestURL = `${baseUrl.mob}/cart/${cartId}/discount?summary=true`;
      testInfo.annotations.push({ type: 'Request [POST]', description: requestURL });

      const response = await request.post(requestURL, {
        timeout: timeoutValue
        ,headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios,
          'auth_token': authToken,
          'Authorization': `Bearer Reason object`,
        },
        data: {
          "discounts": [
            {
                "type": "SPECIAL_CODE",
                "promoCode": "QAORDMULTI",
                "isSharable": false
            }
          ]
        }
      });
      
      const status = response.status();
      const responseBody = await response.json();
      const responseStr = JSON.stringify(responseBody, null, 2);
      testInfo.annotations.push({ type: 'Response', description: responseStr });

      if (status == expectedStatus){ setConfigVariables('cart', responseBody); }
      
      const expectedCartStatus = "IN_PROGRESS";
      const cartStatus = responseBody.cartStatus;
      expect(status).toBe(expectedStatus);
      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected Cart Status: ${expectedCartStatus}, Actual Cart Status: ${cartStatus}`
      });
      
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

  test("POST - Checkout", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId');

      const expectedStatus = 200;

      const cart = getConfigVariables('cart');
      if (cart == undefined){
        testInfo.annotations.push({type: 'Assertion',description: `Test skipped due to mising cart. Issue with Create Cart test.`});
        test.skip();
      }  
      const cartId = cart.cartId;
      
      const requestURL = `${baseUrl.mob}/cart/${cartId}/checkout?summary=true`;
      testInfo.annotations.push({ type: 'Request [POST]', description: requestURL });

      const response = await request.post(requestURL, {
        timeout: timeoutValue
        ,headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios,
          'auth_token': authToken,
          'Authorization': `Bearer Reason object`,
        }
      });
      
      const status = response.status();
      const responseBody = await response.json();
      const responseStr = JSON.stringify(responseBody, null, 2);
      testInfo.annotations.push({ type: 'Response', description: responseStr });

      if (status == expectedStatus){ setConfigVariables('cart', responseBody); }
      
      const expectedCartStatus = "CHECKEDOUT";
      const cartStatus = responseBody.cartStatus;
      expect(status).toBe(expectedStatus);
      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected Cart Status: ${expectedCartStatus}, Actual Cart Status: ${cartStatus}`
      });
      
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

  test("POST - Payment/Submit", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId');

      const expectedStatus = 200;

      const customer = getConfigVariables('customer');
      const cart = getConfigVariables('cart');
      if (cart == undefined){
        testInfo.annotations.push({type: 'Assertion',description: `Test skipped due to mising cart. Issue with Create Cart test.`});
        test.skip();
      }  
      const cartId = cart.cartId;

      // console.log("total price: " + `${cart.cartSummary.totalPrice}`);
      // console.log("cardHolderName: " + `${customer.paymentOptions.creditCards[0].cardholderName}`);
      
      const requestURL = `${baseUrl.mob}/payment/v2/slot-submit/${cartId}?zipReprompt=true`;
      testInfo.annotations.push({ type: 'Request [POST]', description: requestURL });

      const response = await request.post(requestURL, {
        timeout: timeoutValue,
        headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios,
          'auth_token': authToken,
          'Authorization': `Bearer Reason object`,
        },
        data: {
          "payment": {
            "creditCards": [
                {
                    "amount": cart.cartSummary.totalPrice,
                    "tokens": [
                        {
                            "cardHolderName": `${customer.paymentOptions.creditCards[0].cardholderName}`,
                            "cardType": `${customer.paymentOptions.creditCards[0].creditCardType}`,
                            "tokenType": `${customer.paymentOptions.creditCards[0].paymentProcessor}`,
                            "tokenValue": `${customer.paymentOptions.creditCards[0].token}`,
                            "expDate": `${customer.paymentOptions.creditCards[0].expirationDate}`,
                            "lastFour": `${customer.paymentOptions.creditCards[0].lastFour}`
                        }
                      ]
                }
            ],
            "campusCards": [],
            "giftCards": []
        },
        "customer": {
            "smsOptIn": false
          }            
        }
      });
      
      const status = response.status();
      const responseBody = await response.json();

      const responseStr = JSON.stringify(responseBody, null, 2);
      testInfo.annotations.push({ type: 'Response', description: responseStr });

      if (status == expectedStatus){ setConfigVariables('cart', responseBody); } // No longer needed?
      
      const expectedOrderStatus = "NEW";
      const orderStatus = responseBody.summary.status;
      expect(status).toBe(expectedStatus);
      testInfo.annotations.push({
        type: 'Assertion',
        description: `Expected Order Status: ${expectedOrderStatus}, Actual Order Status: ${orderStatus}`
      });
      
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

  test("GET - Order History", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      const authToken = getConfigVariables('authToken');
      const billingId = getConfigVariables('billingId');    

      if (authToken == undefined || billingId == undefined){
        testInfo.annotations.push({ type: 'Assertion', description: `Test skipped due to mising Config Variables. Likely caused by a failed test previously in sequence.` });
        test.skip();
      }

      const expectedStatus = 200;
      
      const requestURL = `${baseUrl.mob}/users/${billingId}/orderHistory`;
      testInfo.annotations.push({ type: 'Request [GET]', description: requestURL });

       const response = await request.get(requestURL, {
        timeout: timeoutValue
        ,headers: {
          'Content-Type': 'application/json',
          'api_token': api_token.ios,
          'auth_token': authToken,
          'Authorization': `Bearer Reason object`,
        },
      });
      
      const status = response.status();
      const responseBody = await response.json();
      const responseStr = JSON.stringify(responseBody, null, 2);
      testInfo.annotations.push({ type: 'Response', description: responseStr });
      
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