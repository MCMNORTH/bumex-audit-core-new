
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';

interface ProjectHeaderProps {
  projectName: string;
  engagementId: string;
  activeSection: string;
  clientName?: string;
  auditType: string;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
}

const ProjectHeader = ({
  projectName,
  engagementId,
  activeSection,
  clientName,
  auditType,
  onBack,
  onSave,
  saving
}: ProjectHeaderProps) => {
  const getSectionTitle = () => {
    switch (activeSection) {
      // Main sections
      case 'engagement-management': return '1. Engagement Management';
      case 'entity-wide-procedures': return '2. Entity wide procedures';
      case 'business-processes': return '3. Business processes';
      case 'conclusions-and-reporting': return '4. Conclusions and reporting';
      
      // Engagement management children
      case 'engagement-profile-section': return '1. Engagement Profile & Strategy';
      case 'sp-specialists-section': return 'SP. Specialists';
      case 'independence-section': return '2. Independence';
      case 'communications-section': return '4. Communications, Inquiries and Minutes';
      case 'tech-risk-corp': return 'Tech Risk Corp - IT Audit';
      case 'initial-independence': return '1. Initial independence and conclusion';
      
      // Entity wide procedures children
      case 'materiality': return '1. Materiality';
      case 'materiality-summary': return '1. Summary';
      case 'materiality-materiality': return '2. Materiality';
      case 'materiality-reevaluate': return '3. Re-evaluate';
      case 'risk-assessment': return '2. Risk Assessment';
      case 'entity-and-env': return '1. Entity and its environment';
      case 'planning-analytics': return '2. Planning analytics';
      case 'risk-business-processes': return '3. Business processes';
      case 'rapd': return '4. RAPD';
      case 'components-of-internal-control': return '3. Components of internal control';
      case 'ceramic': return '1. CERAMIC';
      case 'it-understanding': return '2. IT Understanding';
      case 'gitc-controls': return 'GITC. Controls';
      case 'significant-control-deficiencies': return '3. Significant Control Deficiencies';
      case 'def-deficiencies': return 'DEF. Deficiencies';
      case 'so-service-org': return 'SO. Service Organization';
      case 'fraud': return '4. Fraud';
      case 'fraud-risk': return '1. Fraud risk assessment and response';
      case 'je-plan-testwork': return '2. Journal entry plan and testwork';
      case 'overall-response': return '5. Overall Response';
      case 'general': return '1. General';
      case 'plan-revisions': return '6. Plan revisions';
      
      // GITC Controls children
      case 'ad-1-1-apd-1': return 'AD 1.1APD-1 - Configuration des mots de passe';
      case 'ad-1-1-apd-1-d-i': return '1 - D&I';
      case 'ad-1-1-apd-1-toe': return '2 - TOE';
      case 'ad-1-4-apd-1': return 'AD 1.4 APD-1 - Comptes à pouvoir';
      case 'ad-2-1-pc-2': return 'AD 2.1 PC-2 - Validation de la mise en production des changements';
      case 'seebi-1-1-apd-1': return 'Seebi 1.1 APD-1 - Configuration des mots de passe';
      case 'seebi-1-4-apd-1': return 'Seebi 1.4 APD-1 - Compte à pouvoir';
      case 'seebi-2-1-pc-1': return 'Seebi 2.1 PC-1 - Validation de la mise en production des changements';
      case 'talend-4-1-co-1': return 'Talend 4.1 CO-1 - Paramétrage de l\'ordonnanceur';
      case 'talend-4-1-co-2': return 'Talend 4.1 CO-2 - Suivi et résolution des anomalies';
      
      // Business processes children
      case 'financial-reporting': return '1. Financial reporting';
      case 'financial-reporting-process': return '1. Financial reporting process';
      case 'control-activities': return 'CA - Control activities';
      case 'controle-24': return 'Contrôle 24';
      case 'controle-24-d-i': return '1 - D&I';
      case 'controle-24-toe': return '2 - TOE';
      case 'controle-25': return 'Contrôle 25';
      case 'related-parties': return 'RP - Related parties';
      case 'litigation-claims': return '2. Litigation, claims and assessments';
      case 'ventes-clients': return '3. Ventes - Clients';
      case 'achats-fournisseurs': return '4. Achats - Fournisseurs';
      case 'immobilisations-incorporelles': return '5. Immobilisations Incorporelles';
      case 'stocks': return '6. Stocks';
      case 'tresorerie': return '7. Trésorerie';
      case 'mnsa-material-accounts': return '8. MNSA. Material non-significant accounts';
      
      // Special sections
      case 'team-section': return 'Team Management';
      case 'project-signoffs-summary': return 'Project Sign-offs Summary';
      
      // Legacy/fallback
      case 'engagement-profile': return '1. Engagement profile & Strategy';
      case 'sign-off-1': return 'Sign-off';
      case 'sign-off-2': return 'Sign-off';
      case 'sign-off-3': return 'Sign-off';
      
      default: return 'Project Section';
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getSectionTitle()}
        </h1>
        <p className="text-gray-600 mt-1">
          {clientName} • {auditType}
        </p>
      </div>
      <Button onClick={onSave} disabled={saving}>
        <Save className="mr-2 h-4 w-4" />
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

export default ProjectHeader;
