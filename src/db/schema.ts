import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export interface RecipeIngredient {
  id: string;
  amount: string;
  unit: string;
  item: string;
  notes?: string;
}

/**
 * 1. User Profiles Table
 * Linked 1:1 with Supabase auth.users(id) via foreign key & automatic trigger.
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  displayName: text("display_name").notNull().default("Home Chef"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  themePreference: text("theme_preference").notNull().default("system"),
  defaultViewMode: text("default_view_mode").notNull().default("grid"),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * 2. Recipes Table
 * Stores user-specific recipes including structured ingredients, Markdown instructions,
 * and image URLs for seamless export/import portability.
 */
export const recipes = pgTable("recipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  summary: text("summary"),
  imageUrl: text("image_url"),
  imageStoragePath: text("image_storage_path"),
  prepTimeMinutes: integer("prep_time_minutes").notNull().default(0),
  cookTimeMinutes: integer("cook_time_minutes").notNull().default(0),
  servings: integer("servings").notNull().default(2),
  difficulty: text("difficulty").notNull().default("medium"),
  category: text("category").notNull().default("Main Course"),
  tags: text("tags").array().notNull().default([]),
  ingredients: jsonb("ingredients")
    .$type<RecipeIngredient[]>()
    .notNull()
    .default([]),
  instructionsMarkdown: text("instructions_markdown").notNull(),
  isFavorite: boolean("is_favorite").notNull().default(false),
  importedFromRecipeId: uuid("imported_from_recipe_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * 3. Collections Table
 * Custom user-defined cookbook folders/collections.
 */
export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  iconName: text("icon_name").notNull().default("book-open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * 4. Recipe <-> Collections Join Table
 */
export const recipeCollections = pgTable(
  "recipe_collections",
  {
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.recipeId, table.collectionId] })]
);

/**
 * 5. Shared Recipe Links Table
 * Tokenized read-only recipe share links allowing another user to preview and clone
 * a recipe into their own independent cookbook.
 */
export const sharedRecipeLinks = pgTable("shared_recipe_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  shareToken: text("share_token").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  importCount: integer("import_count").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* Relations */
export const profilesRelations = relations(profiles, ({ many }) => ({
  recipes: many(recipes),
  collections: many(collections),
  sharedLinks: many(sharedRecipeLinks),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  author: one(profiles, {
    fields: [recipes.userId],
    references: [profiles.id],
  }),
  recipeCollections: many(recipeCollections),
  sharedLinks: many(sharedRecipeLinks),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  owner: one(profiles, {
    fields: [collections.userId],
    references: [profiles.id],
  }),
  recipeCollections: many(recipeCollections),
}));

export const recipeCollectionsRelations = relations(
  recipeCollections,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeCollections.recipeId],
      references: [recipes.id],
    }),
    collection: one(collections, {
      fields: [recipeCollections.collectionId],
      references: [collections.id],
    }),
  })
);

export const sharedRecipeLinksRelations = relations(
  sharedRecipeLinks,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [sharedRecipeLinks.recipeId],
      references: [recipes.id],
    }),
    creator: one(profiles, {
      fields: [sharedRecipeLinks.createdBy],
      references: [profiles.id],
    }),
  })
);
