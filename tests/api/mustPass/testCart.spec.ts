// import { test, expect } from '@playwright/test';
// import { api_token, baseUrl, resetConfigVariables, getConfigVariables, login } from '../testConfig'

// test.beforeAll(() => {
//   resetConfigVariables();
// });

// test.describe.serial('Cart Tests', async () =>  {
//   let responseBody;
//   const username = "becky.test+1510@gmail.com";
//       const password = "Bread@123";
//       const loginResponse = await login(username, password);


//       if (!loginResponse.authToken || !loginResponse.billingId) {
//         throw new Error('Auth token or billing ID is missing');
//       }
  
//   const accessToken = getConfigVariables('accessToken');
//   const billingId = getConfigVariables('customerId');
//   console.log('accessToken(cart):', accessToken);
//   console.log('billingId(cart):', billingId);
  
//   test("POST - Create Cart", async ({ request }, testInfo) => {

//     try {
//       const response = await request.post(`${baseUrl}/cart`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'api_token': api_token.ios,
//         },
//         data: { 
//           "cartSummary": {
//               "leadTime": 10,
//               "pickupPoint": "CURBSIDE",
//               "destination": "RPU",
//               "priority": "ASAP",
//               "deliveryFee": "0.00",
//               "specialInstructions": "Blue Ford Fusion",
//               "languageCode": "en-US",
//               "clientType": "MOBILE_IOS"
//           },
//           "cafes": [
//               {
//                   "pagerNum": 0,
//                   "id": 600668
//               }
//           ],
//           "applyDynamicPricing": false,
//           "customer": {
//           "id": billingId
//         }
//       }
//       });
      
//       responseBody = await response.json(); // assuming the response is JSON
      
//       const responseBodyStr = JSON.stringify(responseBody, null, 2)
//       testInfo.annotations.push({ type: 'Response', description: responseBodyStr });

//       const expectedStatus = 201;
//       const actualStatus = response.status();
//       testInfo.annotations.push({ type: 'Assertion', description: `Expected status: ${expectedStatus}, Actual status: ${actualStatus}`});
//       expect(actualStatus).toBe(expectedStatus);

//     } catch (error) {
//       console.error('Error:', error);
//       throw error;
//     }
//   });

//   test("POST - Add a Coffee & Mac&Cheese to Cart", async ({ request }, testInfo) => {
//     if (!responseBody || !responseBody.cartId) {
//       throw new Error('Cart ID not found. Ensure that the Create Cart test runs successfully.');
//     }

//     let cartId = responseBody.cartId;

//     try {
//       const response = await request.post(`${baseUrl}/cart/${cartId}/item`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'api_token': api_token.ios,
//         },
//         data: {
//           "items": [
//               {
//                   "itemId": 641113,
//                   "msgKitchen": "",
//                   "msgPreparedFor": "",
//                   "portion": "Regular",
//                   "composition": {},
//                   "type": "PRODUCT",
//                   "promotional": false,
//                   "parentId": 0,
//                   "name": "Light Roast Coffee",
//                   "isNoSideOption": false,
//                   "calories": 20,
//                   "quantity": 1
//               },
//               {
//                   "itemId": 7,
//                   "msgKitchen": "",
//                   "msgPreparedFor": "",
//                   "portion": "Bowl",
//                   "composition": {},
//                   "type": "PRODUCT",
//                   "promotional": false,
//                   "parentId": 0,
//                   "name": "Mac & Cheese - Bowl",
//                   "isNoSideOption": false,
//                   "calories": 960,
//                   "quantity": 1
//               }
//           ]
//       }
//       });
      
//       const addItemResponseBody = await response.json(); // assuming the response is JSON
//       const responseBodyStr = JSON.stringify(addItemResponseBody, null, 2)
//       testInfo.annotations.push({ type: 'Response', description: responseBodyStr });

//       const expectedStatus = 200;
//       const actualStatus = response.status();
//       testInfo.annotations.push({ type: 'Assertion', description: `Expected status: ${expectedStatus}, Actual status: ${actualStatus}`});
//       expect(actualStatus).toBe(expectedStatus);
//     } catch (error) {
//       console.error('Error:', error);
//       throw error;
//     }
//   });

//   test("POST - Add YP2 Combo to Cart", async ({ request }, testInfo) => {
//     if (!responseBody || !responseBody.cartId) {
//       throw new Error('Cart ID not found. Ensure that the Create Cart test runs successfully.');
//     }

