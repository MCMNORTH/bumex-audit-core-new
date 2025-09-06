import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';
import { Users, UserCheck, Save } from 'lucide-react';
import { SearchableUserSelector } from './SearchableUserSelector';
import { MultiSelectUserSelector } from './MultiSelectUserSelector';
import { useLogging } from '@/hooks/useLogging';
import { useToast } from '@/hooks/use-toast';

interface TeamSectionProps {
  formData: ProjectFormData;
  users: User[];
  currentUserId: string;
  isLeadDeveloper: boolean;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
  onSave: () => void;
  saving: boolean;
  projectId?: string;
}

const TeamSection = ({
  formData,
  users,
  currentUserId,
  isLeadDeveloper,
  onFormDataChange,
  onSave,
  saving,
  projectId
}: TeamSectionProps) => {
  const { logProjectAction } = useLogging();
  const { toast } = useToast();
  const leadDeveloper = users.find(u => u.id === formData.lead_developer_id);
  const leadPartner = users.find(u => u.id === formData.team_assignments.lead_partner_id);
  const partners = users.filter(u => formData.team_assignments.partner_ids.includes(u.id));
  const managers = users.filter(u => formData.team_assignments.manager_ids.includes(u.id));
  const inCharges = users.filter(u => formData.team_assignments.in_charge_ids.includes(u.id));
  const staffMembers = users.filter(u => formData.team_assignments.staff_ids.includes(u.id));

  const handleTeamAssignmentChange = async (role: keyof ProjectFormData['team_assignments'], value: string | string[]) => {
    const oldValue = formData.team_assignments[role];
    
    onFormDataChange({
      team_assignments: {
        ...formData.team_assignments,
        [role]: value
      }
    });

    // Log team assignment changes immediately
    if (projectId) {
      const oldUsers = Array.isArray(oldValue) ? oldValue : [oldValue].filter(Boolean);
      const newUsers = Array.isArray(value) ? value : [value].filter(Boolean);
      
      const added = newUsers.filter(id => !oldUsers.includes(id));
      const removed = oldUsers.filter(id => !newUsers.includes(id));
      
      if (added.length > 0 || removed.length > 0) {
        const details = [];
        if (added.length > 0) details.push(`Added to ${role}: ${added.join(', ')}`);
        if (removed.length > 0) details.push(`Removed from ${role}: ${removed.join(', ')}`);
        
        await logProjectAction.update(projectId, `Team assignment changed - ${details.join('; ')}`);
      }
    }
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
              <Label className="font-medium">Partners</Label>
              <div className="p-3 bg-muted rounded-md">
                {partners.length > 0 ? partners.map(p => `${p.first_name} ${p.last_name}`).join(', ') : 'None assigned'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">Managers</Label>
              <div className="p-3 bg-muted rounded-md">
                {managers.length > 0 ? managers.map(m => `${m.first_name} ${m.last_name}`).join(', ') : 'None assigned'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">In Charge</Label>
              <div className="p-3 bg-muted rounded-md">
                {inCharges.length > 0 ? inCharges.map(ic => `${ic.first_name} ${ic.last_name}`).join(', ') : 'None assigned'}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">Staff</Label>
              <div className="p-3 bg-muted rounded-md">
                {staffMembers.length > 0 ? staffMembers.map(s => `${s.first_name} ${s.last_name}`).join(', ') : 'None assigned'}
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
            <Label className="font-medium">Partners</Label>
            <MultiSelectUserSelector
              users={getSelectableUsers()}
              values={formData.team_assignments.partner_ids}
              onValuesChange={(values) => handleTeamAssignmentChange('partner_ids', values)}
              placeholder="Select partners"
              emptyText="users"
              disabled={!isLeadDeveloper}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Managers</Label>
            <MultiSelectUserSelector
              users={getSelectableUsers()}
              values={formData.team_assignments.manager_ids}
              onValuesChange={(values) => handleTeamAssignmentChange('manager_ids', values)}
              placeholder="Select managers"
              emptyText="users"
              disabled={!isLeadDeveloper}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">In Charge</Label>
            <MultiSelectUserSelector
              users={getSelectableUsers()}
              values={formData.team_assignments.in_charge_ids}
              onValuesChange={(values) => handleTeamAssignmentChange('in_charge_ids', values)}
              placeholder="Select in charge members"
              emptyText="users"
              disabled={!isLeadDeveloper}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Staff</Label>
            <MultiSelectUserSelector
              users={getSelectableUsers()}
              values={formData.team_assignments.staff_ids}
              onValuesChange={(values) => handleTeamAssignmentChange('staff_ids', values)}
              placeholder="Select staff members"
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