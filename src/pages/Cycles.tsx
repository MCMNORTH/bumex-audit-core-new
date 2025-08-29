import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCyclesData } from "@/hooks/useCyclesData";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Shield, FileText, Target } from "lucide-react";

const Cycles = () => {
  const { cycles, loading, error } = useCyclesData();

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6 p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cycles</h1>
            <p className="text-muted-foreground">
              Manage cycles with their associated risks, responses, and substantives
            </p>
          </div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold">Error loading cycles</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cycles</h1>
          <p className="text-muted-foreground">
            Manage cycles with their associated risks, responses, and substantives
          </p>
        </div>

        {cycles.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-48">
              <div className="text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No cycles found</h3>
                <p className="text-muted-foreground">
                  There are no cycles available at the moment.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {cycles.map((cycle) => (
              <Card key={cycle.firebaseId} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Cycle ID: {cycle.id}
                  </CardTitle>
                  <CardDescription>
                    {cycle.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Risks Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <h3 className="font-semibold">Risks</h3>
                      <Badge variant="secondary">{cycle.risks.length}</Badge>
                    </div>
                    {cycle.risks.length > 0 ? (
                      <div className="grid gap-2">
                        {cycle.risks.map((risk) => (
                          <div
                            key={risk.id}
                            className="p-3 rounded-lg bg-destructive/5 border border-destructive/10"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">Risk ID: {risk.id}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {risk.description || "No description available"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No risks associated with this cycle</p>
                    )}
                  </div>

                  <Separator />

                  {/* Responses Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">Responses</h3>
                      <Badge variant="secondary">{cycle.responses.length}</Badge>
                    </div>
                    {cycle.responses.length > 0 ? (
                      <div className="grid gap-2">
                        {cycle.responses.map((response) => (
                          <div
                            key={response.id}
                            className="p-3 rounded-lg bg-primary/5 border border-primary/10"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">Response ID: {response.id}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {response.description || "No description available"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No responses associated with this cycle</p>
                    )}
                  </div>

                  <Separator />

                  {/* Substantives Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4 text-secondary" />
                      <h3 className="font-semibold">Substantives</h3>
                      <Badge variant="secondary">{cycle.substantives.length}</Badge>
                    </div>
                    {cycle.substantives.length > 0 ? (
                      <div className="grid gap-2">
                        {cycle.substantives.map((substantive) => (
                          <div
                            key={substantive.id}
                            className="p-3 rounded-lg bg-secondary/5 border border-secondary/10"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">Substantive ID: {substantive.id}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {substantive.description || "No description available"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No substantives associated with this cycle</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Cycles;