Real LLM-powered NovaShop RAG chatbot

1. Extract this ZIP to your existing ai-rag-chatbot-testing project directory.
   It contains two new app files and two new knowledge-base files.
   Keep your existing return-policy.txt and Playwright files.
2. Open that project folder in VS Code.
3. In the VS Code terminal run: npm install openai dotenv
4. In the PROJECT ROOT create a .env file containing:
   OPENAI_API_KEY=your_actual_api_key_here
   Never paste or upload your key into chat, and never commit .env to GitHub.
5. Add .env as a separate line in the existing .gitignore file
   (or create .gitignore at project root if absent).
6. Run: node app/server.mjs
7. Open: http://127.0.0.1:3000
8. Ask a question and inspect the AI answer, retrieved sources, and context.

The server makes real OpenAI API calls, which may incur charges.
It uses gpt-6-luna for generation and text-embedding-3-small for retrieval.
It indexes the three tiny documents at startup, then embeds each question.
Restart the server after modifying policy files so they are re-indexed.

This is a small learning app, not production-ready: no authentication,
rate limiting, persistent vector database, or hardened prompt-injection protection.