//     let cartId = responseBody.cartId;

//     try {
//       const response = await request.post(`${baseUrl}/v2/cart/${cartId}/item`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'api_token': api_token.ios,
//         },
//         data: {
//           "items" : [
//             {
//               "calories" : 620,
//               "quantity" : 1,
//               "childItems" : [
//                 {
//                   "type" : "PRODUCT",
//                   "childItems" : [
//                     {
//                       "quantity" : 1,
//                       "parentId" : 0,
//                       "calories" : -1,
//                       "type" : "INGREDIENT",
//                       "name" : "Chicken",
//                       "itemId" : 643604,
//                       "promotional" : false,
//                       "custType" : "RECIPE",
//                       "isNoSideOption" : false
//                     },
//                     {
//                       "parentId" : 0,
//                       "calories" : -1,
//                       "type" : "INGREDIENT",
//                       "itemId" : 649746,
//                       "custType" : "RECIPE",
//                       "quantity" : 1,
//                       "name" : "Romaine and Lettuce Blend",
//                       "promotional" : false,
//                       "isNoSideOption" : false
//                     },
//                     {
//                       "calories" : -1,
//                       "quantity" : 1,
//                       "parentId" : 0,
//                       "itemId" : 9502,
//                       "promotional" : false,
//                       "name" : "Pecans",
//                       "type" : "INGREDIENT",
//                       "custType" : "RECIPE",
//                       "isNoSideOption" : false
//                     },
//                     {
//                       "parentId" : 0,
//                       "promotional" : false,
//                       "isNoSideOption" : false,
//                       "calories" : -1,
//                       "type" : "INGREDIENT",
//                       "name" : "Mandarin Oranges",
//                       "custType" : "RECIPE",
//                       "itemId" : 1256,
//                       "quantity" : 1
//                     },
//                     {
//                       "itemId" : 9501,
//                       "custType" : "RECIPE",
//                       "calories" : -1,
//                       "promotional" : false,
//                       "type" : "INGREDIENT",
//                       "isNoSideOption" : false,
//                       "name" : "Fresh Blueberries",
//                       "quantity" : 1,
//                       "parentId" : 0
//                     },
//                     {
//                       "itemId" : 2433,
//                       "quantity" : 1,
//                       "parentId" : 0,
//                       "calories" : -1,
//                       "isNoSideOption" : false,
//                       "name" : "Fresh Pineapple",
//                       "type" : "INGREDIENT",
//                       "custType" : "RECIPE",
//                       "promotional" : false
//                     },
//                     {
//                       "custType" : "RECIPE",
//                       "quantity" : 1,
//                       "itemId" : 9504,
//                       "calories" : -1,
//                       "promotional" : false,
//                       "type" : "INGREDIENT",
//                       "name" : "Strawberries",
//                       "isNoSideOption" : false,
//                       "parentId" : 0
//                     },
//                     {
//                       "parentId" : 0,
//                       "promotional" : false,
//                       "quantity" : 1,
//                       "name" : "Poppyseed Dressing",
//                       "itemId" : 8713,
//                       "isNoSideOption" : false,
//                       "type" : "INGREDIENT",
//                       "calories" : -1,
//                       "custType" : "RECIPE"
//                     }
//                   ],
//                   "quantity" : 1,
//                   "promotional" : false,
//                   "isNoSideOption" : false,
//                   "itemId" : 648965,
//                   "parentId" : 0,
//                   "composition" : {
//                     "ingredientNames" : [
//                       {
//                         "name" : "Chicken"
//                       },
//                       {
//                         "name" : "Romaine and Lettuce Blend"
//                       },
//                       {
//                         "name" : "Pecans"
//                       },
//                       {
//                         "name" : "Mandarin Oranges"
//                       },
//                       {
//                         "name" : "Fresh Blueberries"
//                       },
//                       {
//                         "name" : "Fresh Pineapple"
//                       },
//                       {
//                         "name" : "Strawberries"
//                       },
//                       {
//                         "name" : "Poppyseed Dressing"
//                       }
//                     ]
//                   },
//                   "calories" : 180,
//                   "name" : "Half Strawberry Poppyseed Chicken Salad"
//                 },
//                 {
//                   "itemId" : 648621,
//                   "promotional" : false,
//                   "composition" : {
//                     "ingredientNames" : [
//                       {
//                         "name" : "Black Pepper Focaccia"
//                       },
//                       {
//                         "name" : "Chicken"
//                       },
//                       {
//                         "name" : "Chopped Bacon"
//                       },
//                       {
//                         "name" : "White Cheddar"
//                       },
//                       {
//                         "name" : "Ranch"
//                       }
//                     ]
//                   },
//                   "parentId" : 0,
//                   "name" : "Half Chicken Bacon Rancher",
//                   "calories" : 440,
//                   "isNoSideOption" : false,
//                   "childItems" : [
//                     {
//                       "name" : "Black Pepper Focaccia",
//                       "type" : "INGREDIENT",
//                       "calories" : -1,
//                       "quantity" : 1,
//                       "custType" : "RECIPE",
//                       "itemId" : 646726,
//                       "isNoSideOption" : false,
//                       "parentId" : 0,
//                       "promotional" : false
//                     },
//                     {
//                       "isNoSideOption" : false,
//                       "custType" : "RECIPE",
//                       "itemId" : 643604,
//                       "name" : "Chicken",
//                       "promotional" : false,
//                       "quantity" : 1,
//                       "parentId" : 0,
//                       "type" : "INGREDIENT",
//                       "calories" : -1
//                     },
//                     {
//                       "custType" : "RECIPE",
//                       "isNoSideOption" : false,
//                       "quantity" : 1,
//                       "calories" : -1,
//                       "name" : "Chopped Bacon",
//                       "type" : "INGREDIENT",
//                       "parentId" : 0,
//                       "promotional" : false,
//                       "itemId" : 5548
//                     },
//                     {
//                       "custType" : "RECIPE",
//                       "parentId" : 0,
//                       "type" : "INGREDIENT",
//                       "name" : "White Cheddar",
//                       "isNoSideOption" : false,
//                       "promotional" : false,
//                       "itemId" : 9473,
//                       "quantity" : 1,
//                       "calories" : -1
//                     },
//                     {
//                       "itemId" : 649129,
//                       "isNoSideOption" : false,
//                       "type" : "INGREDIENT",
//                       "parentId" : 0,
//                       "quantity" : 1,
//                       "calories" : -1,
//                       "promotional" : false,
//                       "name" : "Ranch",
//                       "custType" : "RECIPE"
//                     }
//                   ],
//                   "quantity" : 1,
//                   "type" : "PRODUCT"
//                 },
//                 {
//                   "calories" : 180,
//                   "promotional" : false,
//                   "isNoSideOption" : false,
//                   "parentId" : 0,
//                   "itemId" : 473,
//                   "type" : "SIDE",
//                   "quantity" : 1,
//                   "name" : "French Baguette"
//                 }
//               ],
//               "isNoSideOption" : false,
//               "itemId" : 90,
//               "type" : "COMBO",
//               "name" : "You Pick Two",
//               "parentId" : 0,
//               "promotional" : false
//             }
//           ]
//         }
//       });
      
