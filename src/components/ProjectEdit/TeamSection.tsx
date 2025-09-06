import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';
import { Users, UserCheck, Save } from 'lucide-react';
import { SearchableUserSelector } from './SearchableUserSelector';

interface TeamSectionProps {
  formData: ProjectFormData;
  users: User[];
  currentUserId: string;
  isLeadDeveloper: boolean;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
  onSave: () => void;
  saving: boolean;
}

const TeamSection = ({
  formData,
  users,
  currentUserId,
  isLeadDeveloper,
  onFormDataChange,
  onSave,
  saving
}: TeamSectionProps) => {
  const leadDeveloper = users.find(u => u.id === formData.lead_developer_id);
  const leadPartner = users.find(u => u.id === formData.team_assignments.lead_partner_id);
  const partner = users.find(u => u.id === formData.team_assignments.partner_id);
  const inCharge = users.find(u => u.id === formData.team_assignments.in_charge_id);
  const staff = users.find(u => u.id === formData.team_assignments.staff_id);

  const handleTeamAssignmentChange = (role: keyof ProjectFormData['team_assignments'], userId: string) => {
    onFormDataChange({
      team_assignments: {
        ...formData.team_assignments,
        [role]: userId
      }
    });
  };

  const getSelectableUsers = () => {
    // Safety check: ensure users is always an array
    return (users || []).filter(user => user.approved && !user.blocked);
  };

  if (!isLeadDeveloper) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Project Team
          </CardTitle>
          <CardDescription>
            Only the Lead Developer can manage team assignments for this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-medium">Lead Developer</Label>
              <div className="p-3 bg-muted rounded-md">
                {leadDeveloper ? `${leadDeveloper.first_name} ${leadDeveloper.last_name}` : 'Not assigned'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">Lead Partner</Label>
              <div className="p-3 bg-muted rounded-md">
                {leadPartner ? `${leadPartner.first_name} ${leadPartner.last_name}` : 'Not assigned'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">Partner</Label>
              <div className="p-3 bg-muted rounded-md">
                {partner ? `${partner.first_name} ${partner.last_name}` : 'Not assigned'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">In Charge</Label>
              <div className="p-3 bg-muted rounded-md">
                {inCharge ? `${inCharge.first_name} ${inCharge.last_name}` : 'Not assigned'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">Staff</Label>
              <div className="p-3 bg-muted rounded-md">
                {staff ? `${staff.first_name} ${staff.last_name}` : 'Not assigned'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Manage Project Team
        </CardTitle>
        <CardDescription>
          Assign team members to specific roles for this project. Only the Lead Developer can modify these assignments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="font-medium">Lead Developer (You)</Label>
            <div className="p-3 bg-muted rounded-md flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span>
                {leadDeveloper ? `${leadDeveloper.first_name} ${leadDeveloper.last_name}` : 'Not assigned'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Lead Partner</Label>
            <SearchableUserSelector
              users={getSelectableUsers()}
              value={formData.team_assignments.lead_partner_id}
              onValueChange={(value) => handleTeamAssignmentChange('lead_partner_id', value)}
              placeholder="Select lead partner"
              emptyText="users"
              disabled={!isLeadDeveloper}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Partner</Label>
            <SearchableUserSelector
              users={getSelectableUsers()}
              value={formData.team_assignments.partner_id}
              onValueChange={(value) => handleTeamAssignmentChange('partner_id', value)}
              placeholder="Select partner"
              emptyText="users"
              disabled={!isLeadDeveloper}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">In Charge</Label>
            <SearchableUserSelector
              users={getSelectableUsers()}
              value={formData.team_assignments.in_charge_id}
              onValueChange={(value) => handleTeamAssignmentChange('in_charge_id', value)}
              placeholder="Select in charge"
              emptyText="users"
              disabled={!isLeadDeveloper}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Staff</Label>
            <SearchableUserSelector
              users={getSelectableUsers()}
              value={formData.team_assignments.staff_id}
              onValueChange={(value) => handleTeamAssignmentChange('staff_id', value)}
              placeholder="Select staff member"
              emptyText="users"
              disabled={!isLeadDeveloper}
            />
          </div>
        </div>
        
        {isLeadDeveloper && (
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Team Assignments'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamSection;