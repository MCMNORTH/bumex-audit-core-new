
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    myInvoices: 'My Invoices',
    starredProjects: 'Starred Projects',
    noStarredProjects: 'No starred projects',
    profile: 'Profile',
    
    // Auth
    welcomeBack: 'Welcome back',
    signInToYourAccount: 'Sign in to your account',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    
    // Project
    projectNotFound: 'Project not found',
    totalIssues: 'Total Issues',
    inProgress: 'In Progress',
    inReview: 'In Review',
    done: 'Done',
    projectProgress: 'Project Progress',
    projectInformation: 'Project Information',
    created: 'Created',
    lastUpdated: 'Last Updated',
    projectKey: 'Project Key',
    
    // Invoice
    backToMyInvoices: 'Back to My Invoices',
    deleteInvoice: 'Delete Invoice',
    deleting: 'Deleting...',
    recordPayment: 'Record Payment',
    invoice: 'INVOICE',
    billTo: 'Bill To:',
    issueDate: 'Issue Date:',
    dueDate: 'Due Date:',
    currency: 'Currency:',
    description: 'Description',
    qty: 'Qty',
    price: 'Price',
    amount: 'Amount',
    subtotal: 'Subtotal:',
    tax: 'Tax (0%):',
    total: 'Total:',
    paid: 'Paid:',
    balanceDue: 'Balance Due:',
    paymentHistory: 'Payment History',
    date: 'Date',
    note: 'Note',
    thankYou: 'Thank you for your business!',
    questionsContact: 'For questions regarding this invoice, please contact support@overcode.dev',
    
    // Languages
    language: 'Language',
    english: 'English',
    french: 'Français',
    arabic: 'العربية'
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    myInvoices: 'Mes Factures',
    starredProjects: 'Projets Favoris',
    noStarredProjects: 'Aucun projet favori',
    profile: 'Profil',
    
    // Auth
    welcomeBack: 'Bon retour',
    signInToYourAccount: 'Connectez-vous à votre compte',
    email: 'Email',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    signingIn: 'Connexion...',
    
    // Project
    projectNotFound: 'Projet non trouvé',
    totalIssues: 'Total des Problèmes',
    inProgress: 'En Cours',
    inReview: 'En Révision',
    done: 'Terminé',
    projectProgress: 'Progrès du Projet',
    projectInformation: 'Informations du Projet',
    created: 'Créé',
    lastUpdated: 'Dernière Mise à Jour',
    projectKey: 'Clé du Projet',
    
    // Invoice
    backToMyInvoices: 'Retour à Mes Factures',
    deleteInvoice: 'Supprimer la Facture',
    deleting: 'Suppression...',
    recordPayment: 'Enregistrer le Paiement',
    invoice: 'FACTURE',
    billTo: 'Facturer à:',
    issueDate: 'Date d\'émission:',
    dueDate: 'Date d\'échéance:',
    currency: 'Devise:',
    description: 'Description',
    qty: 'Qté',
    price: 'Prix',
    amount: 'Montant',
    subtotal: 'Sous-total:',
    tax: 'Taxe (0%):',
    total: 'Total:',
    paid: 'Payé:',
    balanceDue: 'Solde Dû:',
    paymentHistory: 'Historique des Paiements',
    date: 'Date',
    note: 'Note',
    thankYou: 'Merci pour votre entreprise!',
    questionsContact: 'Pour toute question concernant cette facture, veuillez contacter support@overcode.dev',
    
    // Languages
    language: 'Langue',
    english: 'English',
    french: 'Français',
    arabic: 'العربية'
  },
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    myInvoices: 'فواتيري',
    starredProjects: 'المشاريع المفضلة',
    noStarredProjects: 'لا توجد مشاريع مفضلة',
    profile: 'الملف الشخصي',
    
    // Auth
    welcomeBack: 'مرحباً بعودتك',
    signInToYourAccount: 'تسجيل الدخول إلى حسابك',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    signingIn: 'جاري تسجيل الدخول...',
    
    // Project
    projectNotFound: 'المشروع غير موجود',
    totalIssues: 'إجمالي المشاكل',
    inProgress: 'قيد التقدم',
    inReview: 'قيد المراجعة',
    done: 'مكتمل',
    projectProgress: 'تقدم المشروع',
    projectInformation: 'معلومات المشروع',
    created: 'تم الإنشاء',
    lastUpdated: 'آخر تحديث',
    projectKey: 'مفتاح المشروع',
    
    // Invoice
    backToMyInvoices: 'العودة إلى فواتيري',
    deleteInvoice: 'حذف الفاتورة',
    deleting: 'جاري الحذف...',
    recordPayment: 'تسجيل الدفع',
    invoice: 'فاتورة',
    billTo: 'إرسال الفاتورة إلى:',
    issueDate: 'تاريخ الإصدار:',
    dueDate: 'تاريخ الاستحقاق:',
    currency: 'العملة:',
    description: 'الوصف',
    qty: 'الكمية',
    price: 'السعر',
    amount: 'المبلغ',
    subtotal: 'المجموع الفرعي:',
    tax: 'الضريبة (0%):',
    total: 'الإجمالي:',
    paid: 'مدفوع:',
    balanceDue: 'الرصيد المستحق:',
    paymentHistory: 'تاريخ المدفوعات',
    date: 'التاريخ',
    note: 'ملاحظة',
    thankYou: 'شكراً لك على عملك!',
    questionsContact: 'للأسئلة المتعلقة بهذه الفاتورة، يرجى التواصل مع support@overcode.dev',
    
    // Languages
    language: 'اللغة',
    english: 'English',
    french: 'Français',
    arabic: 'العربية'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'fr', 'ar'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Set document direction for Arabic
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
