
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ITEnvironmentSectionProps {
  formData: {
    it_plan_to_rely_on_automated_controls: string;
    it_plan_benchmarking_strategy: string;
    it_key_members_inquired: string;
    it_interviewees: Array<{
      id: string;
      intervieweeName: string;
      intervieweePosition: string;
      bumexInterviewers: string;
      dateOfMeeting: string;
    }>;
    it_systems_layers: Array<{
      id: string;
      itLayers: string;
      description: string;
      layerType: string;
      financialReporting: string;
      process: string;
      outsourced: boolean;
    }>;
    it_systems_documentation: string;
    it_attach_documentation: boolean;
    it_documentation_details: string;
  };
  onFormDataChange: (updates: any) => void;
}

const ITEnvironmentSection = ({ formData, onFormDataChange }: ITEnvironmentSectionProps) => {
  const addInterviewee = () => {
    const newInterviewee = {
      id: Date.now().toString(),
      intervieweeName: '',
      intervieweePosition: '',
      bumexInterviewers: '',
      dateOfMeeting: '',
    };
    
    onFormDataChange({
      it_interviewees: [...(formData.it_interviewees || []), newInterviewee]
    });
  };

  const updateInterviewee = (id: string, field: string, value: string) => {
    const updatedInterviewees = (formData.it_interviewees || []).map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onFormDataChange({ it_interviewees: updatedInterviewees });
  };

  const deleteInterviewee = (id: string) => {
    const updatedInterviewees = (formData.it_interviewees || []).filter(item => item.id !== id);
    onFormDataChange({ it_interviewees: updatedInterviewees });
  };

  const addSystemLayer = () => {
    const newLayer = {
      id: Date.now().toString(),
      itLayers: '',
      description: '',
      layerType: '',
      financialReporting: '',
      process: '',
      outsourced: false,
    };
    
    onFormDataChange({
      it_systems_layers: [...(formData.it_systems_layers || []), newLayer]
    });
  };

  const updateSystemLayer = (id: string, field: string, value: string | boolean) => {
    const updatedLayers = (formData.it_systems_layers || []).map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onFormDataChange({ it_systems_layers: updatedLayers });
  };

  const deleteSystemLayer = (id: string) => {
    const updatedLayers = (formData.it_systems_layers || []).filter(item => item.id !== id);
    onFormDataChange({ it_systems_layers: updatedLayers });
  };

  return (
    <div className="space-y-6">
      <h4 className="font-medium text-gray-900 mb-4">Understand the entity's IT organization and IT systems</h4>
        
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Do you plan to rely on automated controls?</Label>
          <RadioGroup
            value={formData.it_plan_to_rely_on_automated_controls || ''}
            onValueChange={(value) => onFormDataChange({ it_plan_to_rely_on_automated_controls: value })}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="it-rely-automated-yes" />
              <Label htmlFor="it-rely-automated-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="it-rely-automated-no" />
              <Label htmlFor="it-rely-automated-no" className="text-sm">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-medium">Do you plan to take the benchmarking strategy for testing automated controls?</Label>
          <RadioGroup
            value={formData.it_plan_benchmarking_strategy || ''}
            onValueChange={(value) => onFormDataChange({ it_plan_benchmarking_strategy: value })}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="it-benchmarking-yes" />
              <Label htmlFor="it-benchmarking-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="it-benchmarking-no" />
              <Label htmlFor="it-benchmarking-no" className="text-sm">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="it-key-members" className="text-sm font-medium">We inquired of the following key members of IT organization primarily responsible for the IT environment:</Label>
          <Textarea
            id="it-key-members"
            value={formData.it_key_members_inquired || ''}
            onChange={(e) => onFormDataChange({ it_key_members_inquired: e.target.value })}
            className="mt-2"
            rows={4}
          />
        </div>

        {/* Interviewees Table */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-medium">IT Organization Interviewees</Label>
            <Button onClick={addInterviewee} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Interviewee
            </Button>
          </div>
          
          {(formData.it_interviewees || []).length > 0 && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Interviewee Name</TableHead>
                    <TableHead>Interviewee Position</TableHead>
                    <TableHead>Bumex Interviewers</TableHead>
                    <TableHead>Date of Meeting</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(formData.it_interviewees || []).map((interviewee) => (
                    <TableRow key={interviewee.id}>
                      <TableCell>
                        <Input
                          value={interviewee.intervieweeName}
                          onChange={(e) => updateInterviewee(interviewee.id, 'intervieweeName', e.target.value)}
                          placeholder="Enter interviewee name"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={interviewee.intervieweePosition}
                          onChange={(e) => updateInterviewee(interviewee.id, 'intervieweePosition', e.target.value)}
                          placeholder="Enter position"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={interviewee.bumexInterviewers}
                          onChange={(e) => updateInterviewee(interviewee.id, 'bumexInterviewers', e.target.value)}
                          placeholder="Enter Bumex interviewers"
                        />
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !interviewee.dateOfMeeting && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {interviewee.dateOfMeeting ? format(new Date(interviewee.dateOfMeeting), "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={interviewee.dateOfMeeting ? new Date(interviewee.dateOfMeeting) : undefined}
                              onSelect={(date) => updateInterviewee(interviewee.id, 'dateOfMeeting', date ? date.toISOString() : '')}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteInterviewee(interviewee.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* IT Layers Documentation */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Document the IT layer(s) (including the title and version) that comprise the IT systems used by the entity as part of their financial reporting and business processes, including the process(es) using each IT system(s) (by IT layer), and indication of outsourcing:
          </Label>
          
          <div className="flex justify-between items-center mb-3">
            <span></span>
            <Button onClick={addSystemLayer} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add IT Layer
            </Button>
          </div>
          
          {(formData.it_systems_layers || []).length > 0 && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>IT Layer(s)</TableHead>
                    <TableHead>Description of IT system layer</TableHead>
                    <TableHead>Layer type</TableHead>
                    <TableHead>Financial Reporting</TableHead>
                    <TableHead>Process</TableHead>
                    <TableHead>Outsourced</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(formData.it_systems_layers || []).map((layer) => (
                    <TableRow key={layer.id}>
                      <TableCell>
                        <Input
                          value={layer.id}
                          onChange={(e) => updateSystemLayer(layer.id, 'id', e.target.value)}
                          placeholder="Enter ID"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={layer.itLayers}
                          onChange={(e) => updateSystemLayer(layer.id, 'itLayers', e.target.value)}
                          placeholder="Enter IT layers"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={layer.description}
                          onChange={(e) => updateSystemLayer(layer.id, 'description', e.target.value)}
                          placeholder="Enter description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={layer.layerType}
                          onChange={(e) => updateSystemLayer(layer.id, 'layerType', e.target.value)}
                          placeholder="Enter layer type"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={layer.financialReporting}
                          onChange={(e) => updateSystemLayer(layer.id, 'financialReporting', e.target.value)}
                          placeholder="Enter financial reporting"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={layer.process}
                          onChange={(e) => updateSystemLayer(layer.id, 'process', e.target.value)}
                          placeholder="Enter process"
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={layer.outsourced}
                          onCheckedChange={(checked) => updateSystemLayer(layer.id, 'outsourced', checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSystemLayer(layer.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* IT Systems Documentation */}
        <div>
          <Label htmlFor="it-systems-doc" className="text-sm font-medium mb-2 block">
            Document the IT system(s) comprised by the above IT layer(s), the purpose of each IT system, components using these IT system(s), indication of customization and/or changes (including parameters or settings), extent of outsourcing and any other relevant information.
          </Label>
          <Textarea
            id="it-systems-doc"
            value={formData.it_systems_documentation || ''}
            onChange={(e) => onFormDataChange({ it_systems_documentation: e.target.value })}
            rows={4}
            placeholder="Enter IT systems documentation..."
          />
        </div>

        {/* Attach Documentation */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="attach-it-docs"
              checked={formData.it_attach_documentation || false}
              onCheckedChange={(checked) => onFormDataChange({ it_attach_documentation: checked === true })}
            />
            <Label htmlFor="attach-it-docs" className="text-sm font-medium">
              Check if we choose to attach documentation related to our understanding of IT systems, such as IT Systems Diagrams (ISD).
            </Label>
          </div>
          
          {formData.it_attach_documentation && (
            <Textarea
              value={formData.it_documentation_details || ''}
              onChange={(e) => onFormDataChange({ it_documentation_details: e.target.value })}
              placeholder="Enter documentation details..."
              rows={3}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ITEnvironmentSection;
