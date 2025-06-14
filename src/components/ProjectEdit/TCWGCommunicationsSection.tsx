
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
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
  const defaultCommunications: CommunicationItem[] = [
    {
      id: '1',
      topic: 'The form, timing, and expected general content of communications',
      included: true,
      date: '06/07/2023'
    },
    {
      id: '2',
      topic: 'An overview of the planned scope and timing of the audit, including the significant risks identified during our risk assessment procedures',
      included: true,
      date: '06/07/2023'
    },
    {
      id: '3',
      topic: 'The identity and role of the partner',
      included: true,
      date: '06/07/2023'
    },
    {
      id: '4',
      topic: 'Our responsibilities in relation to the financial statement audit',
      included: true,
      date: '07/02/2023'
    }
  ];

  const communications = (formData as any).tcwg_communications || defaultCommunications;

  const handleCommunicationChange = (id: string, field: 'included' | 'date', value: boolean | string) => {
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
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          We communicate the following:
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="text-left p-4 font-medium">Topic</th>
                <th className="text-center p-4 font-medium">Included in our engagement letter?</th>
                <th className="text-center p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {communications.map((comm: CommunicationItem, index: number) => (
                <tr key={comm.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-4">
                    <div className="text-sm">
                      {comm.topic}
                      {comm.topic.includes('form') && (
                        <span className="text-red-600 underline"> form</span>
                      )}
                      {comm.topic.includes('significant risks') && (
                        <span className="text-red-600 underline"> significant risks</span>
                      )}
                      {comm.topic.includes('identity') && (
                        <span className="text-red-600 underline"> identity</span>
                      )}
                      {comm.topic.includes('role') && (
                        <span className="text-red-600 underline"> role</span>
                      )}
                      {comm.topic.includes('responsibilities') && (
                        <span className="text-red-600 underline"> responsibilities</span>
                      )}
                      {comm.topic.includes('financial statement audit') && (
                        <span className="text-red-600 underline"> financial statement audit</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Checkbox
                      checked={comm.included}
                      onCheckedChange={(checked) => 
                        handleCommunicationChange(comm.id, 'included', !!checked)
                      }
                    />
                  </td>
                  <td className="p-4 text-center">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TCWGCommunicationsSection;
