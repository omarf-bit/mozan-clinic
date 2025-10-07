import { useEffect, useState } from "react";
import { getAllLeads, exportLeadsToCSV, updateLeadTracking } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Download, RefreshCw, Pencil, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: number;
  full_name: string;
  phone_number: string;
  email: string;
  institution: string;
  occupation: string;
  created_at: string;
  call_datetime?: string | null;
  call_notes?: string | null;
  visit_datetime?: string | null;
  visit_notes?: string | null;
}

type SortField = keyof Lead;
type SortDirection = 'asc' | 'desc';

export default function LeadsAdmin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [trackCall, setTrackCall] = useState(false);
  const [trackVisit, setTrackVisit] = useState(false);
  const [callDatetime, setCallDatetime] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [visitDatetime, setVisitDatetime] = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    institution: "",
    occupation: "",
  });
  const { toast } = useToast();

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await getAllLeads();
      setLeads(data);
      setFilteredLeads(data);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Search and filter
  useEffect(() => {
    let filtered = [...leads];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((lead) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          lead.full_name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.phone_number.toLowerCase().includes(searchLower) ||
          lead.institution.toLowerCase().includes(searchLower) ||
          lead.occupation.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle numeric sorting for id
      if (sortField === "id") {
        return sortDirection === "asc" 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }

      // String sorting
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (sortDirection === "asc") {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });

    setFilteredLeads(filtered);
  }, [searchQuery, leads, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportLeadsToCSV();
      toast({
        title: "Success",
        description: "Leads exported to CSV successfully",
      });
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast({
        title: "Error",
        description: "Failed to export to CSV",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setEditForm({
      fullName: lead.full_name,
      phoneNumber: lead.phone_number,
      email: lead.email,
      institution: lead.institution,
      occupation: lead.occupation,
    });
    
    // Load existing tracking data
    setTrackCall(!!lead.call_datetime);
    setCallDatetime(lead.call_datetime || "");
    setCallNotes(lead.call_notes || "");
    setTrackVisit(!!lead.visit_datetime);
    setVisitDatetime(lead.visit_datetime || "");
    setVisitNotes(lead.visit_notes || "");
    
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingLead) return;

    try {
      const result = await updateLeadTracking(editingLead.id, {
        callDatetime: trackCall ? callDatetime : null,
        callNotes: trackCall ? callNotes : null,
        visitDatetime: trackVisit ? visitDatetime : null,
        visitNotes: trackVisit ? visitNotes : null,
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setIsEditDialogOpen(false);
        setEditingLead(null);
        await loadLeads();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leads Management</h2>
          <p className="text-muted-foreground mt-1">
            {filteredLeads.length} of {leads.length} leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadLeads} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, institution, or occupation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery ? "No leads found matching your search" : "No leads found"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID
                      <SortIcon field="id" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort("full_name")}
                  >
                    <div className="flex items-center">
                      Full Name
                      <SortIcon field="full_name" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort("phone_number")}
                  >
                    <div className="flex items-center">
                      Phone Number
                      <SortIcon field="phone_number" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      <SortIcon field="email" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort("institution")}
                  >
                    <div className="flex items-center">
                      Institution
                      <SortIcon field="institution" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort("occupation")}
                  >
                    <div className="flex items-center">
                      Occupation
                      <SortIcon field="occupation" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Called</TableHead>
                  <TableHead className="text-center">Visited</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center">
                      Created At
                      <SortIcon field="created_at" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.id}</TableCell>
                    <TableCell className="font-medium">
                      {lead.full_name}
                    </TableCell>
                    <TableCell>{lead.phone_number}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.institution}</TableCell>
                    <TableCell>{lead.occupation}</TableCell>
                    <TableCell className="text-center">
                      {lead.call_datetime ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          ✗ No
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {lead.visit_datetime ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ✓ Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          ✗ No
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(lead.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(lead)}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details & Tracking</DialogTitle>
            <DialogDescription>
              View lead information and track call/visit activity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Read-only Lead Information */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase">Lead Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <Input
                    value={editForm.fullName}
                    readOnly
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Phone Number</Label>
                  <Input
                    value={editForm.phoneNumber}
                    readOnly
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input
                    value={editForm.email}
                    readOnly
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Institution</Label>
                  <Input
                    value={editForm.institution}
                    readOnly
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs text-muted-foreground">Occupation</Label>
                  <Input
                    value={editForm.occupation}
                    readOnly
                    className="bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Tracking Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase">Activity Tracking</h3>
              
              {/* Call Tracking */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="track-call"
                    checked={trackCall}
                    onCheckedChange={(checked) => setTrackCall(checked as boolean)}
                  />
                  <Label htmlFor="track-call" className="font-semibold cursor-pointer">
                    📞 Call
                  </Label>
                </div>
                
                {trackCall && (
                  <div className="space-y-3 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="call-datetime">Call Date & Time</Label>
                      <Input
                        id="call-datetime"
                        type="datetime-local"
                        value={callDatetime}
                        onChange={(e) => setCallDatetime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="call-notes">Call Notes</Label>
                      <Textarea
                        id="call-notes"
                        value={callNotes}
                        onChange={(e) => setCallNotes(e.target.value)}
                        placeholder="Enter notes about the call..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Visit Tracking */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="track-visit"
                    checked={trackVisit}
                    onCheckedChange={(checked) => setTrackVisit(checked as boolean)}
                  />
                  <Label htmlFor="track-visit" className="font-semibold cursor-pointer">
                    🏥 Visit
                  </Label>
                </div>
                
                {trackVisit && (
                  <div className="space-y-3 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="visit-datetime">Visit Date & Time</Label>
                      <Input
                        id="visit-datetime"
                        type="datetime-local"
                        value={visitDatetime}
                        onChange={(e) => setVisitDatetime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visit-notes">Visit Notes</Label>
                      <Textarea
                        id="visit-notes"
                        value={visitNotes}
                        onChange={(e) => setVisitNotes(e.target.value)}
                        placeholder="Enter notes about the visit..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingLead(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Tracking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
