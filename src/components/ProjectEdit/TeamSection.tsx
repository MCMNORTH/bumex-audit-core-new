import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';
import { Users, UserCheck, Save } from 'lucide-react';

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
    const value = userId === 'none' ? '' : userId;
    onFormDataChange({
      team_assignments: {
        ...formData.team_assignments,
        [role]: value
      }
    });
  };

  const getUsersByRole = (role: string) => {
    return users.filter(user => user.role === role && user.approved && !user.blocked);
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
          Assign team members to specific roles for this project. Only you (Lead Developer) can modify these assignments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="lead_developer_display" className="font-medium">Lead Developer (You)</Label>
            <div className="p-3 bg-muted rounded-md">
              {leadDeveloper ? `${leadDeveloper.first_name} ${leadDeveloper.last_name}` : 'Not assigned'}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lead_partner_id" className="font-medium">Lead Partner</Label>
            <Select
              value={formData.team_assignments.lead_partner_id}
              onValueChange={(value) => handleTeamAssignmentChange('lead_partner_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lead partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No assignment</SelectItem>
                {getUsersByRole('partner').map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="partner_id" className="font-medium">Partner</Label>
            <Select
              value={formData.team_assignments.partner_id}
              onValueChange={(value) => handleTeamAssignmentChange('partner_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No assignment</SelectItem>
                {getUsersByRole('partner').map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="in_charge_id" className="font-medium">In Charge</Label>
            <Select
              value={formData.team_assignments.in_charge_id}
              onValueChange={(value) => handleTeamAssignmentChange('in_charge_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select in charge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No assignment</SelectItem>
                {getUsersByRole('incharge').map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="staff_id" className="font-medium">Staff</Label>
            <Select
              value={formData.team_assignments.staff_id}
              onValueChange={(value) => handleTeamAssignmentChange('staff_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No assignment</SelectItem>
                {getUsersByRole('staff').map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Team Assignments'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSection;