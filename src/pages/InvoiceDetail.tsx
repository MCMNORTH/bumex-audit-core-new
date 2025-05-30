import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Plus, CreditCard, Trash2 } from "lucide-react";
import { Invoice, User } from "@/types";
import { firestore, auth } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";
import { InvoicePaymentDialog } from "@/components/InvoicePaymentDialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import MobileHeader from "@/components/MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";

export default function InvoiceDetail() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const {
    invoiceId
  } = useParams<{
    invoiceId: string;
  }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) return;
      try {
        setLoading(true);
        const fetchedInvoice = (await firestore.getInvoice(invoiceId)) as Invoice;
        if (fetchedInvoice) {
          // Check if the invoice is overdue
          if (fetchedInvoice.status !== 'paid' && fetchedInvoice.status !== 'partial') {
            const dueDate = new Date(fetchedInvoice.dueDate);
            const today = new Date();
            if (dueDate < today && fetchedInvoice.status !== 'overdue') {
              // Update the invoice status in the database
              await firestore.updateInvoice(invoiceId, {
                status: 'overdue',
                updatedAt: new Date().toISOString()
              });
              fetchedInvoice.status = 'overdue';
            }
          }
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

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const currentAuthUser = auth.currentUser;
      if (currentAuthUser) {
        try {
          const userData = (await firestore.getUser(currentAuthUser.uid)) as User;
          setCurrentUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchCurrentUser();
  }, []);
  const handlePrint = () => {
    const printContent = document.getElementById('invoice-printable');
    const originalBody = document.body.innerHTML;
    if (printContent) {
      // Set document title for the print job
      const invoiceNumber = invoice?.id.substring(0, 8) || "";
      const originalTitle = document.title;
      document.title = `Invoice #${invoiceNumber}`;

      // Create a style element for print styling
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body {
            padding: 20mm !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `;
      document.head.appendChild(style);
      document.body.innerHTML = printContent.innerHTML;
      window.print();

      // Restore the original document
      document.body.innerHTML = originalBody;
      document.title = originalTitle;
      document.head.removeChild(style);

      // Re-initialize the page after printing
      window.location.reload();
    }
  };
  const handleDeleteInvoice = async () => {
    if (!invoiceId) return;
    setIsDeleting(true);
    try {
      // Update invoice to mark it as deleted
      await firestore.updateInvoice(invoiceId, {
        deleted: true,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "Invoice Deleted",
        description: "The invoice has been marked as deleted."
      });

      // Navigate back to invoices list
      navigate('/my-invoices');
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };
  const handlePaymentAdded = (updatedInvoice: Invoice) => {
    setInvoice(updatedInvoice);
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
    return <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invoice not found</h2>
          <Button onClick={() => navigate('/my-invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>;
  }
  const remainingAmount = invoice.total - (invoice.amountPaid || 0);
  const isPaid = invoice.status === 'paid';
  const isPartiallyPaid = invoice.status === 'partial';
  const canAddPayment = !isPaid && invoice.status !== 'draft' && invoice.status !== 'cancelled';

  // Check if the current user is a client
  const isClient = currentUser?.client === true;
  return (
    <>
      {isMobile && <MobileHeader />}
      <div className="container mx-auto py-8">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate('/my-invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToMyInvoices')}
          </Button>
          <div className="space-x-2">
            {!isClient && (
              <>
                <Button variant="outline" onClick={() => setShowDeleteConfirmation(true)} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" /> 
                  {isDeleting ? t('deleting') : t('deleteInvoice')}
                </Button>
                {canAddPayment && (
                  <Button onClick={() => setShowPaymentDialog(true)}>
                    <CreditCard className="h-4 w-4 mr-2" /> {t('recordPayment')}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div id="invoice-printable" className="bg-white p-4 md:p-8 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4 md:mb-8">
            <div>
              <img src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/k8h0x3i2mmoy/logo_wide_transparent_black_writing.png" alt="OVERCODE" className="h-8 md:h-12" />
              <p className="text-xs md:text-sm text-gray-500 mt-1">OVERCODE MAURITANIE SARL</p>
              <p className="text-xs md:text-sm text-gray-500">support@overcode.dev</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg md:text-2xl font-bold text-gray-800">{t('invoice')}</h2>
              <p className="text-xs md:text-base text-gray-500">#{invoice.id.substring(0, 8)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-4 md:mb-8">
            <div>
              <h3 className="text-gray-500 font-medium mb-2 text-sm md:text-base">{t('billTo')}</h3>
              <p className="font-bold text-sm md:text-base">{invoice.clientName}</p>
              {invoice.clientContact && <p className="text-xs md:text-sm text-gray-500">{invoice.clientContact}</p>}
            </div>
            <div className="text-left md:text-right">
              <div className="mb-1 md:mb-2">
                <span className="text-gray-500 text-xs md:text-sm">{t('issueDate')} </span>
                <span className="text-xs md:text-sm">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="mb-1 md:mb-2">
                <span className="text-gray-500 text-xs md:text-sm">{t('dueDate')} </span>
                <span className="text-xs md:text-sm">{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="mb-1 md:mb-2">
                <span className="text-gray-500 text-xs md:text-sm">{t('currency')} </span>
                <span className="text-xs md:text-sm">{invoice.currency}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mb-4 md:mb-8">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-1 md:py-2 text-left text-gray-500">{t('description')}</th>
                  <th className="py-1 md:py-2 text-right text-gray-500">{t('qty')}</th>
                  <th className="py-1 md:py-2 text-right text-gray-500">{t('price')}</th>
                  <th className="py-1 md:py-2 text-right text-gray-500">{t('amount')}</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 md:py-4 pr-2">{item.description}</td>
                    <td className="py-2 md:py-4 text-right">{item.quantity}</td>
                    <td className="py-2 md:py-4 text-right">{formatCurrency(item.price, invoice.currency)}</td>
                    <td className="py-2 md:py-4 text-right">{formatCurrency(item.quantity * item.price, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-1/3">
              <div className="flex justify-between pb-1 md:pb-2 text-xs md:text-sm">
                <span className="font-medium">{t('subtotal')}</span>
                <span>{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
              <div className="flex justify-between pb-1 md:pb-2 text-xs md:text-sm">
                <span className="font-medium">{t('tax')}</span>
                <span>{formatCurrency(0, invoice.currency)}</span>
              </div>
              <div className="flex justify-between pt-1 md:pt-2 border-t border-gray-200 text-xs md:text-sm">
                <span className="font-bold">{t('total')}</span>
                <span className="font-bold">{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
              
              {(isPartiallyPaid || isPaid) && (
                <div className="mt-2">
                  <div className="flex justify-between pb-1 md:pb-2 text-xs md:text-sm">
                    <span className="font-medium">{t('paid')}</span>
                    <span className="text-green-600">{formatCurrency(invoice.amountPaid || 0, invoice.currency)}</span>
                  </div>
                  {!isPaid && (
                    <div className="flex justify-between pt-1 md:pt-2 border-t border-gray-200 text-xs md:text-sm">
                      <span className="font-bold">{t('balanceDue')}</span>
                      <span className="font-bold text-red-600">{formatCurrency(remainingAmount, invoice.currency)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mt-4 md:mt-8 pt-2 md:pt-4 border-t border-gray-200">
              <h3 className="text-base md:text-lg font-medium mb-2 md:mb-4">{t('paymentHistory')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs md:text-sm">
                      <th className="py-1 md:py-2 text-left text-gray-500">{t('date')}</th>
                      <th className="py-1 md:py-2 text-left text-gray-500">{t('amount')}</th>
                      <th className="py-1 md:py-2 text-left text-gray-500">{t('note')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map(payment => (
                      <tr key={payment.id} className="border-b border-gray-100 text-xs md:text-sm">
                        <td className="py-2 md:py-3">{formatDate(payment.date)}</td>
                        <td className="py-2 md:py-3 text-green-600">{formatCurrency(payment.amount, invoice.currency)}</td>
                        <td className="py-2 md:py-3 text-gray-600">{payment.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t border-gray-200 text-center text-gray-500 text-xs md:text-sm">
            <p>{t('thankYou')}</p>
            <p>{t('questionsContact')}</p>
          </div>
        </div>
        
        <InvoicePaymentDialog invoice={invoice} open={showPaymentDialog} onOpenChange={setShowPaymentDialog} onPaymentAdded={handlePaymentAdded} />

        {/* Delete confirmation dialog */}
        <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will mark this invoice as deleted. The invoice data will still be stored in the database but will no longer appear in the list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteInvoice} className="bg-red-600 text-white hover:bg-red-700" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
