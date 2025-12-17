import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { Id } from './_generated/dataModel';

const http = httpRouter();

// Helper to get file extension from MIME type
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/x-wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
    'audio/aac': 'aac',
    'audio/m4a': 'm4a',
  };
  return mimeToExt[mimeType] || 'mp3'; // Default to mp3
}

http.route({
  path: '/audio/:storageId',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    // Extract storageId and extension from path like /audio/{storageId}.wav
    const pathMatch = url.pathname.match(/^\/audio\/([^.]+)(?:\.(.+))?$/);
    const storageId = pathMatch?.[1] as Id<'_storage'> | undefined;
    const extension = pathMatch?.[2] || 'wav'; // Default to wav for audio files

    if (!storageId) {
      return new Response('Missing storageId parameter', { status: 400 });
    }

    // Get the audio file from storage
    const blob = await ctx.storage.get(storageId);
    if (blob === null) {
      return new Response('Audio file not found', { status: 404 });
    }

    // Determine content type from blob or extension
    // Force audio/wav if extension is wav, otherwise use blob type or default to mpeg
    let contentType = blob.type || `audio/${extension === 'wav' ? 'wav' : 'mpeg'}`;
    
    // If blob type is PCM format but extension is wav, force audio/wav
    if (extension === 'wav' && (contentType.includes('l16') || contentType.includes('pcm'))) {
      contentType = 'audio/wav';
    }

    // Return the audio file with proper headers
    return new Response(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': blob.size.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  }),
});

export default http;

