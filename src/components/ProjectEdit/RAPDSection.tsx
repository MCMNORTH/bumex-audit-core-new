import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProjectFormData } from '@/types/formData';

interface RAPDSectionProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

const RAPDSection: React.FC<RAPDSectionProps> = ({ formData, onFormDataChange }) => {
  const addTeamMember = () => {
    const newMember = {
      id: Date.now().toString(),
      member: '',
      role: '',
      attendedMeeting: false,
      documentMatters: ''
    };
    
    onFormDataChange({
      rapd_team_members: [...(formData.rapd_team_members || []), newMember]
    });
  };

  const removeTeamMember = (id: string) => {
    onFormDataChange({
      rapd_team_members: formData.rapd_team_members?.filter(member => member.id !== id) || []
    });
  };

  const updateTeamMember = (id: string, field: string, value: string | boolean) => {
    onFormDataChange({
      rapd_team_members: formData.rapd_team_members?.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      ) || []
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Discuss matters affecting the identification and assessment of RMMs among the engagement team
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="meeting-date" className="text-sm font-medium">Date of meeting:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal mt-1",
                  !formData.rapd_meeting_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.rapd_meeting_date ? format(new Date(formData.rapd_meeting_date), "dd/MM/yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.rapd_meeting_date ? new Date(formData.rapd_meeting_date) : undefined}
                onSelect={(date) => onFormDataChange({ rapd_meeting_date: date?.toISOString() || '' })}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium">Identify key engagement team members</Label>
            <Button 
              onClick={addTeamMember}
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
                  <th className="text-left p-4 font-medium border">Engagement team member</th>
                  <th className="text-left p-4 font-medium border">Role</th>
                  <th className="text-center p-4 font-medium border">Attended meeting</th>
                  <th className="text-left p-4 font-medium border">Document important matters communicated to those unable to attend</th>
                  <th className="text-center p-4 font-medium border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.rapd_team_members?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-12 text-gray-500 border">
                      No team members added yet. Click "Add" to create your first team member entry.
                    </td>
                  </tr>
                ) : (
                  formData.rapd_team_members?.map((member, index) => (
                    <tr key={member.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3 border">
                        <Input
                          value={member.member}
                          onChange={(e) => updateTeamMember(member.id, 'member', e.target.value)}
                          placeholder="Team member name"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-3 border">
                        <Input
                          value={member.role}
                          onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                          placeholder="Role"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-4 text-center border">
                        <Checkbox
                          checked={member.attendedMeeting}
                          onCheckedChange={(checked) => updateTeamMember(member.id, 'attendedMeeting', !!checked)}
                        />
                      </td>
                      <td className="p-3 border">
                        <Input
                          value={member.documentMatters}
                          onChange={(e) => updateTeamMember(member.id, 'documentMatters', e.target.value)}
                          placeholder="Document matters"
                          className="text-sm"
                        />
                      </td>
                      <td className="p-4 text-center border">
                        <Button
                          onClick={() => removeTeamMember(member.id)}
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

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Was the fraud brainstorming discussion held at the same meeting as the RAPD?</Label>
            <RadioGroup
              value={formData.rapd_fraud_brainstorming_same_meeting || ''}
              onValueChange={(value) => onFormDataChange({ rapd_fraud_brainstorming_same_meeting: value })}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="fraud-yes" />
                <Label htmlFor="fraud-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="fraud-no" />
                <Label htmlFor="fraud-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="rapd-agenda-confirmation"
              checked={formData.rapd_agenda_confirmation || false}
              onCheckedChange={(checked) => onFormDataChange({ rapd_agenda_confirmation: !!checked })}
              className="mt-1"
            />
            <Label htmlFor="rapd-agenda-confirmation" className="text-sm leading-relaxed">
              We confirm we discussed, at a minimum, the items included in the RAPD agenda unless the item is indicated as optional.
            </Label>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="rapd-document-accounting-policies"
                checked={formData.rapd_document_accounting_policies || false}
                onCheckedChange={(checked) => onFormDataChange({ rapd_document_accounting_policies: !!checked })}
                className="mt-1"
              />
              <Label htmlFor="rapd-document-accounting-policies" className="text-sm leading-relaxed">
                Document matters discussed and significant decisions reached with respect to the entity's selection and application of accounting policies or principles, including related disclosure requirements.
              </Label>
            </div>
            {formData.rapd_document_accounting_policies && (
              <Textarea
                placeholder="Enter details..."
                value={formData.rapd_document_accounting_policies_details || ''}
                onChange={(e) => onFormDataChange({ rapd_document_accounting_policies_details: e.target.value })}
                className="mt-2"
                rows={4}
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="rapd-document-management-bias"
                checked={formData.rapd_document_management_bias || false}
                onCheckedChange={(checked) => onFormDataChange({ rapd_document_management_bias: !!checked })}
                className="mt-1"
              />
              <Label htmlFor="rapd-document-management-bias" className="text-sm leading-relaxed">
                Document matters discussed with respect to how the financial statements could be manipulated through management bias in accounting estimates.
              </Label>
            </div>
            {formData.rapd_document_management_bias && (
              <Textarea
                placeholder="Enter details..."
                value={formData.rapd_document_management_bias_details || ''}
                onChange={(e) => onFormDataChange({ rapd_document_management_bias_details: e.target.value })}
                className="mt-2"
                rows={4}
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="rapd-document-misstatement-susceptibility"
                checked={formData.rapd_document_misstatement_susceptibility || false}
                onCheckedChange={(checked) => onFormDataChange({ rapd_document_misstatement_susceptibility: !!checked })}
                className="mt-1"
              />
              <Label htmlFor="rapd-document-misstatement-susceptibility" className="text-sm leading-relaxed">
                Document matters discussed and significant decisions reached with respect to the susceptibility of financial statements to material misstatement due to error or fraud. Fraud risk factors identified during the meeting are further evaluated at 2.4 Fraud.
              </Label>
            </div>
            {formData.rapd_document_misstatement_susceptibility && (
              <Textarea
                placeholder="Enter details..."
                value={formData.rapd_document_misstatement_susceptibility_details || ''}
                onChange={(e) => onFormDataChange({ rapd_document_misstatement_susceptibility_details: e.target.value })}
                className="mt-2"
                rows={4}
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="rapd-no-other-significant-decisions"
                checked={formData.rapd_no_other_significant_decisions || false}
                onCheckedChange={(checked) => onFormDataChange({ rapd_no_other_significant_decisions: !!checked })}
                className="mt-1"
              />
              <Label htmlFor="rapd-no-other-significant-decisions" className="text-sm leading-relaxed">
                No other significant decisions reached with respect to other matters discussed at the RAPD meeting.
              </Label>
            </div>
            {formData.rapd_no_other_significant_decisions && (
              <Textarea
                placeholder="Enter details..."
                value={formData.rapd_no_other_significant_decisions_details || ''}
                onChange={(e) => onFormDataChange({ rapd_no_other_significant_decisions_details: e.target.value })}
                className="mt-2"
                rows={4}
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="rapd-document-other-significant-decisions"
                checked={formData.rapd_document_other_significant_decisions || false}
                onCheckedChange={(checked) => onFormDataChange({ rapd_document_other_significant_decisions: !!checked })}
                className="mt-1"
              />
              <Label htmlFor="rapd-document-other-significant-decisions" className="text-sm leading-relaxed">
                Document significant decisions reached with respect to other matters discussed at the RAPD meeting.
              </Label>
            </div>
            {formData.rapd_document_other_significant_decisions && (
              <Textarea
                placeholder="Enter details..."
                value={formData.rapd_document_other_significant_decisions_details || ''}
                onChange={(e) => onFormDataChange({ rapd_document_other_significant_decisions_details: e.target.value })}
                className="mt-2"
                rows={4}
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-base mb-4">Setting the tone for our audit</h3>
            <div className="space-y-3 text-sm">
              <p><strong>A.</strong> The purpose of our audit practice is to serve and protect the capital markets and public interest</p>
              <p><strong>B.</strong> We define audit quality as being the outcome when audits are executed consistently, in line with the requirements and intent of applicable professional standards and applicable legal and regulatory requirements, as well as KPMG policies, within a strong system of quality controls.</p>
              <p><strong>C.</strong> We are committed to the utmost professionalism, integrity, objectivity and independence</p>
              <p><strong>D.</strong> Setting the tone is a shared responsibility that is led at the engagement level by the lead partner</p>
              <div>
                <p><strong>E.</strong> Our culture</p>
                <div className="ml-6 space-y-1">
                  <p>1. importance of professional skepticism</p>
                  <p>2. ensure our work is consistent with the purpose of our work</p>
                  <p>3. do the right thing</p>
                  <p>4. be cognizant of undue pressure</p>
                  <p>5. raise your hand if you see something inconsistent in our work or on our team or in conflict with our core values</p>
                  <p>6. ways to raise your hand without fear of reprisal</p>
                </div>
              </div>
              <p><strong>F.</strong> Commit to and embrace effective project management and continuous improvement</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4">Items to emphasize</h3>
            <div className="space-y-3 text-sm">
              <p className="font-medium">During this discussion and throughout the audit:</p>
              <p><strong>a.</strong> All engagement team members contribute to the management and achievement of quality at the engagement level</p>
              <p><strong>b.</strong> Maintain a questioning mind and exercise professional skepticism in gathering and evaluating evidence</p>
              <p><strong>c.</strong> Maintain open and robust communication within the engagement team</p>
              <p><strong>d.</strong> Remain alert for information or other conditions that might affect our assessment of fraud risks</p>
              <div>
                <p><strong>e.</strong> Consider any contradictory or inconsistent information we identify by:</p>
                <div className="ml-6 space-y-1">
                  <p>i. Probing the issues</p>
                  <p>ii. Obtaining additional evidence, as necessary</p>
                  <p>iii. Consulting with other team members and others in the firm – including specialists, if appropriate</p>
                </div>
              </div>
              <p><strong>f.</strong> Maintain independence and comply with ethical requirements and report any breaches (see "Personal responsibilities with respect to independence and ethical requirements" below for additional details)</p>
              <p><strong>g.</strong> Set aside beliefs that management and those charged with governance are honest and have integrity.</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4">To discuss the entity's selection and application of accounting principles, including related disclosure requirements</h3>
            <div className="space-y-3 text-sm">
              <p><strong>a.</strong> Whether the accounting principles are appropriate to the entity and its circumstances</p>
              <p><strong>b.</strong> Whether the accounting principles are common practice in the industry</p>
              <p><strong>c.</strong> How the accounting principles have been applied/implemented</p>
              <p><strong>d.</strong> New and changed requirements of the financial reporting framework</p>
              <p><strong>e.</strong> How changes in the entity and the environment might impact accounting principles & disclosures</p>
              <p><strong>f.</strong> Whether there were any disclosures about complex matters and difficulties in obtaining sufficient appropriate audit evidence in the past</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4">To discuss the susceptibility of financial statements to material misstatement due to error</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p><strong>a.</strong> Materiality to confirm that the following are appropriate:</p>
                <div className="ml-6 space-y-1">
                  <p>i. Materiality</p>
                  <p>ii. Aggregation risk and performance materiality (PM)</p>
                  <p>iii. Materiality and PM for any account balances where a lower materiality will be recorded</p>
                  <p>iv. AMPT,</p>
                </div>
              </div>
              <div>
                <p><strong>b.</strong> Whether the identified risks of material misstatements (RMMs) are appropriate and complete, including those related to estimates and significant unusual transactions.</p>
                <div className="ml-6">
                  <p>i. RMMs that are likely to be significant risks or with a higher (Elevated) risk</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4">To discuss the susceptibility of financial statements to material misstatement due to fraud</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p><strong>a.</strong> Fraud brainstorming topics</p>
                <div className="ml-6 space-y-1">
                  <p>i. How and where management could perpetrate and conceal fraudulent financial reporting</p>
                  <p>ii. How the entity's assets could be misappropriated</p>
                  <p>iii. The susceptibility of the financial statements to material misstatement through related party transactions</p>
                  <p>iv. How fraud might be perpetrated or concealed by omitting or presenting incomplete or inaccurate disclosures</p>
                  <p>v. How the financial statements could be manipulated through management bias in accounting estimates in significant accounts and disclosures</p>
                  <p>vi. What incentives, pressures or opportunities are present to enable fraud</p>
                  <p>vii. Circumstances that might indicate earnings management or manipulation of other financial measures</p>
                  <p>viii. Practices that management might follow to manage earnings or manipulate other financial measure</p>
                  <p>ix. Historical experience of fraud</p>
                </div>
              </div>
              <p><strong>b.</strong> Risk of management override of controls</p>
              <p><strong>c.</strong> Potential audit responses to identified fraud risks</p>
              <p><strong>d.</strong> How to introduce an element of unpredictability in our audit procedure</p>
              <div>
                <p><strong>e.</strong> Related parties</p>
                <div className="ml-6 space-y-1">
                  <p>i. Identified related parties</p>
                  <p>ii. Nature of related party relationships and related party transactions</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4">Personal responsibilities with respect to independence and ethical requirements</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p><strong>a.</strong> Responsibility to maintain personal independence</p>
                <div className="ml-6 space-y-2">
                  <div>
                    <p>i. As a member of the engagement team, you are considered a covered person with respect to the audit client and its related entities. Accordingly, the following circumstances or relationships may be prohibited or restricted for you or your immediate family members as it relates to the audit client and its related entities:</p>
                    <div className="ml-6 space-y-1">
                      <p>(1) Direct or material indirect investments / financial interest</p>
                      <p>(2) Certain lending or leasing arrangement</p>
                      <p>(3) Other financial relationships such as bank accounts or brokerage accounts unless held under normal commercial term</p>
                      <p>(4) Close personal relationships with audit client personnel</p>
                      <p>(5) Immediate family members serving as directors or officers of the audit client or in a position to exert significant influence over the preparation of the accounting records or financial statements (When an engagement team member has a close family member in any of these roles, he or she shall report this to the Engagement Partner or Ethics and Independence Partner.)</p>
                      <p>(6) Accepting or offering certain gifts or hospitality</p>
                      <p>(7) Certain business relationships</p>
                    </div>
                  </div>
                  <p>ii. There are restrictions with respect to discussions with an audit client regarding potential employment. Consultations with the Ethics and Independence Partner is required prior to any such discussion.</p>
                  <p>iii. Immediately report breaches or suspected breaches of KPMG independence policies to the Engagement Partner or the Ethics and Independence Partner.</p>
                  <p>iv. Promptly report breaches or suspected breaches of KPMG policies, other than independence matters, to the Engagement Partner, the appropriate Risk Management Partner, the Ethics and Compliance Hotline [or KPMG International hotline or member firm equivalent hotline), or other appropriate channel. Engagement team members should be familiar with the personal independence policies in Chapter 6 of the Global Quality & Risk Management Manual [or indicate local manual, as applicable.]</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4">Other discussion points</h3>
            <div className="space-y-3 text-sm">
              <p><strong>a.</strong> The overall responsibilities of each key engagement team member</p>
              <p><strong>b.</strong> Topics we may want to discuss throughout the audit with the Engagement Quality Control Reviewer, specific team members and specialists and other reviewers</p>
              <p><strong>c.</strong> Cooperate with the engagement quality control reviewer (or equivalent), if applicable</p>
              <p><strong>d.</strong> Whether the results of the latest Quality Performance Review apply to the audit, and any matters to pay close attention to</p>
              <div>
                <p><strong>e.</strong> Our preliminary thoughts on potential audit responses to RMMs, placing emphasize on:</p>
                <div className="ml-6 space-y-1">
                  <p>i. Financial statement level risks</p>
                  <p>ii. Significant risks of error – assertion level</p>
                  <p>iii. Significant unusual transactions</p>
                  <p>iv. Consider other RMMs with an elevated inherent risk</p>
                  <p>v. Other matters</p>
                </div>
              </div>
              <p><strong>f.</strong> Compliance with Software Audit Tool (SAT) policies, including independence restrictions on sharing SAT outputs with audit clients. The purpose for using SATs is to assist auditors in the performance of the audit. Providing SAT outputs to an audit client could potentially go beyond the scope of the audit and be considered a non-audit service. Refer to Independence Considerations for Software Audit Tools for additional guidance.</p>
              <p><strong>g.</strong> How to resolve disagreements among team members</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RAPDSection;