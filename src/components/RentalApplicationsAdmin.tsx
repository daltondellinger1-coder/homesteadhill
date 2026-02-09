import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, CheckCircle, XCircle, Clock, RefreshCw, ChevronDown, ChevronUp,
  User, Mail, Phone, MapPin, Briefcase, Calendar,
} from "lucide-react";

interface RentalApplication {
  id: string;
  created_at: string;
  first_name: string;
  middle_initial: string | null;
  last_name: string;
  email: string;
  phone_number: string;
  unit_id: string;
  check_in: string;
  check_out: string;
  nights: number;
  status: string;
  booking_name: string;
  current_address: string | null;
  current_city_state_zip: string | null;
  current_employer: string | null;
  employer_position: string | null;
  gross_wages: string | null;
  pets: string | null;
  evictions_count: string | null;
  felonies_count: string | null;
  vehicles_count: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  emergency_relationship: string | null;
  why_rent_to_you: string | null;
  additional_info: string | null;
  applicant_signature: string;
  signature_date: string;
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800 border-amber-300", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle },
  denied: { label: "Denied", color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
};

type StatusFilter = "all" | "pending" | "approved" | "denied";

export function RentalApplicationsAdmin() {
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-rental-applications", {
        body: { action: "list", status: filter },
      });

      if (error) throw error;
      setApplications(data.applications || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast({ title: "Error", description: "Failed to load applications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const updateStatus = async (id: string, status: "approved" | "denied") => {
    setUpdatingId(id);
    try {
      const { data, error } = await supabase.functions.invoke("manage-rental-applications", {
        body: { action: "update-status", id, status },
      });

      if (error) throw error;
      toast({
        title: `Application ${status === "approved" ? "Approved" : "Denied"}`,
        description: `The applicant will be notified via email.`,
      });

      // Update local state
      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, status } : app))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      toast({ title: "Error", description: "Failed to update application status", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filters: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: applications.length },
    { value: "pending", label: "Pending", count: applications.filter(a => a.status === "pending").length },
    { value: "approved", label: "Approved", count: applications.filter(a => a.status === "approved").length },
    { value: "denied", label: "Denied", count: applications.filter(a => a.status === "denied").length },
  ];

  // When filter is "all", count from full list; otherwise use fetched list length
  const filteredApps = filter === "all" ? applications : applications.filter(a => a.status === filter);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rental Applications
            </CardTitle>
            <CardDescription className="mt-1">
              Review and manage rental applications from 30+ night stay requests.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchApplications} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {filters.map(f => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              {!loading && (
                <span className="ml-1.5 text-xs opacity-70">({f.count})</span>
              )}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Loading applications...
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No {filter !== "all" ? filter : ""} applications found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map(app => {
              const config = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = config.icon;
              const isExpanded = expandedId === app.id;

              return (
                <div key={app.id} className="border border-border rounded-xl overflow-hidden">
                  {/* Summary Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 flex-wrap min-w-0">
                      <Badge variant="outline" className={`${config.color} flex items-center gap-1 shrink-0`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                      <span className="font-medium text-foreground truncate">
                        {app.first_name} {app.last_name}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {app.unit_id} · {app.nights} nights
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30 p-5 space-y-6">
                      {/* Contact & Booking Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" /> Contact Info
                          </h4>
                          <div className="space-y-2 text-sm">
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" /> {app.email}
                            </p>
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" /> {app.phone_number}
                            </p>
                            {app.current_address && (
                              <p className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" /> {app.current_address}
                                {app.current_city_state_zip && `, ${app.current_city_state_zip}`}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" /> Booking Details
                          </h4>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p><strong className="text-foreground">Unit:</strong> {app.unit_id}</p>
                            <p><strong className="text-foreground">Check-in:</strong> {app.check_in}</p>
                            <p><strong className="text-foreground">Check-out:</strong> {app.check_out}</p>
                            <p><strong className="text-foreground">Duration:</strong> {app.nights} nights</p>
                          </div>
                        </div>
                      </div>

                      {/* Employment */}
                      {app.current_employer && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" /> Employment
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                            <p><strong className="text-foreground">Employer:</strong> {app.current_employer}</p>
                            {app.employer_position && <p><strong className="text-foreground">Position:</strong> {app.employer_position}</p>}
                            {app.gross_wages && <p><strong className="text-foreground">Gross Wages:</strong> {app.gross_wages}</p>}
                          </div>
                        </div>
                      )}

                      {/* Key Facts */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {app.pets && (
                          <div className="bg-background rounded-lg p-3 border border-border">
                            <p className="text-xs text-muted-foreground">Pets</p>
                            <p className="font-medium text-foreground">{app.pets}</p>
                          </div>
                        )}
                        {app.evictions_count && (
                          <div className="bg-background rounded-lg p-3 border border-border">
                            <p className="text-xs text-muted-foreground">Evictions</p>
                            <p className="font-medium text-foreground">{app.evictions_count}</p>
                          </div>
                        )}
                        {app.felonies_count && (
                          <div className="bg-background rounded-lg p-3 border border-border">
                            <p className="text-xs text-muted-foreground">Felonies</p>
                            <p className="font-medium text-foreground">{app.felonies_count}</p>
                          </div>
                        )}
                        {app.vehicles_count && (
                          <div className="bg-background rounded-lg p-3 border border-border">
                            <p className="text-xs text-muted-foreground">Vehicles</p>
                            <p className="font-medium text-foreground">{app.vehicles_count}</p>
                          </div>
                        )}
                      </div>

                      {/* Emergency Contact */}
                      {app.emergency_name && (
                        <div className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Emergency Contact:</strong> {app.emergency_name}
                          {app.emergency_relationship && ` (${app.emergency_relationship})`}
                          {app.emergency_phone && ` – ${app.emergency_phone}`}
                        </div>
                      )}

                      {/* Why rent to you */}
                      {app.why_rent_to_you && (
                        <div className="text-sm">
                          <strong className="text-foreground">Why should we rent to you?</strong>
                          <p className="text-muted-foreground mt-1">{app.why_rent_to_you}</p>
                        </div>
                      )}

                      {app.additional_info && (
                        <div className="text-sm">
                          <strong className="text-foreground">Additional Info:</strong>
                          <p className="text-muted-foreground mt-1">{app.additional_info}</p>
                        </div>
                      )}

                      {/* Signature */}
                      <div className="text-xs text-muted-foreground border-t border-border pt-3">
                        Signed: <em>{app.applicant_signature}</em> on {app.signature_date}
                      </div>

                      {/* Action Buttons */}
                      {app.status === "pending" && (
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => updateStatus(app.id, "approved")}
                            disabled={updatingId === app.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => updateStatus(app.id, "denied")}
                            disabled={updatingId === app.id}
                          >
                            <XCircle className="h-4 w-4" />
                            Deny
                          </Button>
                        </div>
                      )}

                      {app.status !== "pending" && (
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(app.id, "pending" as any)}
                            disabled={updatingId === app.id}
                          >
                            <Clock className="h-4 w-4" />
                            Reset to Pending
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
