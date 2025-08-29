import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCyclesData, CycleWithData } from '@/hooks/useCyclesData';

const CycleCard = ({ cycle }: { cycle: CycleWithData }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{cycle.description || `Cycle ${cycle.id}`}</span>
          <Badge variant="outline">{cycle.id}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Risks */}
          <div>
            <h4 className="font-medium text-sm mb-2 text-red-600">
              Risks ({cycle.risks.length})
            </h4>
            <div className="space-y-2">
              {cycle.risks.length > 0 ? (
                cycle.risks.map((risk) => (
                  <Card key={risk.id} className="p-3 bg-red-50 border-red-200">
                    <div className="text-sm">
                      <div className="font-medium text-red-800">Risk {risk.id}</div>
                      <div className="text-red-700 mt-1">{risk.description}</div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">No risks defined</div>
              )}
            </div>
          </div>

          {/* Responses */}
          <div>
            <h4 className="font-medium text-sm mb-2 text-blue-600">
              Responses ({cycle.responses.length})
            </h4>
            <div className="space-y-2">
              {cycle.responses.length > 0 ? (
                cycle.responses.map((response) => (
                  <Card key={response.id} className="p-3 bg-blue-50 border-blue-200">
                    <div className="text-sm">
                      <div className="font-medium text-blue-800">Response {response.id}</div>
                      <div className="text-blue-700 mt-1">{response.description}</div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">No responses defined</div>
              )}
            </div>
          </div>

          {/* Substantives */}
          <div>
            <h4 className="font-medium text-sm mb-2 text-green-600">
              Substantives ({cycle.substantives.length})
            </h4>
            <div className="space-y-2">
              {cycle.substantives.length > 0 ? (
                cycle.substantives.map((substantive) => (
                  <Card key={substantive.id} className="p-3 bg-green-50 border-green-200">
                    <div className="text-sm">
                      <div className="font-medium text-green-800">Substantive {substantive.id}</div>
                      <div className="text-green-700 mt-1">{substantive.description}</div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">No substantives defined</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CyclesSection = () => {
  const { cycles, loading, error } = useCyclesData();

  if (loading) {
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 mb-4">Cycles</h4>
        {[1, 2].map((i) => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 mb-4">Cycles</h4>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 mb-4">Cycles</h4>
      
      {cycles.length > 0 ? (
        <div>
          {cycles.map((cycle) => (
            <CycleCard key={cycle.id} cycle={cycle} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <div className="text-sm">No cycles found in the database.</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CyclesSection;