require("dotenv").config({ path: ".env.local" });
import { get } from 'http';
import { request } from 'playwright/test';
import fs from 'fs';

let configVariables: { [key: string]: any } = {};

export function setConfigVariables(key: string, value: any) {
  configVariables[key] = value;
}

export function getConfigVariables(key: string) {
  return configVariables[key];
}

export function resetConfigVariables() {
  configVariables = {};
  setConfigVariables('timeoutValue', 30000); // Timeout Value used for requests
}

// Using the same login on parallel tests could lead to errors due to access tokens expiring.
// You may use the Global login for read only calls, or setup a unique login for write calls.
export const user_logins = [
  { "username" : process.env.USERNAME1 || '', "password": process.env.PASSWORD1 || '', "file": "cart.spec.ts"},
  { "username" : process.env.USERNAME2 || '', "password": process.env.PASSWORD2 || '', "file": "testLogin.spec.ts"},
  { "username" : process.env.USERNAME3 || '', "password": process.env.PASSWORD3 || '', "file": "testCustomer.spec.ts"},
  { "username" : process.env.USERNAME4 || '', "password": process.env.PASSWORD4 || '', "file": "delivery_cart.spec.ts"},
  { "username" : process.env.USERNAME5 || '', "password": process.env.PASSWORD5 || '', "file": ""}
]

export const api_token = {
  "ios": process.env.IOS_API_TOKEN || '',
  "android": process.env.ANDROID_API_TOKEN || '',
  "kiosk": process.env.KIOSK_API_TOKEN || ''
};

export const baseUrl = {
  "mob": process.env.MOB_URL,
  "ecomm": process.env.ECOMM_URL,
  "apigee": process.env.APIGEE_URL
};

export async function userProfile(){
  // Ideally here we use a setup file and storage state vs global
  // The advantage is that a setup file would be seen in the HTML report, whereas a Global one is not

  const customerId = process.env.USER_CUSTOMERID;
  const accessToken = process.env.USER_ACCESS_TOKEN;

  setConfigVariables('authToken', accessToken);
  setConfigVariables('billingId', customerId);
};

export async function login(username: string, password: string) {
  try {
    const timeoutValue = getConfigVariables('timeoutValue');

    const context = await request.newContext();
    
    const response = await context.post(`${baseUrl.mob}/V2/login`, {
      timeout: timeoutValue
      ,headers: {
        'Content-Type': 'application/json',
        'api_token': api_token.ios,
      },
      data: {
        "username": username,
        "password": password
      }
    });
    
    setConfigVariables('status', response.status());
    let responseBody;
    
    try {
      responseBody = await response.json();
    } catch (error) {
      console.error('Error parsing response JSON:', error);
      throw error;
    }
    
    setConfigVariables('authToken', responseBody.accessToken);
    setConfigVariables('billingId', responseBody.customerId);
    // setConfigVariables('username', responseBody.username);
    // setConfigVariables('password', responseBody.password);
    
    return {
      authToken: getConfigVariables('authToken'),
      billingId: getConfigVariables('billingId'),
      status: getConfigVariables('status'),
      // username: getConfigVariables('username'),
      // password: getConfigVariables('password')
    };
  } catch (error) {
    console.error('Error during login:', error);
    setConfigVariables('status', error.response ? error.response.status() : 'error');
    throw error;
  }
}