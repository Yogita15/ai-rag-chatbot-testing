
import json
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv

# 1. Locate the project root
PROJECT_ROOT = Path(__file__).resolve().parents[1]

load_dotenv(PROJECT_ROOT / ".env")

from deepeval import assert_test
from deepeval.metrics import (
    GEval,
    AnswerRelevancyMetric,
    FaithfulnessMetric
)
from deepeval.test_case import LLMTestCase, SingleTurnParams

# 2. Load the existing golden dataset
dataset_path = (
    PROJECT_ROOT / "data" / "novashop-golden-dataset.json"
)

with open(dataset_path, "r", encoding="utf-8") as file:
    test_cases = json.load(file)

# Use the same judge model as Day 15
JUDGE_MODEL = "gpt-4.1-mini"

# 3. Run two selected golden test cases
@pytest.mark.parametrize("case_id", ["RET-01", "SHIP-03"])
def test_novashop_rag_quality(case_id):

    # Find the selected test case
    test_data = next(
        case for case in test_cases
        if case["id"] == case_id
    )

    # 4. Send the question to NovaShop
    response = requests.post(
        "http://127.0.0.1:3000/api/chat",
        json={"question": test_data["input"]},
        timeout=90
    )

    response.raise_for_status()

    result = response.json()
    actual_answer = result["answer"]

    assert isinstance(actual_answer, str)
    assert actual_answer.strip()

    # 5. Get the documents actually retrieved
    retrieved_sources = result["retrievedSources"]

    source_names = [
        source["name"] for source in retrieved_sources
    ]

    # 6. Read the retrieved policy documents
    retrieval_context = []

    for name in source_names:

        # Only accept simple document filenames
        if Path(name).name != name:
            raise ValueError(f"Invalid source name: {name}")

        policy_path = (
            PROJECT_ROOT / "knowledge-base" / name
        )

        if not policy_path.is_file():
            raise FileNotFoundError(
                f"Retrieved policy file not found: {name}"
            )

        policy_text = policy_path.read_text(
            encoding="utf-8"
        )

        retrieval_context.append(policy_text)

        print("\nRetrieved Context:")
        for context in retrieval_context:
            print(context)

    if not retrieval_context:
        raise ValueError("No retrieval context available")

    # 7. Create the DeepEval test case
    test_case = LLMTestCase(
        input=test_data["input"],
        actual_output=actual_answer,
        expected_output=test_data["expected_output"],
        retrieval_context=retrieval_context
    )

    # 8. Define the three evaluation metrics
    correctness = GEval(
        name="Answer Correctness",
        evaluation_steps=[
            "Compare actual and expected answers.",
            "Check whether the policy facts agree.",
            "Identify contradictions or invented claims.",
            "Allow different wording with the same meaning.",
            "Do not penalize accurate supporting details."
        ],
        evaluation_params=[
            SingleTurnParams.ACTUAL_OUTPUT,
            SingleTurnParams.EXPECTED_OUTPUT
        ],
        threshold=0.7,
        model=JUDGE_MODEL
    )

    relevancy = AnswerRelevancyMetric(
        threshold=0.7,
        model=JUDGE_MODEL,
        include_reason=True
    )

    faithfulness = FaithfulnessMetric(
        threshold=0.7,
        model=JUDGE_MODEL,
        include_reason=True
    )

    # 9. Print test information
    print(f"\nTest ID: {case_id}")
    print(f"Question: {test_data['input']}")
    print(f"Expected Answer: {test_data['expected_output']}")
    print(f"Actual Answer: {actual_answer}")
    print(f"Retrieved Sources: {source_names}")

    # 10. Execute all three evaluations
    assert_test(
        test_case,
        [correctness, relevancy, faithfulness]
    )