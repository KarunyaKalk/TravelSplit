import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, jsonb, index, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contacts table - users can add other users as contacts
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contactUserId: varchar("contact_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Groups table
export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Group members table
export const groupMembers = pgTable("group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidBy: varchar("paid_by").notNull().references(() => users.id),
  category: varchar("category", { length: 50 }).notNull().default("other"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Expense splits table - tracks who owes what for each expense
export const expenseSplits = pgTable("expense_splits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expenseId: varchar("expense_id").notNull().references(() => expenses.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  contacts: many(contacts, { relationName: "userContacts" }),
  contactOf: many(contacts, { relationName: "contactUser" }),
  createdGroups: many(groups),
  groupMemberships: many(groupMembers),
  paidExpenses: many(expenses),
  expenseSplits: many(expenseSplits),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
    relationName: "userContacts",
  }),
  contactUser: one(users, {
    fields: [contacts.contactUserId],
    references: [users.id],
    relationName: "contactUser",
  }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
  members: many(groupMembers),
  expenses: many(expenses),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  group: one(groups, {
    fields: [expenses.groupId],
    references: [groups.id],
  }),
  paidByUser: one(users, {
    fields: [expenses.paidBy],
    references: [users.id],
  }),
  splits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
  user: one(users, {
    fields: [expenseSplits.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const upsertUserSchema = createInsertSchema(users);
export const insertContactSchema = createInsertSchema(contacts).pick({
  contactUserId: true,
});
export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
});
export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  userId: true,
});
export const insertExpenseSchema = createInsertSchema(expenses).pick({
  title: true,
  amount: true,
  paidBy: true,
  category: true,
}).extend({
  splitWith: z.array(z.string()).min(1, "Must split with at least one person"),
  category: z.enum(["food", "transport", "accommodation", "entertainment", "other"]).default("other"),
});

export const updateExpenseSchema = insertExpenseSchema;

// TypeScript types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
export type ExpenseSplit = typeof expenseSplits.$inferSelect;
