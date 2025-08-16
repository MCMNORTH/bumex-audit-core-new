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

    // Engagement Profile & Strategy
    'engagement.basicInformation': 'Basic Information',
    'engagement.client': 'Client',
    'engagement.status': 'Status',
    'engagement.engagementName': 'Engagement Name',
    'engagement.engagementId': 'Engagement ID',
    'engagement.projectId': 'Project ID',
    'engagement.auditType': 'Audit Type',
    'engagement.language': 'Language',
    'engagement.jurisdiction': 'Jurisdiction',
    'engagement.bumexOffice': 'BUMEX Office',
    'engagement.periodStart': 'Period Start',
    'engagement.periodEnd': 'Period End',
    'engagement.expectedStartDate': 'Expected start date',
    'engagement.firstTimeAudit': 'First-time audit',
    'engagement.planToRollForward': 'Plan to roll forward an engagement',
    'engagement.enableExternalDocuments': 'Enable the ability to receive external documents',
    'engagement.evaluationInfo': 'Engagement evaluation and sentinel approval information',
    'engagement.evaluationId': 'Engagement evaluation ID',
    'engagement.evaluationStatus': 'Engagement evaluation status',
    'engagement.evaluationApprovalDate': 'Evaluation approval date',
    'engagement.plannedExpirationDate': 'Planned expiration date',
    'engagement.sentinelApprovalNumber': 'Sentinel approval number',
    'engagement.sentinelApprovalStatus': 'Sentinel approval status',
    'engagement.sentinelApprovalDate': 'Sentinel approval date',
    'engagement.sentinelExpirationDate': 'Sentinel expiration date',
    'engagement.firstPeriodAuditing': 'During the first period of this auditing service relationship, is management or client personnel performing the substantive procedures with respect to initial balances in conjunction with the BUMEX auditors?',
    'engagement.documentAttachment': 'Document attachment',
    'engagement.auditTypes.financial': 'Financial Audit',
    'engagement.auditTypes.compliance': 'Compliance Audit',
    'engagement.auditTypes.operational': 'Operational Audit',
    'engagement.auditTypes.it': 'IT Audit',
    'engagement.auditTypes.internal': 'Internal Audit',
    'engagement.auditTypes.tax': 'Tax Audit',
    'engagement.auditTypes.forensic': 'Forensic Audit',
    'engagement.auditTypes.environmental': 'Environmental Audit',
    'engagement.statuses.new': 'New',
    'engagement.statuses.inprogress': 'In Progress',
    'engagement.statuses.closed': 'Closed',
    'engagement.statuses.archived': 'Archived',
    'engagement.statuses.notSelected': 'Not Selected',
    'engagement.statuses.approved': 'Approved',
    'engagement.placeholders.selectClient': 'Select client',
    'engagement.placeholders.engagementName': 'Enter engagement name',
    'engagement.placeholders.engagementId': 'Enter engagement ID',
    'engagement.placeholders.projectId': 'Enter project ID',
    'engagement.placeholders.selectAuditType': 'Select audit type',
    'engagement.placeholders.jurisdiction': 'Enter jurisdiction',
    'engagement.placeholders.selectBumexOffice': 'Select BUMEX office',
    'engagement.placeholders.evaluationId': 'Enter evaluation ID',
    'engagement.placeholders.sentinelNumber': 'Enter sentinel number',
    'engagement.selectEngagementStructure': 'Select engagement structure',
    'engagement.uploadPdf': 'Upload PDF',
    
    // File Upload Section
    'fileUpload.uploadStructure': 'Upload engagement structure file',
    'fileUpload.dragDrop': 'Drag and drop your file here, or click to browse',
    'fileUpload.supportedFormats': 'Supported formats: PDF, DOC, DOCX, XLS, XLSX',
    'fileUpload.uploading': 'Uploading...',
    'fileUpload.uploaded': 'File uploaded successfully',
    'fileUpload.download': 'Download',
    'fileUpload.remove': 'Remove',
    'engagement.performProcedures': 'Perform procedures over client and engagement acceptance or continuance',
    'engagement.isFirstPeriod': 'Is this a first period we will be auditing the entity?',
    'engagement.attachDocuments': 'Attach the following client/engagement acceptance continuance documents:',
    'engagement.sentinelApprovalEmail': 'Sentinel approval email',
    'engagement.ceacApprovalEmail': 'CEAC approval email',
    'engagement.otherDocuments': 'Other documents, if applicable',
    'engagement.entityProfile': 'Entity Profile',
    'engagement.teamAssignment': 'Team Assignment',
    'engagement.scopeAndScale': 'Engagement scope and scale and other strategic matters',
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

    // Engagement Profile & Strategy
    'engagement.basicInformation': 'Informations de base',
    'engagement.client': 'Client',
    'engagement.status': 'Statut',
    'engagement.engagementName': 'Nom de la mission',
    'engagement.engagementId': 'ID de la mission',
    'engagement.projectId': 'ID du projet',
    'engagement.auditType': 'Type d\'audit',
    'engagement.language': 'Langue',
    'engagement.jurisdiction': 'Juridiction',
    'engagement.bumexOffice': 'Bureau BUMEX',
    'engagement.periodStart': 'Début de période',
    'engagement.periodEnd': 'Fin de période',
    'engagement.expectedStartDate': 'Date de début prévue',
    'engagement.firstTimeAudit': 'Premier audit',
    'engagement.planToRollForward': 'Prévoir de reporter un engagement',
    'engagement.enableExternalDocuments': 'Activer la capacité de recevoir des documents externes',
    'engagement.evaluationInfo': 'Informations d\'évaluation de l\'engagement et d\'approbation sentinelle',
    'engagement.evaluationId': 'ID d\'évaluation de l\'engagement',
    'engagement.evaluationStatus': 'Statut d\'évaluation de l\'engagement',
    'engagement.evaluationApprovalDate': 'Date d\'approbation de l\'évaluation',
    'engagement.plannedExpirationDate': 'Date d\'expiration prévue',
    'engagement.sentinelApprovalNumber': 'Numéro d\'approbation sentinelle',
    'engagement.sentinelApprovalStatus': 'Statut d\'approbation sentinelle',
    'engagement.sentinelApprovalDate': 'Date d\'approbation sentinelle',
    'engagement.sentinelExpirationDate': 'Date d\'expiration sentinelle',
    'engagement.firstPeriodAuditing': 'Pendant la première période de cette relation de service d\'audit, la direction ou le personnel du client effectue-t-il les procédures substantielles relatives aux soldes initiaux en collaboration avec les auditeurs BUMEX?',
    'engagement.documentAttachment': 'Pièce jointe de document',
    'engagement.auditTypes.financial': 'Audit financier',
    'engagement.auditTypes.compliance': 'Audit de conformité',
    'engagement.auditTypes.operational': 'Audit opérationnel',
    'engagement.auditTypes.it': 'Audit informatique',
    'engagement.auditTypes.internal': 'Audit interne',
    'engagement.auditTypes.tax': 'Audit fiscal',
    'engagement.auditTypes.forensic': 'Audit judiciaire',
    'engagement.auditTypes.environmental': 'Audit environnemental',
    'engagement.statuses.new': 'Nouveau',
    'engagement.statuses.inprogress': 'En cours',
    'engagement.statuses.closed': 'Fermé',
    'engagement.statuses.archived': 'Archivé',
    'engagement.statuses.notSelected': 'Non sélectionné',
    'engagement.statuses.approved': 'Approuvé',
    'engagement.placeholders.selectClient': 'Sélectionner un client',
    'engagement.placeholders.engagementName': 'Entrer le nom de la mission',
    'engagement.placeholders.engagementId': 'Entrer l\'ID de la mission',
    'engagement.placeholders.projectId': 'Entrer l\'ID du projet',
    'engagement.placeholders.selectAuditType': 'Sélectionner un type d\'audit',
    'engagement.placeholders.jurisdiction': 'Entrer la juridiction',
    'engagement.placeholders.selectBumexOffice': 'Sélectionner un bureau BUMEX',
    'engagement.placeholders.evaluationId': 'Entrer l\'ID d\'évaluation',
    'engagement.placeholders.sentinelNumber': 'Entrer le numéro sentinelle',
    'engagement.selectEngagementStructure': 'Sélectionner la structure d\'engagement',
    'engagement.uploadPdf': 'Télécharger PDF',
    
    // File Upload Section
    'fileUpload.uploadStructure': 'Télécharger le fichier de structure d\'engagement',
    'fileUpload.dragDrop': 'Glissez et déposez votre fichier ici, ou cliquez pour parcourir',
    'fileUpload.supportedFormats': 'Formats pris en charge: PDF, DOC, DOCX, XLS, XLSX',
    'fileUpload.uploading': 'Téléchargement...',
    'fileUpload.uploaded': 'Fichier téléchargé avec succès',
    'fileUpload.download': 'Télécharger',
    'fileUpload.remove': 'Supprimer',
    'engagement.performProcedures': 'Effectuer des procédures sur l\'acceptation ou la continuité du client et de l\'engagement',
    'engagement.isFirstPeriod': 'S\'agit-il d\'une première période où nous auditerons l\'entité?',
    'engagement.attachDocuments': 'Joindre les documents d\'acceptation/continuité client/engagement suivants:',
    'engagement.sentinelApprovalEmail': 'E-mail d\'approbation Sentinel',
    'engagement.ceacApprovalEmail': 'E-mail d\'approbation CEAC',
    'engagement.otherDocuments': 'Autres documents, le cas échéant',
    'engagement.entityProfile': 'Profil de l\'entité',
    'engagement.teamAssignment': 'Affectation d\'équipe',
    'engagement.scopeAndScale': 'Portée et échelle de l\'engagement et autres questions stratégiques',
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