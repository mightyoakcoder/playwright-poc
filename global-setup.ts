require("dotenv").config({ path: ".env.local" });
import type { FullConfig } from '@playwright/test';
import { request } from '@playwright/test';

async function globalSetup(config: FullConfig) {

  const timeoutValue = 30000;

  const context = await request.newContext();

  const response = await context.post(`${process.env.MOB_URL}/V2/login`, {
    timeout: timeoutValue
    ,headers: {
      'Content-Type': 'application/json',
      'api_token': process.env.IOS_API_TOKEN || '',
    },
    data: {
      "username": process.env.USERNAME1,
      "password": process.env.PASSWORD1
    }
  });

  const responseBody = await response.json();

  // console.log("01 - User Token: ", responseBody.accessToken);
  // console.log("01 - User ID: ", responseBody.customerId);

  process.env.USER_CUSTOMERID = responseBody.customerId;
  process.env.USER_ACCESS_TOKEN = responseBody.accessToken;
}

export default globalSetup;