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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGroupSchema, type Group, type User as DbUser } from "@shared/schema";

type User = DbUser;
import { Plus, Users, LogOut, UserPlus, Palmtree } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import type { z } from "zod";

type GroupWithDetails = Group & {
  memberCount: number;
  totalExpenses: string;
  members: User[];
};

export default function Home() {
  const { toast } = useToast();
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const user = authUser as User | undefined;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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

  const { data: groups, isLoading: groupsLoading } = useQuery<GroupWithDetails[]>({
    queryKey: ["/api/groups"],
    enabled: isAuthenticated,
  });

  const form = useForm<z.infer<typeof insertGroupSchema>>({
    resolver: zodResolver(insertGroupSchema),
    defaultValues: {
      name: "",
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertGroupSchema>) => {
      await apiRequest("POST", "/api/groups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Success!",
        description: "Group created successfully",
      });
      setCreateDialogOpen(false);
      form.reset();
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
        description: "Failed to create group",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
          <Skeleton className="w-32 h-6 mx-auto" />
        </div>
      </div>
    );
  }

  const getInitials = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "U";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl">
              <Palmtree className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-display font-bold text-primary">Money Splitter</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/contacts">
              <Button variant="outline" size="icon" className="rounded-full" data-testid="button-contacts">
                <UserPlus className="w-4 h-4" />
              </Button>
            </Link>
            <Avatar data-testid="avatar-user">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user?.firstName, user?.lastName, user?.email)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={async () => {
                await apiRequest("POST", "/api/auth/logout", {});
                queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
                window.location.href = "/";
              }}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold mb-2" data-testid="text-welcome">
            Welcome back, {user?.firstName || user?.email?.split("@")[0] || "Friend"}!
          </h2>
          <p className="text-muted-foreground">Manage your groups and track expenses</p>
        </div>

        {groupsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="w-32 h-6" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="w-full h-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card className="hover-elevate cursor-pointer" data-testid={`card-group-${group.id}`}>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-xl font-semibold" data-testid={`text-group-name-${group.id}`}>
                      {group.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {group.members.slice(0, 3).map((member) => (
                          <Avatar key={member.id} className="w-8 h-8 border-2 border-card">
                            <AvatarImage src={member.profileImageUrl || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                              {getInitials(member.firstName, member.lastName, member.email)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {group.memberCount > 3 && (
                          <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">
                            +{group.memberCount - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground" data-testid={`text-member-count-${group.id}`}>
                        {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-primary" data-testid={`text-total-expenses-${group.id}`}>
                        ₹{group.totalExpenses}
                      </span>
                      <span className="text-sm text-muted-foreground">total</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Card className="hover-elevate cursor-pointer border-dashed border-2 flex items-center justify-center min-h-[200px]" data-testid="card-create-group">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">Create New Group</h3>
                    <p className="text-sm text-muted-foreground">Start tracking expenses</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent data-testid="dialog-create-group">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Give your group a name to start tracking expenses together
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createGroupMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Beach Trip 2024" {...field} data-testid="input-group-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full rounded-full" disabled={createGroupMutation.isPending} data-testid="button-create-group-submit">
                      {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">No groups yet</h3>
            <p className="text-muted-foreground mb-6">Create your first group to start tracking expenses</p>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-full" data-testid="button-create-first-group">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Group
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-create-first-group">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Give your group a name to start tracking expenses together
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createGroupMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Beach Trip 2024" {...field} data-testid="input-first-group-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full rounded-full" disabled={createGroupMutation.isPending} data-testid="button-create-first-group-submit">
                      {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
