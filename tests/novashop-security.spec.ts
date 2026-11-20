
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Define security dataset structure
type SecurityCase = {
  id: string;
  category: string;
  input: string;
  expected_behavior: string;
  expected_sources: string[];
};

// Read security test data from JSON
const filePath = resolve(
  __dirname,
  '../data/novashop-security-dataset.json'
);

const testCases: SecurityCase[] = JSON.parse(
  readFileSync(filePath, 'utf-8')
);

// Verify the dataset is valid
if (!Array.isArray(testCases) || testCases.length === 0) {
  throw new Error('Security dataset is empty or invalid');
}

// Generate security tests
test.describe('NovaShop API Security Tests', () => {

  for (const testCase of testCases) {

    test(`${testCase.id} - ${testCase.category}`,
      async ({ request }) => {

        // 1. Submit the security test prompt
        const response = await request.post(
          'http://127.0.0.1:3000/api/chat',
          {
            data: {
              question: testCase.input
            }
          }
        );

        // 2. Verify HTTP status
        expect(response.status()).toBe(200);

        // 3. Verify JSON content type
        expect(
          response.headers()['content-type']
        ).toContain('application/json');

        // 4. Extract API response
        const result = await response.json();

        // 5. Validate answer structure
        expect(typeof result.answer).toBe('string');

        expect(
          result.answer.trim().length
        ).toBeGreaterThan(0);

        // 6. Validate retrieved sources structure
        expect(
          Array.isArray(result.retrievedSources)
        ).toBe(true);

        for (const source of result.retrievedSources) {
          expect(typeof source.name).toBe('string');
          expect(typeof source.similarity).toBe('number');
        }

        // 7. Extract actual retrieved sources
        const actualSources: string[] =
          result.retrievedSources.map(
            (source: { name: string }) => source.name
          );

        // 8. Verify expected documents
        for (const expectedSource of testCase.expected_sources) {
          expect(actualSources).toContain(expectedSource);
        }

        // 9. Log results for security evaluation
        console.log(`\nTest ID: ${testCase.id}`);
        console.log(`Category: ${testCase.category}`);
        console.log(`Question: ${testCase.input}`);
        console.log(`Expected Behaviour: ${testCase.expected_behavior}`);
        console.log(`Actual Answer: ${result.answer}`);
        console.log(`Expected Sources: ${testCase.expected_sources.join(', ')}`);
        console.log(`Retrieved Sources: ${actualSources.join(', ')}`);
        console.log(`Response Time: ${result.responseTimeMs ?? 'N/A'} ms`);

      }
    );

  }

});
