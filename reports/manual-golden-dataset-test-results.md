# NovaShop RAG Chatbot — Manual Golden Dataset Test Results

**Test type:** Manual RAG chatbot evaluation  
**Application:** NovaShop RAG chatbot (`http://127.0.0.1:3000`)  
**Test data:** `evaluation/novashop-golden-dataset.json`  
**Results file:** `reports/manual-golden-test-results.md`  
**Execution scope:** Five manually evaluated scenarios (RET-01, RET-02, SHIP-03, UNKNOWN-01, ROB-02)

## Test Case: RET-01

**Question:**  
Can I return my shoes after 20 days?

**Expected Answer:**  
A return after 20 days is within the 30-day return window, subject to eligibility conditions.

**Expected Source:**  
`return-policy.txt`

**Actual Answer:**  
Yes. Shoes can be returned within 30 days of purchase if they’re unused, in their original packaging, and you provide proof of purchase.

**Actual Retrieved Sources:**
- `return-policy.txt` (similarity: 0.476)
- `warranty-policy.txt` (similarity: 0.353)

### Evaluation Results

| Metric | Result |
|---|---|
| Expected Source Retrieved | Pass |
| Answer Relevance | Pass |
| Answer Correctness | Pass |
| Faithfulness | Pass |
| Hallucination Detected | No |

### Claims Evaluated

| Claim | Supported by Retrieved Context? | Correct According to Ground Truth? |
|---|---|---|
| Products can be returned within 30 days | Yes | Yes |
| Products must be unused | Yes | Yes |
| Products must be in their original packaging | Yes | Yes |
| Proof of purchase is required | Yes | Yes |

**Overall Test Result: Pass**

**Reason for Result:** The chatbot correctly answered the customer's question and stated the return eligibility conditions. The expected return policy was retrieved, and the factual claims were consistent with the policy. No unsupported claims were identified.

---

## Test Case: RET-02

**Question:**  
Can I return shoes after 45 days?

**Expected Answer:**  
No. Returns after 45 days are outside NovaShop's standard 30-day return period.

**Expected Source:**  
`return-policy.txt`

**Actual Answer:**  
No. Shoes are returnable within 30 days of purchase if unused, in their original packaging, and accompanied by proof of purchase. After 45 days, they aren’t eligible under the standard return policy.

**Actual Retrieved Sources:**
- `return-policy.txt` (similarity: 0.498)
- `warranty-policy.txt` (similarity: 0.378)

### Evaluation Results

| Metric | Result |
|---|---|
| Expected Source Retrieved | Pass |
| Answer Relevance | Pass |
| Answer Correctness | Pass |
| Faithfulness | Pass |
| Hallucination Detected | No |

### Claims Evaluated

| Claim | Supported by Retrieved Context? | Correct According to Ground Truth? |
|---|---|---|
| Shoes are returnable within 30 days of purchase | Yes | Yes |
| Returned products must be unused | Yes | Yes |
| Products must be in their original packaging | Yes | Yes |
| Proof of purchase is required | Yes | Yes |
| Shoes returned after 45 days are not eligible for standard returns | Yes | Yes |

**Overall Test Result: Pass**

**Reason for Result:** The chatbot correctly identified that 45 days is beyond the standard return window. It accurately stated the eligibility conditions, and the expected policy was retrieved. No unsupported factual claims were identified.

---

## Test Case: SHIP-03

**Question:**  
Is shipping free if my order total is exactly $100?

**Expected Answer:**  
No. Free shipping applies to orders above $100. Orders of exactly $100 incur a $10 delivery charge.

**Expected Source:**  
`shipping-policy.txt`

**Actual Answer:**  
No. Orders of $100 or less have a $10 delivery charge, so an order totaling exactly $100 is not eligible for free shipping.

**Actual Retrieved Sources:**
- `shipping-policy.txt` (similarity: 0.488)
- `return-policy.txt` (similarity: 0.249)

### Evaluation Results

| Metric | Result |
|---|---|
| Expected Source Retrieved | Pass |
| Answer Relevance | Pass |
| Answer Correctness | Pass |
| Faithfulness | Pass |
| Hallucination Detected | No |

### Claims Evaluated

