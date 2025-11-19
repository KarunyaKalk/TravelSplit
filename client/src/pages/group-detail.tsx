import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema, type User as DbUser, type Expense, type ExpenseSplit } from "@shared/schema";

type User = DbUser;
import { ArrowLeft, Plus, Wallet, TrendingUp, TrendingDown, UserPlus, Receipt } from "lucide-react";
import { Link, useParams } from "wouter";
import type { z } from "zod";

type ExpenseWithDetails = Expense & {
  paidByUser: User;
  splits: (ExpenseSplit & { user: User })[];
};

type GroupDetails = {
  id: string;
  name: string;
  members: User[];
  expenses: ExpenseWithDetails[];
  balances: {
    userId: string;
    user: User;
    balance: number;
  }[];
  settlements: {
    from: User;
    to: User;
    amount: string;
  }[];
};

export default function GroupDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const user = authUser as User | undefined;
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: group, isLoading: groupLoading } = useQuery<GroupDetails>({
    queryKey: ["/api/groups", id],
    enabled: isAuthenticated && !!id,
  });

  const { data: contacts } = useQuery<User[]>({
    queryKey: ["/api/contacts"],
    enabled: isAuthenticated,
  });

  const expenseForm = useForm<z.infer<typeof insertExpenseSchema>>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      title: "",
      amount: "",
      paidBy: user?.id || "",
      splitWith: [],
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertExpenseSchema>) => {
      await apiRequest("POST", `/api/groups/${id}/expenses`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Success!",
        description: "Expense added successfully",
      });
      setAddExpenseOpen(false);
      expenseForm.reset();
      setSelectedMembers([]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/groups/${id}/members`, { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Success!",
        description: "Member added successfully",
      });
      setAddMemberOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    },
  });

  const getInitials = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "U";
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleExpenseSubmit = (data: z.infer<typeof insertExpenseSchema>) => {
    const formData = {
      ...data,
      splitWith: selectedMembers,
    };
    addExpenseMutation.mutate(formData);
  };

  const availableContactsToAdd = contacts?.filter(
    (contact) => !group?.members.some((member) => member.id === contact.id)
  );

  if (authLoading || groupLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="w-32 h-32 rounded-xl" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Group not found</h2>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalExpenses = group.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const myBalance = group.balances.find((b) => b.userId === user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>

          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-3xl font-display" data-testid="text-group-name">{group.name}</CardTitle>
              <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="rounded-full" data-testid="button-add-member">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-add-member">
                  <DialogHeader>
                    <DialogTitle>Add Member to Group</DialogTitle>
                    <DialogDescription>
                      Select a contact to add to this group
                    </DialogDescription>
                  </DialogHeader>
                  {availableContactsToAdd && availableContactsToAdd.length > 0 ? (
                    <div className="space-y-2">
                      {availableContactsToAdd.map((contact) => (
                        <Card
                          key={contact.id}
                          className="hover-elevate cursor-pointer"
                          onClick={() => addMemberMutation.mutate(contact.id)}
                          data-testid={`card-contact-${contact.id}`}
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={contact.profileImageUrl || undefined} />
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {getInitials(contact.firstName, contact.lastName, contact.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {contact.firstName && contact.lastName
                                  ? `${contact.firstName} ${contact.lastName}`
                                  : contact.email}
                              </p>
                              {contact.email && (contact.firstName || contact.lastName) && (
                                <p className="text-sm text-muted-foreground">{contact.email}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No contacts available to add</p>
                      <Link href="/contacts">
                        <Button size="sm">Add Contacts</Button>
                      </Link>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex -space-x-2">
                  {group.members.map((member) => (
                    <Avatar key={member.id} className="w-10 h-10 border-2 border-card" data-testid={`avatar-member-${member.id}`}>
                      <AvatarImage src={member.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {getInitials(member.firstName, member.lastName, member.email)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground" data-testid="text-member-count">
                  {group.members.length} {group.members.length === 1 ? "member" : "members"}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                  <p className="text-4xl font-bold text-primary" data-testid="text-total-expenses">
                    ₹{totalExpenses.toFixed(2)}
                  </p>
                </div>
                {myBalance && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
                    <div className="flex items-center gap-2">
                      {myBalance.balance > 0 ? (
                        <>
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <p className="text-4xl font-bold text-green-600" data-testid="text-my-balance">
                            +₹{myBalance.balance.toFixed(2)}
                          </p>
                        </>
                      ) : myBalance.balance < 0 ? (
                        <>
                          <TrendingDown className="w-5 h-5 text-destructive" />
                          <p className="text-4xl font-bold text-destructive" data-testid="text-my-balance">
                            ₹{myBalance.balance.toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="text-4xl font-bold text-muted-foreground" data-testid="text-my-balance">₹0.00</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Expenses</h3>
              <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full" data-testid="button-add-expense">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" data-testid="dialog-add-expense">
                  <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                    <DialogDescription>
                      Track a new expense and split it with group members
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...expenseForm}>
                    <form onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)} className="space-y-4">
                      <FormField
                        control={expenseForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expense Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Dinner at Beach Restaurant" {...field} data-testid="input-expense-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={expenseForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="2500.00"
                                {...field}
                                data-testid="input-expense-amount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={expenseForm.control}
                        name="paidBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Paid By</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-paid-by">
                                  <SelectValue placeholder="Select who paid" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {group.members.map((member) => (
                                  <SelectItem key={member.id} value={member.id} data-testid={`option-paidby-${member.id}`}>
                                    {member.firstName && member.lastName
                                      ? `${member.firstName} ${member.lastName}`
                                      : member.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <FormLabel>Split With</FormLabel>
                        <div className="space-y-2 mt-2">
                          {group.members.map((member) => (
                            <div key={member.id} className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedMembers.includes(member.id)}
                                onCheckedChange={() => handleMemberToggle(member.id)}
                                data-testid={`checkbox-split-${member.id}`}
                              />
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={member.profileImageUrl || undefined} />
                                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                    {getInitials(member.firstName, member.lastName, member.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {member.firstName && member.lastName
                                    ? `${member.firstName} ${member.lastName}`
                                    : member.email}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedMembers.length === 0 && (
                          <p className="text-sm text-destructive mt-2">Select at least one person</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full rounded-full"
                        disabled={addExpenseMutation.isPending || selectedMembers.length === 0}
                        data-testid="button-add-expense-submit"
                      >
                        {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {group.expenses.length > 0 ? (
              <div className="space-y-3">
                {group.expenses.map((expense) => (
                  <Card key={expense.id} className="hover-elevate" data-testid={`card-expense-${expense.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Receipt className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1" data-testid={`text-expense-title-${expense.id}`}>
                              {expense.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Paid by{" "}
                              <span className="font-medium text-foreground">
                                {expense.paidByUser.firstName && expense.paidByUser.lastName
                                  ? `${expense.paidByUser.firstName} ${expense.paidByUser.lastName}`
                                  : expense.paidByUser.email}
                              </span>
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {expense.splits.map((split) => (
                                <Badge key={split.id} variant="secondary" className="text-xs">
                                  {split.user.firstName && split.user.lastName
                                    ? `${split.user.firstName} ${split.user.lastName}`
                                    : split.user.email}
                                  : ₹{parseFloat(split.amount).toFixed(2)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary" data-testid={`text-expense-amount-${expense.id}`}>
                            ₹{parseFloat(expense.amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
                  <p className="text-muted-foreground mb-4">Start tracking by adding your first expense</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Settlements</h3>
            {group.settlements.length > 0 ? (
              <div className="space-y-3">
                {group.settlements.map((settlement, idx) => (
                  <Card key={idx} data-testid={`card-settlement-${idx}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={settlement.from.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-destructive/20 text-destructive text-xs">
                            {getInitials(settlement.from.firstName, settlement.from.lastName, settlement.from.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {settlement.from.firstName && settlement.from.lastName
                            ? `${settlement.from.firstName} ${settlement.from.lastName}`
                            : settlement.from.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px bg-border flex-1" />
                        <span className="text-xs text-muted-foreground">owes</span>
                        <div className="h-px bg-border flex-1" />
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={settlement.to.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                            {getInitials(settlement.to.firstName, settlement.to.lastName, settlement.to.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {settlement.to.firstName && settlement.to.lastName
                            ? `${settlement.to.firstName} ${settlement.to.lastName}`
                            : settlement.to.email}
                        </span>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-primary" data-testid={`text-settlement-amount-${idx}`}>
                          ₹{settlement.amount}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">All settled up!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
