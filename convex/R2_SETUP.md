# Cloudflare R2 Storage Setup

This project uses Cloudflare R2 for storing audio files to reduce Convex file bandwidth usage.

## Prerequisites

1. A Cloudflare account with R2 enabled
2. An R2 bucket created (e.g., `zgodbomat`)
3. R2 API tokens with read/write permissions

## Configuration

Set the following environment variables in your Convex dashboard (Settings → Environment Variables):

### Required Variables

- `R2_ACCOUNT_ID`: Your Cloudflare account ID (found in Cloudflare dashboard URL or account settings)
- `R2_ACCESS_KEY_ID`: Your R2 access key ID (create in Cloudflare dashboard → R2 → Manage R2 API Tokens)
- `R2_SECRET_ACCESS_KEY`: Your R2 secret access key (created with the access key ID)
- `R2_BUCKET_NAME`: Your R2 bucket name (e.g., `zgodbomat`)

### Getting Your R2 Credentials

1. **Account ID**:
   - Go to Cloudflare Dashboard
   - Your account ID is in the URL or visible in the right sidebar

2. **Access Key ID and Secret Access Key**:
   - Go to Cloudflare Dashboard → R2 → Manage R2 API Tokens
   - Click "Create API Token"
   - Give it a name and select permissions (Object Read & Write)
   - Copy the Access Key ID and Secret Access Key (you'll only see the secret once!)

## Bucket Configuration

**No special configuration needed!**

This implementation uses **presigned URLs**, which means:

- ✅ Your bucket can remain private (more secure)
- ✅ No need to configure public access
- ✅ No need for a custom domain
- ✅ URLs are signed and valid for 1 year
- ✅ Works immediately after setting up API tokens

## How It Works

- When a story audio is generated, it's uploaded to R2 instead of Convex storage
- A **presigned URL** (valid for 1 year) is generated and stored in the `audioUrl` field
- The presigned URL allows direct access to the file without needing public bucket access
- Old files stored in Convex will continue to work via the HTTP action route (backward compatibility)
- New files will use R2 presigned URLs

## Testing

After setting up the environment variables:

1. Generate a new story audio
2. Check the Convex logs to see the R2 upload confirmation
3. Verify the audio URL in the story data points to your R2 bucket

