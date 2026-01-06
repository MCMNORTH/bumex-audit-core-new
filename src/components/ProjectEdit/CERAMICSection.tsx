import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
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
                  <th className="text-left p-4 font-medium border">Bumex interviewer</th>
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
                          placeholder="Bumex interviewer"
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

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-700 mb-4">
              In determining whether inquiry alone is sufficient to obtain an understanding of the components of the entity's system of internal control, 
              determine whether any of the following circumstances exist. If at least one of the circumstances exist, perform more than inquiry.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ceramic-larger-entity"
                  checked={formData.ceramic_larger_entity || false}
                  onCheckedChange={(checked) => onFormDataChange({ ceramic_larger_entity: !!checked })}
                />
                <Label htmlFor="ceramic-larger-entity" className="text-sm">
                  Larger entity
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ceramic-more-complex"
                  checked={formData.ceramic_more_complex || false}
                  onCheckedChange={(checked) => onFormDataChange({ ceramic_more_complex: !!checked })}
                />
                <Label htmlFor="ceramic-more-complex" className="text-sm">
                  More complex entity
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ceramic-lack-knowledge"
                  checked={formData.ceramic_lack_knowledge || false}
                  onCheckedChange={(checked) => onFormDataChange({ ceramic_lack_knowledge: !!checked })}
                />
                <Label htmlFor="ceramic-lack-knowledge" className="text-sm">
                  Lack of existing knowledge of the entity's system of internal controls
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ceramic-planned-reliance"
                  checked={formData.ceramic_planned_reliance || false}
                  onCheckedChange={(checked) => onFormDataChange({ ceramic_planned_reliance: !!checked })}
                />
                <Label htmlFor="ceramic-planned-reliance" className="text-sm">
                  Planned reliance on the entity's control activities to reduce control risk
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ceramic-extensive-changes"
                  checked={formData.ceramic_extensive_changes || false}
                  onCheckedChange={(checked) => onFormDataChange({ ceramic_extensive_changes: !!checked })}
                />
                <Label htmlFor="ceramic-extensive-changes" className="text-sm">
                  Extensive changes to the entity's systems and operations based upon our understanding of the entity and its environment in 2.2 Risk assessment
                </Label>
              </div>
            </div>
          </div>

          <div>
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 w-full bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition-colors">
                <ChevronDown className="h-4 w-4" />
                <span className="font-medium">Control environment:</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4 p-4 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm mb-4">
                    The entity demonstrates a commitment to integrity and ethical values.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <span className="font-medium text-sm min-w-[80px]">Element 1</span>
                      <span className="text-sm">
                        Our understanding includes how management's oversight responsibilities are carried out, 
                        such as creating and maintaining the entity's culture.
                      </span>
                    </div>
                    
                    <div className="flex gap-4">
                      <span className="font-medium text-sm min-w-[80px]">Element 2</span>
                      <div className="text-sm space-y-2">
                        <p>
                          When those charged with governance are separate from management, those charged with 
                          governance (a) demonstrate independence from management, when appropriate, and (b) 
                          exercise oversight of the development and performance of internal control.
                        </p>
                        <p>
                          Our understanding includes the nature and extent of oversight and governance in place 
                          over management's process for making accounting estimates.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <span className="font-medium text-sm min-w-[80px]">Element 3</span>
                      <span className="text-sm">
                        Entity's management establishes, with board oversight, structures, reporting lines, and 
                        appropriate authorities and responsibilities in the pursuit of objectives.
                      </span>
                    </div>
                    
                    <div className="flex gap-4">
                      <span className="font-medium text-sm min-w-[80px]">Element 4</span>
                      <div className="text-sm space-y-2">
                        <p>
                          The entity demonstrates a commitment to attract, develop, and retain competent 
                          individuals in alignment with objectives.
                        </p>
                        <p>
                          Our understanding includes how management identifies the need for, and applies, 
                          specialized skills or knowledge related to accounting estimates, including with respect to 
                          the use of a specialist.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <span className="font-medium text-sm min-w-[80px]">Element 5</span>
                      <span className="text-sm">
                        The entity holds individuals accountable for their internal control responsibilities in the 
                        pursuit of objectives.
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <Label className="text-sm font-medium">
                      Document our understanding of the set of controls, processes and structures that address each element above.
                    </Label>
                    <Textarea
                      placeholder="Enter your documentation..."
                      value={formData.ceramic_control_environment_documentation || ''}
                      onChange={(e) => onFormDataChange({ ceramic_control_environment_documentation: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div>
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 w-full bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition-colors">
                <ChevronDown className="h-4 w-4" />
                <span className="font-medium">Risk Assessment:</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4 p-4 bg-gray-50 rounded-md">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="font-medium text-sm min-w-[80px]">Element 6</span>
                    <div className="text-sm space-y-2">
                      <p>
                        The entity specifies objectives with sufficient clarity to enable the identification and 
                        assessment of risks relating to objectives.
                      </p>
                      <p>
                        The objectives are those relevant to financial reporting objectives, including accounting 
                        estimates.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="font-medium text-sm min-w-[80px]">Element 7</span>
                    <div className="text-sm space-y-2">
                      <p>
                        The entity identifies risks to the achievement of its objectives and analyzes risks as a basis 
                        for determining how the risks should be managed.
                      </p>
                      <p>
                        These risks are business risks relevant to financial reporting objectives, including risks 
                        related to accounting estimates.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="font-medium text-sm min-w-[80px]">Element 8</span>
                    <div className="text-sm space-y-2">
                      <p>
                        The entity considers the potential for fraud in assessing risks to the achievement of 
                        objectives.
                      </p>
                      <p>
                        Our understanding includes the entity's process for considering the potential for fraud in 
                        accounting estimates, including the susceptibility of accounting estimates to management 
                        bias.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="font-medium text-sm min-w-[80px]">Element 9</span>
                    <div className="text-sm space-y-2">
                      <p>
                        The entity identifies and assesses changes that could significantly affect the system of 
                        internal control.
                      </p>
                      <p>
                        Our understanding includes the entity's process for assessing changes that could impact 
                        the entity's process for making accounting estimates.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <Label className="text-sm font-medium">
                      Document our understanding of the processes for each element above.
                    </Label>
                    <Textarea
                      placeholder="Enter your documentation..."
                      value={formData.ceramic_risk_assessment_documentation || ''}
                      onChange={(e) => onFormDataChange({ ceramic_risk_assessment_documentation: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div>
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 w-full bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition-colors">
                <ChevronDown className="h-4 w-4" />
                <span className="font-medium">Communication:</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4 p-4 bg-gray-50 rounded-md">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="font-medium text-sm min-w-[80px]">Element 10</span>
                    <span className="text-sm">
                      The entity communicates significant matters that support the preparation of the financial 
                      statements and related reporting responsibilities in the information system and other 
                      components of the system of internal control between people within the entity, including 
                      how financial reporting roles and responsibilities are communicated.
                    </span>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="font-medium text-sm min-w-[80px]">Element 11</span>
                    <span className="text-sm">
                      The entity communicates significant matters that support the preparation of the financial 
                      statements and related reporting responsibilities in the information system and other 
                      components of the system of internal control between management and those charged 
                      with governance.
                    </span>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="font-medium text-sm min-w-[80px]">Element 12</span>
                    <span className="text-sm">
                      The entity communicates significant matters that support the preparation of the financial 
                      statements and related reporting responsibilities in the information system and other 
                      components of the system of internal control to external parties such as regulatory bodies.
                    </span>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <Label className="text-sm font-medium">
                      Document our understanding of how the entity communicates each element above.
                    </Label>
                    <Textarea
                      placeholder="Enter your documentation..."
                      value={formData.ceramic_communication_documentation || ''}
                      onChange={(e) => onFormDataChange({ ceramic_communication_documentation: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div>
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 w-full bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition-colors">
                <ChevronDown className="h-4 w-4" />
                <span className="font-medium">Monitoring Activities:</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4 p-4 bg-gray-50 rounded-md">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="font-medium text-sm min-w-[80px]">Element 13</span>
                    <div className="text-sm space-y-2">
                      <p>
                        The entity selects, develops, and performs ongoing and/or separate evaluations to 
                        ascertain whether the components of internal control are present and functioning.
                      </p>
                      <p>
                        Our understanding includes the sources of the information used in the entity's process to 
                        monitor the system of internal control, and the basis upon which management considers 
                        the information to be sufficiently reliable for the purpose.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="font-medium text-sm min-w-[80px]">Element 14</span>
                    <span className="text-sm">
                      The entity evaluates and communicates internal control deficiencies in a timely manner to 
                      those parties responsible for taking corrective action.
                    </span>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <Label className="text-sm font-medium">
                      Document our understanding of the processes that address each element above.
                    </Label>
                    <Textarea
                      placeholder="Enter your documentation..."
                      value={formData.ceramic_monitoring_activities_documentation || ''}
                      onChange={(e) => onFormDataChange({ ceramic_monitoring_activities_documentation: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-6">Evaluate the CERAMIC Components</h3>
          
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium block mb-3">
                Have we identified any control deficiency(ies) based on the nature and complexity of the entity, including elements for which we were unable to obtain an understanding?
              </Label>
              <RadioGroup
                value={formData.ceramic_eval_control_deficiencies || ''}
                onValueChange={(value) => onFormDataChange({ ceramic_eval_control_deficiencies: value })}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="deficiencies-yes" />
                  <Label htmlFor="deficiencies-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="deficiencies-no" />
                  <Label htmlFor="deficiencies-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h4 className="font-medium text-base mb-4">Evaluate the Control environment component</h4>
              
              <div className="space-y-4 ml-4">
                <div>
                  <Label className="text-sm font-medium block mb-3">
                    Based on our understanding obtained from the control environment, has management, with the oversight of those charged with governance, created and maintained a culture of honesty and ethical behavior?
                  </Label>
                  <RadioGroup
                    value={formData.ceramic_eval_control_culture || ''}
                    onValueChange={(value) => onFormDataChange({ ceramic_eval_control_culture: value })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="culture-yes" />
                      <Label htmlFor="culture-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="culture-no" />
                      <Label htmlFor="culture-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium block mb-3">
                    Based on our understanding obtained, does the control environment provide an appropriate foundation for the other components of the entity's system of internal control considering the nature and complexity of the entity?
                  </Label>
                  <RadioGroup
                    value={formData.ceramic_eval_control_foundation || ''}
                    onValueChange={(value) => onFormDataChange({ ceramic_eval_control_foundation: value })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="foundation-yes" />
                      <Label htmlFor="foundation-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="foundation-no" />
                      <Label htmlFor="foundation-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-base mb-4">Evaluate the Risk Assessment component</h4>
              
              <div className="space-y-4 ml-4">
                <div>
                  <Label className="text-sm font-medium block mb-3">
                    Have we identified any risks of material misstatement that arise from business risks that were not identified by the entity's risk assessment process?
                  </Label>
                  <RadioGroup
                    value={formData.ceramic_eval_risk_identification || ''}
                    onValueChange={(value) => onFormDataChange({ ceramic_eval_risk_identification: value })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="risk-id-yes" />
                      <Label htmlFor="risk-id-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="risk-id-no" />
                      <Label htmlFor="risk-id-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium block mb-3">
                    Based on our understanding obtained, is the entity's risk assessment process appropriate to the entity's circumstances considering the nature and complexity of the entity?
                  </Label>
                  <RadioGroup
                    value={formData.ceramic_eval_risk_process || ''}
                    onValueChange={(value) => onFormDataChange({ ceramic_eval_risk_process: value })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="risk-process-yes" />
                      <Label htmlFor="risk-process-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="risk-process-no" />
                      <Label htmlFor="risk-process-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-base mb-4">Evaluate the Communication component</h4>
              
              <div className="space-y-4 ml-4">
                <div>
                  <Label className="text-sm font-medium block mb-3">
                    Based on our understanding obtained, do the entity's communications appropriately support the preparation of the entity's financial statements in accordance with the applicable financial reporting framework?
                  </Label>
                  <RadioGroup
                    value={formData.ceramic_eval_communication_support || ''}
                    onValueChange={(value) => onFormDataChange({ ceramic_eval_communication_support: value })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="comm-support-yes" />
                      <Label htmlFor="comm-support-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="comm-support-no" />
                      <Label htmlFor="comm-support-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-base mb-4">Evaluate the Monitoring component</h4>
              
              <div className="space-y-4 ml-4">
                <div>
                  <Label className="text-sm font-medium block mb-3">
                    Based on our understanding obtained, is the entity's process for monitoring the system of internal control appropriate to the entity's circumstances considering the nature and complexity of the entity?
                  </Label>
                  <RadioGroup
                    value={formData.ceramic_eval_monitoring_process || ''}
                    onValueChange={(value) => onFormDataChange({ ceramic_eval_monitoring_process: value })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="monitoring-process-yes" />
                      <Label htmlFor="monitoring-process-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="monitoring-process-no" />
                      <Label htmlFor="monitoring-process-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CERAMICSection;