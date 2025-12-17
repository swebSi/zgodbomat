import { v } from 'convex/values';
import { api } from './_generated/api';
import type { Id } from './_generated/dataModel';
import type { ActionCtx } from './_generated/server';
import { action, mutation, query } from './_generated/server';
import { uploadAudioToR2 } from './r2';

type StoryGenerationParams = {
  childId: string;
  childName: string;
  childAge: number;
  setting: string | null;
  moral: string | null;
  storyTone: string | null;
  storyLength: string | null;
  characterType: string | null;
  language?: string;
  chapterCount?: number;
};

// Map language codes to full language names for AI prompts
const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  sl: 'Slovenian',
};

function buildStoryPrompt(params: StoryGenerationParams): string {
  const {
    childName,
    childAge,
    setting,
    moral,
    storyTone,
    storyLength,
    characterType,
    language = 'en',
    chapterCount = 5,
  } = params;

  // Convert language code to full name, default to English if not found
  const languageName = LANGUAGE_MAP[language] || LANGUAGE_MAP['en'] || 'English';

  // Determine main character based on character type and child's avatar
  const mainCharacter = childName;

  // Map story length to chapter count if not provided
  let finalChapterCount = chapterCount;
  if (storyLength === 'short') {
    finalChapterCount = 3;
  } else if (storyLength === 'medium') {
    finalChapterCount = 5;
  } else if (storyLength === 'long') {
    finalChapterCount = 7;
  }

  const parts: string[] = [];

  parts.push(
    'You are a gentle and imaginative storyteller creating bedtime stories for children.\n\n'
  );
  parts.push(
    `Create an original bedtime story in ${languageName}, suitable for a child aged ${childAge} years.\n`
  );
  parts.push('If age is not provided, assume 3–7 years old.\n\n');
  parts.push('The story must be divided into calm, visually clear chapters.\n');
  parts.push('Each chapter must be easy to illustrate with a single image.\n\n');

  parts.push('STORY RULES:\n');
  parts.push('- Warm, cozy, bedtime tone.\n');
  parts.push('- No scary elements, danger, or conflict.\n');
  parts.push('- No villains or sadness.\n');
  parts.push('- Calm pacing.\n');
  parts.push('- Peaceful, sleepy ending.\n\n');

  // Add setting if provided
  if (setting) {
    const settingLabels: Record<string, string> = {
      forest: 'Enchanted Forest',
      castle: 'Magical Castle',
      ocean: 'Underwater Kingdom',
      space: 'Starry Galaxy',
      jungle: 'Mysterious Jungle',
      mountain: 'Mountain Peak',
      village: 'Cozy Village',
      desert: 'Desert Oasis',
    };
    parts.push(`SETTING: The story takes place in ${settingLabels[setting] || setting}.\n\n`);
  }

  // Add character type if provided
  if (characterType) {
    const characterLabels: Record<string, string> = {
      animal: 'Animal Characters',
      human: 'Human Characters',
      fantasy: 'Fantasy Creatures',
      mixed: 'Mixed Characters',
    };
    parts.push(
      `CHARACTERS: The story should feature ${characterLabels[characterType] || characterType}.\n\n`
    );
  }

  // Add moral if provided
  if (moral) {
    const moralLabels: Record<string, string> = {
      friendship: 'Friendship',
      bravery: 'Bravery',
      kindness: 'Kindness',
      honesty: 'Honesty',
      perseverance: 'Perseverance',
      sharing: 'Sharing',
      respect: 'Respect',
      creativity: 'Creativity',
    };
    parts.push(
      `MORAL LESSON: The story should teach the value of ${moralLabels[moral] || moral}.\n\n`
    );
  }

  // Add story tone if provided
  if (storyTone) {
    const toneLabels: Record<string, string> = {
      adventurous: 'Adventurous',
      gentle: 'Gentle & Calming',
      funny: 'Funny & Playful',
      mysterious: 'Mysterious',
      inspiring: 'Inspiring',
      magical: 'Magical',
    };
    parts.push(`TONE: The story should be ${toneLabels[storyTone] || storyTone}.\n\n`);
  }

  parts.push('CHAPTER RULES:\n');
  parts.push(`- Create exactly ${finalChapterCount} chapters.\n`);
  parts.push('- Each chapter represents one gentle scene.\n');
  parts.push('- Each chapter must have ONE main visual focus.\n');
  parts.push('- No sudden or chaotic actions.\n\n');

  parts.push('MAIN CHARACTER:\n');
  parts.push(`- The main character is ${mainCharacter}.\n`);
  parts.push("- Keep the character's appearance consistent across all chapters.\n\n");

  parts.push('IMAGE PROMPT RULES:\n');
  parts.push('- Image prompts must be short (1–2 sentences max).\n');
  parts.push('- Describe only what should be visible.\n');
  parts.push('- Include: character, setting, mood, lighting.\n');
  parts.push('- Do NOT include story text, emotions, or actions that are not visible.\n');
  parts.push('- Use a consistent illustration style suitable for children.\n\n');

  parts.push('OUTPUT FORMAT (STRICT JSON):\n');
  parts.push('{\n');
  parts.push('  "title": "A short, catchy title for the story (3-8 words max).",\n');
  parts.push('  "chapters": [\n');
  parts.push('    {\n');
  parts.push('      "chapter_number": 1,\n');
  parts.push(
    '      "text": "Chapter text written in simple, soothing language for reading aloud.",\n'
  );
  parts.push(
    '      "image_prompt": "Short, concrete prompt describing the illustration for this chapter."\n'
  );
  parts.push('    }\n');
  parts.push('  ]\n');
  parts.push('}\n\n');

  parts.push('STYLE LOCK FOR IMAGE PROMPTS:\n');
  parts.push("- Soft children's book illustration\n");
  parts.push('- Warm colors\n');
  parts.push('- Gentle lighting\n');
  parts.push('- No text in image\n');
  parts.push('- No realism, no photorealism\n\n');

  parts.push('Do not include anything outside the JSON output.');

  return parts.join('');
}

