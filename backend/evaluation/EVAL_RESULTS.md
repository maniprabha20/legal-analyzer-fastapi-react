# RAG Evaluation Results — August 27, 2026

Document tested: sample-commercial-lease-agreement.pdf (5 pages)
Model: openai/gpt-oss-120b via Groq
Embedding model: all-MiniLM-L6-v2 (local)

## Summary

- On-topic questions: 4/5 passed content check
- On-topic questions: 5/5 passed citation check
- Off-topic questions: 2/2 correctly refused
- Borderline question: Correctly identified that the lease does not specify a penalty for tenant termination after the first 12 months. No unsupported penalty was guessed.

## Issues found

- The lease-term-end question returned the correct answer ("January 31, 2029"), but the automated content check reported FAIL due to answer formatting/keyword matching.
- Citation checks passed for all on-topic questions.
- Off-topic questions were correctly refused.
- The borderline question was manually reviewed and appeared grounded in the document.