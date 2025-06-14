
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from 'lucide-react';
import { Client, User, Project } from '@/types';
import FileUploadSection from './FileUploadSection';

interface FormData {
  client_id: string;
  engagement_name: string;
  engagement_id: string;
  project_id: string;
  assigned_to: string[];
  status: Project['status'];
  period_start: string;
  period_end: string;
  expected_start_date: string;
  audit_type: string;
  jurisdiction: string;
  bumex_office: string;
  language: string;
  is_first_audit: boolean;
  plan_to_roll_forward: boolean;
  enable_external_documents: boolean;
  engagement_structure_file: string;
}

interface EngagementProfileSectionProps {
  formData: FormData;
  clients: Client[];
  users: User[];
  uploadedFile: File | null;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  onFormDataChange: (updates: Partial<FormData>) => void;
  onAssignmentChange: (userId: string, checked: boolean) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onDownloadFile: () => void;
}

const EngagementProfileSection = ({
  formData,
  clients,
  users,
  uploadedFile,
  uploadStatus,
  onFormDataChange,
  onAssignmentChange,
  onFileUpload,
  onRemoveFile,
  onDownloadFile
}: EngagementProfileSectionProps) => {
  const auditTypes = [
    'Financial Audit',
    'Compliance Audit',
    'Operational Audit',
    'IT Audit',
    'Internal Audit',
    'Tax Audit',
    'Forensic Audit',
    'Environmental Audit'
  ];

  const languages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Other'];
  const bumexOffices = ['Nouakchott'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_id">Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => onFormDataChange({ client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onFormDataChange({ status: value as Project['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="engagement_name">Engagement Name</Label>
            <Input
              id="engagement_name"
              value={formData.engagement_name}
              onChange={(e) => onFormDataChange({ engagement_name: e.target.value })}
              placeholder="Enter engagement name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="engagement_id">Engagement ID</Label>
              <Input
                id="engagement_id"
                value={formData.engagement_id}
                onChange={(e) => onFormDataChange({ engagement_id: e.target.value })}
                placeholder="Enter engagement ID"
              />
            </div>
            <div>
              <Label htmlFor="project_id">Project ID</Label>
              <Input
                id="project_id"
                value={formData.project_id}
                onChange={(e) => onFormDataChange({ project_id: e.target.value })}
                placeholder="Enter project ID"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="audit_type">Audit Type</Label>
              <Select
                value={formData.audit_type}
                onValueChange={(value) => onFormDataChange({ audit_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audit type" />
                </SelectTrigger>
                <SelectContent>
                  {auditTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => onFormDataChange({ language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input
                id="jurisdiction"
                value={formData.jurisdiction}
                onChange={(e) => onFormDataChange({ jurisdiction: e.target.value })}
                placeholder="Enter jurisdiction"
              />
            </div>
            <div>
              <Label htmlFor="bumex_office">BUMEX Office</Label>
              <Select
                value={formData.bumex_office}
                onValueChange={(value) => onFormDataChange({ bumex_office: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select BUMEX office" />
                </SelectTrigger>
                <SelectContent>
                  {bumexOffices.map((office) => (
                    <SelectItem key={office} value={office}>
                      {office}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="period_start">Period Start</Label>
              <Input
                id="period_start"
                type="date"
                value={formData.period_start}
                onChange={(e) => onFormDataChange({ period_start: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="period_end">Period End</Label>
              <Input
                id="period_end"
                type="date"
                value={formData.period_end}
                onChange={(e) => onFormDataChange({ period_end: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="expected_start_date">Expected start date</Label>
              <div className="relative">
                <Input
                  id="expected_start_date"
                  type="date"
                  value={formData.expected_start_date}
                  onChange={(e) => onFormDataChange({ expected_start_date: e.target.value })}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_first_audit"
                checked={formData.is_first_audit}
                onCheckedChange={(checked) => onFormDataChange({ is_first_audit: checked as boolean })}
              />
              <Label htmlFor="is_first_audit">First-time audit</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="plan_to_roll_forward"
                checked={formData.plan_to_roll_forward}
                onCheckedChange={(checked) => onFormDataChange({ plan_to_roll_forward: checked as boolean })}
              />
              <Label htmlFor="plan_to_roll_forward">Plan to roll forward an engagement</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable_external_documents"
                checked={formData.enable_external_documents}
                onCheckedChange={(checked) => onFormDataChange({ enable_external_documents: checked as boolean })}
              />
              <Label htmlFor="enable_external_documents">Enable the ability to receive external documents</Label>
            </div>
          </div>

          <FileUploadSection
            uploadedFile={uploadedFile}
            uploadStatus={uploadStatus}
            onFileUpload={onFileUpload}
            onRemoveFile={onRemoveFile}
            onDownloadFile={onDownloadFile}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox
                  id={user.id}
                  checked={formData.assigned_to.includes(user.id)}
                  onCheckedChange={(checked) => onAssignmentChange(user.id, checked as boolean)}
                />
                <Label htmlFor={user.id} className="text-sm">
                  {user.first_name} {user.last_name} ({user.role})
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngagementProfileSection;
