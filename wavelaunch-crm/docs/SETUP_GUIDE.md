# Wavelaunch CRM Setup Guide

This guide will walk you through setting up the Wavelaunch CRM system from scratch. No advanced technical knowledge required!

## Prerequisites (What You Need)

Before you start, make sure you have:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Check if installed: Open terminal and type `node --version`

2. **A code editor** (optional but helpful)
   - We recommend Visual Studio Code: https://code.visualstudio.com/

3. **Git** (for downloading the code)
   - Download from: https://git-scm.com/
   - Check if installed: Type `git --version` in terminal

## Step 1: Get the Code

1. Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux)

2. Navigate to where you want to put the project:
   ```bash
   cd ~/Documents  # or wherever you want
   ```

3. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd WavelaunchOS/wavelaunch-crm
   ```

## Step 2: Install Dependencies

Dependencies are pre-built code libraries that the system needs to work.

In your terminal, run:
```bash
npm install
```

This will take a few minutes. Don't worry if you see lots of text scrolling by!

## Step 3: Set Up Environment Variables

Environment variables are like secret settings for your app. They tell it how to connect to databases, where to send emails, etc.

1. Create a file called `.env` in the `wavelaunch-crm` folder

2. Copy this template into the file:

```env
# Database (where we store all the data)
DATABASE_URL="file:./dev.db"

# NextAuth (for admin login)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# App URL (where the app is hosted)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Anthropic AI (for AI features - optional)
ANTHROPIC_API_KEY="your-api-key-here"
```

3. **IMPORTANT**: Change `NEXTAUTH_SECRET` to a random, long string
   - Make it at least 32 characters
   - Use letters, numbers, and symbols
   - Example: `j8n2k9m4p7q1r5t8v3w6x9y2z5a8b1c4`
   - You can generate one here: https://generate-secret.vercel.app/32

## Step 4: Set Up the Database

The database is where all client information, business plans, and messages are stored.

1. Generate the database structure:
   ```bash
   npm run db:generate
   ```

2. Create the actual database file:
   ```bash
   npm run db:push
   ```

3. (Optional) Add some test data:
   ```bash
   npm run db:seed
   ```
   This creates a demo admin account and sample clients you can test with.

### Default Admin Account (if you ran seed)
- Email: `admin@wavelaunch.com`
- Password: `Admin123!`

**IMPORTANT**: Change this password immediately in production!

## Step 5: Start the Development Server

Now let's run the application!

```bash
npm run dev
```

You should see:
```
✓ Ready in 2.3s
○ Local: http://localhost:3000
```

## Step 6: Access the System

Open your web browser and go to:

### Admin Dashboard
- URL: `http://localhost:3000/login`
- Use the admin credentials above (if you seeded)

### Client Portal
- URL: `http://localhost:3000/portal/login`
- You'll need to create a client first, then send them an invite

## Common Commands

Here are the commands you'll use regularly:

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run production server
```

### Database
```bash
npm run db:generate  # Update database structure
npm run db:push      # Apply changes to database
npm run db:migrate   # Create migration files
npm run db:studio    # Open visual database editor
npm run db:seed      # Add test data
```

### Testing
```bash
npm run test         # Run all tests
npm run lint         # Check code quality
```

## Troubleshooting

### "Module not found" error
**Solution**: Run `npm install` again

### "NEXTAUTH_SECRET is required" error
**Solution**: Make sure you created the `.env` file and set NEXTAUTH_SECRET

### Database errors
**Solution**: Delete `dev.db` and run the database commands again:
```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Port 3000 is already in use
**Solution**: Either:
1. Stop the other app using port 3000, or
2. Use a different port:
   ```bash
   PORT=3001 npm run dev
   ```

### Can't log in
**Solution**:
1. Make sure you ran `db:seed` to create the admin account
2. Check you're using the correct credentials
3. Try resetting the database (see Database errors above)

## Production Deployment

When you're ready to deploy to production:

1. **Set strong passwords**:
   - Change NEXTAUTH_SECRET to a strong random string
   - Change admin password immediately

2. **Use a real database**:
   - SQLite (the default) is fine for small deployments
   - For production, consider PostgreSQL or MySQL

3. **Set up environment variables** on your hosting platform:
   - All the variables from your `.env` file
   - Add `NODE_ENV="production"`

4. **Build the application**:
   ```bash
   npm run build
   ```

5. **Start the production server**:
   ```bash
   npm start
   ```

### Recommended Hosting Platforms

- **Vercel** (easiest): https://vercel.com/
  - Automatically detects Next.js
  - Free tier available
  - One-click deployment

- **Railway**: https://railway.app/
  - Easy database setup
  - Affordable pricing

- **DigitalOcean**: https://www.digitalocean.com/
  - More control
  - Requires more setup

## Next Steps

Once your system is running:

1. [Read the Admin Guide](./ADMIN_GUIDE.md) to learn how to manage clients
2. [Read the User Guide](./USER_GUIDE.md) to understand what clients see
3. [Review Security Guide](./SECURITY.md) to ensure your deployment is secure

## Getting Help

If you get stuck:
1. Check the error message carefully
2. Search for the error online
3. Review this guide again
4. Contact your development team

---

Remember: The development server (`npm run dev`) is for testing only. Always use `npm run build` and `npm start` for production!
