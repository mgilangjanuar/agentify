<!-- [![vercel](https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg)](https://vercel.com/?utm_source=appledore-dev&utm_campaign=oss) -->

# Agentify

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![server status](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fagentify.appledore.dev%2Fapi%2Fping&query=status&label=server%20status)
[![deploy](https://github.com/mgilangjanuar/agentify/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/mgilangjanuar/agentify/actions/workflows/deploy.yml)
[![](https://img.shields.io/badge/Chat_with_Agentify-Ask_Cody-%238A16D7?labelColor=%23383838)](https://sourcegraph.com/github.com/mgilangjanuar/agentify)

An agent studio platform that utilizes Claude models to generate a specific agent for a particular task.

Live demo: [agentify.appledore.dev](https://agentify.appledore.dev)

![ss](/public/img1.png)

**Video Demo 1:**

[![Video Demo 1](https://img.youtube.com/vi/S_RuJZQFyuY/0.jpg)](https://www.youtube.com/watch?v=S_RuJZQFyuY "Agentify - Weather Agent")

**Video Demo 2:**

[![Video Demo 2](https://img.youtube.com/vi/992ebMwTVZ8/0.jpg)](https://www.youtube.com/watch?v=992ebMwTVZ8 "Agentify - GitHub Agent")

## Features

- [x] Generate agents
- [x] Agent Store
- [x] Publish your generated agents
- [x] Install agents from the Store
- [x] Review submissions
- [x] Stream mode
- [ ] Isolated script execution
- [ ] Advanced mode Studio
- [ ] Chat with multiple agents
- [ ] Pagination, lol

## Requirements

- [agentify-browser](https://github.com/mgilangjanuar/agentify-browser)
- [agentify-script](https://github.com/mgilangjanuar/agentify-script)
- [PostgreSQL](https://www.postgresql.org)
- [bun](https://bun.sh) (recommended)

## Installation and Setup

1. Clone this repository
2. Install dependencies

    ```bash
    bun install
    ```
3. Create a `.env` file and fill it with the required [environment variables](#environment-variables)

    ```bash
    cp .env.example .env
    ```
4. Create a new database and set the `DATABASE_URL` in the `.env` file
5. Run the migrations

    ```bash
    bun prisma migrate deploy && \
    bun prisma generate
    ```

## Development

Run the development server

```bash
bun run dev
```

## Production

Build the project & start the server

```bash
bun run build && bun run start
```

## Environment Variables

| Variable | Description | Required |
| --- | --- | --- |
| `NODE_ENV` | The environment mode | ✅ |
| `DATABASE_URL` | The database URL | ✅ |
| `SUPERADMINS` | The superadmins' email | ✅ |
| `SECRET` | The encryption secret | ✅ |
| `GOOGLE_CLIENT_ID` | The Google OAuth client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | The Google OAuth client secret | ✅ |
| `GOOGLE_REDIRECT_URI` | The Google OAuth redirect URI | ✅ |
| `GOOGLE_SEARCH_KEY` | The Google Search API key | ✅ |
| `GOOGLE_SEARCH_CX` | The Google Search CX | ✅ |
| `BROWSER_URL` | The Agentify Browser URL | ✅ |
| `BROWSER_SECRET` | The Agentify Browser secret | ✅ |
| `SCRIPT_URL` | The Agentify Script Runner URL | ✅ |
| `SCRIPT_SECRET` | The Agentify Script Runner secret | ✅ |
| `ANTHROPIC_API_KEY` | The Anthropic API key | ✅ |

## Contributors

<a href="https://github.com/mgilangjanuar/agentify/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mgilangjanuar/agentify" />
</a>

## License

[MIT](/LICENSE.md)

![meme](/meme.jpg)
