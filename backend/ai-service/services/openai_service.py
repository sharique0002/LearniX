"""
OpenAI Service - Handles all OpenAI API interactions
"""

from openai import AsyncOpenAI
from typing import List, Dict, Optional
import json
from config.settings import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def create_embedding(text: str) -> List[float]:
    """
    Generate embedding vector for text using OpenAI
    """
    response = await client.embeddings.create(
        model=settings.OPENAI_EMBEDDING_MODEL,
        input=text
    )
    return response.data[0].embedding


async def create_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts in batch
    """
    response = await client.embeddings.create(
        model=settings.OPENAI_EMBEDDING_MODEL,
        input=texts
    )
    return [item.embedding for item in response.data]


async def generate_chat_response(
    messages: List[Dict[str, str]],
    system_prompt: str = None,
    temperature: float = 0.7,
    max_tokens: int = 500
) -> Dict:
    """
    Generate a chat response using OpenAI
    """
    chat_messages = []
    
    # Add system prompt if provided
    if system_prompt:
        chat_messages.append({"role": "system", "content": system_prompt})
    
    # Add conversation messages
    chat_messages.extend(messages)
    
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=chat_messages,
        temperature=temperature,
        max_tokens=max_tokens
    )
    
    return {
        "content": response.choices[0].message.content,
        "usage": {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens
        }
    }


async def generate_quiz_from_content(content: str, num_questions: int = 5) -> List[Dict]:
    """
    Generate quiz questions from lesson content
    """
    system_prompt = """You are an educational quiz generator. Create multiple-choice questions 
    based on the given content. Each question should have 4 options with exactly one correct answer.
    Return the quiz as a JSON array with this structure:
    [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]
    where 'correct' is the index of the correct option (0-3)."""
    
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate {num_questions} quiz questions from this content:\n\n{content}"}
        ],
        temperature=0.7,
        response_format={"type": "json_object"}
    )
    
    result = json.loads(response.choices[0].message.content)
    return result.get("questions", result)


async def summarize_content(content: str, max_length: int = 200) -> str:
    """
    Summarize lesson content for quick review
    """
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": f"Summarize the following content in {max_length} words or less. Focus on key concepts and learning points."},
            {"role": "user", "content": content}
        ],
        temperature=0.5,
        max_tokens=max_length * 2
    )
    
    return response.choices[0].message.content


async def explain_concept(
    concept: str,
    context: str = None,
    difficulty_level: str = "intermediate"
) -> str:
    """
    Explain a concept at the specified difficulty level
    """
    system_prompt = f"""You are an expert tutor. Explain concepts clearly at the {difficulty_level} level.
    Use analogies and examples when helpful. If context is provided, relate your explanation to it.
    Be concise but thorough."""
    
    user_message = f"Explain this concept: {concept}"
    if context:
        user_message += f"\n\nContext from the lesson: {context}"
    
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.7,
        max_tokens=600
    )
    
    return response.choices[0].message.content
