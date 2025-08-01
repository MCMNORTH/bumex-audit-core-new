import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectFormData } from '@/types/formData';

interface GitcControlsSectionProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

const GitcControlsSection: React.FC<GitcControlsSectionProps> = ({
  formData,
  onFormDataChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GITC Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">GITC Controls content will be implemented here</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GitcControlsSection;