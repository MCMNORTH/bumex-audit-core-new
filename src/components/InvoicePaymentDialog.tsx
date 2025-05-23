
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Invoice, Payment } from "@/types";
import { firestore } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

interface InvoicePaymentDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentAdded: (updatedInvoice: Invoice) => void;
}

export function InvoicePaymentDialog({ 
  invoice, 
  open, 
  onOpenChange,
  onPaymentAdded
}: InvoicePaymentDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const remainingAmount = invoice.total - (invoice.amountPaid || 0);
  
  const handleAddPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount > remainingAmount) {
      toast({
        title: "Invalid amount",
        description: `Payment cannot exceed the remaining amount (${invoice.currency} ${remainingAmount.toFixed(2)})`,
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const newPayment: Payment = {
        id: uuidv4(),
        amount: paymentAmount,
        date: new Date().toISOString(),
        note: note || undefined
      };
      
      const result = await firestore.addPaymentToInvoice(invoice.id, newPayment);
      
      toast({
        title: "Payment added",
        description: `Payment of ${invoice.currency} ${paymentAmount.toFixed(2)} was recorded successfully`,
      });
      
      // Create an updated invoice object with the new payment information
      const updatedInvoice = {
        ...invoice,
        payments: [...(invoice.payments || []), newPayment],
        amountPaid: (invoice.amountPaid || 0) + paymentAmount,
        status: result.status,
        updatedAt: result.updatedAt
      };
      
      onPaymentAdded(updatedInvoice);
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "Error",
        description: "Failed to add payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>
            Record a payment for invoice #{invoice.id.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total-amount">Total Amount</Label>
              <Input
                id="total-amount"
                value={`${invoice.currency} ${invoice.total.toFixed(2)}`}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="remaining-amount">Remaining Amount</Label>
              <Input
                id="remaining-amount"
                value={`${invoice.currency} ${remainingAmount.toFixed(2)}`}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="payment-amount">Payment Amount</Label>
            <div className="flex items-center">
              <div className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-l-md">
                {invoice.currency}
              </div>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter payment amount"
                className="rounded-l-none"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="payment-note">Note (Optional)</Label>
            <Textarea
              id="payment-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this payment"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleAddPayment} 
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > remainingAmount || loading}
          >
            {loading ? "Adding..." : "Add Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
