import {
  users,
  contacts,
  groups,
  groupMembers,
  expenses,
  expenseSplits,
  type User,
  type UpsertUser,
  type Contact,
  type Group,
  type GroupMember,
  type Expense,
  type ExpenseSplit,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Contact operations
  getContacts(userId: string): Promise<User[]>;
  addContact(userId: string, contactUserId: string): Promise<Contact>;
  isContact(userId: string, contactUserId: string): Promise<boolean>;

  // Group operations
  getGroups(userId: string): Promise<any[]>;
  getGroup(groupId: string, userId: string): Promise<any>;
  createGroup(name: string, createdBy: string): Promise<Group>;
  addGroupMember(groupId: string, userId: string): Promise<GroupMember>;
  getGroupMembers(groupId: string): Promise<User[]>;
  isGroupMember(groupId: string, userId: string): Promise<boolean>;

  // Expense operations
  addExpense(
    groupId: string,
    title: string,
    amount: string,
    paidBy: string,
    splitWith: string[],
    category?: string
  ): Promise<Expense>;
  getGroupExpenses(groupId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Contact operations
  async getContacts(userId: string): Promise<User[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(contacts)
      .innerJoin(users, eq(contacts.contactUserId, users.id))
      .where(eq(contacts.userId, userId));

    return result;
  }

  async addContact(userId: string, contactUserId: string): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values({ userId, contactUserId })
      .returning();
    return contact;
  }

  async isContact(userId: string, contactUserId: string): Promise<boolean> {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.userId, userId), eq(contacts.contactUserId, contactUserId)));
    return !!contact;
  }

  // Group operations
  async getGroups(userId: string): Promise<any[]> {
    const userGroups = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));

    const groupIds = userGroups.map((g) => g.groupId);

    if (groupIds.length === 0) {
      return [];
    }

    const groupsData = await db
      .select()
      .from(groups)
      .where(sql`${groups.id} IN ${groupIds}`);

    const result = await Promise.all(
      groupsData.map(async (group) => {
        const members = await this.getGroupMembers(group.id);
        const memberCount = members.length;

        const expensesList = await db
          .select()
          .from(expenses)
          .where(eq(expenses.groupId, group.id));

        const totalExpenses = expensesList
          .reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
          .toFixed(2);

        return {
          ...group,
          memberCount,
          totalExpenses,
          members: members.slice(0, 3),
        };
      })
    );

    return result;
  }

  async getGroup(groupId: string, userId: string): Promise<any> {
    const isMember = await this.isGroupMember(groupId, userId);
    if (!isMember) {
      return null;
    }

    const [group] = await db.select().from(groups).where(eq(groups.id, groupId));

    if (!group) {
      return null;
    }

    const members = await this.getGroupMembers(groupId);
    const expensesList = await this.getGroupExpenses(groupId);

    // Calculate balances
    const balanceMap = new Map<string, number>();
    members.forEach((member) => balanceMap.set(member.id, 0));

    expensesList.forEach((expense) => {
      const paidAmount = parseFloat(expense.amount);
      balanceMap.set(expense.paidBy, (balanceMap.get(expense.paidBy) || 0) + paidAmount);

      expense.splits.forEach((split: any) => {
        const splitAmount = parseFloat(split.amount);
        balanceMap.set(split.userId, (balanceMap.get(split.userId) || 0) - splitAmount);
      });
    });

    const balances = Array.from(balanceMap.entries()).map(([userId, balance]) => ({
      userId,
      user: members.find((m) => m.id === userId)!,
      balance,
    }));

    // Calculate settlements (greedy algorithm to minimize transactions)
    const settlements = this.calculateSettlements(balances);

    return {
      ...group,
      members,
      expenses: expensesList,
      balances,
      settlements,
    };
  }

  private calculateSettlements(balances: { userId: string; user: User; balance: number }[]): any[] {
    const debtors = balances.filter((b) => b.balance < 0).map((b) => ({ ...b }));
    const creditors = balances.filter((b) => b.balance > 0).map((b) => ({ ...b }));

    const settlements: any[] = [];

    debtors.sort((a, b) => a.balance - b.balance);
    creditors.sort((a, b) => b.balance - a.balance);

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(-debtor.balance, creditor.balance);

      if (amount > 0.01) {
        settlements.push({
          from: debtor.user,
          to: creditor.user,
          amount: amount.toFixed(2),
        });
      }

      debtor.balance += amount;
      creditor.balance -= amount;

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (Math.abs(creditor.balance) < 0.01) j++;
    }

    return settlements;
  }

  async createGroup(name: string, createdBy: string): Promise<Group> {
    const [group] = await db.insert(groups).values({ name, createdBy }).returning();

    await db.insert(groupMembers).values({ groupId: group.id, userId: createdBy });

    return group;
  }

  async addGroupMember(groupId: string, userId: string): Promise<GroupMember> {
    const [member] = await db
      .insert(groupMembers)
      .values({ groupId, userId })
      .returning();
    return member;
  }

  async getGroupMembers(groupId: string): Promise<User[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId));

    return result;
  }

  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
    return !!member;
  }

  // Expense operations
  async addExpense(
    groupId: string,
    title: string,
    amount: string,
    paidBy: string,
    splitWith: string[],
    category: string = "other"
  ): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values({ groupId, title, amount, paidBy, category })
      .returning();

    const splitAmount = (parseFloat(amount) / splitWith.length).toFixed(2);

    const splits = splitWith.map((userId) => ({
      expenseId: expense.id,
      userId,
      amount: splitAmount,
    }));

    await db.insert(expenseSplits).values(splits);

    return expense;
  }

  async getGroupExpenses(groupId: string): Promise<any[]> {
    const expensesList = await db
      .select()
      .from(expenses)
      .where(eq(expenses.groupId, groupId))
      .orderBy(sql`${expenses.createdAt} DESC`);

    const result = await Promise.all(
      expensesList.map(async (expense) => {
        const [paidByUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, expense.paidBy));

        const splits = await db
          .select({
            id: expenseSplits.id,
            expenseId: expenseSplits.expenseId,
            userId: expenseSplits.userId,
            amount: expenseSplits.amount,
            user: users,
          })
          .from(expenseSplits)
          .innerJoin(users, eq(expenseSplits.userId, users.id))
          .where(eq(expenseSplits.expenseId, expense.id));

        return {
          ...expense,
          paidByUser,
          splits,
        };
      })
    );

    return result;
  }
}

export const storage = new DatabaseStorage();
