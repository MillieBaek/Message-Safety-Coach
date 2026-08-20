# Message Safety Coach

A coach that helps people vulnerable to scams (including seniors) understand suspicious texts and emails. Paste a message and it flags risk level, highlights risky sentences, and tells you what to do next.

## Structure
- `public/index.html` — frontend (static, no build step needed)
- `api/analyze.js` — Vercel serverless function that calls the Anthropic API server-side, so the API key is never exposed in the browser
- `.env.example` — example environment variable

## Tech Stack 

- React — Interactive frontend and component-based UI
- JavaScript (ES6+) — Application logic and user interactions
- Anthropic API — AI-powered phishing message analysis
- React Hooks (useState) — State management for user input
- CSS — Interface styling and layout
- Vite — Development server and build tool
- Vercel — Deployment and serverless functions
- Git & GitHub — Version control and project management

## Testing locally
```bash
npm install -g vercel
vercel dev
```
Copy `.env.example` to `.env` and add your real API key first.

## Ideas for next steps
- Validate accuracy against a dataset of real phishing examples
- Test with 3–5 real users and refine wording/category names based on their feedback
- Add rate limiting or caching to manage API costs

![alt text](image-1.png)
![alt text](image.png)
