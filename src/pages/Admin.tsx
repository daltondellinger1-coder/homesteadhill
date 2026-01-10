import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RefreshCw, Webhook, Calendar } from "lucide-react";

const Admin = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleTestWebhook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Testing Zapier webhook:", webhookUrl);

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          action: "sync-calendars",
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });

      toast({
        title: "Request Sent",
        description: "The webhook was triggered. Check your Zap's history to confirm it worked.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-calendar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "sync-all" }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${data.synced?.length || 0} calendars.`,
        });
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (error) {
      console.error("Error syncing calendars:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync calendars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>

        <div className="space-y-6">
          {/* Manual Sync Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Manual Calendar Sync
              </CardTitle>
              <CardDescription>
                Sync all unit calendars with their Airbnb iCal feeds right now.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleManualSync} disabled={isSyncing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync All Calendars"}
              </Button>
            </CardContent>
          </Card>

          {/* Zapier Webhook Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Zapier Automation
              </CardTitle>
              <CardDescription>
                Set up automatic calendar syncing using Zapier. Create a Zap with a Schedule trigger
                that calls your sync endpoint.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Your Sync Endpoint:</p>
                <code className="text-xs bg-background p-2 rounded block break-all">
                  {import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-calendar
                </code>
                <p className="text-xs text-muted-foreground">
                  POST with body: {`{"action": "sync-all"}`}
                </p>
              </div>

              <div className="border-t pt-4">
                <form onSubmit={handleTestWebhook} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook">Zapier Webhook URL (for testing)</Label>
                    <Input
                      id="webhook"
                      type="url"
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your Zapier webhook URL to test the connection from this page.
                    </p>
                  </div>
                  <Button type="submit" variant="outline" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Test Webhook"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><strong>1.</strong> Create a new Zap in Zapier</p>
              <p><strong>2.</strong> Add a "Schedule by Zapier" trigger (daily or weekly)</p>
              <p><strong>3.</strong> Add a "Webhooks by Zapier" action (POST request)</p>
              <p><strong>4.</strong> Set the URL to your sync endpoint shown above</p>
              <p><strong>5.</strong> Set the payload type to JSON and body to: {`{"action": "sync-all"}`}</p>
              <p><strong>6.</strong> Turn on your Zap!</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
