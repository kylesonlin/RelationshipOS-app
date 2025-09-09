import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  Users,
  UserPlus,
  Settings,
  Shield,
  Eye,
  Edit,
  Crown,
  Share,
  Bell,
  Activity,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Calendar
} from "lucide-react"

export default function TeamSharing() {
  const [inviteEmail, setInviteEmail] = useState("")

  const teamMembers = [
    {
      id: 1,
      name: "Sarah Chen",
      email: "sarah@company.com",
      role: "Admin",
      avatar: "/api/placeholder/32/32",
      status: "active",
      lastActive: "2 min ago",
      relationships: 127,
      permissions: ["view_all", "edit_all", "admin"]
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      email: "mike@company.com", 
      role: "Manager",
      avatar: "/api/placeholder/32/32",
      status: "active",
      lastActive: "1 hour ago",
      relationships: 89,
      permissions: ["view_team", "edit_own"]
    },
    {
      id: 3,
      name: "Lisa Park",
      email: "lisa@company.com",
      role: "Sales Rep",
      avatar: "/api/placeholder/32/32",
      status: "active",
      lastActive: "3 hours ago",
      relationships: 56,
      permissions: ["view_own", "edit_own"]
    },
    {
      id: 4,
      name: "David Kim",
      email: "david@company.com",
      role: "Sales Rep", 
      avatar: "/api/placeholder/32/32",
      status: "inactive",
      lastActive: "2 days ago",
      relationships: 34,
      permissions: ["view_own", "edit_own"]
    }
  ]

  const sharedRelationships = [
    {
      contact: "Johnson Industries",
      owner: "Sarah Chen",
      shared_with: ["Mike Rodriguez", "Lisa Park"],
      type: "Account",
      value: "High",
      last_interaction: "2 days ago"
    },
    {
      contact: "TechCorp Partnership", 
      owner: "Mike Rodriguez",
      shared_with: ["Sarah Chen"],
      type: "Partnership",
      value: "Medium",
      last_interaction: "1 week ago"
    },
    {
      contact: "StartupX Demo",
      owner: "Lisa Park",
      shared_with: ["Sarah Chen", "Mike Rodriguez"],
      type: "Prospect",
      value: "High",
      last_interaction: "3 days ago"
    }
  ]

  const teamActivity = [
    {
      user: "Mike Rodriguez",
      action: "Updated contact info for Alex Rivera",
      time: "2 hours ago",
      type: "edit"
    },
    {
      user: "Lisa Park",
      action: "Shared TechCorp relationship with team",
      time: "4 hours ago",
      type: "share"
    },
    {
      user: "Sarah Chen",
      action: "Added new team member: David Kim",
      time: "1 day ago", 
      type: "admin"
    },
    {
      user: "Mike Rodriguez",
      action: "Scheduled meeting with Johnson Industries",
      time: "1 day ago",
      type: "meeting"
    }
  ]

  const permissions = [
    {
      name: "View All Relationships",
      description: "See all team relationships and contacts",
      roles: ["Admin", "Manager"]
    },
    {
      name: "Edit All Relationships", 
      description: "Modify any team relationship data",
      roles: ["Admin"]
    },
    {
      name: "Manage Team Members",
      description: "Invite, remove, and manage user permissions",
      roles: ["Admin"]
    },
    {
      name: "Export Team Data",
      description: "Download relationship data and reports",
      roles: ["Admin", "Manager"]
    },
    {
      name: "Access Analytics",
      description: "View team performance and insights",
      roles: ["Admin", "Manager"]
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Team Collaboration</h1>
        <p className="text-muted-foreground">
          Share relationships, coordinate outreach, and collaborate across your organization
        </p>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teamMembers.filter(m => m.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Contacts</CardTitle>
            <Share className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              Across team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Relationships</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">306</div>
            <p className="text-xs text-muted-foreground">
              Total managed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaboration Score</CardTitle>
            <Crown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.7</div>
            <p className="text-xs text-muted-foreground">
              Team effectiveness
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="shared">Shared Relationships</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Team Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {/* Invite New Member */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Team Member
              </CardTitle>
              <CardDescription>Add new members to collaborate on relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter email address..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="sales">Sales Rep</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage user access and permissions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                            {member.role === 'Admin' && <Crown className="h-3 w-3 mr-1" />}
                            {member.role}
                          </Badge>
                          <Badge variant={member.status === 'active' ? 'default' : 'outline'}>
                            {member.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.relationships} relationships • Last active: {member.lastActive}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                Shared Relationships
              </CardTitle>
              <CardDescription>Relationships accessible to multiple team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sharedRelationships.map((relationship, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{relationship.contact}</span>
                        <Badge variant="outline">{relationship.type}</Badge>
                        <Badge variant={relationship.value === 'High' ? 'default' : 'secondary'}>
                          {relationship.value} Value
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Owner: {relationship.owner}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Shared with: {relationship.shared_with.join(', ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last interaction: {relationship.last_interaction}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Share New Relationship</CardTitle>
              <CardDescription>Grant team access to a relationship or account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Relationship</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose relationship to share" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="johnson">Johnson Industries</SelectItem>
                      <SelectItem value="techcorp">TechCorp</SelectItem>
                      <SelectItem value="startupx">StartupX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Share With</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mike">Mike Rodriguez</SelectItem>
                      <SelectItem value="lisa">Lisa Park</SelectItem>
                      <SelectItem value="david">David Kim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Permission Level</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">View & Edit</SelectItem>
                    <SelectItem value="manage">Full Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <Share className="h-4 w-4 mr-2" />
                Share Relationship
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permission Management
              </CardTitle>
              <CardDescription>Control what team members can access and modify</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {permissions.map((permission, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{permission.name}</h4>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex gap-2">
                      {permission.roles.map((role, roleIndex) => (
                        <Badge key={roleIndex} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                    {index < permissions.length - 1 && <div className="border-b"></div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Team Activity
              </CardTitle>
              <CardDescription>Recent actions by team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'admin' ? 'bg-purple-100 text-purple-600' :
                      activity.type === 'share' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'edit' ? 'bg-green-100 text-green-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {activity.type === 'admin' && <Settings className="h-4 w-4" />}
                      {activity.type === 'share' && <Share className="h-4 w-4" />}
                      {activity.type === 'edit' && <Edit className="h-4 w-4" />}
                      {activity.type === 'meeting' && <Calendar className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.user}</div>
                      <div className="text-sm text-muted-foreground">{activity.action}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Team Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Team Collaboration Insights</CardTitle>
          <CardDescription>How your team is working together</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">73%</div>
              <div className="text-sm text-muted-foreground">Relationships shared</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">2.3x</div>
              <div className="text-sm text-muted-foreground">Faster response time</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">94%</div>
              <div className="text-sm text-muted-foreground">Coverage rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}