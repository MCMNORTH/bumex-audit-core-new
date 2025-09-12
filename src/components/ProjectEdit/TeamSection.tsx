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
import { isDev } from '@/utils/permissions';

interface TeamSectionProps {
  formData: ProjectFormData;
  users: User[];
  currentUser: User | null;
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
  currentUser,
  currentUserId,
  isLeadDeveloper,
  onFormDataChange,
  onSave,
  saving,
  projectId
}: TeamSectionProps) => {
  const { logProjectAction } = useLogging();
  const { toast } = useToast();
  
  // Ensure team_assignments exists with default values
  const teamAssignments = formData.team_assignments || {
    lead_partner_id: '',
    partner_ids: [],
    manager_ids: [],
    in_charge_ids: [],
    staff_ids: []
  };
  
  const leadDeveloper = users.find(u => u.id === formData.lead_developer_id);
  const leadPartner = users.find(u => u.id === teamAssignments.lead_partner_id);
  const partners = users.filter(u => teamAssignments.partner_ids?.includes(u.id));
  const managers = users.filter(u => teamAssignments.manager_ids?.includes(u.id));
  const inCharges = users.filter(u => teamAssignments.in_charge_ids?.includes(u.id));
  const staffMembers = users.filter(u => teamAssignments.staff_ids?.includes(u.id));

  const handleTeamAssignmentChange = async (role: keyof ProjectFormData['team_assignments'], value: string | string[]) => {
    const oldValue = teamAssignments[role];
    
    onFormDataChange({
      team_assignments: {
        ...teamAssignments,
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

  const canManageTeam = isLeadDeveloper;

  // Show team list view for non-lead developers
  if (!canManageTeam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Project Team
          </CardTitle>
          <CardDescription>
            View the assigned team members for this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Lead Partner - First priority */}
            {leadPartner && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <Label className="font-semibold text-primary">Lead Partner</Label>
                <div className="mt-1 text-foreground">
                  {leadPartner.first_name} {leadPartner.last_name}
                  {leadPartner.role && (
                    <span className="ml-2 text-sm text-muted-foreground">({leadPartner.role})</span>
                  )}
                </div>
              </div>
            )}
            
            {/* Lead Developer - Second priority */}
            <div className="p-4 bg-secondary/50 border border-secondary/50 rounded-lg">
              <Label className="font-semibold">Lead Developer</Label>
              <div className="mt-1 text-foreground">
                {leadDeveloper ? `${leadDeveloper.first_name} ${leadDeveloper.last_name}` : 'Not assigned'}
                {leadDeveloper?.role && (
                  <span className="ml-2 text-sm text-muted-foreground">({leadDeveloper.role})</span>
                )}
              </div>
            </div>
            
            {/* Other team members */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partners.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-medium">Partners</Label>
                  <div className="space-y-1">
                    {partners.map(p => (
                      <div key={p.id} className="p-2 bg-muted rounded-md text-sm">
                        {p.first_name} {p.last_name}
                        {p.role && <span className="ml-2 text-muted-foreground">({p.role})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {managers.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-medium">Managers</Label>
                  <div className="space-y-1">
                    {managers.map(m => (
                      <div key={m.id} className="p-2 bg-muted rounded-md text-sm">
                        {m.first_name} {m.last_name}
                        {m.role && <span className="ml-2 text-muted-foreground">({m.role})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {inCharges.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-medium">In Charge</Label>
                  <div className="space-y-1">
                    {inCharges.map(ic => (
                      <div key={ic.id} className="p-2 bg-muted rounded-md text-sm">
                        {ic.first_name} {ic.last_name}
                        {ic.role && <span className="ml-2 text-muted-foreground">({ic.role})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {staffMembers.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-medium">Staff</Label>
                  <div className="space-y-1">
                    {staffMembers.map(s => (
                      <div key={s.id} className="p-2 bg-muted rounded-md text-sm">
                        {s.first_name} {s.last_name}
                        {s.role && <span className="ml-2 text-muted-foreground">({s.role})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              value={teamAssignments.lead_partner_id}
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
              values={teamAssignments.partner_ids}
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
              values={teamAssignments.manager_ids}
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
              values={teamAssignments.in_charge_ids}
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
              values={teamAssignments.staff_ids}
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