# Bloom Habits - Habit Tracker

A modern, mobile-responsive habit tracking application built with Next.js, Tailwind CSS, and Supabase. Track your daily habits, view completion trends, and build better routines.

## Features

- 🔐 **Authentication**: Email/password and Google OAuth login
- 📱 **Mobile-Responsive**: Beautiful design that works on all devices
- 📊 **Habit Tracking**: Add, view, and mark habits as completed
- 📈 **Analytics**: Chart.js line charts showing habit completion trends
- 🎯 **Dashboard**: Clean interface with stats and recent activity
- ⚡ **Real-time**: Instant updates with Supabase real-time subscriptions

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Set Up Database Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create habits table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habit_logs table
CREATE TABLE habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for habits table
CREATE POLICY "Users can view their own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for habit_logs table
CREATE POLICY "Users can view their own habit logs" ON habit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs" ON habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs" ON habit_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_completed_at ON habit_logs(completed_at);
```

### 4. Configure Google OAuth (Optional)

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials (Client ID and Client Secret)
5. Add your redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects)
├── components/            # React components
│   ├── AddHabitModal.tsx # Modal for adding habits
│   ├── AuthProvider.tsx  # Authentication context
│   ├── HabitChart.tsx    # Chart.js component
│   └── HabitList.tsx     # Habit list component
├── hooks/                 # Custom React hooks
│   └── useAuth.ts        # Authentication hook
├── lib/                   # Utility libraries
│   └── supabase.ts       # Supabase client
└── public/               # Static assets
```

## Features in Detail

### Authentication
- Email/password authentication
- Google OAuth integration
- Protected routes
- Automatic session management

### Habit Management
- Create new habits with title and description
- Mark habits as completed for the day
- Toggle completion status
- View all user habits

### Analytics Dashboard
- Line chart showing completion trends over 7 days
- Weekly statistics
- Recent activity feed
- Completion rate calculations

### Mobile Responsive Design
- Responsive grid layout
- Touch-friendly interface
- Optimized for mobile devices
- Clean, modern UI with Tailwind CSS

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional (for admin features)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own habit tracking needs!

## Support

If you encounter any issues:
1. Check the Supabase documentation
2. Verify your environment variables
3. Ensure database tables are created correctly
4. Check the browser console for errors

---

Built with ❤️ using Next.js, Tailwind CSS, and Supabase 