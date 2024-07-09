# Agentify

An agent studio platform that utilizes Claude models to generate a specific agent for a particular task.

![meme](/meme.jpg)

## Features

- [x] Generate agents
- [x] Agent Store
- [x] Publish your generated agents
- [x] Install agents from the Store
- [x] Review submissions
- [ ] Advanced mode Studio
- [ ] Stream mode
- [ ] Pagination, lol

## Requirements

- [agentify-browser](https://github.com/mgilangjanuar/agentify-browser)
- [PostgreSQL](https://www.postgresql.org)
- [Prisma](https://prisma.io)
- [Next.js](https://nextjs.org)
- [bun](https://bun.sh) (recommended)

## Installation and Setup

1. Clone this repository
2. Install dependencies

    ```bash
    bun install
    ```
3. Create a `.env` file and fill it with the required environment variables

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
| `NODE_ENV` | The environment mode | [x] |
| `DATABASE_URL` | The database URL | [x] |
| `SUPERADMINS` | The superadmins' email | [x] |
| `SECRET` | The encryption secret | [x] |
| `GOOGLE_CLIENT_ID` | The Google OAuth client ID | [x] |
| `GOOGLE_CLIENT_SECRET` | The Google OAuth client secret | [x] |
| `GOOGLE_REDIRECT_URI` | The Google OAuth redirect URI | [x] |
| `GOOGLE_SEARCH_KEY` | The Google Search API key | [x] |
| `GOOGLE_SEARCH_CX` | The Google Search CX | [x] |
| `BROWSER_URL` | The Agentify Browser URL | [x] |
| `BROWSER_SECRET` | The Agentify Browser secret | [x] |
| `ANTHROPIC_API_KEY` | The Anthropic API key | [x] |

## License

[MIT](/LICENSE.md)
