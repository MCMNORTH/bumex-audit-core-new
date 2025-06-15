
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/types";

interface ProjectTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  leadId: string | undefined;
  assignedIds: string[];
  onChangeLead: (leadId: string) => void;
  onToggleMember: (userId: string) => void;
  onSave: () => void;
  saving?: boolean;
}

export const ProjectTeamDialog: React.FC<ProjectTeamDialogProps> = ({
  open,
  onOpenChange,
  users,
  leadId,
  assignedIds,
  onChangeLead,
  onToggleMember,
  onSave,
  saving,
}) => {
  // partition users: leads vs members
  const leadCandidates = users.filter(user =>
    user.role === "partner" || user.role === "manager"
  );
  const memberCandidates = users;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Team Management</DialogTitle>
          <span className="text-sm text-gray-500">Set project lead and assigned team members.</span>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="lead">Project Lead</Label>
            <Select
              value={leadId ?? ""}
              onValueChange={onChangeLead}
            >
              <SelectTrigger id="lead">
                <SelectValue placeholder="Select project lead" />
              </SelectTrigger>
              <SelectContent>
                {leadCandidates.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Assigned Members</Label>
            <div className="max-h-36 overflow-y-auto space-y-1 mt-2">
              {memberCandidates.map(user => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`member-${user.id}`}
                    checked={assignedIds.includes(user.id)}
                    onCheckedChange={() => onToggleMember(user.id)}
                  />
                  <Label htmlFor={`member-${user.id}`}>
                    {user.first_name} {user.last_name} <span className="text-xs text-gray-400">({user.role})</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" type="button" disabled={saving}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
