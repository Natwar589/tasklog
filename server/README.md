# DailyLog Backend Setup Guide (Supabase)

This directory contains the database structure for **DailyLog** using Supabase (PostgreSQL).

## 🚀 Setup Steps

### 1. Create a Supabase Project
1. Go to [Supabase Console](https://supabase.com/) and create a new project.
2. Note your **Database Password** (needed for connection strings) and wait for the database provisioning to complete.

### 2. Apply the Database Schema
1. In your Supabase Dashboard, navigate to the **SQL Editor** tab (on the left menu sidebar, look for the `SQL` icon).
2. Click **New Query**.
3. Open the file [schema.sql](file:///Users/natwarrathor/Downloads/my_work/Daily%20task%20logger/server/schema.sql) in your workspace editor, copy its contents, and paste it into the SQL Editor.
4. Click the **Run** button at the bottom right.
5. You should see a success message indicating the schema tables, triggers, and Row Level Security policies have been successfully created.

### 3. Copy API Keys
1. In the Supabase Dashboard, navigate to **Project Settings** (gear icon at the bottom left) -> **API**.
2. Locate the following keys:
   * **Project URL** (under Project API keys)
   * **Project API `anon` `public` key** (under Project API keys)
3. Copy these values.

---

## 🔒 Row Level Security (RLS) Details

We enforce strict privacy in the database layout:
1. **Profiles Table**: Users can read and update only their own matching UUID profiles (`auth.uid() = id`).
2. **Entries Table**: All logs are encrypted and private by default. Users can select, insert, update, or delete only entries matching their own authenticated UUID (`auth.uid() = user_id`).
3. **Database Constraints**: Prevents creating multiple logs for the same calendar date per user, keeping data clean.
