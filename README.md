Things to Set Up After Cloning the Template

1. Install dependencies

After cloning the repo:

npm install

# or

pnpm install

2. Set up the .env file

This is crucial. Copy the .env.example (if it exists), or manually set the needed variables. At a minimum, you likely need:

DATABASE_URL=your_postgres_db_url
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key (optional for email verification)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

You can use openssl rand -base64 32 to generate NEXTAUTH_SECRET. 3. Push database schema to your DB

If you’re using Prisma, push the schema:

npx prisma db push

Or run migrations if you're using them:

npx prisma migrate dev --name init

4. Seed the DB (optional)

If you have a seed script (usually in prisma/seed.ts):

npx prisma db seed

5. Run the development server

npm run dev

# or

pnpm dev
