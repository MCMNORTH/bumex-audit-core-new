
import { useState } from "react";
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
import { User } from "@/types";

// Temporary mock data for invoices
const mockInvoices = [
  {
    id: "INV-001",
    userId: "user1",
    userName: "John Doe",
    amount: 250.00,
    date: "2025-05-20",
    status: "paid"
  },
  {
    id: "INV-002",
    userId: "user2",
    userName: "Jane Smith",
    amount: 450.00,
    date: "2025-05-18",
    status: "pending"
  },
  {
    id: "INV-003",
    userId: "user3",
    userName: "Robert Johnson",
    amount: 125.50,
    date: "2025-05-15",
    status: "overdue"
  }
];

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState(mockInvoices);

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
        <Table>
          <TableCaption>A list of all invoices</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.userName}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
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
      </div>
    </div>
  );
}
