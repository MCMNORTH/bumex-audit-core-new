
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { ProjectFormData } from '@/types/formData';

interface TCWGCommunicationsSectionProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

interface CommunicationItem {
  id: string;
  topic: string;
  included: boolean;
  date: string;
}

const TCWGCommunicationsSection = ({
  formData,
  onFormDataChange
}: TCWGCommunicationsSectionProps) => {
  const communications = (formData as any).tcwg_communications || [];

  const handleCommunicationChange = (id: string, field: 'topic' | 'included' | 'date', value: boolean | string) => {
    const updatedCommunications = communications.map((comm: CommunicationItem) =>
      comm.id === id ? { ...comm, [field]: value } : comm
    );
    onFormDataChange({ tcwg_communications: updatedCommunications } as any);
  };

  const addNewCommunication = () => {
    const newCommunication: CommunicationItem = {
      id: Date.now().toString(),
      topic: '',
      included: false,
      date: ''
    };
    onFormDataChange({ tcwg_communications: [...communications, newCommunication] } as any);
  };

  const removeCommunication = (id: string) => {
    const updatedCommunications = communications.filter((comm: CommunicationItem) => comm.id !== id);
    onFormDataChange({ tcwg_communications: updatedCommunications } as any);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Communicate with Those Charged with Governance (TCWG) - Planning
          </CardTitle>
          <Button 
            onClick={addNewCommunication}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          We communicate the following:
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="text-left p-4 font-medium border">Topic</th>
                <th className="text-center p-4 font-medium border">Included in our engagement letter?</th>
                <th className="text-center p-4 font-medium border">Date</th>
                <th className="text-center p-4 font-medium border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {communications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-gray-500 border">
                    No communications added yet. Click "Add" to create your first communication item.
                  </td>
                </tr>
              ) : (
                communications.map((comm: CommunicationItem, index: number) => (
                  <tr key={comm.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-2 border">
                      <Textarea
                        value={comm.topic}
                        onChange={(e) => handleCommunicationChange(comm.id, 'topic', e.target.value)}
                        placeholder="Enter communication topic..."
                        className="min-h-[60px] resize-none"
                      />
                    </td>
                    <td className="p-4 text-center border">
                      <Checkbox
                        checked={comm.included}
                        onCheckedChange={(checked) => 
                          handleCommunicationChange(comm.id, 'included', !!checked)
                        }
                      />
                    </td>
                    <td className="p-2 text-center border">
                      <div className="flex items-center justify-center gap-2">
                        <Input
                          type="date"
                          value={comm.date}
                          onChange={(e) => 
                            handleCommunicationChange(comm.id, 'date', e.target.value)
                          }
                          className="w-32 text-sm"
                        />
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                    </td>
                    <td className="p-2 text-center border">
                      <Button
                        onClick={() => removeCommunication(comm.id)}
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
      </CardContent>
    </Card>
  );
};

export default TCWGCommunicationsSection;
