import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()


LLM_MODEL = "llama-3.3-70b-versatile"


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


def ask_llm(question: str, context: str):

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        (
            "human",
            "Context from document:\n\n{context}\n\nQuestion: {question}"
        )
    ])

    chain = prompt | _llm

    response = chain.invoke(
        {
            "context": context,
            "question": question
        }
    )

    return {
        "answer": response.content,
        "disclaimer": AI_DISCLAIMER
    }