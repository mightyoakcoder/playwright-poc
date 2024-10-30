import { test, expect } from '@playwright/test';
import { resetConfigVariables, getConfigVariables, login, user_logins } from '../testConfig'

test.beforeAll(() => {
  resetConfigVariables();
});

test.beforeAll('BeforeAll',async () =>{
  // This must be present on all tests files
  // It can be commented out if the test is intended to be run on every environment
  // Add the name(s) of the environment these tests will run on

  const envNames: string[] = ["test"]; // The ENV the tests WILL run on (will NOT run on any other)
  test.skip(!envNames.includes(process.env.CI_ENVIRONMENT_NAME ? process.env.CI_ENVIRONMENT_NAME : "") , `This group of test(s) will only run if the CI ENV name matches (${envNames.join(", ")}).`);
});

test.describe.parallel('Login Tests', async () => {

  test("POST - Login - Good Creds", async ({ request }, testInfo) => {
    const username = user_logins[1].username;
    const password = user_logins[1].password;
    
    const response = await login(username, password);
    const responseStr = JSON.stringify(response, null, 2)
    testInfo.annotations.push({ type: 'Response', description: responseStr });

    const expectedStatus = 200;
    const status = getConfigVariables('status');
    expect(status).toBe(expectedStatus);
    testInfo.annotations.push({type: 'Assertion', description: `Expected status: ${expectedStatus}, Actual status: ${status}`
    });

    const authToken = getConfigVariables('authToken');
    expect(authToken).toEqual(expect.any(String));
    testInfo.annotations.push({type: 'Assertion', description: `authToken is a ${typeof authToken}`
    });

  });

  test("POST - Login - Bad Creds", async ({ request }, testInfo) => {
    const username = user_logins[1].username;
    const password = "nope";

    const response = await login(username, password);
    const responseStr = JSON.stringify(response, null, 2)
    testInfo.annotations.push({ type: 'Response', description: responseStr });

    const expectedStatus = 404;
    const status = getConfigVariables('status');
    expect(status).toBe(expectedStatus);
    testInfo.annotations.push({type: 'Assertion', description: `Expected status: ${expectedStatus}, Actual status: ${status}`
    });

    const authToken = getConfigVariables('authToken');
    // expect(authToken).toEqual(expect.any(String));
    // testInfo.annotations.push({type: 'Assertion', description: `authToken is a ${typeof authToken}`});
    // I figure this test should succeed in that we expect it to fail
    expect(authToken).toBeUndefined();
    testInfo.annotations.push({type: 'Assertion', description: `authToken is a undefined`});

  });
});