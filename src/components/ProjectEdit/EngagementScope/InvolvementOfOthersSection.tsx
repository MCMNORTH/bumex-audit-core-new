
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import CommentableQuestion from '../Comments/CommentableQuestion';

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
    <CommentableQuestion fieldId="involvement-others-section" label="Involvement of Others">
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
            <Label htmlFor="plan_to_involve_specialists">We plan to involve specific team members with specialized skills in accounting and auditing and/or use the work of employed/engaged Bumex specialists and/or management's specialists</Label>
          </div>
        </div>

        {formData.plan_to_involve_specialists && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-gray-900">Specialist Teams</Label>
              <Button
                type="button"
                onClick={handleAddSpecialistTeam}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-600">
                    <TableHead className="text-white font-medium">ID</TableHead>
                    <TableHead className="text-white font-medium">Description</TableHead>
                    <TableHead className="text-white font-medium">Name</TableHead>
                    <TableHead className="text-white font-medium">Title</TableHead>
                    <TableHead className="text-white font-medium w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(formData.specialist_teams || []).map((team, index) => (
                    <TableRow key={`specialist-team-${index}`} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <TableCell>
                        <Input
                          value={team.id}
                          onChange={(e) => handleSpecialistTeamChange(index, 'id', e.target.value)}
                          placeholder="Enter ID"
                          className="border-0 bg-transparent"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={team.description}
                          onChange={(e) => handleSpecialistTeamChange(index, 'description', e.target.value)}
                          placeholder="Enter description"
                          className="border-0 bg-transparent"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={team.name}
                          onChange={(e) => handleSpecialistTeamChange(index, 'name', e.target.value)}
                          placeholder="Enter name"
                          className="border-0 bg-transparent"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={team.title}
                          onChange={(e) => handleSpecialistTeamChange(index, 'title', e.target.value)}
                          placeholder="Enter title"
                          className="border-0 bg-transparent"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSpecialistTeam(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!formData.specialist_teams || formData.specialist_teams.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No specialist teams added yet. Click the + button to add a specialist team.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </CommentableQuestion>
  );
};

export default InvolvementOfOthersSection;
