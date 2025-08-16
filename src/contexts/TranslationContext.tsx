import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'fr';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Translation data
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.clients': 'Clients',
    'nav.projects': 'Projects',
    'nav.logs': 'Logs',
    'nav.appControl': 'App Control',
    'nav.logout': 'Logout',
    
    // Common
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.notSelected': 'Not Selected',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.add': 'Add',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.name': 'Name',
    'common.description': 'Description',
    'common.loading': 'Loading...',
    
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.signInButton': 'Sign In',
    'auth.signUpButton': 'Create Account',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.recentProjects': 'Recent Projects',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.createProject': 'Create New Project',
    'dashboard.viewAllProjects': 'View All Projects',
    
    // Projects
    'projects.title': 'Projects',
    'projects.createNew': 'Create New Project',
    'projects.clientName': 'Client Name',
    'projects.projectName': 'Project Name',
    'projects.status': 'Status',
    'projects.lastModified': 'Last Modified',
    
    // Language
    'language.selector': 'Language',
    'language.english': 'English',
    'language.french': 'Français',
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.clients': 'Clients',
    'nav.projects': 'Projets',
    'nav.logs': 'Journaux',
    'nav.appControl': 'Contrôle App',
    'nav.logout': 'Déconnexion',
    
    // Common
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.notSelected': 'Non sélectionné',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.add': 'Ajouter',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.actions': 'Actions',
    'common.status': 'Statut',
    'common.date': 'Date',
    'common.name': 'Nom',
    'common.description': 'Description',
    'common.loading': 'Chargement...',
    
    // Auth
    'auth.login': 'Connexion',
    'auth.signup': 'Inscription',
    'auth.email': 'E-mail',
    'auth.password': 'Mot de passe',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.signInButton': 'Se connecter',
    'auth.signUpButton': 'Créer un compte',
    'auth.forgotPassword': 'Mot de passe oublié?',
    'auth.noAccount': "Vous n'avez pas de compte?",
    'auth.hasAccount': 'Vous avez déjà un compte?',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bon retour',
    'dashboard.recentProjects': 'Projets récents',
    'dashboard.quickActions': 'Actions rapides',
    'dashboard.createProject': 'Créer un nouveau projet',
    'dashboard.viewAllProjects': 'Voir tous les projets',
    
    // Projects
    'projects.title': 'Projets',
    'projects.createNew': 'Créer un nouveau projet',
    'projects.clientName': 'Nom du client',
    'projects.projectName': 'Nom du projet',
    'projects.status': 'Statut',
    'projects.lastModified': 'Dernière modification',
    
    // Language
    'language.selector': 'Langue',
    'language.english': 'English',
    'language.french': 'Français',
  },
};

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  const value: TranslationContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};