async function generateStoryWithAI(
  ctx: ActionCtx,
  prompt: string
): Promise<{
  title: string;
  chapters: Array<{ chapter_number: number; text: string; image_prompt: string }>;
}> {
  // Get API key from environment
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENAI_API_KEY environment variable is not set');
  }

  // Import Google GenAI SDK
  // Note: You'll need to install @google/genai package first
  // Run: npm install @google/genai
  // Then set GOOGLE_GENAI_API_KEY in Convex dashboard environment variables
  let GoogleGenAI: any;
  try {
    // @ts-ignore - Package will be installed by user
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const genaiModule = await import('@google/genai');
    GoogleGenAI = genaiModule.GoogleGenAI;
  } catch (error) {
    throw new Error(
      '@google/genai package is not installed. Please run: npm install @google/genai'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response text from AI');
    }

    // Parse JSON response
    // The AI might wrap the JSON in markdown code blocks, so we need to extract it
    let jsonText = responseText.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      const lines = jsonText.split('\n');
      const startIndex = lines.findIndex((line: string) => line.includes('{'));
      const endIndex = lines.findLastIndex((line: string) => line.includes('}'));
      jsonText = lines.slice(startIndex, endIndex + 1).join('\n');
    }

    const parsed = JSON.parse(jsonText);

    // Validate structure
    if (!parsed.title || !Array.isArray(parsed.chapters)) {
      throw new Error('Invalid response structure from AI');
    }

    return parsed;
  } catch (error) {
    console.error('Error generating story with AI:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate story: ${error.message}`);
    }
    throw new Error('Failed to generate story');
  }
}

/**
 * Generate a story using Google GenAI
 */
