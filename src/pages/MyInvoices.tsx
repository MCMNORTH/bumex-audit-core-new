import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Invoice, InvoiceStatus } from "@/types";
import { firestore } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileHeader from "@/components/MobileHeader";
import MobileInvoiceCard from "@/components/MobileInvoiceCard";

export default function MyInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const fetchedInvoices = await firestore.getAllInvoices() as Invoice[];
        
        // Filter invoices for the current user
        const userInvoices = fetchedInvoices.filter(invoice => invoice.userId === currentUser.uid);
        
        // Check for overdue invoices
        const updatedInvoices = userInvoices.map(invoice => {
          // Only update if not already paid or partially paid
          if (invoice.status !== 'paid' && invoice.status !== 'partial') {
            const dueDate = new Date(invoice.dueDate);
            const today = new Date();
            
            // Set to overdue if due date is in the past
            if (dueDate < today && invoice.status !== 'overdue') {
              return { ...invoice, status: 'overdue' as InvoiceStatus };
            }
          }
          return invoice;
        });
        
        setInvoices(updatedInvoices);
      } catch (error) {
        console.error("Error fetching user invoices:", error);
        toast({
          title: "Error",
          description: "Failed to load your invoices. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [currentUser]);

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US").format(date);
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <MobileHeader />
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Invoices</h1>
        </div>

        <div className="bg-white rounded-md shadow">
          {loading ? (
            <div className="p-8 text-center">Loading your invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">You don't have any invoices yet</p>
            </div>
          ) : isMobile ? (
            <div className="p-4 space-y-4">
              {invoices.map((invoice) => (
                <MobileInvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onView={(invoiceId) => navigate(`/invoices/${invoiceId}`)}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              ))}
            </div>
          ) : (
            <Table>
              <TableCaption>A list of your invoices</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id.substring(0, 8)}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(invoice.total, invoice.currency)}</TableCell>
                    <TableCell>
                      {invoice.amountPaid ? formatCurrency(invoice.amountPaid, invoice.currency) : "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                        invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        <FileText className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
