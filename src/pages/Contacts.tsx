import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  
  const contacts = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@marketpro.com",
      phone: "+1 (555) 123-4567",
      company: "MarketPro Solutions",
      position: "Marketing Director",
      location: "San Francisco, CA",
      lastContact: "2 weeks ago",
      relationship: "Strong",
      priority: "High",
      avatar: "SJ",
      tags: ["Marketing", "B2B", "Lead"]
    },
    {
      id: 2,
      name: "David Lee",
      email: "david@techstart.io",
      phone: "+1 (555) 987-6543",
      company: "TechStart Inc",
      position: "Founder & CEO",
      location: "Austin, TX",
      lastContact: "Never",
      relationship: "New",
      priority: "Medium",
      avatar: "DL",
      tags: ["Tech", "Startup", "CEO"]
    },
    {
      id: 3,
      name: "Alex Rodriguez",
      email: "alex.r@consulting.com",
      phone: "+1 (555) 456-7890",
      company: "Rodriguez Consulting",
      position: "Senior Consultant",
      location: "New York, NY",
      lastContact: "3 months ago",
      relationship: "Moderate",
      priority: "Medium",
      avatar: "AR",
      tags: ["Consulting", "B2B", "Partner"]
    },
    {
      id: 4,
      name: "Emily Wilson",
      email: "emily@designstudio.com",
      phone: "+1 (555) 234-5678",
      company: "Creative Design Studio",
      position: "Design Lead",
      location: "Los Angeles, CA",
      lastContact: "1 week ago",
      relationship: "Strong",
      priority: "High",
      avatar: "EW",
      tags: ["Design", "Creative", "Freelancer"]
    },
    {
      id: 5,
      name: "Mike Chen",
      email: "mike@datatech.com",
      phone: "+1 (555) 345-6789",
      company: "DataTech Solutions",
      position: "Data Scientist",
      location: "Seattle, WA",
      lastContact: "1 month ago",
      relationship: "Strong",
      priority: "Medium",
      avatar: "MC",
      tags: ["Data", "AI", "Tech"]
    },
    {
      id: 6,
      name: "Lisa Park",
      email: "lisa@financeplus.com",
      phone: "+1 (555) 567-8901",
      company: "FinancePlus",
      position: "Financial Advisor",
      location: "Chicago, IL",
      lastContact: "2 days ago",
      relationship: "Strong",
      priority: "High",
      avatar: "LP",
      tags: ["Finance", "Advisory", "Professional"]
    }
  ]

  const filteredContacts = contacts.filter(contact =>
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage and nurture your professional relationships</p>
        </div>
        <Button className="bg-gradient-primary shadow-medium hover:shadow-strong transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search contacts..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  Message
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Meet
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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