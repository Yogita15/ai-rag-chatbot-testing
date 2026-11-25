import json
from pathlib import Path

import requests
from dotenv import load_dotenv

# Locate the NovaShop project root
PROJECT_ROOT = Path(__file__).resolve().parents[1]

# Load the existing OpenAI API key
load_dotenv(PROJECT_ROOT / ".env")

from deepeval import assert_test
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCase, SingleTurnParams


def test_return_policy_correctness():

    # 1. Read the existing golden dataset
    dataset_path = (
        PROJECT_ROOT / "data" / "novashop-golden-dataset.json"
    )

    with open(dataset_path, "r", encoding="utf-8") as file:
        test_cases = json.load(file)

    # 2. Select only RET-02
    test_data = next(
        case for case in test_cases
        if case["id"] == "RET-02"
    )

    # 3. Send the question to the real NovaShop chatbot
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

    # 4. Create a DeepEval test case
    test_case = LLMTestCase(
        input=test_data["input"],
        actual_output=actual_answer,
        expected_output=test_data["expected_output"]
    )

    # 5. Define the correctness evaluation metric
    correctness_metric = GEval(
        name="Answer Correctness",
        evaluation_steps=[
            "Compare the actual output with the expected output.",
            "Identify factual contradictions about return eligibility.",
            "Check whether the answer preserves the 30-day return limit.",
            "Allow different wording if the policy meaning is correct.",
            "Penalize invented return exceptions or incorrect claims."
        ],
        evaluation_params=[
            SingleTurnParams.ACTUAL_OUTPUT,
            SingleTurnParams.EXPECTED_OUTPUT
        ],
        threshold=0.7,
        model="gpt-4.1-mini"
    )

    # 6. Display the answers for debugging
    print(f"\nTest ID: {test_data['id']}")
    print(f"Question: {test_data['input']}")
    print(f"Expected Answer: {test_data['expected_output']}")
    print(f"Actual Answer: {actual_answer}")

    # 7. Evaluate the chatbot response
    assert_test(test_case, [correctness_metric])
