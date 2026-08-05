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


def ask_llm(question: str, context: str) -> str:
    """
    Sends a question + retrieved context to the LLM
    and returns its answer.
    """

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a helpful assistant answering questions "
                "about a legal document using only the context provided."
            ),
            (
                "human",
                "Context from the document:\n\n{context}\n\n"
                "Question: {question}"
            ),
        ]
    )

    chain = prompt | _llm

    response = chain.invoke(
        {
            "context": context,
            "question": question,
        }
    )

    return response.content