
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit, FileText, Calendar, DollarSign, User, Mail, Printer } from "lucide-react";
import { Quote } from "@/types";
import { useAppStore } from "@/store";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const QuoteDetail = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { getQuote, updateQuote } = useAppStore();
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

  const canEdit = quote && (quote.status === 'draft' || quote.status === 'pending');

  const handleEditQuote = () => {
    if (quote && canEdit) {
      navigate(`/quotes/${quote.id}/edit`);
    }
  };

  const handleStatusChange = async (newStatus: Quote['status']) => {
    if (!quote) return;

    try {
      const updatedQuote = await updateQuote(quote.id, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setQuote(updatedQuote);
      toast({
        title: "Success",
        description: "Quote status updated successfully",
      });
    } catch (error) {
      console.error("Error updating quote status:", error);
      toast({
        title: "Error",
        description: "Failed to update quote status",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading quote...</div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Quote not found</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px !important;
          }
          .no-print {
            display: none !important;
          }
          .print-logo {
            max-height: 80px !important;
            margin-bottom: 24px !important;
          }
        }
      `}</style>
      
      <div className="container mx-auto py-8 no-print">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <img 
              src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/k8h0x3i2mmoy/logo_wide_transparent_black_writing.png" 
              alt="OVERCODE" 
              className="h-8 mr-4"
            />
            <h1 className="text-3xl font-bold">Quote Detail</h1>
          </div>

          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/quotes')}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quotes
            </Button>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handlePrint}
                variant="outline"
                className="flex items-center"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Quote
              </Button>
              {canEdit && (
                <Button 
                  onClick={handleEditQuote}
                  className="flex items-center bg-jira-blue hover:bg-jira-blue-dark"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Quote
                </Button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <label htmlFor="status" className="text-sm font-medium">
                Status:
              </label>
              <Select value={quote.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="printable-area bg-white rounded-lg shadow p-8">
            <div className="mb-8">
              <img 
                src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/k8h0x3i2mmoy/logo_wide_transparent_black_writing.png" 
                alt="OVERCODE" 
                className="print-logo h-12 mb-6"
              />
            </div>

            <div className="border-b pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Quote #{quote.id.slice(-8)}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Issue Date: {format(new Date(quote.issueDate), 'MMM dd, yyyy')}</span>
                    <span>Valid Until: {format(new Date(quote.validUntil), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                <Badge className={`no-print ${getStatusColor(quote.status)}`}>
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Client Information
                </h3>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {quote.clientName}</p>
                  {quote.clientContact && (
                    <p className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      <strong>Contact:</strong> {quote.clientContact}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Quote Details
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <strong>Issue Date:</strong> {format(new Date(quote.issueDate), 'MMM dd, yyyy')}
                  </p>
                  <p className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <strong>Valid Until:</strong> {format(new Date(quote.validUntil), 'MMM dd, yyyy')}
                  </p>
                  <p className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <strong>Currency:</strong> {quote.currency}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-4">Quote Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Description</th>
                      <th className="border border-gray-200 px-4 py-2 text-center">Quantity</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Price</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-200 px-4 py-2">{item.description}</td>
                        <td className="border border-gray-200 px-4 py-2 text-center">{item.quantity}</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">{item.price.toFixed(2)} {quote.currency}</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">{(item.quantity * item.price).toFixed(2)} {quote.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={3} className="border border-gray-200 px-4 py-2 text-right">Total:</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{quote.total.toFixed(2)} {quote.currency}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuoteDetail;