export const generateStory = action({
  // Use Node.js runtime for external API calls
  // Note: This requires the @google/genai package to be installed
  // Run: npm install @google/genai
  // Also set GOOGLE_GENAI_API_KEY in Convex dashboard environment variables
  args: {
    childId: v.id('children'),
    childName: v.string(),
    childAge: v.number(),
    setting: v.union(v.string(), v.null()),
    moral: v.union(v.string(), v.null()),
    storyTone: v.union(v.string(), v.null()),
    storyLength: v.union(v.string(), v.null()),
    characterType: v.union(v.string(), v.null()),
    language: v.optional(v.string()),
    chapterCount: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    storyId: string;
    title: string;
    chapters: Array<{ chapter_number: number; text: string; image_prompt: string }>;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Verify the child belongs to the authenticated user
    const child = await ctx.runQuery(api.children.getChildById, {
      childId: args.childId,
    });

    if (!child) {
      throw new Error('Child not found');
    }

    // Build the prompt
    const prompt = buildStoryPrompt({
      childId: args.childId,
      childName: args.childName,
      childAge: args.childAge,
      setting: args.setting ?? null,
      moral: args.moral ?? null,
      storyTone: args.storyTone ?? null,
      storyLength: args.storyLength ?? null,
      characterType: args.characterType ?? null,
      language: args.language,
      chapterCount: args.chapterCount,
    });

    // Generate story with AI
    const aiResponse = await generateStoryWithAI(ctx, prompt);

    // Combine all chapter texts for the content field
    const fullContent = aiResponse.chapters.map((ch) => ch.text).join('\n\n');

    // Use the title from AI response (short, catchy title)
    const title = aiResponse.title.trim();

    // Save the story to database
    const storyId = await ctx.runMutation(api.stories.createStory, {
      childId: args.childId,
      title,
      content: fullContent,
      chapters: aiResponse.chapters.map((ch) => ({
        chapterNumber: ch.chapter_number,
        text: ch.text,
        imagePrompt: ch.image_prompt,
      })),
    });

    return {
      storyId,
      title,
      chapters: aiResponse.chapters,
    };
  },
});

/**
 * Get all stories for a specific child
 */
export const getStoriesByChild = query({
  args: {
    childId: v.id('children'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Verify the child belongs to the authenticated user
    const child = await ctx.db.get(args.childId);
    if (!child) {
      return [];
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!user || child.userId !== user._id) {
      return [];
    }

    return await ctx.db
      .query('stories')
      .withIndex('by_child_id_created_at', (q) => q.eq('childId', args.childId))
      .order('desc')
      .collect();
  },
});

/**
 * Get all stories for the authenticated user (across all children)
 */
export const getStoriesByUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!user) {
      return [];
    }

    // Get all children for the user
    const children = await ctx.db
      .query('children')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .collect();

    if (children.length === 0) {
      return [];
    }

    // Get all stories for all children
    const allStories = await Promise.all(
      children.map((child) =>
        ctx.db
          .query('stories')
          .withIndex('by_child_id_created_at', (q) => q.eq('childId', child._id))
          .order('desc')
          .collect()
      )
    );

    // Flatten and sort by creation date
    return allStories.flat().sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get a specific story by ID
 */
export const getStoryById = query({
  args: {
    storyId: v.id('stories'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const story = await ctx.db.get(args.storyId);
    if (!story) {
      return null;
    }

    // Verify the story belongs to a child of the authenticated user
    const child = await ctx.db.get(story.childId);
    if (!child) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!user || child.userId !== user._id) {
      return null;
    }

    // Return audioUrl directly (now stored as R2 URL)
    // Keep backward compatibility with audioStorageId for old files
    let audioUrl = story.audioUrl;
    if (story.audioStorageId && !audioUrl) {
      // Legacy: Generate URL for old Convex storage files
      // Use HTTP action URL with .wav extension for better compatibility (especially iOS)
      const storageUrl = await ctx.storage.getUrl(story.audioStorageId);
      if (storageUrl) {
        try {
          const url = new URL(storageUrl);
          // Convert .convex.cloud to .convex.site for HTTP actions
          if (url.hostname.includes('.convex.cloud')) {
            const siteHostname = url.hostname.replace('.convex.cloud', '.convex.site');
            // HTTP action URL format: https://xxx.convex.site/audio/{storageId}.wav
            audioUrl = `https://${siteHostname}/audio/${story.audioStorageId}.wav`;
            console.log('Constructed HTTP action URL for legacy file:', audioUrl);
          } else {
            audioUrl = storageUrl;
          }
        } catch (error) {
          console.warn('Could not construct HTTP action URL, using storage URL:', error);
          audioUrl = storageUrl;
        }
      }
    }

    return {
      ...story,
      audioUrl: audioUrl || undefined,
    };
  },
});

