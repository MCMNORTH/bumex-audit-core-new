
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Send } from "lucide-react";

// Mock invoice data - would be replaced with API calls in a real app
const mockInvoiceData = {
  "INV-001": {
    id: "INV-001",
    client: {
      name: "John Doe",
      email: "john@example.com",
      address: "123 Main St, Anytown, USA"
    },
    items: [
      { description: "Website Development", quantity: 1, price: 250.00 }
    ],
    total: 250.00,
    issueDate: "2025-05-20",
    dueDate: "2025-06-20",
    status: "paid"
  },
  "INV-002": {
    id: "INV-002",
    client: {
      name: "Jane Smith",
      email: "jane@example.com",
      address: "456 Oak Avenue, Othertown, USA"
    },
    items: [
      { description: "Logo Design", quantity: 1, price: 200.00 },
      { description: "Business Cards", quantity: 1, price: 150.00 },
      { description: "Brochure Design", quantity: 1, price: 100.00 }
    ],
    total: 450.00,
    issueDate: "2025-05-18",
    dueDate: "2025-06-18",
    status: "pending"
  },
  "INV-003": {
    id: "INV-003",
    client: {
      name: "Robert Johnson",
      email: "robert@example.com",
      address: "789 Pine Lane, Somewhere, USA"
    },
    items: [
      { description: "Monthly Maintenance", quantity: 1, price: 125.50 }
    ],
    total: 125.50,
    issueDate: "2025-05-15",
    dueDate: "2025-06-15",
    status: "overdue"
  }
};

export default function InvoiceDetail() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) return;

    // Simulate API call
    setTimeout(() => {
      const foundInvoice = mockInvoiceData[invoiceId as keyof typeof mockInvoiceData];
      if (foundInvoice) {
        setInvoice(foundInvoice);
      }
      setLoading(false);
    }, 500);
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    // In a real app, this would trigger an API call to send an email
    alert(`Email would be sent to ${invoice?.client.email}`);
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
              src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/2dgtj37xrkp6/Logo_wide_transparent.png" 
              alt="OVERCODE" 
              className="h-12"
            />
            <p className="text-sm text-gray-500 mt-1">OVERCODE Technologies Inc.</p>
            <p className="text-sm text-gray-500">123 Tech Lane, Innovation City</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
            <p className="text-gray-500">#{invoice.id}</p>
            <div className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-gray-500 font-medium mb-2">Bill To:</h3>
            <p className="font-bold">{invoice.client.name}</p>
            <p>{invoice.client.email}</p>
            <p className="text-gray-600">{invoice.client.address}</p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-gray-500">Issue Date: </span>
              <span>{invoice.issueDate}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-500">Due Date: </span>
              <span>{invoice.dueDate}</span>
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
            {invoice.items.map((item: any, index: number) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4">{item.description}</td>
                <td className="py-4 text-right">{item.quantity}</td>
                <td className="py-4 text-right">${item.price.toFixed(2)}</td>
                <td className="py-4 text-right">${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-1/3">
            <div className="flex justify-between pb-2">
              <span className="font-medium">Subtotal:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-medium">Tax (0%):</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold">Total:</span>
              <span className="font-bold">${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p>For questions regarding this invoice, please contact billing@overcode.com</p>
        </div>
      </div>
    </div>
  );
}
