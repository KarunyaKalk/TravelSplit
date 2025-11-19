import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
import { Link, useParams } from "wouter";
import type { User as DbUser } from "@shared/schema";

type User = DbUser;

type GroupDetails = {
  id: string;
  name: string;
  members: User[];
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

export default function Balances() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const user = authUser as User | undefined;

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

  const getInitials = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "U";
  };

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
            <Button data-testid="button-go-home">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const myBalance = group.balances.find((b) => b.userId === user?.id);
  const youOwe = group.settlements.filter((s) => s.from.id === user?.id);
  const youGet = group.settlements.filter((s) => s.to.id === user?.id);
  const otherSettlements = group.settlements.filter(
    (s) => s.from.id !== user?.id && s.to.id !== user?.id
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Link href={`/groups/${id}`}>
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-to-group">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Group
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2" data-testid="text-page-title">
            Balance Summary
          </h1>
          <p className="text-muted-foreground" data-testid="text-group-name">{group.name}</p>
        </div>

        {myBalance && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {myBalance.balance > 0 ? (
                  <>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-4xl font-bold text-green-600" data-testid="text-your-balance">
                        +₹{myBalance.balance.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">You are owed</p>
                    </div>
                  </>
                ) : myBalance.balance < 0 ? (
                  <>
                    <TrendingDown className="w-8 h-8 text-destructive" />
                    <div>
                      <p className="text-4xl font-bold text-destructive" data-testid="text-your-balance">
                        ₹{myBalance.balance.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">You owe</p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-4xl font-bold text-muted-foreground" data-testid="text-your-balance">
                        ₹0.00
                      </p>
                      <p className="text-sm text-muted-foreground">All settled up!</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {youOwe.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-destructive" data-testid="heading-you-owe">
              You Owe
            </h2>
            <div className="space-y-3">
              {youOwe.map((settlement, idx) => (
                <Card key={idx} className="border-destructive/20" data-testid={`card-you-owe-${idx}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={settlement.to.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {getInitials(settlement.to.firstName, settlement.to.lastName, settlement.to.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold" data-testid={`text-owe-to-name-${idx}`}>
                            {settlement.to.firstName && settlement.to.lastName
                              ? `${settlement.to.firstName} ${settlement.to.lastName}`
                              : settlement.to.email}
                          </p>
                          <p className="text-sm text-muted-foreground">Pay this person</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-destructive" />
                        <p className="text-3xl font-bold text-destructive" data-testid={`text-owe-amount-${idx}`}>
                          ₹{settlement.amount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {youGet.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-green-600" data-testid="heading-you-get">
              You Get Back
            </h2>
            <div className="space-y-3">
              {youGet.map((settlement, idx) => (
                <Card key={idx} className="border-green-600/20" data-testid={`card-you-get-${idx}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={settlement.from.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-destructive/20 text-destructive">
                            {getInitials(settlement.from.firstName, settlement.from.lastName, settlement.from.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold" data-testid={`text-get-from-name-${idx}`}>
                            {settlement.from.firstName && settlement.from.lastName
                              ? `${settlement.from.firstName} ${settlement.from.lastName}`
                              : settlement.from.email}
                          </p>
                          <p className="text-sm text-muted-foreground">Owes you</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-green-600" />
                        <p className="text-3xl font-bold text-green-600" data-testid={`text-get-amount-${idx}`}>
                          +₹{settlement.amount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {otherSettlements.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4" data-testid="heading-other-settlements">
              Other Settlements
            </h2>
            <div className="space-y-3">
              {otherSettlements.map((settlement, idx) => (
                <Card key={idx} data-testid={`card-other-settlement-${idx}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={settlement.from.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary text-sm">
                            {getInitials(settlement.from.firstName, settlement.from.lastName, settlement.from.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium" data-testid={`text-other-from-name-${idx}`}>
                          {settlement.from.firstName && settlement.from.lastName
                            ? `${settlement.from.firstName} ${settlement.from.lastName}`
                            : settlement.from.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        <p className="text-xl font-bold text-primary" data-testid={`text-other-amount-${idx}`}>
                          ₹{settlement.amount}
                        </p>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={settlement.to.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary text-sm">
                            {getInitials(settlement.to.firstName, settlement.to.lastName, settlement.to.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium" data-testid={`text-other-to-name-${idx}`}>
                          {settlement.to.firstName && settlement.to.lastName
                            ? `${settlement.to.firstName} ${settlement.to.lastName}`
                            : settlement.to.email}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {group.settlements.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">All Settled Up!</h3>
              <p className="text-muted-foreground">Everyone in the group is square</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
