
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Invoice } from "@/types";

interface MobileInvoiceCardProps {
  invoice: Invoice;
  onView: (invoiceId: string) => void;
  formatCurrency: (amount: number, currency: string) => string;
  formatDate: (dateString: string) => string;
}

const MobileInvoiceCard = ({ 
  invoice, 
  onView, 
  formatCurrency, 
  formatDate 
}: MobileInvoiceCardProps) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{invoice.clientName}</h3>
              <p className="text-sm text-gray-500">#{invoice.id.substring(0, 8)}</p>
            </div>
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
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Issue Date</p>
              <p className="font-medium">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-gray-500">Due Date</p>
              <p className="font-medium">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Amount</p>
              <p className="font-medium text-lg">{formatCurrency(invoice.total, invoice.currency)}</p>
            </div>
            <div>
              <p className="text-gray-500">Paid</p>
              <p className="font-medium">
                {invoice.amountPaid ? formatCurrency(invoice.amountPaid, invoice.currency) : "-"}
              </p>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onView(invoice.id)}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" /> View Invoice
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileInvoiceCard;
