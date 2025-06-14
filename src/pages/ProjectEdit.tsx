
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, updateDoc, getDocs, collection, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Project, Client, User } from '@/types';
import { ArrowLeft, Save, Calendar, Upload, X, FileText, Download } from 'lucide-react';

const ProjectEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('engagement-profile');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState({
    client_id: '',
    engagement_name: '',
    engagement_id: '',
    project_id: '',
    assigned_to: [] as string[],
    status: 'new' as Project['status'],
    period_start: '',
    period_end: '',
    expected_start_date: '',
    audit_type: '',
    jurisdiction: '',
    bumex_office: '',
    language: 'English',
    is_first_audit: false,
    plan_to_roll_forward: false,
    enable_external_documents: false,
    engagement_structure_file: '',
  });

  const sidebarSections = [
    { id: 'engagement-profile', title: 'Engagement Profile', active: true },
    { id: 'team-assignment', title: 'Team Assignment', active: false },
    { id: 'timeline', title: 'Timeline & Milestones', active: false },
    { id: 'documentation', title: 'Documentation', active: false },
    { id: 'risk-assessment', title: 'Risk Assessment', active: false },
    { id: 'planning', title: 'Audit Planning', active: false },
  ];

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

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      // Fetch project
      const projectDoc = await getDoc(doc(db, 'projects', id!));
      if (!projectDoc.exists()) {
        toast({
          title: 'Error',
          description: 'Project not found',
          variant: 'destructive',
        });
        navigate('/projects');
        return;
      }

      const projectData = {
        id: projectDoc.id,
        ...projectDoc.data(),
        created_at: projectDoc.data().created_at?.toDate() || new Date(),
        period_start: projectDoc.data().period_start?.toDate() || new Date(),
        period_end: projectDoc.data().period_end?.toDate() || new Date(),
      } as Project;

      setProject(projectData);
      setFormData({
        client_id: projectData.client_id,
        engagement_name: projectData.engagement_name,
        engagement_id: projectData.engagement_id,
        project_id: projectData.project_id || '',
        assigned_to: projectData.assigned_to,
        status: projectData.status,
        period_start: projectData.period_start.toISOString().split('T')[0],
        period_end: projectData.period_end.toISOString().split('T')[0],
        expected_start_date: projectData.period_start.toISOString().split('T')[0],
        audit_type: projectData.audit_type,
        jurisdiction: projectData.jurisdiction,
        bumex_office: projectData.bumex_office || '',
        language: projectData.language,
        is_first_audit: projectData.is_first_audit,
        plan_to_roll_forward: false,
        enable_external_documents: false,
        engagement_structure_file: (projectData as any).engagement_structure_file || '',
      });

      // If there's an existing file, set the upload status and create a mock file object for display
      if ((projectData as any).engagement_structure_file) {
        setUploadStatus('success');
        // Extract filename from URL for display purposes
        const url = (projectData as any).engagement_structure_file;
        const fileName = url.split('/').pop()?.split('?')[0] || 'engagement-structure.pdf';
        const displayName = fileName.includes('-') ? fileName.split('-').slice(1).join('-') : fileName;
        setUploadedFile({ name: displayName } as File);
      }

      // Fetch clients and users
      const [clientsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'clients'))),
        getDocs(query(collection(db, 'users')))
      ]);

      setClients(clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Client));
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User));
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch project data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please select a PDF file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadStatus('uploading');
    
    try {
      // Create a reference to the file in Firebase Storage
      const fileName = `engagement-structures/${id}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      setUploadedFile(file);
      setUploadStatus('success');
      setFormData(prev => ({
        ...prev,
        engagement_structure_file: downloadURL
      }));
      
      toast({
        title: 'File uploaded',
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
      toast({
        title: 'Upload failed',
        description: 'Failed to upload the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFile = async () => {
    if (formData.engagement_structure_file && formData.engagement_structure_file.startsWith('https://')) {
      try {
        // Delete the file from Firebase Storage
        const storageRef = ref(storage, formData.engagement_structure_file);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting file from storage:', error);
        // Continue with removing the reference even if storage deletion fails
      }
    }

    setUploadedFile(null);
    setUploadStatus('idle');
    setFormData(prev => ({
      ...prev,
      engagement_structure_file: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadFile = () => {
    if (formData.engagement_structure_file) {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = formData.engagement_structure_file;
      link.download = uploadedFile?.name || 'engagement-structure.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        ...formData,
        period_start: new Date(formData.period_start),
        period_end: new Date(formData.period_end),
        expected_start_date: new Date(formData.expected_start_date),
      };

      await updateDoc(doc(db, 'projects', id!), updateData);
      
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignmentChange = (userId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: checked 
        ? [...prev.assigned_to, userId]
        : prev.assigned_to.filter(id => id !== userId)
    }));
  };

  const selectedClient = clients.find(c => c.id === formData.client_id);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/projects')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <div>
            <h2 className="font-semibold text-gray-900 truncate">{project?.engagement_name}</h2>
            <p className="text-sm text-gray-500">{project?.engagement_id}</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarSections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeSection === 'engagement-profile' && 'Engagement Profile'}
                  {activeSection === 'team-assignment' && 'Team Assignment'}
                  {activeSection === 'timeline' && 'Timeline & Milestones'}
                  {activeSection === 'documentation' && 'Documentation'}
                  {activeSection === 'risk-assessment' && 'Risk Assessment'}
                  {activeSection === 'planning' && 'Audit Planning'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {selectedClient?.name} • {formData.audit_type}
                </p>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {activeSection === 'engagement-profile' && (
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
                          onValueChange={(value) => setFormData({ ...formData, client_id: value })}
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
                          onValueChange={(value) => setFormData({ ...formData, status: value as Project['status'] })}
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
                        onChange={(e) => setFormData({ ...formData, engagement_name: e.target.value })}
                        placeholder="Enter engagement name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="engagement_id">Engagement ID</Label>
                        <Input
                          id="engagement_id"
                          value={formData.engagement_id}
                          onChange={(e) => setFormData({ ...formData, engagement_id: e.target.value })}
                          placeholder="Enter engagement ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="project_id">Project ID</Label>
                        <Input
                          id="project_id"
                          value={formData.project_id}
                          onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                          placeholder="Enter project ID"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="audit_type">Audit Type</Label>
                        <Select
                          value={formData.audit_type}
                          onValueChange={(value) => setFormData({ ...formData, audit_type: value })}
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
                          onValueChange={(value) => setFormData({ ...formData, language: value })}
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
                          onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                          placeholder="Enter jurisdiction"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bumex_office">BUMEX Office</Label>
                        <Select
                          value={formData.bumex_office}
                          onValueChange={(value) => setFormData({ ...formData, bumex_office: value })}
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
                          onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="period_end">Period End</Label>
                        <Input
                          id="period_end"
                          type="date"
                          value={formData.period_end}
                          onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expected_start_date">Expected start date</Label>
                        <div className="relative">
                          <Input
                            id="expected_start_date"
                            type="date"
                            value={formData.expected_start_date}
                            onChange={(e) => setFormData({ ...formData, expected_start_date: e.target.value })}
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
                          onCheckedChange={(checked) => setFormData({ ...formData, is_first_audit: checked as boolean })}
                        />
                        <Label htmlFor="is_first_audit">First-time audit</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="plan_to_roll_forward"
                          checked={formData.plan_to_roll_forward}
                          onCheckedChange={(checked) => setFormData({ ...formData, plan_to_roll_forward: checked as boolean })}
                        />
                        <Label htmlFor="plan_to_roll_forward">Plan to roll forward an engagement</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="enable_external_documents"
                          checked={formData.enable_external_documents}
                          onCheckedChange={(checked) => setFormData({ ...formData, enable_external_documents: checked as boolean })}
                        />
                        <Label htmlFor="enable_external_documents">Enable the ability to receive external documents</Label>
                      </div>
                    </div>

                    <div>
                      <Label>Select engagement structure</Label>
                      <div className="mt-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".pdf"
                          className="hidden"
                        />
                        
                        {!uploadedFile ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleUploadClick}
                            disabled={uploadStatus === 'uploading'}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload PDF'}
                          </Button>
                        ) : (
                          <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700 flex-1">{uploadedFile.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleDownloadFile}
                              className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                              title="Download file"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveFile}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              title="Remove file"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
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
                            onCheckedChange={(checked) => handleAssignmentChange(user.id, checked as boolean)}
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
            )}

            {activeSection !== 'engagement-profile' && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">This section is under development</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEdit;
