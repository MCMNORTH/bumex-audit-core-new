import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Lock } from 'lucide-react';
import { User } from '@/types';
import { ProjectFormData } from '@/types/formData';

interface SignOffData {
  signed: boolean;
  signedBy?: string;
  signedAt?: string;
}

interface SignOffBarProps {
  sectionId: string;
  signOffData: SignOffData;
  users: User[];
  canSignOff: boolean;
  canUnsign: boolean;
  onSignOff: (sectionId: string) => void;
  onUnsign: (sectionId: string) => void;
  signOffLevel: 'incharge' | 'manager';
}

const SignOffBar: React.FC<SignOffBarProps> = ({
  sectionId,
  signOffData,
  users,
  canSignOff,
  canUnsign,
  onSignOff,
  onUnsign,
  signOffLevel
}) => {
  const signedByUser = signOffData.signedBy ? 
    users.find(u => u.id === signOffData.signedBy) : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSignOffLevelText = () => {
    return signOffLevel === 'incharge' ? 'In Charge+' : 'Manager+';
  };

  return (
    <Card className={`mb-6 border-2 ${
      signOffData.signed ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {signOffData.signed ? (
              <>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <Lock className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      Signed Off
                    </Badge>
                    <span className="text-sm text-green-700 font-medium">
                      Section is locked and read-only
                    </span>
                  </div>
                  {signedByUser && signOffData.signedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      Signed by {signedByUser.first_name} {signedByUser.last_name} on {formatDate(signOffData.signedAt)}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <X className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                      Pending Sign-off
                    </Badge>
                    <span className="text-sm text-yellow-700">
                      Requires {getSignOffLevelText()} approval
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex space-x-2">
            {!signOffData.signed && canSignOff && (
              <Button
                onClick={() => onSignOff(sectionId)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Sign Off
              </Button>
            )}
            
            {signOffData.signed && canUnsign && (
              <Button
                onClick={() => onUnsign(sectionId)}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Unsign
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignOffBar;