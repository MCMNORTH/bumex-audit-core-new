
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
import { PlusCircle, FileText } from "lucide-react";
import { Invoice } from "@/types";
import { firestore } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const fetchedInvoices = await firestore.getAllInvoices() as Invoice[];
        
        // Check for overdue invoices
        const updatedInvoices = fetchedInvoices.map(invoice => {
          // Only update if not already paid or partially paid
          if (invoice.status !== 'paid' && invoice.status !== 'partial') {
            const dueDate = new Date(invoice.dueDate);
            const today = new Date();
            
            // Set to overdue if due date is in the past
            if (dueDate < today && invoice.status !== 'overdue') {
              // Only update in state, actual DB update will happen when we update the invoice
              return { ...invoice, status: 'overdue' };
            }
          }
          return invoice;
        });
        
        setInvoices(updatedInvoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast({
          title: "Error",
          description: "Failed to load invoices. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button 
          onClick={() => navigate('/create-invoice')} 
          className="bg-jira-blue hover:bg-jira-blue-dark gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <div className="bg-white rounded-md shadow">
        {loading ? (
          <div className="p-8 text-center">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No invoices found</p>
            <Button 
              onClick={() => navigate('/create-invoice')} 
              variant="outline"
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Create your first invoice
            </Button>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of all invoices</TableCaption>
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
  );
}
