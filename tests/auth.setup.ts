require("dotenv").config({ path: ".env.local" });
import { test as setup } from '@playwright/test';
import { login  } from './api/testConfig'

const authFile = './.auth/customer.json';

setup('SETUP - Login', async ({ request }) => {
    // This is the prefered method but I could not get it to work
    // Will explore this in a future branch

    const timeoutValue = 30000;

    console.log("Setup running...");
    
    await request.post(`${process.env.MOB_URL}/V2/login`, {
        timeout: timeoutValue
        ,headers: {
            'Content-Type': 'application/json',
            'api_token': process.env.IOS_API_TOKEN || '',
        },
        data: {
            "username": process.env.USERNAME5,
            "password": process.env.PASSWORD5
        }
    });

    await request.storageState({ path: authFile }); // This doesn't store the JSON from the response... how do?

    // const response = await request.post(`${process.env.MOB_URL}/V2/login`, {
    //     timeout: timeoutValue
    //     ,headers: {
    //         'Content-Type': 'application/json',
    //         'api_token': process.env.IOS_API_TOKEN || '',
    //     },
    //     data: {
    //         "username": process.env.USERNAME5,
    //         "password": process.env.PASSWORD5
    //     }
    //   });
      
    // const responseBody = await response.json();

    // await responseBody.storageState({ path: authFile }); // This doesn't work as the .storageState is not a function of response

});