import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
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
      attendedMeeting: '',
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

  const updateTeamMember = (id: string, field: string, value: string) => {
    onFormDataChange({
      rapd_team_members: formData.rapd_team_members?.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      ) || []
    });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h4 className="text-lg font-semibold mb-4">Discuss matters affecting the identification and assessment of RMMs among the engagement team</h4>
          
          <div className="space-y-4">
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
              <Label className="text-sm font-medium">Identify key engagement team members</Label>
              
              <div className="mt-3 space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 rounded-md font-medium text-sm text-gray-700">
                  <div>Engagement team member</div>
                  <div>Role</div>
                  <div>Attended meeting</div>
                  <div>Document important matters communicated to those unable to attend</div>
                  <div className="text-center">Actions</div>
                </div>

                {/* Table Rows */}
                {formData.rapd_team_members?.map((member) => (
                  <div key={member.id} className="grid grid-cols-5 gap-4 p-3 border rounded-md">
                    <Input
                      value={member.member}
                      onChange={(e) => updateTeamMember(member.id, 'member', e.target.value)}
                      placeholder="Team member name"
                    />
                    <Input
                      value={member.role}
                      onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                      placeholder="Role"
                    />
                    <Input
                      value={member.attendedMeeting}
                      onChange={(e) => updateTeamMember(member.id, 'attendedMeeting', e.target.value)}
                      placeholder="Yes/No"
                    />
                    <Input
                      value={member.documentMatters}
                      onChange={(e) => updateTeamMember(member.id, 'documentMatters', e.target.value)}
                      placeholder="Document matters"
                    />
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTeamMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add Button */}
                <Button
                  variant="outline"
                  onClick={addTeamMember}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RAPDSection;