import sys
from pathlib import Path

# Add backend folder to Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx

from evaluation.eval_questions import EVAL_QUESTIONS


BASE_URL = "http://127.0.0.1:8000"

# IMPORTANT:
# Change this to the document ID of your real READY lease document.
DOCUMENT_ID = 27

# We will get this token in the next step.
AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZW1haWwiOiJhaV9ldmFsXzIwMjZAZXhhbXBsZS5jb20iLCJleHAiOjE3ODc5MTEyNDR9.ZzdajeJUO00QgaHWefyPU8NxfkK-75a3m6XXTkB9o64"



def run_evaluation():
    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}"
    }

    results = []

    with httpx.Client(
        base_url=BASE_URL,
        headers=headers,
        timeout=60.0
    ) as http_client:

        for item in EVAL_QUESTIONS:

            print(f"\nTesting: {item['question']}")

            response = http_client.get(
                f"/documents/{DOCUMENT_ID}/ask",
                params={
                    "q": item["question"]
                }
            )

            print(f"Status: {response.status_code}")
            print(response.text)

            data = response.json()

            answer = data.get("answer", "")
            pages_referenced = data.get(
                "pages_referenced",
                []
            )

            answer_lower = answer.lower()

            if item["expected_answer_contains"]:
                found_expected_text = any(
                    expected.lower() in answer_lower
                    for expected in item[
                        "expected_answer_contains"
                    ]
                )
            else:
                found_expected_text = None

            correctly_refused = (
                "could not find information"
                in answer_lower
            )

            results.append({
                "question": item["question"],
                "category": item["category"],
                "answer": answer,
                "pages_referenced": pages_referenced,
                "expected_page": item["expected_page"],
                "found_expected_text": found_expected_text,
                "correctly_refused": correctly_refused,
            })

    print_report(results)


def print_report(results):

    print("\n")
    print("=" * 70)
    print("RAG EVALUATION REPORT")
    print("=" * 70)

    for result in results:

        print("\nQuestion:")
        print(result["question"])

        print("Category:")
        print(result["category"])

        print("Answer:")
        print(result["answer"])

        print("Pages referenced:")
        print(result["pages_referenced"])

        if result["category"] == "on_topic_direct":

            text_status = (
                "PASS"
                if result["found_expected_text"]
                else "FAIL"
            )

            page_status = (
                "PASS"
                if result["expected_page"]
                in result["pages_referenced"]
                else "FAIL"
            )

            print(
                f"Content check: {text_status}"
            )

            print(
                f"Citation check: {page_status}"
            )

        elif result["category"] == "off_topic":

            status = (
                "PASS"
                if result["correctly_refused"]
                else "FAIL"
            )

            print(
                f"Refusal check: {status}"
            )

        elif result["category"] == "borderline_should_not_guess":

            status = (
                "LIKELY PASS (refused)"
                if result["correctly_refused"]
                else "REVIEW MANUALLY"
            )

            print(
                f"Borderline check: {status}"
            )

    print("\n")
    print("=" * 70)


if __name__ == "__main__":
    run_evaluation()