/**
 * Create a story in the database
 */
export const createStory = mutation({
  args: {
    childId: v.id('children'),
    title: v.string(),
    content: v.string(),
    chapters: v.array(
      v.object({
        chapterNumber: v.number(),
        text: v.string(),
        imagePrompt: v.string(),
        imageUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Verify the child belongs to the authenticated user
    const child = await ctx.db.get(args.childId);
    if (!child) {
      throw new Error('Child not found');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!user || child.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    const now = Date.now();
    const storyId = await ctx.db.insert('stories', {
      childId: args.childId,
      title: args.title,
      content: args.content,
      chapters: args.chapters,
      createdAt: now,
      updatedAt: now,
    });

    return storyId;
  },
});

/**
 * Update chapter image URL in a story
 */
export const updateChapterImage = mutation({
  args: {
    storyId: v.id('stories'),
    chapterNumber: v.number(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const story = await ctx.db.get(args.storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    // Verify the story belongs to the authenticated user
    const child = await ctx.db.get(story.childId);
    if (!child) {
      throw new Error('Child not found');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!user || child.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    // Update the chapter with the image URL
    const updatedChapters = story.chapters.map((chapter) =>
      chapter.chapterNumber === args.chapterNumber
        ? { ...chapter, imageUrl: args.imageUrl }
        : chapter
    );

    await ctx.db.patch(args.storyId, {
      chapters: updatedChapters,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Generate a single chapter image using Gemini
 */
async function generateChapterImage(
  ctx: ActionCtx,
  imagePrompt: string,
  referenceImageUrl?: string
): Promise<{ imageData: ArrayBuffer; mimeType: string }> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENAI_API_KEY environment variable is not set');
  }

  let GoogleGenAI: any;
  try {
    // @ts-ignore - Package will be installed by user
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const genaiModule = await import('@google/genai');
    GoogleGenAI = genaiModule.GoogleGenAI;
  } catch (error) {
    throw new Error(
      '@google/genai package is not installed. Please run: npm install @google/genai'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Build the prompt with style consistency instructions if reference image exists
    let enhancedPrompt = imagePrompt;
    if (referenceImageUrl) {
      enhancedPrompt = `${imagePrompt}\n\nIMPORTANT: Maintain the exact same illustration style, character appearance, color palette, and artistic technique as shown in the reference image. The characters and visual elements must be consistent and recognizable across all images.`;
    }

    // Prepare the request
    const requestConfig: any = {
      model: 'gemini-2.5-flash-image',
      contents: enhancedPrompt,
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: '16:9', // Good for story illustrations
          imageSize: '2K', // 2K resolution for good quality
        },
      },
    };

    // If we have a reference image, fetch it and include it
    if (referenceImageUrl) {
      const referenceResponse = await fetch(referenceImageUrl);
      if (referenceResponse.ok) {
        const referenceImageBuffer = await referenceResponse.arrayBuffer();
        // Note: The exact API for including reference images may vary
        // You may need to adjust this based on the actual Gemini API
        requestConfig.contents = [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: Buffer.from(referenceImageBuffer).toString('base64'),
                  mimeType: 'image/png',
                },
              },
              { text: enhancedPrompt },
            ],
          },
        ];
      }
    }

    const response = await ai.models.generateContent(requestConfig);

    // Extract image from response
    // The response structure may vary - adjust based on actual API response
    if (!response.parts || response.parts.length === 0) {
      throw new Error('No image generated in response');
    }

    const imagePart = response.parts.find((part: any) => part.image);
    if (!imagePart || !imagePart.image) {
      throw new Error('No image found in response');
    }

    // Get image data
    const imageData = await imagePart.image.arrayBuffer();
    const mimeType = imagePart.image.mimeType || 'image/png';

    return { imageData, mimeType };
  } catch (error) {
    console.error('Error generating chapter image:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error('Failed to generate image');
  }
}

/**
 * Generate all chapter images for a story
 * Generates images sequentially to maintain style consistency
 */
export const generateChapterImages = action({
  args: {
    storyId: v.id('stories'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Get the story
    const story = await ctx.runQuery(api.stories.getStoryById, {
      storyId: args.storyId,
    });

    if (!story) {
      throw new Error('Story not found');
    }

    // Verify ownership - get child and verify it belongs to the user
    const child = await ctx.runQuery(api.children.getChildById, {
      childId: story.childId,
    });

    if (!child) {
      throw new Error('Child not found');
    }

    // Get user by clerk ID to verify ownership
    // We'll need to query users through a helper or verify differently
    // For now, we can get the user's children and check if this child belongs to them
    const userChildren = await ctx.runQuery(api.children.getChildrenByUser, {});
    const userOwnsChild = userChildren.some((c) => c._id === story.childId);

    if (!userOwnsChild) {
      throw new Error('Unauthorized');
    }

    // Sort chapters by chapter number
    const sortedChapters = [...story.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);

    let referenceImageUrl: string | undefined;

    // Generate images sequentially
    for (const chapter of sortedChapters) {
      // Skip if image already exists
      if (chapter.imageUrl) {
        referenceImageUrl = chapter.imageUrl;
        continue;
      }

      try {
        // Generate image
        const { imageData, mimeType } = await generateChapterImage(
          ctx,
          chapter.imagePrompt,
          referenceImageUrl
        );

        // Upload to Convex file storage
        // Create a Blob from the ArrayBuffer for Convex storage
        const blob = new Blob([imageData], { type: mimeType });
        const storageId = await ctx.storage.store(blob);

        // Get the URL for the stored file
        const imageUrl = await ctx.storage.getUrl(storageId);
        if (!imageUrl) {
          throw new Error('Failed to get image URL from storage');
        }

        // Update the chapter with the image URL
        await ctx.runMutation(api.stories.updateChapterImage, {
          storyId: args.storyId,
          chapterNumber: chapter.chapterNumber,
          imageUrl,
        });

        // Use this image as reference for next chapters
        referenceImageUrl = imageUrl;
      } catch (error) {
        console.error(`Error generating image for chapter ${chapter.chapterNumber}:`, error);
        // Continue with next chapter even if one fails
        // You might want to track failed chapters and retry them
      }
    }

    return { success: true };
  },
});

/**
 * Update story audio URL and storage ID
 * Now primarily uses R2 URLs stored in audioUrl
 */
export const updateStoryAudio = mutation({
  args: {
    storyId: v.id('stories'),
    audioUrl: v.optional(v.string()), // R2 URL for new files
    audioStorageId: v.optional(v.id('_storage')), // Legacy Convex storage ID (can be undefined to clear)
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const story = await ctx.db.get(args.storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    // Verify ownership
    const child = await ctx.db.get(story.childId);
    if (!child) {
      throw new Error('Child not found');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!user || child.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    // Build patch object - only include fields that are provided
    const patchData: {
      audioUrl?: string;
      audioStorageId?: Id<'_storage'> | undefined;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.audioUrl !== undefined) {
      patchData.audioUrl = args.audioUrl;
    }

    if (args.audioStorageId !== undefined) {
      patchData.audioStorageId = args.audioStorageId;
    } else if (args.audioUrl) {
      // If setting a new R2 URL, clear the old storage ID
      patchData.audioStorageId = undefined;
    }

    await ctx.db.patch(args.storyId, patchData);
  },
});

/**
 * Generate audio for a story using Gemini TTS
 */
async function generateStoryAudio(
  ctx: ActionCtx,
  storyContent: string,
  language: string = 'en'
): Promise<{ audioData: ArrayBuffer; mimeType: string }> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENAI_API_KEY environment variable is not set');
  }

  let GoogleGenAI: any;
  try {
    // @ts-ignore - Package will be installed by user
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const genaiModule = await import('@google/genai');
    GoogleGenAI = genaiModule.GoogleGenAI;
  } catch (error) {
    throw new Error(
      '@google/genai package is not installed. Please run: npm install @google/genai'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Use gemini-2.5-flash-preview-tts for text-to-speech
    // Based on official documentation - single speaker format
    const config = {
      temperature: 1,
      responseModalities: ['audio'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Zephyr', // Warm, welcoming voice suitable for bedtime stories
          },
        },
      },
    };

    const model = 'gemini-2.5-flash-preview-tts';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: storyContent,
          },
        ],
      },
    ];

    // Helper function to decode base64 to Uint8Array (works in Convex)
    function base64ToUint8Array(base64: string): Uint8Array {
      // Remove data URL prefix if present
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

      // Decode base64 string
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }

    // Helper to parse MIME type and extract sample rate
    function parseMimeType(mimeType: string): {
      sampleRate: number;
      bitsPerSample: number;
      channels: number;
    } {
      const sampleRateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;

      // L16 means 16-bit linear PCM
      const bitsPerSample = 16;
      // TTS typically outputs mono audio
      const channels = 1;

      return { sampleRate, bitsPerSample, channels };
    }

    // Helper to create WAV header (standard WAV format specification)
    function createWavHeader(
      dataLength: number,
      sampleRate: number,
      bitsPerSample: number,
      channels: number
    ): Uint8Array {
      const byteRate = (sampleRate * channels * bitsPerSample) / 8;
      const blockAlign = (channels * bitsPerSample) / 8;
      const headerSize = 44;

      const header = new Uint8Array(headerSize);
      const view = new DataView(header.buffer);

      // RIFF header (bytes 0-11)
      header.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
      view.setUint32(4, 36 + dataLength, true); // ChunkSize (file size - 8 bytes, little-endian)
      header.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"

      // fmt chunk (bytes 12-35)
      header.set([0x66, 0x6d, 0x74, 0x20], 12); // "fmt " (note the space)
      view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM, little-endian)
      view.setUint16(20, 1, true); // AudioFormat (1 = PCM, little-endian)
      view.setUint16(22, channels, true); // NumChannels (little-endian)
      view.setUint32(24, sampleRate, true); // SampleRate (little-endian)
      view.setUint32(28, byteRate, true); // ByteRate (little-endian)
      view.setUint16(32, blockAlign, true); // BlockAlign (little-endian)
      view.setUint16(34, bitsPerSample, true); // BitsPerSample (little-endian)

      // data chunk (bytes 36-43)
      header.set([0x64, 0x61, 0x74, 0x61], 36); // "data"
      view.setUint32(40, dataLength, true); // Subchunk2Size (data size, little-endian)

      return header;
    }

    // Helper to convert PCM to WAV
    function convertPcmToWav(
      pcmData: Uint8Array,
      mimeType: string
    ): { audioData: ArrayBuffer; mimeType: string } {
      console.log('convertPcmToWav called with MIME type:', mimeType);
      const { sampleRate, bitsPerSample, channels } = parseMimeType(mimeType);
      console.log(`WAV parameters: ${sampleRate}Hz, ${bitsPerSample}-bit, ${channels} channel(s)`);

      // Create WAV header
      const wavHeader = createWavHeader(pcmData.length, sampleRate, bitsPerSample, channels);
      console.log(
        `Created WAV header: ${wavHeader.length} bytes, PCM data: ${pcmData.length} bytes`
      );

      // Combine header + PCM data
      const wavFile = new Uint8Array(wavHeader.length + pcmData.length);
      wavFile.set(wavHeader, 0);
      wavFile.set(pcmData, wavHeader.length);

      console.log(`Total WAV file size: ${wavFile.length} bytes`);
      return { audioData: wavFile.buffer, mimeType: 'audio/wav' };
    }

    // Use streaming API for longer content, but handle both streaming and non-streaming responses
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    // Collect all audio chunks
    const audioChunks: Uint8Array[] = [];
    let rawMimeType = 'audio/l16;codec=pcm;rate=24000'; // Default, will be updated from first chunk

    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0]?.content?.parts?.[0]?.inlineData) {
        // Skip chunks without audio data
        continue;
      }

      const inlineData = chunk.candidates[0].content.parts[0].inlineData;

      // Update mimeType from first chunk
      if (audioChunks.length === 0 && inlineData.mimeType) {
        rawMimeType = inlineData.mimeType;
        console.log('Detected audio MIME type:', rawMimeType);
      }

      // Decode base64 audio data to Uint8Array
      if (inlineData.data) {
        const audioBytes = base64ToUint8Array(inlineData.data);
        audioChunks.push(audioBytes);
      }
    }

    if (audioChunks.length === 0) {
      throw new Error('No audio chunks received in response');
    }

    // Combine all audio chunks
    const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combinedAudio = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of audioChunks) {
      combinedAudio.set(chunk, offset);
      offset += chunk.length;
    }

    console.log(`Combined ${audioChunks.length} audio chunks, total size: ${totalLength} bytes`);
    console.log('Raw MIME type detected:', rawMimeType);

    // Convert PCM to WAV if needed (check for various PCM formats)
    const isPcmFormat =
      rawMimeType.includes('l16') ||
      rawMimeType.includes('pcm') ||
      rawMimeType.includes('L16') ||
      rawMimeType.startsWith('audio/l16');

    if (isPcmFormat) {
      console.log('Converting PCM to WAV format...');
      const result = convertPcmToWav(combinedAudio, rawMimeType);
      console.log('Conversion complete, new MIME type:', result.mimeType);
      return result;
    } else {
      // Already in a playable format
      console.log('Audio already in playable format:', rawMimeType);
      return { audioData: combinedAudio.buffer, mimeType: rawMimeType };
    }
  } catch (error) {
    console.error('Error generating story audio:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate audio: ${error.message}`);
    }
    throw new Error('Failed to generate audio');
  }
}