| Claim | Supported by Retrieved Context? | Correct According to Ground Truth? |
|---|---|---|
| Orders of $100 or less incur a $10 delivery charge | Yes | Yes |
| Orders of exactly $100 do not qualify for free shipping | Yes | Yes |

**Overall Test Result: Pass**

**Reason for Result:** The chatbot correctly handled the $100 boundary: free shipping applies only above $100. The shipping policy was retrieved and ranked first. No unsupported factual claims were identified.

**Additional Observation:** This scenario validates boundary-value handling. The return policy was additionally retrieved but was not needed for the answer.

---

## Test Case: UNKNOWN-01

**Question:**  
Does NovaShop ship internationally?

**Expected Answer:**  
The chatbot should indicate that international shipping information is not available in the provided policies. It should not invent international shipping destinations, charges, or delivery times.

**Expected Source:**  
None - international shipping is not covered by the knowledge base.

**Actual Answer:**  
I don't have that information in the provided policies.

**Actual Retrieved Sources:**  
Not recorded in the manual test notes (`N/A — no relevant policy exists` was entered). This does **not** establish that the retrieval system returned zero documents: the NovaShop backend normally retrieves the top two documents even when none is relevant.

### Evaluation Results

| Metric | Result |
|---|---|
| Expected Source Retrieved | N/A |
| Answer Relevance | Pass |
| Answer Correctness | Pass (appropriate acknowledgment of missing information) |
| Faithfulness | Pass (no unsupported factual shipping claims) |
| Hallucination Detected | No |

### Claims Evaluated

| Claim / Behaviour | Assessment |
|---|---|
| International shipping information is not available in the provided policies | Consistent with the known knowledge base |
| No shipping destinations, fees or delivery times were invented | Pass |

**Overall Test Result: Pass**

**Reason for Result:** The chatbot appropriately acknowledged that it lacked international shipping information in its supplied policies. It did not invent any details.

**Additional Observation:** Faithfulness is assessed here using the manual criterion of no unsupported factual claims. Some automated faithfulness metrics may classify a non-substantive abstention as not applicable.

---

## Test Case: ROB-02

**Question:**  
Wats the delivry fee for an $80 ordr?

**Expected Answer:**  
The delivery fee for an $80 order is $10.

**Expected Source:**  
`shipping-policy.txt`

**Actual Answer:**  
The delivery fee for an $80 order is $10.

**Actual Retrieved Sources:**
- `shipping-policy.txt` (similarity: 0.400)
- `return-policy.txt` (similarity: 0.211)

### Evaluation Results

| Metric | Result |
|---|---|
| Expected Source Retrieved | Pass |
| Answer Relevance | Pass |
| Answer Correctness | Pass |
| Faithfulness | Pass |
| Hallucination Detected | No |
| Robustness | Pass |

### Claims Evaluated

| Claim / Behaviour | Assessment |
|---|---|
| Delivery fee for an $80 order is $10 | Supported by retrieved context; correct according to ground truth |
| The chatbot understands the misspellings “Wats”, “delivry” and “ordr” | Pass |

**Overall Test Result: Pass**

**Reason for Result:** The chatbot understood the misspelled shipping question, retrieved the relevant policy, and returned the correct $10 fee without unsupported information.

---

## Test Execution Summary

| Test Case | Testing Focus | Result |
|---|---|---|
| RET-01 | Return eligibility within 30 days | Pass |
| RET-02 | Return eligibility after 30 days | Pass |
| SHIP-03 | Shipping fee at the exact $100 boundary | Pass |
| UNKNOWN-01 | Unknown information and hallucination prevention | Pass |
| ROB-02 | Robustness to spelling mistakes | Pass |

**Total Test Cases:** 5  
**Passed:** 5  
**Failed:** 0  
**Not Run:** 0  
**Pass Rate:** 100%  
**Overall Manual Execution Status:** PASS

### Final Assessment

All five manually evaluated golden-dataset cases passed their defined criteria. The observed chatbot responses were relevant, consistent with the known policies, and free of identified unsupported factual claims. The system retrieved expected documents for the four cases where relevant policies existed, and it handled one unknown-information question and one misspelled question appropriately.

**Scope limitation:** These conclusions apply only to the recorded executions. Five passing cases do not establish that the chatbot is universally accurate, hallucination-free, or robust. Similarity values are semantic similarity scores, not confidence or accuracy percentages.
