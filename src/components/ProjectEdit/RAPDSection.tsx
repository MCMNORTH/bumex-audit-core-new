import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProjectFormData } from '@/types/formData';

interface RAPDSectionProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

const RAPDSection: React.FC<RAPDSectionProps> = ({ formData, onFormDataChange }) => {
  const addTeamMember = () => {
    const newMember = {
      id: Date.now().toString(),
      member: '',
      role: '',
      attendedMeeting: false,
      documentMatters: ''
    };
    
    onFormDataChange({
      rapd_team_members: [...(formData.rapd_team_members || []), newMember]
    });
  };

  const removeTeamMember = (id: string) => {
    onFormDataChange({
      rapd_team_members: formData.rapd_team_members?.filter(member => member.id !== id) || []
    });
  };

  const updateTeamMember = (id: string, field: string, value: string | boolean) => {
    onFormDataChange({
      rapd_team_members: formData.rapd_team_members?.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      ) || []
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Discuss matters affecting the identification and assessment of RMMs among the engagement team
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="meeting-date" className="text-sm font-medium">Date of meeting:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal mt-1",
                  !formData.rapd_meeting_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.rapd_meeting_date ? format(new Date(formData.rapd_meeting_date), "dd/MM/yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.rapd_meeting_date ? new Date(formData.rapd_meeting_date) : undefined}
                onSelect={(date) => onFormDataChange({ rapd_meeting_date: date?.toISOString() || '' })}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium">Identify key engagement team members</Label>
            <Button 
              onClick={addTeamMember}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="text-left p-4 font-medium border">Engagement team member</th>
                  <th className="text-left p-4 font-medium border">Role</th>
                  <th className="text-center p-4 font-medium border">Attended meeting</th>
                  <th className="text-left p-4 font-medium border">Document important matters communicated to those unable to attend</th>
                  <th className="text-center p-4 font-medium border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.rapd_team_members?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-12 text-gray-500 border">
                      No team members added yet. Click "Add" to create your first team member entry.
                    </td>
                  </tr>
                ) : (
                  formData.rapd_team_members?.map((member, index) => (
                    <tr key={member.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3 border">
                        <Input
                          value={member.member}
                          onChange={(e) => updateTeamMember(member.id, 'member', e.target.value)}
                          placeholder="Team member name"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3 border">
                        <Input
                          value={member.role}
                          onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                          placeholder="Role"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-4 text-center border">
                        <Checkbox
                          checked={member.attendedMeeting}
                          onCheckedChange={(checked) => updateTeamMember(member.id, 'attendedMeeting', !!checked)}
                        />
                      </td>
                      <td className="p-3 border">
                        <Input
                          value={member.documentMatters}
                          onChange={(e) => updateTeamMember(member.id, 'documentMatters', e.target.value)}
                          placeholder="Document matters"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-4 text-center border">
                        <Button
                          onClick={() => removeTeamMember(member.id)}
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RAPDSection;