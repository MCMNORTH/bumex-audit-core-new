
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { ProjectFormData } from '@/types/formData';
import DocumentAttachmentSection from './DocumentAttachmentSection';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

interface InquiryItem {
  id: string;
  intervieweeName: string;
  intervieweeRole: string;
  intervieweePosition: string;
  kpmgInterviewer: string;
  dateOfMeeting: string;
}

const TCWGCommunicationsSection = ({
  formData,
  onFormDataChange
}: TCWGCommunicationsSectionProps) => {
  const communications = (formData as any).tcwg_communications || [];
  const mainAttachments = (formData as any).tcwg_main_attachments || [];
  const inquiries = (formData as any).tcwg_inquiries || [];

  const handleCommunicationChange = (id: string, field: 'topic' | 'included' | 'date', value: boolean | string) => {
    const updatedCommunications = communications.map((comm: CommunicationItem) =>
      comm.id === id ? { ...comm, [field]: value } : comm
    );
    onFormDataChange({ tcwg_communications: updatedCommunications } as any);
  };

  const handleMainAttachmentsChange = (attachments: Array<{name: string, url: string, type: string}>) => {
    onFormDataChange({ tcwg_main_attachments: attachments } as any);
  };

  const handleInquiryChange = (id: string, field: keyof InquiryItem, value: string) => {
    const updatedInquiries = inquiries.map((inquiry: InquiryItem) =>
      inquiry.id === id ? { ...inquiry, [field]: value } : inquiry
    );
    onFormDataChange({ tcwg_inquiries: updatedInquiries } as any);
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

  const addNewInquiry = () => {
    const newInquiry: InquiryItem = {
      id: Date.now().toString(),
      intervieweeName: '',
      intervieweeRole: '',
      intervieweePosition: '',
      kpmgInterviewer: '',
      dateOfMeeting: ''
    };
    onFormDataChange({ tcwg_inquiries: [...inquiries, newInquiry] } as any);
  };

  const removeInquiry = (id: string) => {
    const updatedInquiries = inquiries.filter((inquiry: InquiryItem) => inquiry.id !== id);
    onFormDataChange({ tcwg_inquiries: updatedInquiries } as any);
  };

  const DatePicker = ({ value, onChange }: { value: string, onChange: (date: string) => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectedDate = value ? new Date(value) : undefined;

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        onChange(format(date, 'dd/MM/yyyy'));
        setIsOpen(false);
      }
    };

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {value || "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    );
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
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            We communicate the following:
          </p>
          <p className="text-sm text-gray-700 font-medium">
            Attach the signed engagement letter and any other documents relevant to understanding the terms of the audit.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="text-left p-6 font-medium border">Topic</th>
                  <th className="text-center p-6 font-medium border">Included in our engagement letter?</th>
                  <th className="text-center p-6 font-medium border">Date</th>
                  <th className="text-center p-6 font-medium border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {communications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-12 text-gray-500 border">
                      No communications added yet. Click "Add" to create your first communication item.
                    </td>
                  </tr>
                ) : (
                  communications.map((comm: CommunicationItem, index: number) => (
                    <tr key={comm.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-4 border">
                        <Textarea
                          value={comm.topic}
                          onChange={(e) => handleCommunicationChange(comm.id, 'topic', e.target.value)}
                          placeholder="Enter communication topic..."
                          className="min-h-[80px] resize-none"
                        />
                      </td>
                      <td className="p-6 text-center border">
                        <Checkbox
                          checked={comm.included}
                          onCheckedChange={(checked) => 
                            handleCommunicationChange(comm.id, 'included', !!checked)
                          }
                        />
                      </td>
                      <td className="p-4 text-center border">
                        <Input
                          type="date"
                          value={comm.date}
                          onChange={(e) => 
                            handleCommunicationChange(comm.id, 'date', e.target.value)
                          }
                          className="w-36 text-sm"
                        />
                      </td>
                      <td className="p-4 text-center border">
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

          <DocumentAttachmentSection
            title="Attachment"
            files={mainAttachments}
            onFilesChange={handleMainAttachmentsChange}
            projectId={formData.project_id || 'unknown'}
            storagePrefix="tcwg-main-attachments"
          />

          {communications.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start space-x-2">
                <Checkbox className="mt-1" />
                <p className="text-sm text-blue-800">
                  When appropriate, attach a copy of either (i) written communications, (ii) materials related to oral communications (including when and to whom it was communicated) and/or (ii) matter not covered by our engagement.
                </p>
              </div>
            </div>
          )}

          {/* New Inquiries Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Inquiries of Those Charged with Governance (TCWG), management and others about RMMs
              </h3>
              <Button 
                onClick={addNewInquiry}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              We inquired of the following person(s) or organization(s):
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="text-left p-4 font-medium border">Interviewee name</th>
                    <th className="text-left p-4 font-medium border">Interviewee role</th>
                    <th className="text-left p-4 font-medium border">Interviewee position</th>
                    <th className="text-left p-4 font-medium border">KPMG interviewer(s)</th>
                    <th className="text-left p-4 font-medium border">Date of meeting</th>
                    <th className="text-center p-4 font-medium border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-12 text-gray-500 border">
                        No inquiries added yet. Click "Add" to create your first inquiry.
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((inquiry: InquiryItem, index: number) => (
                      <tr key={inquiry.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-3 border">
                          <Input
                            value={inquiry.intervieweeName}
                            onChange={(e) => handleInquiryChange(inquiry.id, 'intervieweeName', e.target.value)}
                            placeholder="Enter interviewee name"
                            className="text-sm"
                          />
                        </td>
                        <td className="p-3 border">
                          <Input
                            value={inquiry.intervieweeRole}
                            onChange={(e) => handleInquiryChange(inquiry.id, 'intervieweeRole', e.target.value)}
                            placeholder="Enter role"
                            className="text-sm"
                          />
                        </td>
                        <td className="p-3 border">
                          <Input
                            value={inquiry.intervieweePosition}
                            onChange={(e) => handleInquiryChange(inquiry.id, 'intervieweePosition', e.target.value)}
                            placeholder="Enter position"
                            className="text-sm"
                          />
                        </td>
                        <td className="p-3 border">
                          <Input
                            value={inquiry.kpmgInterviewer}
                            onChange={(e) => handleInquiryChange(inquiry.id, 'kpmgInterviewer', e.target.value)}
                            placeholder="Enter KPMG interviewer"
                            className="text-sm"
                          />
                        </td>
                        <td className="p-3 border">
                          <DatePicker
                            value={inquiry.dateOfMeeting}
                            onChange={(date) => handleInquiryChange(inquiry.id, 'dateOfMeeting', date)}
                          />
                        </td>
                        <td className="p-3 text-center border">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default TCWGCommunicationsSection;