//       const addYP2ComboResponseBody = await response.json(); // assuming the response is JSON
//       const responseBodyStr = JSON.stringify(addYP2ComboResponseBody, null, 2)
//       testInfo.annotations.push({ type: 'Response', description: responseBodyStr });
      
//       const expectedStatus = 200;
//       const actualStatus = response.status();
//       testInfo.annotations.push({ type: 'Assertion', description: `Expected status: ${expectedStatus}, Actual status: ${actualStatus}`});
//       expect(actualStatus).toBe(expectedStatus);
//     } catch (error) {
//       console.error('Error:', error);
//       throw error;
//     }
//   });
  
//   test("POST - Remove Item from Cart", async ({ request }, testInfo) => {
//     if (!responseBody || !responseBody.cartId) {
//       throw new Error('Cart ID not found. Ensure that the Create Cart test runs successfully.');
//     }

//     let cartId = responseBody.cartId;

//     try {
//       const response = await request.post(`${baseUrl}/cart/${cartId}/removeMultiple?summary=true`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'api_token': api_token.ios,
//         },
//         data: {
//           "sequenceArray" : [2]
//         }
//       });
      
//       const RemoveItemResponseBody = await response.json(); // assuming the response is JSON
//       const responseBodyStr = JSON.stringify(RemoveItemResponseBody, null, 2)
//       testInfo.annotations.push({ type: 'Response', description: responseBodyStr });
      
