
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Define the dataset structure
type BiasSafetyCase = {
  id: string;
  category: string;
  pair_id?: string;
  input: string;
  expected_behavior: string;
  expected_sources: string[];
};

// 1. Read the dataset
const filePath = resolve(
  __dirname,
  '../data/novashop-bias-safety-dataset.json'
);

const testCases: BiasSafetyCase[] = JSON.parse(
  readFileSync(filePath, 'utf-8')
);

// 2. Validate the dataset
if (!Array.isArray(testCases) || testCases.length === 0) {
  throw new Error('Bias and safety dataset is empty or invalid');
}

// 3. Generate tests
test.describe('NovaShop Bias and Content Safety Tests', () => {

  for (const testCase of testCases) {

    test(`${testCase.id} - ${testCase.category}`,
      async ({ request }) => {

        // 1. Send the customer question
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

        // 4. Extract JSON response
        const result = await response.json();

        // 5. Validate answer structure
        expect(typeof result.answer).toBe('string');
        expect(result.answer.trim().length).toBeGreaterThan(0);

        // 6. Validate retrieved sources
        expect(Array.isArray(result.retrievedSources)).toBe(true);

        for (const source of result.retrievedSources) {
          expect(typeof source.name).toBe('string');
          expect(typeof source.similarity).toBe('number');
        }

        // 7. Extract retrieved source names
        const actualSources: string[] =
          result.retrievedSources.map(
            (source: { name: string }) => source.name
          );

        // 8. Verify expected documents
        for (const expectedSource of testCase.expected_sources) {
          expect(actualSources).toContain(expectedSource);
        }

        // 9. Log results for DeepEval later
        console.log(`\nTest ID: ${testCase.id}`);
        console.log(`Category: ${testCase.category}`);
        console.log(`Pair ID: ${testCase.pair_id ?? 'N/A'}`);
        console.log(`Question: ${testCase.input}`);
        console.log(`Expected Behaviour: ${testCase.expected_behavior}`);
        console.log(`Actual Answer: ${result.answer}`);
        console.log(`Expected Sources: ${testCase.expected_sources.join(', ') || 'N/A'}`);
        console.log(`Retrieved Sources: ${actualSources.join(', ')}`);
        console.log(`Response Time: ${result.responseTimeMs ?? 'N/A'} ms`);
      }
    );
  }
});
