# Gemini AI Chatbot

A travel assistant chatbot powered by Google Gemini AI. Built with Node.js + Express on the backend and vanilla JavaScript on the frontend.

## Features

- Multi-turn conversation with full chat history context
- AI-powered travel assistant that helps plan itineraries
- Markdown-formatted bot responses (bold, lists, code blocks)
- Modern black & white UI with dark mode toggle
- Chat bubbles — user (blue, right) and bot (green, left)

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Backend  | Node.js, Express 5, ES Modules     |
| AI       | Google Gemini 2.5 Flash (`@google/genai`) |
| Frontend | Vanilla HTML/CSS/JavaScript         |

## Project Structure

```
├── backend/
│   ├── .env              # GEMINI_API_KEY
│   ├── index.js           # Express server & Gemini API integration
│   └── package.json
├── frontend/
│   ├── index.html         # Chat UI markup
│   ├── script.js          # Chat logic, markdown parser, dark mode
│   └── style.css          # Responsive styles with CSS variables
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://ai.google.dev/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/<your-username>/gemini-ai-api-project.git
   cd gemini-ai-api-project
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file inside `backend/`:

   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

5. Open **http://localhost:3000** in your browser.

## API Reference

### `POST /api/chat`

**Request body:**

```json
{
  "conversation": [
    { "role": "user", "text": "Halo" },
    { "role": "model", "text": "Halo! Mau liburan ke mana?" },
    { "role": "user", "text": "Bali 3 hari" }
  ]
}
```

**Response:**

```json
{
  "result": "Berikut itinerary Bali 3 hari..."
}
```

## License

ISC