//       const expectedStatus = 200;
//       const actualStatus = response.status();
//       testInfo.annotations.push({ type: 'Assertion', description: `Expected status: ${expectedStatus}, Actual status: ${actualStatus}`});
//       expect(actualStatus).toBe(expectedStatus);
//     } catch (error) {
//       console.error('Error:', error);
//       throw error;
//     }
//   });

//   test("POST - Add Customized Coffee to Cart", async ({ request }, testInfo) => {
//     if (!responseBody || !responseBody.cartId) {
//       throw new Error('Cart ID not found. Ensure that the Create Cart test runs successfully.');
//     }

//     let cartId = responseBody.cartId;

//     try {
//       const response = await request.post(`${baseUrl}/v2/cart/${cartId}/item`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'api_token': api_token.ios,
//         },
//         data: {
//           "items": [
//               {
//                   "isNoSideOption": false,
//                   "composition": {
//                       "ingredientNames": [
//                           {
//                               "name": "Milk"
//                           },
//                           {
//                               "name": "Whipped Cream"
//                           },
//                           {
//                               "name": "Caramel Drizzle"
//                           }
//                       ],
//                       "ingredientNamesRemoved": [
//                           {
//                               "name": "Caramel Syrup"
//                           },
//                           {
//                               "name": "Espresso Shot"
//                           }
//                       ]
//                   },
//                   "itemId": 781063,
//                   "portion": "Regular",
//                   "calories": 200,
//                   "quantity": 1,
//                   "name": "Caramel Latte",
//                   "parentId": 0,
//                   "childItems": [
//                       {
//                           "itemId": 780434,
//                           "quantity": 1,
//                           "parentId": 0,
//                           "custType": "RECIPE",
//                           "promotional": false,
//                           "calories": -1,
//                           "isNoSideOption": false,
//                           "type": "INGREDIENT",
//                           "name": "Milk"
//                       },
//                       {
//                           "itemId": 8280,
//                           "quantity": 1,
//                           "parentId": 0,
//                           "custType": "RECIPE",
//                           "promotional": false,
//                           "calories": -1,
//                           "isNoSideOption": false,
//                           "type": "INGREDIENT",
//                           "name": "Whipped Cream"
//                       },
//                       {
//                           "itemId": 2436,
//                           "quantity": 1,
//                           "parentId": 0,
//                           "custType": "RECIPE",
//                           "promotional": false,
//                           "calories": -1,
//                           "isNoSideOption": false,
//                           "type": "INGREDIENT",
//                           "name": "Caramel Drizzle"
//                       },
//                       {
//                           "itemId": 800411,
//                           "quantity": 1,
//                           "parentId": 0,
//                           "custType": "REMOVED",
//                           "promotional": false,
//                           "calories": -1,
//                           "isNoSideOption": false,
//                           "type": "INGREDIENT",
//                           "name": "No Caramel Syrup"
//                       },
//                       {
//                           "itemId": 800561,
//                           "quantity": 1,
//                           "parentId": 0,
//                           "custType": "REMOVED",
//                           "promotional": false,
//                           "calories": -1,
//                           "isNoSideOption": false,
//                           "type": "INGREDIENT",
//                           "name": "No Espresso Shot"
//                       }
//                   ],
//                   "msgKitchen": "",
//                   "type": "PRODUCT",
//                   "msgPreparedFor": "",
//                   "promotional": false
//               },
//               {
//                 "isNoSideOption": false,
//                 "composition": {
//                     "ingredientNames": [
//                         {
//                             "name": "Milk"
//                         },
//                         {
//                             "name": "Whipped Cream"
//                         },
//                         {
//                             "name": "Caramel Drizzle"
//                         }
//                     ],
//                     "ingredientNamesRemoved": [
//                         {
//                             "name": "Caramel Syrup"
//                         },
//                         {
//                             "name": "Espresso Shot"
//                         }
//                     ]
//                 },
//                 "itemId": 781063,
//                 "portion": "Regular",
//                 "calories": 200,
//                 "quantity": 1,
//                 "name": "Caramel Latte",
//                 "parentId": 0,
//                 "childItems": [
//                     {
//                         "itemId": 780434,
//                         "quantity": 1,
//                         "parentId": 0,
//                         "custType": "RECIPE",
//                         "promotional": false,
//                         "calories": -1,
//                         "isNoSideOption": false,
//                         "type": "INGREDIENT",
//                         "name": "Milk"
//                     },
//                     {
//                         "itemId": 8280,
//                         "quantity": 1,
//                         "parentId": 0,
//                         "custType": "RECIPE",
//                         "promotional": false,
//                         "calories": -1,
//                         "isNoSideOption": false,
//                         "type": "INGREDIENT",
//                         "name": "Whipped Cream"
//                     },
//                     {
//                         "itemId": 2436,
//                         "quantity": 1,
//                         "parentId": 0,
//                         "custType": "RECIPE",
//                         "promotional": false,
//                         "calories": -1,
//                         "isNoSideOption": false,
//                         "type": "INGREDIENT",
//                         "name": "Caramel Drizzle"
//                     },
//                     {
//                         "itemId": 800411,
//                         "quantity": 1,
//                         "parentId": 0,
//                         "custType": "REMOVED",
//                         "promotional": false,
//                         "calories": -1,
//                         "isNoSideOption": false,
//                         "type": "INGREDIENT",
//                         "name": "No Caramel Syrup"
//                     },
//                     {
//                         "itemId": 800561,
//                         "quantity": 1,
//                         "parentId": 0,
//                         "custType": "REMOVED",
//                         "promotional": false,
//                         "calories": -1,
//                         "isNoSideOption": false,
//                         "type": "INGREDIENT",
//                         "name": "No Espresso Shot"
//                     }
//                 ],
//                 "msgKitchen": "",
//                 "type": "PRODUCT",
//                 "msgPreparedFor": "",
//                 "promotional": false
//             }
//           ]
//       }
//       });
      
