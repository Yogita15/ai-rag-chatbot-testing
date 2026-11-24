# NovaShop RAG Chatbot — Performance Test Summary

**Test type:** Exploratory API performance testing  
**System under test:** Locally hosted NovaShop RAG chatbot  
**Tool:** Apache JMeter  
**Endpoint:** `POST http://127.0.0.1:3000/api/chat`  
**Request:** `{"question":"How much is delivery for an $80 order?"}`  
**Evidence:** Three JMeter Aggregate Report CSV exports. The reported thread settings are based on the planned test configuration; raw `.jtl` timestamps were not available for independent verification.

## 1. Objective and test design

Measure response time, throughput and reported error rate for three exploratory API performance scenarios. These are small demonstration tests, not production-capacity or stress tests.

| ID | Scenario | Planned configuration | Expected requests | CSV samples |
|---|---|---|---:|---:|
| PERF-00 | Baseline | 1 thread, 1 s ramp-up, 1 loop | 1 | 1 |
| PERF-01 | Sequential | 1 thread, 1 s ramp-up, 3 loops | 3 | 3 |
| PERF-02 | Concurrent | 3 threads, 1 s ramp-up, 1 loop | 3 | **3** |

## 2. Recorded JMeter results

| Metric | Baseline | Sequential | Concurrent |
|---|---:|---:|---:|
| Samples | 1 | 3 | **3** |
| Average response time (ms) | 1,821 | 1,849 | **3,892** |
| Median (ms) | 1,821 | 1,691 | 3,933 |
| Minimum (ms) | 1,821 | 1,556 | 3,217 |
| Maximum (ms) | 1,821 | 2,302 | 4,526 |
| P90 (ms) | 1,821 | 2,302 | 4,526 |
| P95 (ms) | 1,821 | 2,302 | 4,526 |
| Error rate | 0.000% | 0.000% | **0.000%** |
| Throughput (requests/sec) | 0.54915 | 0.54054 | **0.66284** |

**Evidence files:** `novashop-baseline-results.csv`, `novashop-sequential-results.csv`, and `novashop-concurrent-results.csv`. Values are from the `NovaShop Chat API` row; the `TOTAL` row represents the same samples and is not counted twice.

## 3. Findings

1. **Latency increased under the nominally concurrent scenario.** Mean response time rose by **2,043 ms (110.5%)**, from 1,849 ms to 3,892 ms. This difference was observed but cannot be attributed solely to concurrency based on these small runs.
2. **Throughput increased.** JMeter reported 0.54054 requests/sec for the sequential run versus 0.66284 requests/sec for the concurrent run — **22.6% higher**. This illustrates that greater throughput can coexist with slower individual requests.
3. **No recorded request errors.** All three scenario exports show **0.000%** errors across **7 recorded samples** (1 + 3 + 3). This describes the sampler/assertion outcomes only, not AI answer correctness.
4. **Maximum observed latency:** Sequential 2,302 ms; concurrent 4,526 ms.
5. **P95 is not statistically meaningful:** With only three concurrent observations, the reported 4,526 ms percentile cannot establish reliable tail latency.

## 4. Limitations and interpretation

- The concurrent Aggregate Report contains three samples. Request-level timestamps or the saved `.jmx` configuration would be needed to independently verify request overlap and the exact test settings.
- LLM response variation, output token counts, server warm-up, retrieval, and provider delays can affect measurements. The experiments were not replicated enough to separate these factors.
- There is no defined performance service-level objective (SLO) or acceptance criterion; therefore **no formal latency pass/fail conclusion** is supported.
- An Aggregate Report is summary data; raw `.jtl` measurements would enable investigation of request timing and anomalies.
- Additional load would incur real OpenAI API usage and might encounter provider rate limits.

## 5. Portfolio deliverables and follow-up

- `performance/novashop-load-test.jmx` — saved JMeter plan.
- `reports/novashop-baseline-results.csv` — one-request baseline.
- `reports/novashop-sequential-results.csv` — three sequential requests.
- `reports/novashop-concurrent-results.csv` — three-request concurrent results.
- `reports/novashop-performance-test-summary.md` — this report.

For future runs, clear old listener data, save raw `.jtl` files with timestamps, document active threads and loop counts, and use JMeter's non-GUI execution for any controlled larger workload. Keep AI answer evaluations in DeepEval and functional UI/API assertions in Playwright.

## 6. Conclusion

Across the three exploratory scenarios, JMeter recorded the planned sample counts and **zero reported request errors**. The concurrent-labelled three-request run delivered **higher measured throughput (0.663 vs. 0.541 requests/sec)** but **higher average latency (3,892 vs. 1,849 ms)** than the sequential run. These results provide an introductory performance baseline, but they do not establish production capacity or statistically reliable tail latency.
