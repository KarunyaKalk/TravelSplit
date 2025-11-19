import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, comparePassword, isAuthenticated, getUserById } from "./auth";
import { insertGroupSchema, insertExpenseSchema, registerSchema, loginSchema, users } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error).toString();
        return res.status(400).json({ message: errorMessage });
      }

      const { email, password, firstName, lastName } = validation.data;

      // Check if user exists
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await db.insert(users).values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      }).returning();

      // Set session
      req.session.userId = user[0].id;
      res.json({ id: user[0].id, email: user[0].email, firstName: user[0].firstName, lastName: user[0].lastName });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        const errorMessage = fromZodError(validation.error).toString();
        return res.status(400).json({ message: errorMessage });
      }

      const { email, password } = validation.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Contact routes
  app.get("/api/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const contacts = await storage.getContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { contactUserId } = req.body;

      if (!contactUserId) {
        return res.status(400).json({ message: "Contact user ID is required" });
      }

      if (userId === contactUserId) {
        return res.status(400).json({ message: "Cannot add yourself as a contact" });
      }

      const isAlreadyContact = await storage.isContact(userId, contactUserId);
      if (isAlreadyContact) {
        return res.status(400).json({ message: "Already a contact" });
      }

      const contact = await storage.addContact(userId, contactUserId);
      res.json(contact);
    } catch (error) {
      console.error("Error adding contact:", error);
      res.status(500).json({ message: "Failed to add contact" });
    }
  });

  app.post("/api/contacts/search", isAuthenticated, async (req: any, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      res.json(user || null);
    } catch (error) {
      console.error("Error searching for user:", error);
      res.status(500).json({ message: "Failed to search for user" });
    }
  });

  // Group routes
  app.get("/api/groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const groups = await storage.getGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post("/api/groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const validation = insertGroupSchema.safeParse(req.body);

      if (!validation.success) {
        const errorMessage = fromZodError(validation.error).toString();
        return res.status(400).json({ message: errorMessage });
      }

      const { name } = validation.data;
      const group = await storage.createGroup(name, userId);
      res.json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.get("/api/groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;

      const group = await storage.getGroup(id, userId);

      if (!group) {
        return res.status(404).json({ message: "Group not found or access denied" });
      }

      res.json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.post("/api/groups/:id/members", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const isCurrentUserMember = await storage.isGroupMember(id, currentUserId);
      if (!isCurrentUserMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      const isAlreadyMember = await storage.isGroupMember(id, userId);
      if (isAlreadyMember) {
        return res.status(400).json({ message: "User is already a member" });
      }

      const member = await storage.addGroupMember(id, userId);
      res.json(member);
    } catch (error) {
      console.error("Error adding group member:", error);
      res.status(500).json({ message: "Failed to add group member" });
    }
  });

  // Expense routes
  app.post("/api/groups/:id/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;

      const isMember = await storage.isGroupMember(id, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validation = insertExpenseSchema.safeParse(req.body);

      if (!validation.success) {
        const errorMessage = fromZodError(validation.error).toString();
        return res.status(400).json({ message: errorMessage });
      }

      const { title, amount, paidBy, splitWith, category = "other" } = validation.data;

      const expense = await storage.addExpense(id, title, amount, paidBy, splitWith, category);
      res.json(expense);
    } catch (error) {
      console.error("Error adding expense:", error);
      res.status(500).json({ message: "Failed to add expense" });
    }
  });

  app.patch("/api/groups/:groupId/expenses/:expenseId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { groupId, expenseId } = req.params;

      const isMember = await storage.isGroupMember(groupId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validation = insertExpenseSchema.safeParse(req.body);

      if (!validation.success) {
        const errorMessage = fromZodError(validation.error).toString();
        return res.status(400).json({ message: errorMessage });
      }

      const { title, amount, paidBy, splitWith, category = "other" } = validation.data;

      const expense = await storage.updateExpense(expenseId, title, amount, paidBy, splitWith, category);
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/groups/:groupId/expenses/:expenseId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { groupId, expenseId } = req.params;

      const isMember = await storage.isGroupMember(groupId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteExpense(expenseId);
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
