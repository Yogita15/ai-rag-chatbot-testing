
import { test, expect } from '@playwright/test';

const apiURL = 'http://127.0.0.1:3000/api/chat';

// Define negative test scenarios
const negativeCases = [
  {
    id: 'NEG-API-01',
    description: 'Missing question field',
    requestBody: {}
  },
  {
    id: 'NEG-API-02',
    description: 'Empty question',
    requestBody: { question: '' }
  },
  {
    id: 'NEG-API-03',
    description: 'Whitespace-only question',
    requestBody: { question: '   ' }
  },
  {
    id: 'NEG-API-04',
    description: 'Invalid question data type',
    requestBody: { question: 123 }
  }
];

// Run each negative test
for (const scenario of negativeCases) {

  test(`${scenario.id} - ${scenario.description}`,
    async ({ request }) => {

      // 1. Submit invalid data
      const response = await request.post(apiURL, {
        data: scenario.requestBody
      });

      // 2. Capture actual API results
      const actualStatus = response.status();
      const responseBody = await response.text();

      // 3. Log details before assertions
      console.log(`Test ID: ${scenario.id}`);
      console.log(`Scenario: ${scenario.description}`);
      console.log(`HTTP Status: ${actualStatus}`);
      console.log(`Response Body: ${responseBody}`);

      // 4. Validate expected error status
      expect([400, 422]).toContain(actualStatus);

      // 5. Verify error response is not empty
      expect(responseBody.trim().length).toBeGreaterThan(0);

    }
  );
}
