"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, UserPlus, Trash2, Mail } from "lucide-react"
import type { WorkspaceMember } from "@/types/auth"
import { toast } from "@/hooks/use-toast"

interface TeamManagementProps {
  workspaceId: string
  userRole: string
}

export function TeamManagement({ workspaceId, userRole }: TeamManagementProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>("member")
  const [loading, setLoading] = useState(false)

  const canManageTeam = userRole === "owner" || userRole === "admin"

  useEffect(() => {
    fetchMembers()
  }, [workspaceId])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error("Failed to fetch members:", error)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to invite member")
      }

      await fetchMembers()
      setInviteEmail("")
      setInviteRole("member")

      toast({
        title: "Invitation sent",
        description: `Invited ${inviteEmail} to join the workspace`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to invite member",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error("Failed to update role")
      }

      await fetchMembers()
      toast({
        title: "Role updated",
        description: "Member role has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove member")
      }

      await fetchMembers()
      toast({
        title: "Member removed",
        description: "Member has been removed from the workspace",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-500"
      case "admin":
        return "bg-blue-500"
      case "member":
        return "bg-green-500"
      case "viewer":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <Users className="h-4 w-4" />
          Team ({members.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle>Team Management</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {canManageTeam && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Invite Team Member</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer - Can view requests</SelectItem>
                      <SelectItem value="member">Member - Can create and edit</SelectItem>
                      <SelectItem value="admin">Admin - Can manage team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInviteMember} disabled={loading} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  {loading ? "Sending..." : "Send Invitation"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.user.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {canManageTeam && member.role !== "owner" ? (
                        <Select value={member.role} onValueChange={(value) => handleUpdateRole(member.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
                      )}

                      {canManageTeam && member.role !== "owner" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.user.name} from this workspace?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
