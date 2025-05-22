
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Send, FileText } from "lucide-react";
import { Invoice } from "@/types";
import { firestore } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";

export default function InvoiceDetail() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) return;
      
      try {
        setLoading(true);
        const fetchedInvoice = await firestore.getInvoice(invoiceId) as Invoice;
        if (fetchedInvoice) {
          setInvoice(fetchedInvoice);
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast({
          title: "Error",
          description: "Failed to load invoice details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    // In a real app, this would trigger an API call to send an email
    toast({
      title: "Email Sent",
      description: `Invoice was sent to the client.`,
    });
  };

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

  if (loading) {
    return <div className="container mx-auto py-8">Loading invoice...</div>;
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invoice not found</h2>
          <Button onClick={() => navigate('/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button onClick={handleSendEmail}>
            <Send className="h-4 w-4 mr-2" /> Send to Client
          </Button>
        </div>
      </div>

      <div id="invoice-printable" className="bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-8">
          <div>
            <img 
              src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/k8h0x3i2mmoy/logo_wide_transparent_black_writing.png" 
              alt="OVERCODE" 
              className="h-12"
            />
            <p className="text-sm text-gray-500 mt-1">OVERCODE MAURITANIE SARL</p>
            <p className="text-sm text-gray-500">support@overcode.dev</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
            <p className="text-gray-500">#{invoice.id.substring(0, 8)}</p>
            <div className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-gray-500 font-medium mb-2">Bill To:</h3>
            <p className="font-bold">{invoice.clientName}</p>
            {invoice.userId && (
              <p className="text-sm text-gray-500">Client ID: {invoice.userId}</p>
            )}
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-gray-500">Issue Date: </span>
              <span>{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-500">Due Date: </span>
              <span>{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-500">Currency: </span>
              <span>{invoice.currency}</span>
            </div>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left text-gray-500">Description</th>
              <th className="py-2 text-right text-gray-500">Quantity</th>
              <th className="py-2 text-right text-gray-500">Price</th>
              <th className="py-2 text-right text-gray-500">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4">{item.description}</td>
                <td className="py-4 text-right">{item.quantity}</td>
                <td className="py-4 text-right">{formatCurrency(item.price, invoice.currency)}</td>
                <td className="py-4 text-right">{formatCurrency(item.quantity * item.price, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-1/3">
            <div className="flex justify-between pb-2">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-medium">Tax (0%):</span>
              <span>{formatCurrency(0, invoice.currency)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold">Total:</span>
              <span className="font-bold">{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p>For questions regarding this invoice, please contact support@overcode.dev</p>
        </div>
      </div>
    </div>
  );
}
