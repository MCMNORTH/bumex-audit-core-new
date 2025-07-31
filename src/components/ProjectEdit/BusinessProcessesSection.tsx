import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface BusinessProcess {
  id: string;
  name: string;
  accounts: string[];
}

const businessProcesses: BusinessProcess[] = [
  {
    id: 'immobilisations',
    name: 'Immobilisations',
    accounts: ['20', '21', '280', '29', '680', '780', '785']
  },
  {
    id: 'immobilisations-financieres',
    name: 'Les immobilisations financières',
    accounts: ['26', '296', '297', '685']
  },
  {
    id: 'stock',
    name: 'Le stock',
    accounts: ['3', '603', '685', '785']
  },
  {
    id: 'vente-client',
    name: 'Vente/client',
    accounts: ['41', '491', '642', '695', '70', '741', '743', '744', '745', '746', '747', '748', '785']
  },
  {
    id: 'personnel',
    name: 'Personnel',
    accounts: ['42', '434', '44', '65']
  },
  {
    id: 'impot',
    name: 'Impôt',
    accounts: ['43', '66']
  },
  {
    id: 'tresorerie',
    name: 'Trésorerie',
    accounts: ['17', '55', '56', '58', '635', '67', '77']
  },
  {
    id: 'capitaux-propres',
    name: 'Capitaux propres',
    accounts: ['10', '11', '12', '13', '14', '15', '76']
  },
  {
    id: 'provisions-risques',
    name: 'Provisions pour risques et charges',
    accounts: ['15', '687', '787']
  },
  {
    id: 'emprunts',
    name: 'Emprunts',
    accounts: ['16']
  },
  {
    id: 'achat-fournisseur',
    name: 'Achat/fournisseur',
    accounts: ['40', '60', '61', '62', '63', '641', '643', '644', '645', '646', '647', '648', '742']
  },
  {
    id: 'groupe-associes',
    name: 'Groupe / Associés',
    accounts: ['45', '495']
  },
  {
    id: 'autres-comptes',
    name: 'Autres comptes',
    accounts: ['46', '48', '496', '79']
  }
];

interface BusinessProcessesSectionProps {
  formData: any;
  onFormDataChange: (updates: any) => void;
}

const BusinessProcessesSection = ({ formData, onFormDataChange }: BusinessProcessesSectionProps) => {
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>(
    formData.selected_business_processes || []
  );
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    formData.selected_business_accounts || []
  );

  const handleProcessToggle = (processId: string, checked: boolean) => {
    const updatedProcesses = checked 
      ? [...selectedProcesses, processId]
      : selectedProcesses.filter(id => id !== processId);
    
    setSelectedProcesses(updatedProcesses);
    onFormDataChange({ selected_business_processes: updatedProcesses });
  };

  const handleAccountToggle = (accountNumber: string, checked: boolean) => {
    const updatedAccounts = checked
      ? [...selectedAccounts, accountNumber]
      : selectedAccounts.filter(acc => acc !== accountNumber);
    
    setSelectedAccounts(updatedAccounts);
    onFormDataChange({ selected_business_accounts: updatedAccounts });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identify relevant processes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Identify business processes that are associated with accounts, disclosures, or classes of transactions where there is a reasonable possibility a RMM exists.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Process checkboxes */}
          <div className="space-y-4">
            <div className="bg-slate-100 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-3 text-slate-900">Process</h4>
              <div className="space-y-3">
                {businessProcesses.map((process) => (
                  <div key={process.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={process.id}
                      checked={selectedProcesses.includes(process.id)}
                      onCheckedChange={(checked) => 
                        handleProcessToggle(process.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={process.id} className="text-sm font-normal">
                      {process.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Account/disclosure numbers */}
          <div className="space-y-4">
            <div className="bg-slate-100 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-3 text-slate-900">Account/disclosure</h4>
              <div className="space-y-3 min-h-[400px]">
                {selectedProcesses.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Select processes to view associated accounts
                  </p>
                ) : (
                  selectedProcesses.map((processId) => {
                    const process = businessProcesses.find(p => p.id === processId);
                    if (!process) return null;
                    
                    return (
                      <div key={processId} className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {process.accounts.map((account) => (
                            <div key={`${processId}-${account}`} className="flex items-center space-x-2">
                              <Checkbox
                                id={`account-${processId}-${account}`}
                                checked={selectedAccounts.includes(account)}
                                onCheckedChange={(checked) => 
                                  handleAccountToggle(account, checked as boolean)
                                }
                              />
                              <Label htmlFor={`account-${processId}-${account}`} className="text-xs">
                                {account}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessProcessesSection;