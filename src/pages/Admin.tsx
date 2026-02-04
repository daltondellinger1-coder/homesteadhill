import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Webhook, Calendar, Shield, Copy, RefreshCw, CheckCircle, XCircle } from "lucide-react";

const Admin = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
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
    setSyncResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-calendar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ""}`,
        },
        body: JSON.stringify({ action: "sync-all" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sync failed");
      }

      const successCount = data.synced?.filter((r: { success: boolean }) => r.success).length || 0;
      const failCount = data.synced?.filter((r: { success: boolean }) => !r.success).length || 0;

      setSyncResult({
        success: true,
        message: `Synced ${successCount} calendar(s)${failCount > 0 ? `, ${failCount} failed` : ""}`,
      });

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${successCount} calendar(s)`,
      });
    } catch (error) {
      console.error("Sync error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setSyncResult({
        success: false,
        message: errorMessage,
      });
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const syncEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-calendar`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>

        <div className="space-y-6">
          {/* Security Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Shield className="h-5 w-5" />
                Security Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-700">
              <p>
                Calendar sync operations require the <strong>service role key</strong> for authentication. 
                This key should never be exposed in client-side code. Use Zapier or another secure 
                backend service to automate calendar syncing.
              </p>
            </CardContent>
          </Card>

          {/* Manual Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Manual Calendar Sync
              </CardTitle>
              <CardDescription>
                Manually trigger a sync of all unit calendars from their iCal sources.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleManualSync} 
                  disabled={isSyncing}
                  size="lg"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Sync All Calendars
                    </>
                  )}
                </Button>
                
                {syncResult && (
                  <div className={`flex items-center gap-2 text-sm ${syncResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {syncResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {syncResult.message}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                This will fetch the latest availability from Airbnb and other connected calendars for all units.
              </p>
            </CardContent>
          </Card>

          {/* Calendar Sync Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar Sync Endpoint
              </CardTitle>
              <CardDescription>
                Use this endpoint with your service role key to sync unit calendars via automation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Endpoint URL:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-background p-2 rounded flex-1 break-all">
                      {syncEndpoint}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(syncEndpoint, "Endpoint URL")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Method:</p>
                  <code className="text-xs bg-background p-2 rounded block">POST</code>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Required Headers:</p>
                  <code className="text-xs bg-background p-2 rounded block">
                    Authorization: Bearer {"<SERVICE_ROLE_KEY>"}
                  </code>
                  <code className="text-xs bg-background p-2 rounded block mt-1">
                    Content-Type: application/json
                  </code>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Request Body:</p>
                  <code className="text-xs bg-background p-2 rounded block whitespace-pre">
{`{
  "action": "sync-all"
}`}
                  </code>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The service role key can be found in your backend settings. 
                  Never expose this key in client-side code or public repositories.
                </p>
              </div>
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
                that calls your sync endpoint with the service role key.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <p><strong>5.</strong> Add Authorization header with your <strong>service role key</strong> (not anon key)</p>
              <p><strong>6.</strong> Set Content-Type header to: application/json</p>
              <p><strong>7.</strong> Set the payload type to JSON and body to: {`{"action": "sync-all"}`}</p>
              <p><strong>8.</strong> Turn on your Zap!</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
