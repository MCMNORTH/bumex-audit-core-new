
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, FileText, Calendar, DollarSign, User, Mail, Phone } from "lucide-react";
import { Quote } from "@/types";
import { useAppStore } from "@/store";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const QuoteDetail = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { getQuote } = useAppStore();
  const { toast } = useToast();
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!quoteId) return;
      
      setLoading(true);
      try {
        const fetchedQuote = await getQuote(quoteId);
        if (fetchedQuote) {
          setQuote(fetchedQuote);
        } else {
          toast({
            title: "Error",
            description: "Quote not found",
            variant: "destructive",
          });
          navigate('/quotes');
        }
      } catch (error) {
        console.error("Error fetching quote:", error);
        toast({
          title: "Error",
          description: "Failed to load quote",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId, getQuote, navigate, toast]);

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'expired':
        return 'bg-red-700';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading quote...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Quote not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/quotes')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quotes
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Quote #{quote.id.slice(-8)}</h1>
              <p className="text-muted-foreground">Quote details and information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(quote.status)}>
              {quote.status}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Quote Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quote Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Client:</span>
                    <span>{quote.clientName}</span>
                  </div>
                  {quote.clientContact && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Contact:</span>
                      <span>{quote.clientContact}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Total:</span>
                    <span className="font-semibold">{quote.total} {quote.currency}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Issue Date:</span>
                    <span>{format(new Date(quote.issueDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Valid Until:</span>
                    <span>{format(new Date(quote.validUntil), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Status:</span>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Quote line items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.description}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {item.price} {quote.currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">
                        {(item.quantity * item.price).toFixed(2)} {quote.currency}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>{quote.total.toFixed(2)} {quote.currency}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail;
