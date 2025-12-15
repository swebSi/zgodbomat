import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_email', ['email']),

  children: defineTable({
    userId: v.id('users'),
    name: v.string(),
    age: v.number(),
    avatar: v.union(
      v.literal('lion'),
      v.literal('bear'),
      v.literal('bunny'),
      v.literal('owl'),
      v.literal('fox')
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_user_id_created_at', ['userId', 'createdAt']),

  stories: defineTable({
    childId: v.id('children'),
    title: v.string(),
    content: v.string(),
    voiceId: v.optional(v.id('voices')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_child_id', ['childId'])
    .index('by_child_id_created_at', ['childId', 'createdAt']),

  voices: defineTable({
    userId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_user_id_default', ['userId', 'isDefault']),
});
