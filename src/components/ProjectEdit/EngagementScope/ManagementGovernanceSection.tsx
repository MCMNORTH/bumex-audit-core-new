
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ManagementGovernanceSectionProps {
  formData: {
    governance_management_same_persons: boolean;
    entity_has_internal_audit_function: boolean;
  };
  onFormDataChange: (updates: any) => void;
}

const ManagementGovernanceSection = ({ formData, onFormDataChange }: ManagementGovernanceSectionProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Management, those charged with governance and internal audit function:</h4>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="governance_management_same_persons"
            checked={formData.governance_management_same_persons}
            onCheckedChange={(checked) => onFormDataChange({ governance_management_same_persons: checked as boolean })}
          />
          <Label htmlFor="governance_management_same_persons">Those charged with governance and management are the same persons</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="entity_has_internal_audit_function"
            checked={formData.entity_has_internal_audit_function}
            onCheckedChange={(checked) => onFormDataChange({ entity_has_internal_audit_function: checked as boolean })}
          />
          <Label htmlFor="entity_has_internal_audit_function">The entity has an internal audit function or equivalent, including others under the direction of management or those charged with governance</Label>
        </div>
      </div>
    </div>
  );
};

export default ManagementGovernanceSection;
