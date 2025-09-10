import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UsageMeter } from "@/components/UsageMeter"
import { ContactsSkeleton } from "@/components/ui/dashboard-skeleton"
import { useSubscription } from "@/hooks/useSubscription"
import { useContacts } from "@/hooks/useContacts"
import { 
  Search, 
  Plus, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Building,
  Calendar,
  MessageCircle,
  MoreHorizontal,
  Heart,
  Star,
  Users
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const { trackUsage } = useSubscription()
  const { contacts, loading } = useContacts()

  // Show UI immediately with loading states for contact cards
  // Don't block the page on data loading
  // Transform contacts data to display format with safe fallbacks
  const displayContacts = (contacts || []).map(contact => ({
    id: contact.id,
    name: `${contact.first_name} ${contact.last_name}`,
    email: contact.email,
    phone: contact.phone || "Not provided",
    company: contact.company || "Unknown Company",
    position: contact.title || "Unknown Position",
    location: contact.additional_fields?.location || "Unknown Location",
    lastContact: contact.updated_at ? (() => {
      const days = Math.floor((Date.now() - new Date(contact.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
      return `${Math.floor(days / 30)} months ago`;
    })() : "No recent contact",
    relationship: (() => {
      const daysSinceContact = Math.floor((Date.now() - new Date(contact.updated_at || contact.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceContact < 7) return "Strong";
      if (daysSinceContact < 30) return "Good";
      if (daysSinceContact < 90) return "Cooling";
      return "Cold";
    })(),
    priority: "Medium", // This would be calculated based on various factors
    avatar: `${contact.first_name.charAt(0)}${contact.last_name.charAt(0)}`.toUpperCase(),
    tags: contact.additional_fields?.tags || ["Contact"]
  }))

  const filteredContacts = displayContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case "Strong": return "text-success"
      case "Moderate": return "text-warning"
      case "New": return "text-primary"
      default: return "text-muted-foreground"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-destructive text-destructive-foreground"
      case "Medium": return "bg-warning text-warning-foreground"
      case "Low": return "bg-success text-success-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Usage Meter */}
      <UsageMeter 
        resourceType="contacts" 
        title="Contact Management" 
        description="Track and organize your professional relationships"
      />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage and nurture your professional relationships</p>
        </div>
        <Button className="bg-gradient-primary shadow-medium hover:shadow-strong transition-all w-full md:w-auto" size="responsive">
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search contacts..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full md:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          <span className="md:inline">Filter</span>
        </Button>
      </div>

      {/* Contacts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-3 w-20 bg-muted rounded"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 w-full bg-muted rounded"></div>
                <div className="h-3 w-3/4 bg-muted rounded"></div>
                <div className="h-3 w-1/2 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="shadow-soft hover:shadow-medium transition-all cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-primary text-white font-medium">
                      {contact.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{contact.position}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Company Info */}
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{contact.company}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{contact.location}</span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.phone}</span>
                </div>
              </div>

              {/* Relationship Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className={`h-4 w-4 ${getRelationshipColor(contact.relationship)}`} />
                  <span className={`text-sm font-medium ${getRelationshipColor(contact.relationship)}`}>
                    {contact.relationship}
                  </span>
                </div>
                <Badge className={getPriorityColor(contact.priority)} variant="secondary">
                  {contact.priority}
                </Badge>
              </div>

              {/* Last Contact */}
              <div className="text-xs text-muted-foreground">
                Last contact: {contact.lastContact}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {contact.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Message</span>
                  <span className="sm:hidden">Msg</span>
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Meet</span>
                  <span className="sm:hidden">Meet</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Empty State */}
      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No contacts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Start building your network by adding your first contact"}
          </p>
          <Button className="bg-gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Contact
          </Button>
        </div>
      )}
    </div>
  )
}

export default Contacts