import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Create a new child for the authenticated user
 */
export const createChild = mutation({
  args: {
    name: v.string(),
    age: v.number(),
    avatar: v.union(
      v.literal('lion'),
      v.literal('bear'),
      v.literal('bunny'),
      v.literal('owl'),
      v.literal('fox')
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Find or create user record
    let user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    let userId;
    if (!user) {
      // Create user record if it doesn't exist
      const now = Date.now();
      userId = await ctx.db.insert('users', {
        clerkId: identity.subject,
        email: identity.email ?? '',
        firstName: identity.givenName ?? undefined,
        lastName: identity.familyName ?? undefined,
        imageUrl: identity.pictureUrl ?? undefined,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      userId = user._id;
    }

    // Create child record
    const now = Date.now();
    const childId = await ctx.db.insert('children', {
      userId,
      name: args.name.trim(),
      age: args.age,
      avatar: args.avatar,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(childId);
  },
});

/**
 * Get all children for the authenticated user
 */
export const getChildrenByUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return [];
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query('children')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();
  },
});

/**
 * Get a specific child by ID
 */
export const getChildById = query({
  args: {
    childId: v.id('children'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const child = await ctx.db.get(args.childId);
    if (!child) {
      return null;
    }

    // Verify the child belongs to the authenticated user
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!user || child.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    return child;
  },
});

/**
 * Update an existing child for the authenticated user
 */
export const updateChild = mutation({
  args: {
    childId: v.id('children'),
    name: v.string(),
    age: v.number(),
    avatar: v.union(
      v.literal('lion'),
      v.literal('bear'),
      v.literal('bunny'),
      v.literal('owl'),
      v.literal('fox')
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Verify the child belongs to the authenticated user
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const child = await ctx.db.get(args.childId);
    if (!child) {
      throw new Error('Child not found');
    }

    if (child.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    // Update child record
    await ctx.db.patch(args.childId, {
      name: args.name.trim(),
      age: args.age,
      avatar: args.avatar,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.childId);
  },
});