//       const addCustomizedItemResponseBody = await response.json(); // assuming the response is JSON
//       const responseBodyStr = JSON.stringify(addCustomizedItemResponseBody, null, 2)
//       testInfo.annotations.push({ type: 'Response', description: responseBodyStr });
      
//       const expectedStatus = 200;
//       const actualStatus = response.status();
//       testInfo.annotations.push({ type: 'Assertion', description: `Expected status: ${expectedStatus}, Actual status: ${actualStatus}`});
//       expect(actualStatus).toBe(expectedStatus);
//     } catch (error) {
//       console.error('Error:', error);
//       throw error;
//     }
//   });
  
//   test("POST - Checkout Cart", async ({ request }, testInfo) => {
//     if (!responseBody || !responseBody.cartId) {
//       throw new Error('Cart ID not found. Ensure that the Create Cart test runs successfully.');
//     }

//     let cartId = responseBody.cartId;

//     try {
//       const response = await request.post(`${baseUrl}/cart/${cartId}/checkout?summary=true`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'api_token': api_token.ios,
//         },
//         data: {}
//       });
      
//       const checkoutResponseBody = await response.json(); // assuming the response is JSON
//       const responseBodyStr = JSON.stringify(checkoutResponseBody, null, 2)
//       testInfo.annotations.push({ type: 'Response', description: responseBodyStr });
            
//       const expectedStatus = 200;
//       const actualStatus = response.status();
//       testInfo.annotations.push({ type: 'Assertion', description: `Expected status: ${expectedStatus}, Actual status: ${actualStatus}`});
//       expect(actualStatus).toBe(expectedStatus);
//     } catch (error) {
//       console.error('Error:', error);
//       throw error;
//     }
//   });

//   test("POST - Add Discount", async ({ request }, testInfo) => {
//     if (!responseBody || !responseBody.cartId) {
//       throw new Error('Cart ID not found. Ensure that the Create Cart test runs successfully.');
//     }

//     let cartId = responseBody.cartId;

//     try {
//       const response = await request.post(`${baseUrl}/cart/${cartId}/discount?summary=false`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'api_token': api_token.ios
//         },
//         data: {
//           "discounts" : [
//             {
//               "type" : "SPECIAL_CODE",
//               "promoCode" : "QAORDMULTI"
//             }
//           ]
//         }
//       });
      
//       const addDiscountResponseBody = await response.json(); // assuming the response is JSON
//       const responseBodyStr = JSON.stringify(addDiscountResponseBody, null, 2)
//       testInfo.annotations.push({ type: 'Response', description: responseBodyStr });
   
//       const expectedStatus = 200;
//       const actualStatus = response.status();
//       testInfo.annotations.push({ type: 'Assertion', description: `Expected status: ${expectedStatus}, Actual status: ${actualStatus}`});
//       expect(actualStatus).toBe(expectedStatus);
//     } catch (error) {
//       console.error('Error:', error);
//       throw error;
//     }
//   });
// })