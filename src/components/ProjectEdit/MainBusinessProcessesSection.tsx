import { Card, CardContent } from '@/components/ui/card';
import CommentableQuestion from './Comments/CommentableQuestion';

interface BusinessProcessCard {
  id: string;
  number: string;
  title: string;
}

const businessProcessCards: BusinessProcessCard[] = [
  {
    id: 'financial-reporting',
    number: '1.',
    title: 'Financial reporting'
  },
  {
    id: 'litigation-claims',
    number: '2.',
    title: 'Litigation, claims and assessments'
  },
  {
    id: 'ventes-clients',
    number: '3.',
    title: 'Ventes - Clients'
  },
  {
    id: 'achats-fournisseurs',
    number: '4.',
    title: 'Achats - Fournisseurs'
  },
  {
    id: 'immobilisations-incorporelles',
    number: '5.',
    title: 'Immobilisations Incorporelles'
  },
  {
    id: 'stocks',
    number: '6.',
    title: 'Stocks'
  },
  {
    id: 'tresorerie',
    number: '7.',
    title: 'Trésorerie'
  },
  {
    id: 'mnsa-accounts',
    number: '8.',
    title: 'MNSA. Material non-significant accounts'
  }
];

interface MainBusinessProcessesSectionProps {
  onSectionChange?: (sectionId: string) => void;
}

const MainBusinessProcessesSection = ({ onSectionChange = () => {} }: MainBusinessProcessesSectionProps) => {
  return (
    <CommentableQuestion fieldId="main-business-processes-section" label="Business Processes">
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
              aria-label={process.title}
              role="button"
            >
              <CardContent className="flex flex-col p-8 items-start min-h-[120px] h-full">
                <span className="text-xs text-muted-foreground font-semibold mb-1">
                  {process.number}
                </span>
                <span className="text-gray-900 text-base font-medium">
                  {process.title}
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