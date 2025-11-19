import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Palmtree, Users, Wallet, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl">
              <Palmtree className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-display font-bold text-primary">Money Splitter</h1>
          </div>
          <Button
            onClick={() => window.location.href = "/api/login"}
            size="lg"
            className="rounded-full"
            data-testid="button-login"
          >
            Get Started
          </Button>
        </header>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-foreground mb-6">
              Split Bills with <span className="text-primary">Vacation Vibes</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              The easiest way to track shared expenses with friends and settle up after your adventures. No more awkward money conversations!
            </p>
            <Button
              onClick={() => window.location.href = "/api/login"}
              size="lg"
              className="rounded-full px-8 text-lg h-12"
              data-testid="button-get-started"
            >
              Start Splitting
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Groups</h3>
                <p className="text-muted-foreground">
                  Organize expenses by trip, vacation, or event. Add friends and start tracking together.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="bg-accent/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Expenses</h3>
                <p className="text-muted-foreground">
                  Add expenses on the go. Split equally or customize who owes what.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="bg-chart-1/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-chart-1" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Settle Up</h3>
                <p className="text-muted-foreground">
                  See who owes what at a glance. Get clear settlement instructions instantly.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-display font-bold mb-3">Ready to simplify your group expenses?</h3>
              <p className="text-muted-foreground mb-6">Join thousands of groups tracking expenses the easy way</p>
              <Button
                onClick={() => window.location.href = "/api/login"}
                variant="default"
                size="lg"
                className="rounded-full"
                data-testid="button-join-now"
              >
                Join Now - It's Free!
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
