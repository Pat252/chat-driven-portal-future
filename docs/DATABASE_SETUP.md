# Database Setup Guide - Messaging Tables with RLS

## 🎯 Overview

This guide prepares you to create Supabase tables for the messaging feature with proper Row Level Security (RLS) policies.

**Status:** ✅ Authentication foundation is complete and working.

**Next Step:** Create database tables and RLS policies (instructions below).

---

## 📋 Prerequisites

Before creating tables, ensure:

- ✅ OAuth login works correctly
- ✅ Sessions are created and persist
- ✅ UI shows "Signed in as email@example.com"
- ✅ Cookies are set properly
- ✅ `supabase.auth.getUser()` returns authenticated user

If any of these are not working, fix authentication first before proceeding.

---

## 🗄️ Tables to Create

### 1. Messages Table

**Purpose:** Store individual messages from users to AI

**Schema:**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

**Columns:**
- `id` - Unique identifier for each message
- `user_id` - Foreign key to auth.users (who sent the message)
- `content` - The actual message text
- `role` - 'user' (from user), 'assistant' (from AI), or 'system' (system messages)
- `conversation_id` - Optional grouping of messages into conversations
- `created_at` - When the message was created
- `updated_at` - When the message was last updated

---

### 2. Conversations Table (Optional but Recommended)

**Purpose:** Group messages into conversation threads

**Schema:**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
```

**Columns:**
- `id` - Unique identifier for each conversation
- `user_id` - Foreign key to auth.users (who owns the conversation)
- `title` - Optional title for the conversation (e.g., "Chat about React")
- `created_at` - When the conversation started
- `updated_at` - When the conversation was last updated

---

## 🔒 Row Level Security (RLS) Policies

### Messages Table RLS

**Enable RLS:**
```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

**Policy 1: Users can INSERT their own messages**
```sql
CREATE POLICY "Users can insert their own messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

**Policy 2: Users can SELECT their own messages**
```sql
CREATE POLICY "Users can select their own messages"
ON messages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

**Policy 3: Users can UPDATE their own messages**
```sql
CREATE POLICY "Users can update their own messages"
ON messages
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Policy 4: Users can DELETE their own messages**
```sql
CREATE POLICY "Users can delete their own messages"
ON messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

### Conversations Table RLS

**Enable RLS:**
```sql
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
```

**Policy 1: Users can INSERT their own conversations**
```sql
CREATE POLICY "Users can insert their own conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

**Policy 2: Users can SELECT their own conversations**
```sql
CREATE POLICY "Users can select their own conversations"
ON conversations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

**Policy 3: Users can UPDATE their own conversations**
```sql
CREATE POLICY "Users can update their own conversations"
ON conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Policy 4: Users can DELETE their own conversations**
```sql
CREATE POLICY "Users can delete their own conversations"
ON conversations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

## 📝 How to Apply These Schemas

### Option 1: Supabase Dashboard (Recommended for Testing)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy/paste the SQL from above
5. Click **Run**

### Option 2: Supabase CLI (Recommended for Production)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Create migration file:
   ```bash
   supabase migration new create_messaging_tables
   ```

5. Add SQL to the migration file

6. Apply migration:
   ```bash
   supabase db push
   ```

---

## ✅ Testing RLS Policies

After creating tables and policies, test them:

### Test 1: Insert Message

```typescript
const { data, error } = await supabase
  .from('messages')
  .insert({
    content: 'Hello, AI!',
    role: 'user',
  })

console.log({ data, error })
```

**Expected:** Success (message inserted with your user_id)

### Test 2: Select Messages

```typescript
const { data, error } = await supabase
  .from('messages')
  .select('*')

console.log({ data, error })
```

**Expected:** Only your messages returned

### Test 3: Try to Insert with Different user_id

```typescript
const { data, error } = await supabase
  .from('messages')
  .insert({
    user_id: '00000000-0000-0000-0000-000000000000', // Different user
    content: 'This should fail',
    role: 'user',
  })

console.log({ data, error })
```

**Expected:** Error (RLS blocks this)

### Test 4: Anonymous Access

```typescript
// Sign out first
await supabase.auth.signOut()

// Try to select messages
const { data, error } = await supabase
  .from('messages')
  .select('*')

console.log({ data, error })
```

**Expected:** Error or empty array (no access for anonymous users)

---

## 🚀 Next Steps After Creating Tables

1. **Create API Routes** for message operations:
   - `POST /api/messages` - Create new message
   - `GET /api/messages` - Get user's messages
   - `GET /api/conversations` - Get user's conversations

2. **Update Chat UI** to:
   - Save messages to database
   - Load message history
   - Display conversations

3. **Add AI Integration**:
   - Send user message to AI API
   - Save AI response to database
   - Update UI with AI response

4. **Add Real-time Features** (optional):
   - Use Supabase Realtime for live message updates
   - Show typing indicators
   - Live conversation updates

---

## 🔍 Verifying Everything Works

After setup, verify:

- [ ] Tables exist in Supabase Dashboard → Table Editor
- [ ] RLS is enabled on both tables
- [ ] Policies are created and active
- [ ] Can insert messages while authenticated
- [ ] Can read own messages while authenticated
- [ ] Cannot access other users' messages
- [ ] Anonymous users cannot access any messages
- [ ] Foreign key constraints work (user_id → auth.users)

---

## 📊 Database Diagram

```
auth.users (Supabase managed)
    ↓ (1:many)
conversations
    ↓ (1:many)
messages
    ↓ (many:1)
auth.users
```

---

## 🛡️ Security Considerations

1. **RLS is Critical:** Never disable RLS on these tables in production
2. **Validate Input:** Always validate message content before inserting
3. **Rate Limiting:** Consider rate limiting message creation
4. **Content Filtering:** Implement content moderation if needed
5. **Backups:** Enable Supabase automatic backups

---

## 📝 Complete SQL Script

Here's the complete script you can run all at once:

```sql
-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations RLS Policies
CREATE POLICY "Users can insert their own conversations"
ON conversations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own conversations"
ON conversations FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON conversations FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON conversations FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Messages RLS Policies
CREATE POLICY "Users can insert their own messages"
ON messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own messages"
ON messages FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON messages FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

---

## ✅ Status

**Authentication:** ✅ Complete and working
**Database Tables:** ⏸️ Ready to create (use SQL above)
**RLS Policies:** ⏸️ Ready to create (use SQL above)
**Frontend Integration:** ⏸️ Next step after tables are created

---

**You are now ready to create the database tables!** 🚀

Use the complete SQL script above in Supabase Dashboard → SQL Editor.

