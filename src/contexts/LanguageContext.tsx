
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

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
    totalTasks: 'Total Tasks',
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
    
    // 404 page
    pageNotFound: 'Page Not Found',
    pageNotFoundDesc: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
    returnHome: 'Return to Home'
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    myInvoices: 'Mes Factures',
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
    totalTasks: 'Tâches Totales',
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
    
    // 404 page
    pageNotFound: 'Page non trouvée',
    pageNotFoundDesc: 'La page que vous recherchez a peut-être été supprimée, son nom a changé ou elle est temporairement indisponible.',
    returnHome: 'Retour à l\'accueil'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'fr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Set document language
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
