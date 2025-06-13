RESTART_ The Server

AI-First News Aggregator for Builders and Technologists

"Signal, not sludge." A modern Drudge-style feed tailored for the AI industry and those building the future.

📌 Overview

RESTART_ The Server is a minimalist, lightning-fast news aggregation site focused exclusively on the most important developments in AI. Inspired by the stark utility of the Drudge Report, this project combines human editorial curation with AI-powered enhancements like summarization, hype scoring, and smart tagging.

🚀 Core Features

📰 Headline-First Feed – Clean, single-page layout optimized for speed and clarity

🔥 Flame Score System – Classifies stories 1-5 based on importance ("1-flame = fluff, 5-flame = seismic")

🤖 AI Summarization – One-sentence, GPT-generated summaries for quick reads

🧠 Admin Dashboard – Bookmarklet-based editorial pipeline with full CRUD

💡 Story Types – "Normal", "Breaking", and "Developing" to track evolving events

🌗 Dark Mode – Automatic theme toggle

📱 Mobile-First Design – Built to look great and load fast on any device

📊 Basic Analytics – Click tracking and dead link detection

🧼 Non-Intrusive Ads – Footer-only Google AdSense for monetization

📅 7-Day MVP Build Plan

Day

Focus

1

Initialize repo, install Next.js + Tailwind CSS + Supabase

2

Build headline data model, set up Supabase tables

3

Create Drudge-style frontend layout (mobile + dark mode)

4

Admin interface + bookmarklet to add/edit headlines

5

Integrate OpenAI API for summaries + flame scoring

6

Add non-intrusive footer ads (AdSense), dead link checker

7

Polish, test, deploy to Vercel, soft launch to builders

🧱 Tech Stack

Frontend: Next.js 14 + Tailwind CSS

Backend: Supabase (DB + Auth)

AI: OpenAI API (GPT-4 for summary + classification)

Deployment: Vercel

Dev Tools: Cursor.com IDE, GitHub Actions, Prettier, ESLint

🧠 AI Prompt Design

System: You are a neutral AI news classifier for tech industry professionals. Rate stories 1-5 flames based on industry impact, write 1-sentence summaries, and categorize them accurately.

User: Title: "Anthropic Releases Claude 3.5 with Major Performance Gains"
Source: Anthropic Blog
Date: 2025-06-13

Response format:
Summary: [one sentence]
Category: [Model Releases|Funding|Regulation|Research|Drama|Other]
Flames: [1-5]

📁 Folder Structure (Planned)

📦 restart-the-server
├── public/
├── pages/
│   ├── index.tsx (feed)
│   └── admin.tsx (dashboard)
├── components/
│   └── HeadlineCard.tsx
├── lib/
│   └── summarize.ts (OpenAI)
├── supabase/
│   └── schema.sql
├── docs/
│   ├── PRD.md
│   └── tech.md
└── README.md

💵 Monetization Strategy

Google AdSense only in the footer (1 slot per page)

Clean layout with no popups, interstitials, or banner clutter

Long-term: programmable alerts, premium access to archives, or API access to headline feed

📈 Roadmap

✅ MVP Launch (7 days)

🔄 Improve flame scoring with ML feedback loop

🔔 User-specific programmable alerts

📨 Weekly email digest (click to subscribe)

👥 Multi-curator support w/ invite-based access

📬 Contact / Contribute

Want to help curate, contribute to code, or sponsor the project?

📧 Email: hello@restarttheserver.com🌐 Website: restarttheserver.com (coming soon)

🧠 Philosophy

"This is exactly like Drudge, but somehow better."

We don't believe in reinventing news. We believe in filtering noise so builders can stay focused. If it's not 🔥, it’s not on the Server.

🔒 License

MIT