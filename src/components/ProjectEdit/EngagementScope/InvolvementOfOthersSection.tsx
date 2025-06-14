
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

interface SpecialistTeam {
  id: string;
  description: string;
  name: string;
  title: string;
}

interface InvolvementOfOthersSectionProps {
  formData: {
    entity_uses_service_organization: boolean;
    plan_to_involve_specialists: boolean;
    specialist_teams: SpecialistTeam[];
  };
  onFormDataChange: (updates: any) => void;
}

const InvolvementOfOthersSection = ({ formData, onFormDataChange }: InvolvementOfOthersSectionProps) => {
  const handleAddSpecialistTeam = () => {
    const newTeam: SpecialistTeam = {
      id: '',
      description: '',
      name: '',
      title: ''
    };
    const newTeams = [...(formData.specialist_teams || []), newTeam];
    onFormDataChange({ specialist_teams: newTeams });
  };

  const handleRemoveSpecialistTeam = (index: number) => {
    const newTeams = (formData.specialist_teams || []).filter((_, i) => i !== index);
    onFormDataChange({ specialist_teams: newTeams });
  };

  const handleSpecialistTeamChange = (index: number, field: keyof SpecialistTeam, value: string) => {
    const newTeams = (formData.specialist_teams || []).map((team, i) =>
      i === index ? { ...team, [field]: value } : team
    );
    onFormDataChange({ specialist_teams: newTeams });
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Involvement of others and specialized skills or knowledge</h4>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="entity_uses_service_organization"
            checked={formData.entity_uses_service_organization || false}
            onCheckedChange={(checked) => onFormDataChange({ entity_uses_service_organization: checked as boolean })}
          />
          <Label htmlFor="entity_uses_service_organization">The entity uses a service organization(s)</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="plan_to_involve_specialists"
            checked={formData.plan_to_involve_specialists || false}
            onCheckedChange={(checked) => onFormDataChange({ plan_to_involve_specialists: checked as boolean })}
          />
          <Label htmlFor="plan_to_involve_specialists">We plan to involve specific team members with specialized skills in accounting and auditing and/or use the work of employed/engaged KPMG specialists and/or management's specialists</Label>
        </div>
      </div>

      {formData.plan_to_involve_specialists && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium text-gray-900">Specialist Teams</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSpecialistTeam}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          {(formData.specialist_teams || []).length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(formData.specialist_teams || []).map((team, index) => (
                  <TableRow key={`specialist-team-${index}`}>
                    <TableCell>
                      <Input
                        value={team.id}
                        onChange={(e) => handleSpecialistTeamChange(index, 'id', e.target.value)}
                        placeholder="ID"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={team.description}
                        onChange={(e) => handleSpecialistTeamChange(index, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={team.name}
                        onChange={(e) => handleSpecialistTeamChange(index, 'name', e.target.value)}
                        placeholder="Name"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={team.title}
                        onChange={(e) => handleSpecialistTeamChange(index, 'title', e.target.value)}
                        placeholder="Title"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSpecialistTeam(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
};

export default InvolvementOfOthersSection;
