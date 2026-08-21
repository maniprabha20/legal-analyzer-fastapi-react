import os
import json
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate 
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from pydantic import ValidationError
from schemas import DocumentAnalysis

load_dotenv()


LLM_MODEL = "openai/gpt-oss-120b"

_llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model=LLM_MODEL,
    temperature=0.2,
)


AI_DISCLAIMER = (
    "This is an AI-generated analysis and is provided for informational purposes only. "
    "It is not legal advice. Please consult a qualified legal professional before making "
    "any decisions based on this content."
)


SYSTEM_PROMPT = """
You are a legal document assistant.

You answer questions strictly using ONLY the context provided from the uploaded document.

Rules:
1. Only use information found in the provided context.
2. Do not use outside knowledge.
3. If information is not available, reply exactly:
"I could not find information about this in the document."

4. Mention page numbers when answering.
5. Do not provide legal advice.
6. Describe what the document says only.
7. Be concise.
"""


def ask_llm(
    question: str,
    context: str,
    chat_history: list[dict] | None = None
) -> dict:

    messages = [
        SystemMessage(content=SYSTEM_PROMPT)
    ]

    if chat_history:
        for turn in chat_history:
            if turn["role"] == "user":
                messages.append(
                    HumanMessage(content=turn["content"])
                )
            else:
                messages.append(
                    AIMessage(content=turn["content"])
                )

    final_message = (
        f"Context from document:\n\n{context}\n\n"
        f"Question: {question}"
    )

    messages.append(
        HumanMessage(content=final_message)
    )

    response = _llm.invoke(messages)

    return {
        "answer": response.content,
        "disclaimer": AI_DISCLAIMER
    }
ANALYSIS_SYSTEM_PROMPT = """
You are a legal document analysis assistant. You will be given the full text
of a legal document, broken into pages. Analyze it and return a SINGLE JSON
object, and ONLY a JSON object, no other text before or after, matching exactly
this structure:

{
  "summary": "a plain-English summary of the whole document, 3-6 sentences",
  "risks": [
    {
      "description": "...",
      "risk_level": "low|medium|high",
      "page_number": 0
    }
  ],
  "key_clauses": [
    {
      "title": "...",
      "summary": "...",
      "page_number": 0
    }
  ],
  "key_dates": [
    {
      "description": "...",
      "date_or_deadline": "...",
      "page_number": 0
    }
  ],
  "payment_terms": [
    {
      "description": "...",
      "amount_or_terms": "...",
      "page_number": 0
    }
  ],
  "obligations": [
    {
      "party": "...",
      "description": "...",
      "page_number": 0
    }
  ],
  "recommendations": [
    "..."
  ]
}

Rules:
1. Only use information found in the document text provided.
2. Do not invent clauses, dates, or amounts.
3. Every item must include the correct page_number.
4. If nothing is found, return empty list [].
5. risk_level must be only low, medium, or high.
6. Return ONLY JSON object.
"""


def analyze_document_text(full_context: str) -> DocumentAnalysis:
    """
    Sends document text to LLM and returns validated analysis.
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", "{analysis_prompt}"),
        ("human", "Document text:\n\n{document_text}"),
    ])

    analysis_llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model=LLM_MODEL,
        temperature=0.1,
        model_kwargs={
            "response_format": {
                "type": "json_object"
            }
        },
    )

    chain = prompt | analysis_llm

    response = chain.invoke({
        "analysis_prompt": ANALYSIS_SYSTEM_PROMPT,
        "document_text": full_context
    })

    try:
        parsed = json.loads(response.content)

    except json.JSONDecodeError as e:
        raise ValueError(
            f"LLM did not return valid JSON: {e}"
        )

    parsed["disclaimer"] = AI_DISCLAIMER

    try:
        return DocumentAnalysis(**parsed)

    except ValidationError as e:
        raise ValueError(
            f"LLM JSON did not match schema: {e}"
        )