import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RotateCcw, Shield, FileText } from 'lucide-react';
import { useCyclesData, CycleWithDetails } from '@/hooks/useCyclesData';
import { Button } from '@/components/ui/button';

const CycleCard = ({ cycle }: { cycle: CycleWithDetails }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <RotateCcw className="h-5 w-5 text-primary" />
          Cycle: {cycle.description}
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">{cycle.risks.length} Risks</Badge>
          <Badge variant="secondary">{cycle.responses.length} Responses</Badge>
          <Badge variant="secondary">{cycle.substantives.length} Substantives</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Risks Section */}
        {cycle.risks.length > 0 && (
          <div>
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-red-500" />
              Risks
            </h4>
            <div className="space-y-2 ml-6">
              {cycle.risks.map(risk => (
                <div key={risk.id} className="p-3 bg-red-50 border-l-4 border-red-200 rounded">
                  <p className="text-sm text-gray-700">{risk.description}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {risk.id}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Responses Section */}
        {cycle.responses.length > 0 && (
          <div>
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Responses
            </h4>
            <div className="space-y-2 ml-6">
              {cycle.responses.map(response => (
                <div key={response.id} className="p-3 bg-blue-50 border-l-4 border-blue-200 rounded">
                  <p className="text-sm text-gray-700">{response.description}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {response.id}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Substantives Section */}
        {cycle.substantives.length > 0 && (
          <div>
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-green-500" />
              Substantives
            </h4>
            <div className="space-y-2 ml-6">
              {cycle.substantives.map(substantive => (
                <div key={substantive.id} className="p-3 bg-green-50 border-l-4 border-green-200 rounded">
                  <p className="text-sm text-gray-700">{substantive.description}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {substantive.id}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for cycle with no data */}
        {cycle.risks.length === 0 && cycle.responses.length === 0 && cycle.substantives.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No risks, responses, or substantives found for this cycle.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CyclesSection = () => {
  const { cycles, loading, error, refetch } = useCyclesData();

  if (loading) {
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Cycles Management</h4>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Cycles Management</h4>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={refetch}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Cycles Management</h4>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {cycles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No cycles found in the system.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cycles.map(cycle => (
            <CycleCard key={cycle.id} cycle={cycle} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CyclesSection;