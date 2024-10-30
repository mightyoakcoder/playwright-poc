import { test, expect } from '@playwright/test';
import { api_token, baseUrl, resetConfigVariables, getConfigVariables, setConfigVariables, login, user_logins, userProfile } from '../testConfig'

test.beforeAll(() => {
  resetConfigVariables();
});

test.beforeAll('BeforeAll',async () =>{
  // This must be present on all tests files
  // It can be commented out if the test is intended to be run on every environment
  // Add the name(s) of the environment these tests will run on

  const envNames: string[] = ["test"]; // The ENV(s) the tests WILL run on (will NOT run on any other)
  test.skip(!envNames.includes(process.env.CI_ENVIRONMENT_NAME ? process.env.CI_ENVIRONMENT_NAME : "") , `This group of test(s) will only run if the CI ENV name matches (${envNames.join(", ")}).`);
});

test.describe('Cart Flow', async () => {

  const cafeId = 600668
  const username = user_logins[0].username; // Not used || We use the Global Setup
  const password = user_logins[0].password;

  await userProfile();
     
  const authToken = getConfigVariables('authToken');
  const billingId = getConfigVariables('billingId');

  // console.log("02 - User Token: ", authToken);
  // console.log("02 - User ID: ", billingId);

  if (authToken == undefined || billingId == undefined){
    test.skip(true, "Required parameters missing: Auth Token || Billing ID");
  }  

  test("POST - Login", async ({ request }, testInfo) => {
    try {

      // This test is no longer needed since we are using the Global Setup file
      // Keep it here in the event we revert back or for storage testing
      if (authToken == undefined || billingId == undefined){
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
      // const authToken = getConfigVariables('authToken');
      // const billingId = getConfigVariables('billingId');     

      if (authToken == undefined || billingId == undefined){
        testInfo.annotations.push({ type: 'Assertion', description: `Test skipped due to missing Config Variables. Likely caused by a failed test previously in sequence.` });
        test.skip();
      }
      const expectedStatus = 200;

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

  test("POST - Cart Create", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      // const authToken = getConfigVariables('authToken');
      // const billingId = getConfigVariables('billingId');     

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
          "cafes":[{"id":cafeId } ]
          ,"createGroupOrder": false
          ,"applyDynamicPricing": true
          ,"serviceFeeSupported": true
          ,"customer": {
              "id": billingId
              ,"identityProvider": `${customer.loginType}`
              ,"lastName": `${customer.lastName}`
              ,"firstName": `${customer.firstName}`
              ,"loyaltyNum": `${customer.loyaltyNum}`
              ,"email": `${customer.email}`
              ,"phone": `${customer.phone}`
              }
          ,"cartSummary": {
              "orderFulfillmentDT": `${order_fullfillment_dt}`
              ,"deliveryFee": "0.00"
              ,"priority": "LATER"
              ,"languageCode": "en-US"
              ,"specialInstructions": ""
              ,"clientType": "MOBILE_IOS"
              ,"pickupPoint": "IN_CAFE"
              ,"destination": "RPU"
              ,"appVersion": "Omni_iOS_4.52.0"
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
      // // const authToken = getConfigVariables('authToken');
      // const billingId = getConfigVariables('billingId');

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
                "itemId": 781343,
                "type": "PRODUCT",
                "name": "Tropical Green Smoothie",
                "quantity": 7
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
      // // const authToken = getConfigVariables('authToken');
      // const billingId = getConfigVariables('billingId');

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
                "itemId": 781062,
                "type": "PRODUCT",
                "name": "Cappuccino",
                "quantity": 3
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

  test("GET - Check That Delivery Pricing Rules Are Not Present", async ({ request }, testInfo) => {
    try {
      const timeoutValue = getConfigVariables('timeoutValue');
      // const authToken = getConfigVariables('authToken');
      // const billingId = getConfigVariables('billingId');

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

      
      const items = responseBody.items;
      let itemIdsWithDeliveryRule: { itemId: number; ruleName: string }[] = [];
      
      items.forEach(item => {
        if (item.pricingRules && item.pricingRules.length > 0) {
          item.pricingRules.forEach(rule => {
            if (rule.ruleName.includes('ECOM_DELIVERY_')) {
              itemIdsWithDeliveryRule.push({ itemId: item.itemId, ruleName: rule.ruleName });
            }
          })
        }
      })
      
      expect(itemIdsWithDeliveryRule).toStrictEqual([]);      
      
      if (status == expectedStatus){ setConfigVariables('cart', responseBody); }
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
      // const authToken = getConfigVariables('authToken');
      // const billingId = getConfigVariables('billingId');

      const expectedStatus = 200;

      const cart = getConfigVariables('cart');
      if (cart == undefined){
        testInfo.annotations.push({type: 'Assertion',description: `Test skipped due to mising cart. Issue with Create Cart test.`});
        test.skip();
      }  
      const cartId = cart.cartId;
      const itemNum = 1;
      
      const requestURL = `${baseUrl.mob}/cart/${cartId}/item/${itemNum}?summary=true`;
      testInfo.annotations.push({ type: 'Request [DEL]', description: requestURL });

      const response = await request.delete(requestURL, {
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
      // const authToken = getConfigVariables('authToken');
      // const billingId = getConfigVariables('billingId');

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
      // const authToken = getConfigVariables('authToken');
      // const billingId = getConfigVariables('billingId');

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
      // const authToken = getConfigVariables('authToken');
      // const billingId = getConfigVariables('billingId');

      const expectedStatus = 200;

      const customer = getConfigVariables('customer');
      const cart = getConfigVariables('cart');
      if (cart == undefined){
        testInfo.annotations.push({type: 'Assertion',description: `Test skipped due to mising cart. Issue with Create Cart test.`});
        test.skip();
      }  
      const cartId = cart.cartId;

      const requestURL = `${baseUrl.mob}/payment/v2/slot-submit/${cartId}?zipReprompt=true`;
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
      // const authToken = getConfigVariables('authToken');
      // const billingId = getConfigVariables('billingId');

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