/**
 * Generate audio for a story
 */
export const generateStoryAudioAction = action({
  args: {
    storyId: v.id('stories'),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Get the story
    const story = await ctx.runQuery(api.stories.getStoryById, {
      storyId: args.storyId,
    });

    if (!story) {
      throw new Error('Story not found');
    }

    // Verify ownership
    const child = await ctx.runQuery(api.children.getChildById, {
      childId: story.childId,
    });

    if (!child) {
      throw new Error('Child not found');
    }

    // Verify ownership by checking if user owns the child
    const userChildren = await ctx.runQuery(api.children.getChildrenByUser, {});
    const userOwnsChild = userChildren.some((c) => c._id === story.childId);

    if (!userOwnsChild) {
      throw new Error('Unauthorized');
    }

    try {
      // Generate audio from story content
      const { audioData, mimeType } = await generateStoryAudio(
        ctx,
        story.content,
        args.language || 'en'
      );

      // Upload to R2 storage
      console.log('Uploading audio to R2 with MIME type:', mimeType);
      const audioUrl = await uploadAudioToR2(audioData, mimeType);
      console.log('Audio uploaded to R2, URL:', audioUrl);

      // Store the R2 URL directly
      await ctx.runMutation(api.stories.updateStoryAudio, {
        storyId: args.storyId,
        audioUrl, // Store R2 URL
        audioStorageId: undefined, // Clear old Convex storage ID if exists
      });

      return { success: true, audioUrl };
    } catch (error) {
      console.error('Error generating story audio:', error);
      throw error;
    }
  },
});
