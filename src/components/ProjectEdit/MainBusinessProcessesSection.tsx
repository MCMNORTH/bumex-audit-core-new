import { Card, CardContent } from '@/components/ui/card';
import CommentableQuestion from './Comments/CommentableQuestion';
import { useTranslation } from '@/contexts/TranslationContext';

interface BusinessProcessCard {
  id: string;
  number: string;
  titleKey: string;
}

const businessProcessCards: BusinessProcessCard[] = [
  {
    id: 'financial-reporting',
    number: '1.',
    titleKey: 'mainBusinessProcesses.financialReporting'
  },
  {
    id: 'litigation-claims',
    number: '2.',
    titleKey: 'mainBusinessProcesses.litigationClaims'
  },
  {
    id: 'mnsa-accounts',
    number: '8.',
    titleKey: 'mainBusinessProcesses.mnsaAccounts'
  }
];

interface MainBusinessProcessesSectionProps {
  onSectionChange?: (sectionId: string) => void;
}

const MainBusinessProcessesSection = ({ onSectionChange = () => {} }: MainBusinessProcessesSectionProps) => {
  const { t } = useTranslation();
  
  return (
    <CommentableQuestion fieldId="main-business-processes-section" label={t('mainBusinessProcesses.title')}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessProcessCards.map((process) => (
            <Card 
              key={process.id}
              className="cursor-pointer border border-gray-200 shadow-md rounded-xl transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none h-full" 
              tabIndex={0}
              onClick={() => onSectionChange(process.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSectionChange(process.id);
              }}
              aria-label={t(process.titleKey)}
              role="button"
            >
              <CardContent className="flex flex-col p-8 items-start min-h-[120px] h-full">
                <span className="text-xs text-muted-foreground font-semibold mb-1">
                  {process.number}
                </span>
                <span className="text-gray-900 text-base font-medium">
                  {t(process.titleKey)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </CommentableQuestion>
  );
};

export default MainBusinessProcessesSection;
