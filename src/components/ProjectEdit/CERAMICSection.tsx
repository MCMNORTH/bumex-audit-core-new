import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProjectFormData } from '@/types/formData';

interface CERAMICSectionProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

const CERAMICSection: React.FC<CERAMICSectionProps> = ({ formData, onFormDataChange }) => {
  const addInquiry = () => {
    const newInquiry = {
      id: Date.now().toString(),
      dateOfInquiry: '',
      intervieweeName: '',
      intervieweeRole: '',
      kpmgInterviewer: '',
      ceramicComponents: '',
      controlAssessment: ''
    };
    
    onFormDataChange({
      ceramic_inquiries: [...(formData.ceramic_inquiries || []), newInquiry]
    });
  };

  const removeInquiry = (id: string) => {
    onFormDataChange({
      ceramic_inquiries: formData.ceramic_inquiries?.filter(inquiry => inquiry.id !== id) || []
    });
  };

  const updateInquiry = (id: string, field: string, value: string) => {
    onFormDataChange({
      ceramic_inquiries: formData.ceramic_inquiries?.map(inquiry => 
        inquiry.id === id ? { ...inquiry, [field]: value } : inquiry
      ) || []
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Obtain an understanding of the CERAMIC components
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">
            Are those charged with governance separate from management (at least one member of those charged with governance is not a member of management)?
          </Label>
          <RadioGroup
            value={formData.ceramic_governance_separate || ''}
            onValueChange={(value) => onFormDataChange({ ceramic_governance_separate: value })}
            className="flex gap-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="governance-yes" />
              <Label htmlFor="governance-yes">YES</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="governance-no" />
              <Label htmlFor="governance-no">NO</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium">Document inquiries performed to obtain an understanding of the CERAMIC components</Label>
            <Button 
              onClick={addInquiry}
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
                  <th className="text-left p-4 font-medium border">Date of inquiry</th>
                  <th className="text-left p-4 font-medium border">Interviewee name</th>
                  <th className="text-left p-4 font-medium border">Interviewee role</th>
                  <th className="text-left p-4 font-medium border">KPMG interviewer</th>
                  <th className="text-left p-4 font-medium border">CERAMIC Components</th>
                  <th className="text-left p-4 font-medium border">Control assessment</th>
                  <th className="text-center p-4 font-medium border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.ceramic_inquiries?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-12 text-gray-500 border">
                      No inquiries added yet. Click "Add" to create your first inquiry entry.
                    </td>
                  </tr>
                ) : (
                  formData.ceramic_inquiries?.map((inquiry, index) => (
                    <tr key={inquiry.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3 border">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !inquiry.dateOfInquiry && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {inquiry.dateOfInquiry ? format(new Date(inquiry.dateOfInquiry), "dd/MM/yyyy") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={inquiry.dateOfInquiry ? new Date(inquiry.dateOfInquiry) : undefined}
                              onSelect={(date) => updateInquiry(inquiry.id, 'dateOfInquiry', date?.toISOString() || '')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="p-3 border">
                        <Input
                          value={inquiry.intervieweeName}
                          onChange={(e) => updateInquiry(inquiry.id, 'intervieweeName', e.target.value)}
                          placeholder="Interviewee name"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3 border">
                        <Input
                          value={inquiry.intervieweeRole}
                          onChange={(e) => updateInquiry(inquiry.id, 'intervieweeRole', e.target.value)}
                          placeholder="Role"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3 border">
                        <Input
                          value={inquiry.kpmgInterviewer}
                          onChange={(e) => updateInquiry(inquiry.id, 'kpmgInterviewer', e.target.value)}
                          placeholder="KPMG interviewer"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3 border">
                        <Input
                          value={inquiry.ceramicComponents}
                          onChange={(e) => updateInquiry(inquiry.id, 'ceramicComponents', e.target.value)}
                          placeholder="CERAMIC components"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3 border">
                        <Input
                          value={inquiry.controlAssessment}
                          onChange={(e) => updateInquiry(inquiry.id, 'controlAssessment', e.target.value)}
                          placeholder="Control assessment"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-4 text-center border">
                        <Button
                          onClick={() => removeInquiry(inquiry.id)}
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

export default CERAMICSection;