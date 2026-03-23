import * as dotenv from "dotenv";
dotenv.config();

export const TEST_ACCOUNT = {
  userName: process.env.TEST_USERNAME || "",
  password: process.env.TEST_PASSWORD || "", // Account used for test login
};

export function generateUser() {
  const timestamp = Date.now();
  return {
    userName: `testuser_${timestamp}`,
    password: `Test@${timestamp}`, // DemoQA requires complex password
  };
}
