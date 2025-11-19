import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, UserPlus, Users } from "lucide-react";
import { Link } from "wouter";
import type { User as DbUser } from "@shared/schema";

type User = DbUser;

export default function Contacts() {
  const { toast } = useToast();
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const user = authUser as User | undefined;
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);

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

  const { data: contacts, isLoading: contactsLoading } = useQuery<User[]>({
    queryKey: ["/api/contacts"],
    enabled: isAuthenticated,
  });

  const searchMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/contacts/search", { email }) as unknown as User | null;
      return response;
    },
    onSuccess: (data: User | null) => {
      setSearchResult(data);
      setSearching(false);
      if (!data) {
        toast({
          title: "Not found",
          description: "No user found with that email",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      setSearching(false);
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
        description: "Failed to search for user",
        variant: "destructive",
      });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async (contactUserId: string) => {
      await apiRequest("POST", "/api/contacts", { contactUserId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success!",
        description: "Contact added successfully",
      });
      setSearchResult(null);
      setSearchEmail("");
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
        description: "Failed to add contact",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchEmail.trim()) {
      setSearching(true);
      searchMutation.mutate(searchEmail.trim());
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "U";
  };

  const isAlreadyContact = (userId: string) => {
    return contacts?.some((contact) => contact.id === userId);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="w-32 h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Contacts</h1>
          <p className="text-muted-foreground">Add friends to split expenses with</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Add New Contact</h3>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Search by email address"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-email"
                />
              </div>
              <Button type="submit" disabled={searching || !searchEmail.trim()} data-testid="button-search">
                {searching ? "Searching..." : "Search"}
              </Button>
            </form>

            {searchResult && (
              <Card className="mt-4">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={searchResult.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {getInitials(searchResult.firstName, searchResult.lastName, searchResult.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium" data-testid="text-search-result-name">
                        {searchResult.firstName && searchResult.lastName
                          ? `${searchResult.firstName} ${searchResult.lastName}`
                          : searchResult.email}
                      </p>
                      {searchResult.email && (searchResult.firstName || searchResult.lastName) && (
                        <p className="text-sm text-muted-foreground" data-testid="text-search-result-email">
                          {searchResult.email}
                        </p>
                      )}
                    </div>
                  </div>
                  {isAlreadyContact(searchResult.id) ? (
                    <Button variant="secondary" disabled>
                      Already Added
                    </Button>
                  ) : searchResult.id === user?.id ? (
                    <Button variant="secondary" disabled>
                      That's You!
                    </Button>
                  ) : (
                    <Button
                      onClick={() => addContactMutation.mutate(searchResult.id)}
                      disabled={addContactMutation.isPending}
                      data-testid="button-add-contact"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {addContactMutation.isPending ? "Adding..." : "Add Contact"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <div>
          <h3 className="font-semibold mb-4">Your Contacts ({contacts?.length || 0})</h3>
          {contactsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="w-full h-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : contacts && contacts.length > 0 ? (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <Card key={contact.id} className="hover-elevate" data-testid={`card-contact-${contact.id}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={contact.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {getInitials(contact.firstName, contact.lastName, contact.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium" data-testid={`text-contact-name-${contact.id}`}>
                        {contact.firstName && contact.lastName
                          ? `${contact.firstName} ${contact.lastName}`
                          : contact.email}
                      </p>
                      {contact.email && (contact.firstName || contact.lastName) && (
                        <p className="text-sm text-muted-foreground" data-testid={`text-contact-email-${contact.id}`}>
                          {contact.email}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
                <p className="text-muted-foreground">Search for friends by email to add them</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
