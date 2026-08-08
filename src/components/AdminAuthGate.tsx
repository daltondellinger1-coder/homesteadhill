import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, LogOut } from "lucide-react";

interface AdminAuthGateProps {
  children: React.ReactNode;
}

/**
 * Wraps the admin UI with a Supabase email + password sign-in form.
 * Only signed-in users whose email is on the `admin_allowlist`
 * table see the children.
 */
export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const { loading, session, isAllowed, email } = useAdminAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: formEmail.trim(),
      password: formPassword,
    });
    setSigningIn(false);
    if (error) {
      toast({
        title: "Sign-in failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
      return;
    }
    setFormPassword("");
  };

  const handleMagicLink = async () => {
    const target = formEmail.trim();
    if (!target) {
      toast({
        title: "Email required",
        description: "Enter your email to receive a sign-in link.",
        variant: "destructive",
      });
      return;
    }
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: target,
      options: {
        emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    });
    setSigningIn(false);
    if (error) {
      toast({
        title: "Could not send link",
        description: "Please try again or use your password.",
        variant: "destructive",
      });
      return;
    }
    setMagicSent(true);
    toast({
      title: "Check your email",
      description: `A sign-in link was sent to ${target}.`,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-md">
          <p className="text-muted-foreground text-center">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Signed in but not on the allowlist.
  if (session && !isAllowed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access denied
              </CardTitle>
              <CardDescription>
                {email} is not authorized to view this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Not signed in — show the login form.
  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin sign-in
              </CardTitle>
              <CardDescription>
                Authorized administrators only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={signingIn} className="w-full">
                  {signingIn ? "Signing in…" : "Sign in"}
                </Button>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={signingIn || magicSent}
                  className="w-full"
                  onClick={handleMagicLink}
                >
                  {magicSent ? "Sign-in link sent" : "Email me a sign-in link"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Signed in and allowed.
  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-50">
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
      {children}
    </div>
  );
}