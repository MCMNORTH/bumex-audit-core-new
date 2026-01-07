import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Calendar, Upload, FileText, X, Download } from 'lucide-react';
import { ProjectFormData, CommunicationItem, InquiryItem, MeetingMinuteItem, TCWGResultsCommunicationItem } from '@/types/formData';
import DocumentAttachmentSection from './DocumentAttachmentSection';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { CommentableQuestion } from './Comments';
import { useTranslation } from '@/contexts/TranslationContext';

interface TCWGCommunicationsSectionProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

const TCWGCommunicationsSection = ({
  formData,
  onFormDataChange
}: TCWGCommunicationsSectionProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const communications = (formData as any).tcwg_communications || [];
  const mainAttachments = (formData as any).tcwg_main_attachments || [];
  const inquiries = (formData as any).tcwg_inquiries || [];
  const meetingMinutes = (formData as any).tcwg_meeting_minutes || [];
  const generateMeetingAgenda = (formData as any).tcwg_generate_meeting_agenda || false;
  const responsesUnsatisfactory = (formData as any).tcwg_responses_unsatisfactory || '';
  const resultsCommunications = (formData as any).tcwg_results_communications || [];
  const resultsAttachments = (formData as any).tcwg_results_attachments || [];
  const adequateCommunication = (formData as any).tcwg_adequate_communication || '';

  // Add upload states for meeting minutes attachments
  const [meetingMinuteUploads, setMeetingMinuteUploads] = React.useState<{[key: string]: {uploading: boolean, file: File | null}}>({});

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

  const handleMeetingMinuteChange = (id: string, field: keyof MeetingMinuteItem, value: string | boolean) => {
    const updatedMeetingMinutes = meetingMinutes.map((minute: MeetingMinuteItem) =>
      minute.id === id ? { ...minute, [field]: value } : minute
    );
    onFormDataChange({ tcwg_meeting_minutes: updatedMeetingMinutes } as any);
  };

  // New file upload handler for individual meeting minute attachments
  const handleMeetingMinuteFileUpload = async (minuteId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please select a PDF file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setMeetingMinuteUploads(prev => ({
      ...prev,
      [minuteId]: { uploading: true, file: null }
    }));

    try {
      const fileName = `tcwg-meeting-minutes/${formData.project_id || 'unknown'}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      handleMeetingMinuteChange(minuteId, 'attachment', downloadURL);
      setMeetingMinuteUploads(prev => ({
        ...prev,
        [minuteId]: { uploading: false, file }
      }));
      
      toast({
        title: 'File uploaded',
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setMeetingMinuteUploads(prev => ({
        ...prev,
        [minuteId]: { uploading: false, file: null }
      }));
      toast({
        title: 'Upload failed',
        description: 'Failed to upload the file. Please try again.',
        variant: 'destructive',
      });
    }

    // Reset the input
    event.target.value = '';
  };

  const handleRemoveMeetingMinuteFile = async (minuteId: string) => {
    const minute = meetingMinutes.find((m: MeetingMinuteItem) => m.id === minuteId);
    if (minute?.attachment && minute.attachment.startsWith('https://')) {
      try {
        const storageRef = ref(storage, minute.attachment);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting file from storage:', error);
      }
    }

    handleMeetingMinuteChange(minuteId, 'attachment', '');
    setMeetingMinuteUploads(prev => ({
      ...prev,
      [minuteId]: { uploading: false, file: null }
    }));
  };

  const handleDownloadMeetingMinuteFile = (attachment: string, fileName?: string) => {
    if (attachment) {
      window.open(attachment, '_blank');
    }
  };

  // New handlers for results communications
  const handleResultsCommunicationChange = (id: string, field: keyof TCWGResultsCommunicationItem, value: string | boolean) => {
    const updatedCommunications = resultsCommunications.map((comm: TCWGResultsCommunicationItem) =>
      comm.id === id ? { ...comm, [field]: value } : comm
    );
    onFormDataChange({ tcwg_results_communications: updatedCommunications } as any);
  };

  const addNewResultsCommunication = () => {
    const newCommunication: TCWGResultsCommunicationItem = {
      id: Date.now().toString(),
      communicationPerformed: '',
      writtenForm: false,
      oralForm: false,
      when: '',
      toWhom: '',
      byWhom: '',
      potentiallyApplicableCR: false
    };
    onFormDataChange({ tcwg_results_communications: [...resultsCommunications, newCommunication] } as any);
  };

  const removeResultsCommunication = (id: string) => {
    const updatedCommunications = resultsCommunications.filter((comm: TCWGResultsCommunicationItem) => comm.id !== id);
    onFormDataChange({ tcwg_results_communications: updatedCommunications } as any);
  };

  const handleResultsAttachmentsChange = (attachments: Array<{name: string, url: string, type: string}>) => {
    onFormDataChange({ tcwg_results_attachments: attachments } as any);
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

  const addNewMeetingMinute = () => {
    const newMeetingMinute: MeetingMinuteItem = {
      id: Date.now().toString(),
      bodyCommittee: '',
      dateOfMeeting: '',
      meetingMinutesAvailable: false,
      comments: '',
      attachment: ''
    };
    onFormDataChange({ tcwg_meeting_minutes: [...meetingMinutes, newMeetingMinute] } as any);
  };

  const removeMeetingMinute = (id: string) => {
    const updatedMeetingMinutes = meetingMinutes.filter((minute: MeetingMinuteItem) => minute.id !== id);
    onFormDataChange({ tcwg_meeting_minutes: updatedMeetingMinutes } as any);
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
    <CommentableQuestion fieldId="tcwg_main" label="TCWG Communications">
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

          <p className="text-sm text-gray-700 font-medium">
            Attach the signed engagement letter and any other documents relevant to understanding the terms of the audit.
          </p>

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
                    <th className="text-left p-4 font-medium border">Bumex interviewer(s)</th>
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
                            placeholder="Enter Bumex interviewer"
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

            {/* New section with checkbox and radio buttons */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={generateMeetingAgenda}
                  onCheckedChange={(checked) => 
                    onFormDataChange({ tcwg_generate_meeting_agenda: !!checked } as any)
                  }
                />
                <p className="text-sm text-gray-700">
                  Based on the selection made in the table above, we choose to generate and use the meeting agenda/questionnaire template(s) in order to document our inquiries:
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-700 font-medium">
                  Were any of the responses obtained and documented in the attachment(s) above inconsistent with our understanding of the entity or otherwise unsatisfactory?
                </p>
                
                <RadioGroup 
                  value={responsesUnsatisfactory} 
                  onValueChange={(value) => 
                    onFormDataChange({ tcwg_responses_unsatisfactory: value } as any)
                  }
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="yes" />
                    <Label htmlFor="yes" className="text-sm">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="no" />
                    <Label htmlFor="no" className="text-sm">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* New Meeting Minutes Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Read the meeting minutes of owners, management and TCWG
              </h3>
              <Button 
                onClick={addNewMeetingMinute}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              We read the meeting minutes of the following body/committee:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="text-left p-4 font-medium border">Body/Committee</th>
                    <th className="text-left p-4 font-medium border">Date of meeting</th>
                    <th className="text-center p-4 font-medium border">Meeting minutes available</th>
                    <th className="text-left p-4 font-medium border">Comments</th>
                    <th className="text-center p-4 font-medium border">Upload PDF</th>
                    <th className="text-center p-4 font-medium border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meetingMinutes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-12 text-gray-500 border">
                        No meeting minutes added yet. Click "Add" to create your first meeting minute entry.
                      </td>
                    </tr>
                  ) : (
                    meetingMinutes.map((minute: MeetingMinuteItem, index: number) => {
                      const uploadState = meetingMinuteUploads[minute.id];
                      const hasFile = minute.attachment && minute.attachment.length > 0;
                      
                      return (
                        <tr key={minute.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3 border">
                            <Input
                              value={minute.bodyCommittee}
                              onChange={(e) => handleMeetingMinuteChange(minute.id, 'bodyCommittee', e.target.value)}
                              placeholder="Enter body/committee"
                              className="text-sm"
                            />
                          </td>
                          <td className="p-3 border">
                            <DatePicker
                              value={minute.dateOfMeeting}
                              onChange={(date) => handleMeetingMinuteChange(minute.id, 'dateOfMeeting', date)}
                            />
                          </td>
                          <td className="p-6 text-center border">
                            <Checkbox
                              checked={minute.meetingMinutesAvailable}
                              onCheckedChange={(checked) => 
                                handleMeetingMinuteChange(minute.id, 'meetingMinutesAvailable', !!checked)
                              }
                            />
                          </td>
                          <td className="p-3 border">
                            <Textarea
                              value={minute.comments}
                              onChange={(e) => handleMeetingMinuteChange(minute.id, 'comments', e.target.value)}
                              placeholder="Enter comments..."
                              className="min-h-[60px] resize-none text-sm"
                            />
                          </td>
                          <td className="p-3 text-center border">
                            <div className="space-y-2">
                              {hasFile ? (
                                <div className="flex flex-col items-center space-y-1">
                                  <div className="flex items-center space-x-1 text-xs text-green-600">
                                    <FileText className="h-3 w-3" />
                                    <span>File uploaded</span>
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDownloadMeetingMinuteFile(minute.attachment)}
                                      className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                                      title="Download file"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveMeetingMinuteFile(minute.id)}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                      title="Remove file"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => handleMeetingMinuteFileUpload(minute.id, e)}
                                    className="hidden"
                                    id={`file-upload-${minute.id}`}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById(`file-upload-${minute.id}`)?.click()}
                                    disabled={uploadState?.uploading}
                                    className="text-xs"
                                  >
                                    <Upload className="h-3 w-3 mr-1" />
                                    {uploadState?.uploading ? 'Uploading...' : 'Upload PDF'}
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center border">
                            <Button
                              onClick={() => removeMeetingMinute(minute.id)}
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* New TCWG Results Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Communicate with Those Charged with Governance (TCWG), management and/or other parties, as applicable - Results
              </h3>
              <Button 
                onClick={addNewResultsCommunication}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Identify communications with TCWG, management, and others:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="text-left p-4 font-medium border">Communication performed</th>
                    <th className="text-center p-4 font-medium border">Written form</th>
                    <th className="text-center p-4 font-medium border">Oral form</th>
                    <th className="text-center p-4 font-medium border">When?</th>
                    <th className="text-left p-4 font-medium border">To whom?</th>
                    <th className="text-left p-4 font-medium border">By who?</th>
                    <th className="text-center p-4 font-medium border">Potentially applicable consultation requirement (CR)</th>
                    <th className="text-center p-4 font-medium border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsCommunications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-12 text-gray-500 border">
                        No communications added yet. Click "Add" to create your first communication.
                      </td>
                    </tr>
                  ) : (
                    resultsCommunications.map((comm: TCWGResultsCommunicationItem, index: number) => (
                      <tr key={comm.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-3 border">
                          <Textarea
                            value={comm.communicationPerformed}
                            onChange={(e) => handleResultsCommunicationChange(comm.id, 'communicationPerformed', e.target.value)}
                            placeholder="Enter communication performed..."
                            className="min-h-[60px] resize-none text-sm"
                          />
                        </td>
                        <td className="p-6 text-center border">
                          <Checkbox
                            checked={comm.writtenForm}
                            onCheckedChange={(checked) => 
                              handleResultsCommunicationChange(comm.id, 'writtenForm', !!checked)
                            }
                          />
                        </td>
                        <td className="p-6 text-center border">
                          <Checkbox
                            checked={comm.oralForm}
                            onCheckedChange={(checked) => 
                              handleResultsCommunicationChange(comm.id, 'oralForm', !!checked)
                            }
                          />
                        </td>
                        <td className="p-3 border">
                          <Input
                            type="date"
                            value={comm.when}
                            onChange={(e) => handleResultsCommunicationChange(comm.id, 'when', e.target.value)}
                            className="text-sm"
                          />
                        </td>
                        <td className="p-3 border">
                          <Input
                            value={comm.toWhom}
                            onChange={(e) => handleResultsCommunicationChange(comm.id, 'toWhom', e.target.value)}
                            placeholder="Enter recipient..."
                            className="text-sm"
                          />
                        </td>
                        <td className="p-3 border">
                          <Input
                            value={comm.byWhom}
                            onChange={(e) => handleResultsCommunicationChange(comm.id, 'byWhom', e.target.value)}
                            placeholder="Enter sender..."
                            className="text-sm"
                          />
                        </td>
                        <td className="p-6 text-center border">
                          <Checkbox
                            checked={comm.potentiallyApplicableCR}
                            onCheckedChange={(checked) => 
                              handleResultsCommunicationChange(comm.id, 'potentiallyApplicableCR', !!checked)
                            }
                          />
                        </td>
                        <td className="p-3 text-center border">
                          <Button
                            onClick={() => removeResultsCommunication(comm.id)}
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

            <div className="mt-6 space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox />
                <p className="text-sm text-gray-700">
                  When appropriate, attach a copy of the written communications or materials related to oral communications:
                </p>
              </div>

              <DocumentAttachmentSection
                title="Attachment"
                files={resultsAttachments}
                onFilesChange={handleResultsAttachmentsChange}
                projectId={formData.project_id || 'unknown'}
                storagePrefix="tcwg-results-attachments"
              />

              <div className="space-y-3">
                <p className="text-sm text-gray-700 font-medium">
                  Has the two-way communication between TCWG and us been adequate for the purpose of the audit?
                </p>
                
                <RadioGroup 
                  value={adequateCommunication} 
                  onValueChange={(value) => 
                    onFormDataChange({ tcwg_adequate_communication: value } as any)
                  }
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="adequate-yes" />
                    <Label htmlFor="adequate-yes" className="text-sm">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="adequate-no" />
                    <Label htmlFor="adequate-no" className="text-sm">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </CommentableQuestion>
  );
};

export default TCWGCommunicationsSection;
