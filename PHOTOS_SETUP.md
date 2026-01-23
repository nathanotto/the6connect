# Photos Feature Setup Instructions

Before the photos feature will work, you need to:

## 1. Run Database Migration

Go to your Supabase dashboard:
1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/*_create_photos_table.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)

This creates the `photos` table with proper RLS policies.

## 2. Create Storage Bucket

In your Supabase dashboard:
1. Click **Storage** in the left sidebar
2. Click **New Bucket**
3. Name it: `photos`
4. Set it to **Public** (so photo URLs work without auth)
5. Click **Create bucket**

## 3. Set Storage Policies (Optional but Recommended)

In the Storage bucket settings for `photos`:
1. Click **Policies**
2. Add these policies:

**INSERT Policy:**
- Name: "Users can upload photos"
- Target roles: authenticated
- Policy definition:
```sql
bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
```

**SELECT Policy:**
- Name: "Anyone can view photos"
- Target roles: public
- Policy definition:
```sql
bucket_id = 'photos'
```

**DELETE Policy:**
- Name: "Users can delete own photos"
- Target roles: authenticated
- Policy definition:
```sql
bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
```

## 4. Test It

1. Deploy the code to Vercel
2. Go to `/dashboard/photos`
3. Try uploading a photo
4. Check that it appears in Supabase Storage under `photos/[user-id]/[timestamp].jpg`

## Troubleshooting

- **"Failed to upload photo"**: Check storage bucket exists and is public
- **Photos don't display**: Check RLS policies on `photos` table
- **Can't delete photos**: Check storage DELETE policy is set correctly
