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
    'common.pickDate': 'Pick a date',
    'common.upload': 'Upload',
    'common.remove': 'Remove',
    'common.download': 'Download',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.confirm': 'Confirm',
    'common.id': 'ID',
    'common.reference': 'Reference',
    'common.attachment': 'Attachment',
    'common.noDataYet': 'No data added yet',
    'common.clickToAdd': 'Click "Add" to create your first entry',
    
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
    'engagement.evaluationInfo': 'Engagement evaluation and approval',
    'engagement.evaluationId': 'Engagement evaluation ID',
    'engagement.evaluationStatus': 'Engagement evaluation status',
    'engagement.evaluationApprovalDate': 'Evaluation approval date',
    'engagement.plannedExpirationDate': 'Planned expiration date',
    'engagement.sentinelApprovalNumber': 'Approval number',
    'engagement.sentinelApprovalStatus': 'Approval status',
    'engagement.sentinelApprovalDate': 'Approval date',
    'engagement.sentinelExpirationDate': 'Expiration date',
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
    'engagement.placeholders.sentinelNumber': 'Enter approval number',
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
    'engagement.evaluationApprovalDocuments': 'Evaluation / Approval documents',
    'engagement.otherDocuments': 'Other documents, if applicable',
    'engagement.entityProfile': 'Entity Profile',
    'engagement.teamAssignment': 'Team Assignment',
    'engagement.scopeAndScale': 'Engagement scope and scale and other strategic matters',
    
    // Engagement Type Section
    'engagementType.selectType': 'Select type of engagement',
    'engagementType.financialStatementAuditReport': 'Financial statement audit report',
    'engagementType.auditReportDate': 'Audit report date',
    'engagementType.requiredAuditFileCloseoutDate': 'Required audit file closeout date',
    
    // Auditing Standards Section
    'auditingStandards.title': 'Applicable auditing standards and other legislative and regulatory requirements:',
    'auditingStandards.placeholder': 'Enter auditing standard',
    
    // Reporting Framework Section
    'reportingFramework.title': 'Applicable financial reporting framework and other legislative and regulatory requirements:',
    'reportingFramework.placeholder': 'Enter financial reporting framework',
    
    // Component Reporting Section
    'componentReporting.title': 'Component reporting',
    'componentReporting.details': 'Component reporting details',
    'componentReporting.placeholder': 'Describe the nature and scope of component reporting requirements, including any specific instructions received from group auditors...',
    'componentReporting.groupAuditor': 'Group auditor',
    'componentReporting.applicableAuditingStandards': 'Applicable auditing standards and other legislative and regulatory requirements:',
    'componentReporting.applicableFinancialFramework': 'Applicable financial reporting framework and other legislative and regulatory requirements:',
    'componentReporting.componentReportingDate': 'Component reporting date',
    'componentReporting.groupAuditReportDate': 'Group audit report date',
    'componentReporting.requiredComponentCloseoutDate': 'Required component closeout date',
    'componentReporting.independenceRules': 'Independence rules applicable for the component as communicated by the group audit instructions - Select one of the following:',
    'componentReporting.iesbaPie': 'IESBA PIE',
    'componentReporting.iesbaNonPie': 'IESBA non-PIE',
    'componentReporting.reportingToKpmgOffice': 'Reporting to another BUMEX office or member firm',
    'componentReporting.reportingToNonKpmgEntity': 'Reporting to a non-BUMEX entity',
    'componentReporting.auditingFinancialStatements': 'Are we auditing financial statements that are any of the following:',
    'componentReporting.consolidatedStatements': '- Consolidated financial statements;',
    'componentReporting.proportionateConsolidation': '- Financial statements prepared using proportionate consolidation;',
    'componentReporting.equityMethod': '- Financial statements that include at least one investment accounted for by the equity method; or',
    'componentReporting.combinedStatements': '- Combined financial statements of the financial information of entities or business units that have no parent but are under common control or common management?',
    
    // Reviewer Selection Section
    'reviewerSelection.title': 'Select the type of reviewer(s) which have been identified for the engagement:',
    'reviewerSelection.engagementQualityControlReviewer': 'Engagement quality control reviewer',
    'reviewerSelection.limitedScopeQualityControlReviewer': 'Limited scope quality control reviewer',
    'reviewerSelection.otherReviewer': 'Other reviewer',
    'reviewerSelection.notApplicable': 'Not Applicable',
    
    // Management Governance Section
    'managementGovernance.title': 'Management, those charged with governance and internal audit function:',
    'managementGovernance.samePersons': 'Those charged with governance and management are the same persons',
    'managementGovernance.internalAuditFunction': 'The entity has an internal audit function or equivalent, including others under the direction of management or those charged with governance',
    
    // Involvement of Others Section
    'involvementOfOthers.title': 'Involvement of others and specialized skills or knowledge',
    'involvementOfOthers.usesServiceOrganization': 'The entity uses a service organization(s)',
    'involvementOfOthers.planToInvolveSpecialists': 'We plan to involve specific team members with specialized skills in accounting and auditing and/or use the work of employed/engaged Bumex specialists and/or management\'s specialists',
    'involvementOfOthers.specialistTeams': 'Specialist Teams',
    'involvementOfOthers.noSpecialistTeams': 'No specialist teams added yet. Click the + button to add a specialist team.',
    
    // Engagement Team Section
    'engagementTeam.title': 'Engagement team',
    'engagementTeam.sufficientResources': 'Confirm that sufficient and appropriate resources to perform the engagement are assigned or made available to the engagement in a timely manner',
    'engagementTeam.competenceAndCapabilities': 'Confirm that the members of the engagement team, and any engaged BUMEX specialists and internal auditors who provide direct assistance collectively have the appropriate competence and capabilities, including sufficient time, to perform the engagement',
    
    // Direction Supervision Section
    'directionSupervision.title': 'Determine the nature, timing, and extent of direction and supervision of engagement team members, and review of their work',
    'directionSupervision.documentLabel': 'Document how we plan to direct and supervise engagement team members, including review of their work.',
    'directionSupervision.placeholder': 'Document your approach to team direction and supervision, including review procedures and communication methods...',
    
    // Strategy Considerations Section
    'strategyConsiderations.title': 'Other strategy or planning considerations',
    'strategyConsiderations.significantFactors': 'Identify factors that are significant in directing the activities of the engagement team e.g. significant issues and key audit areas.',
    'strategyConsiderations.significantFactorsPlaceholder': 'Identify and describe significant factors, issues, and key audit areas that will guide the engagement team\'s activities...',
    'strategyConsiderations.additionalInfo': 'Document any additional information e.g. overall timing of audit activities and preliminary decisions about which locations we will include in our audit scope.',
    'strategyConsiderations.additionalInfoPlaceholder': 'Document additional planning information, including timing of audit activities, location scope decisions, and other relevant considerations...',
    
    // Audit Strategy Section
    'auditStrategy.infoText': 'We consider the information obtained in defining the audit strategy and plan our audit procedures on this screen, in 3.x.1 Understanding, risks and response for each business process and in the following locations:',
    'auditStrategy.activateGaap': 'Activate GAAP conversion and/or GAAS differences for this report',
    'auditStrategy.gaapConversion': 'GAAP conversion activity',
    'auditStrategy.gaasConversion': 'GAAS conversion activity',
    'auditStrategy.methodTitle': 'Method used to evaluate identified misstatements:',
    'auditStrategy.currentPeriod': 'Current period',
    'auditStrategy.priorPeriod': 'Prior period',
    'auditStrategy.dualMethod': 'Dual method',
    'auditStrategy.balanceSheetMethod': 'Balance sheet method',
    'auditStrategy.incomeStatementMethod': 'Income statement method',
    
    // Entity Profile Section
    'entityProfile.internationalCriteria': 'We confirm the entity/engagement meets all the following International-standard criteria:',
    'entityProfile.entityCriteria': 'The entity:',
    'entityProfile.notPie': '- is not a Public Interest Entity (PIE), as determined by the member firm based on the definition in the Global Quality & Risk Management Manual (GQ&RMM)',
    'entityProfile.notPubliclyTraded': '- is not a publicly traded entity',
    'entityProfile.notBank': '- is not a Bank, as defined for the International Enhanced PIE criteria',
    'entityProfile.notInsurance': '- is not an insurance entity, one of whose main functions is to provide insurance to the public',
    'entityProfile.satsTitle': 'Create a list of SATs to be used on the engagement',
    'entityProfile.satsQuestion': 'Besides Bumex Auditcore – Standard, are you using SATs on the engagement which are not already on the member firm SAT list?',
    'entityProfile.satsList': 'SATs List',
    'entityProfile.addSat': 'Add SAT',
    'entityProfile.reliabilityEvaluation': 'Consider the reliability of the output provided by evaluating the design and testing the consistent operation of those tools to the extent necessary.',
    'entityProfile.enterReliability': 'Enter your evaluation of the reliability...',
    
    // IT Environment Section
    'itEnvironment.title': 'Understand the entity\'s IT organization and IT systems',
    'itEnvironment.relyOnAutomatedControls': 'Do you plan to rely on automated controls?',
    'itEnvironment.benchmarkingStrategy': 'Do you plan to take the benchmarking strategy for testing automated controls?',
    'itEnvironment.keyMembersInquired': 'We inquired of the following key members of IT organization primarily responsible for the IT environment:',
    'itEnvironment.intervieweesTitle': 'IT Organization Interviewees',
    'itEnvironment.addInterviewee': 'Add Interviewee',
    'itEnvironment.intervieweeName': 'Interviewee Name',
    'itEnvironment.intervieweePosition': 'Interviewee Position',
    'itEnvironment.bumexInterviewers': 'Bumex Interviewers',
    'itEnvironment.dateOfMeeting': 'Date of Meeting',
    'itEnvironment.itLayersDocumentation': 'Document the IT layer(s) (including the title and version) that comprise the IT systems used by the entity as part of their financial reporting and business processes, including the process(es) using each IT system(s) (by IT layer), and indication of outsourcing:',
    'itEnvironment.addItLayer': 'Add IT Layer',
    'itEnvironment.itLayers': 'IT Layer(s)',
    'itEnvironment.descriptionOfItSystem': 'Description of IT system layer',
    'itEnvironment.layerType': 'Layer type',
    'itEnvironment.financialReporting': 'Financial Reporting',
    'itEnvironment.process': 'Process',
    'itEnvironment.outsourced': 'Outsourced',
    'itEnvironment.serviceOrganizations': 'Service Organizations',
    'itEnvironment.newAccountingSoftware': 'New accounting software',
    'itEnvironment.softwareEffects': 'Software effects description',
    'itEnvironment.processesUnderstanding': 'Processes understanding',
    'itEnvironment.riskAssessmentProcedures': 'Risk assessment procedures',
    'itEnvironment.cybersecurityRisks': 'Cybersecurity risks',
    
    // Multi Reporting Section
    'multiReporting.title': 'Multi-reporting',
    'multiReporting.planningToUse': 'Are you planning to use Multi-reporting?',
    'multiReporting.identifyReports': 'Identify the reports (complete this table only after roll forward has been executed if we plan to roll forward the reports from prior period)',
    'multiReporting.reportId': 'Report ID',
    'multiReporting.reportName': 'Report name',
    'multiReporting.legalEntity': 'Legal entity',
    'multiReporting.isPrimaryReport': 'Is Primary report?',
    'multiReporting.noReports': 'No reports added yet. Click the + button to add a report.',
    
    // RAPD Section
    'rapd.title': 'Discuss matters affecting the identification and assessment of RMMs among the engagement team',
    'rapd.meetingDate': 'Date of meeting:',
    'rapd.identifyTeamMembers': 'Identify key engagement team members',
    'rapd.teamMember': 'Engagement team member',
    'rapd.role': 'Role',
    'rapd.attendedMeeting': 'Attended meeting',
    'rapd.documentMatters': 'Document important matters communicated to those unable to attend',
    'rapd.noTeamMembers': 'No team members added yet. Click "Add" to create your first team member entry.',
    'rapd.fraudBrainstorming': 'Was the fraud brainstorming discussion held at the same meeting as the RAPD?',
    'rapd.agendaConfirmation': 'We confirm we discussed, at a minimum, the items included in the RAPD agenda unless the item is indicated as optional.',
    'rapd.settingTone': 'Setting the tone for our audit',
    'rapd.toneA': 'The purpose of our audit practice is to serve and protect the capital markets and public interest',
    'rapd.toneB': 'We define audit quality as being the outcome when audits are executed consistently, in line with the requirements and intent of applicable professional standards and applicable legal and regulatory requirements, as well as Bumex policies, within a strong system of quality controls.',
    'rapd.toneC': 'We are committed to the utmost professionalism, integrity, objectivity and independence',
    'rapd.toneD': 'Setting the tone is a shared responsibility that is led at the engagement level by the lead partner',
    'rapd.toneE': 'Our culture',
    'rapd.toneE1': 'importance of professional skepticism',
    'rapd.toneE2': 'ensure our work is consistent with the purpose of our work',
    'rapd.toneE3': 'do the right thing',
    'rapd.toneE4': 'be cognizant of undue pressure',
    'rapd.toneE5': 'raise your hand if you see something inconsistent in our work or on our team or in conflict with our core values',
    'rapd.toneE6': 'ways to raise your hand without fear of reprisal',
    'rapd.toneF': 'Commit to and embrace effective project management and continuous improvement',
    'rapd.itemsToEmphasize': 'Items to emphasize',
    'rapd.duringDiscussion': 'During this discussion and throughout the audit:',
    'rapd.emphasisA': 'All engagement team members contribute to the management and achievement of quality at the engagement level',
    'rapd.emphasisB': 'Maintain a questioning mind and exercise professional skepticism in gathering and evaluating evidence',
    'rapd.emphasisC': 'Maintain open and robust communication within the engagement team',
    'rapd.emphasisD': 'Remain alert for information or other conditions that might affect our assessment of fraud risks',
    'rapd.emphasisE': 'Consider any contradictory or inconsistent information we identify by:',
    'rapd.emphasisE1': 'Probing the issues',
    'rapd.emphasisE2': 'Obtaining additional evidence, as necessary',
    'rapd.emphasisE3': 'Consulting with other team members and others in the firm – including specialists, if appropriate',
    'rapd.emphasisF': 'Maintain independence and comply with ethical requirements and report any breaches (see "Personal responsibilities with respect to independence and ethical requirements" below for additional details)',
    'rapd.emphasisG': 'Set aside beliefs that management and those charged with governance are honest and have integrity.',
    'rapd.accountingPrinciples': 'To discuss the entity\'s selection and application of accounting principles, including related disclosure requirements',
    'rapd.errorSusceptibility': 'To discuss the susceptibility of financial statements to material misstatement due to error',
    'rapd.fraudSusceptibility': 'To discuss the susceptibility of financial statements to material misstatement due to fraud',
    'rapd.personalResponsibilities': 'Personal responsibilities with respect to independence and ethical requirements',
    
    // CERAMIC Section
    'ceramic.title': 'CERAMIC Risk Assessment',
    'ceramic.description': 'Identify and assess the risks of material misstatement',
    
    // TCWG Communications Section
    'tcwg.title': 'Communications with Those Charged with Governance',
    
    // Independence Requirements Section
    'independence.title': 'Independence Requirements',
    
    // Entity Environment Section
    'entityEnvironment.title': 'Entity and Its Environment',
    
    // Business Processes Section
    'businessProcesses.title': 'Business Processes',
    
    // DI Section
    'di.title': 'Documentation Index',
    
    // Comptes A Pouvoir Section
    'comptesAPouvoir.title': 'Comptes à Pouvoir',
    
    // Financial Reporting Process Section
    'financialReporting.title': 'Financial Reporting Process',
    
    // Materiality Section
    'materiality.title': 'Materiality',
    'materiality.identifyMetrics': 'Identify the relevant metrics and determine the benchmark',
    'materiality.mbtApplicable': 'Metrics and Benchmark Table (MBT) that is applicable for the entity',
    'materiality.mbtIndustry': 'MBT Industry or Scenarios',
    'materiality.financialInfo': 'Financial information used for materiality calculation',
    'materiality.periodSelection': 'Period selection',
    'materiality.relevantMetric': 'Relevant metric(s)',
    'materiality.benchmark': 'Benchmark',
    'materiality.mbt': 'MBT',
    'materiality.amount': 'Amount',
    'materiality.metricType': 'Metric type',
    'materiality.relevant': 'Relevant',
    'materiality.manualAdjustment': 'Manual adjustment',
    'materiality.adjustedAmount': 'Adjusted amount',
    'materiality.expectedHigherRange': 'Expected higher range',
    'materiality.expectedLowerRange': 'Expected lower range',
    'materiality.qualitativeFactors': 'Qualitative factors',
    'materiality.factors': 'Factors',
    'materiality.higherLowerAmount': 'Higher/Lower amount',
    'materiality.consideration': 'Consideration',
    'materiality.materialityAssessment': 'Materiality assessment',
    'materiality.amountOfMetric': 'Amount of metric',
    'materiality.materialityPercentage': 'Materiality as a %',
    'materiality.guidelineRange': 'Guideline range',
    'materiality.changesInCircumstances': 'Determine whether to revise materiality and other materiality measures',
    'materiality.considerChanges': 'Consider whether changes in circumstances have occurred',
    'materiality.eventsQuestion': 'Have there been any events or changes in conditions that occurred after we established materiality for the financial statements as a whole (and the related materiality measures), that are likely to affect the users\' perceptions about the entity?',
    'materiality.determineActualAmount': 'Determine the actual amount of the relevant metrics, including the benchmark',
    'materiality.compareAmounts': 'Compare the amounts of the relevant metrics we used to establish materiality to the actual amounts of the relevant metrics',
    'materiality.initialAmount': 'Initial amount',
    'materiality.actualAmount': 'Actual amount',
    'materiality.adjustActualAmount': 'Adjust the actual amount, when appropriate',
    'materiality.adjustedActualAmount': 'Adjusted actual amount',
    'materiality.percentageChange': '% change in amount',
    'materiality.significantlyDifferent': 'Do the adjusted actual amounts of the relevant metrics including the benchmark indicate a materiality that is significantly different?',
    
    // Fraud Risk Assessment Section
    'fraud.title': 'Fraud Risk Assessment',
    'fraud.riskFactors': 'Fraud Risk Factors',
    'fraud.identified': 'Identified',
    'fraud.incentivesOrPressures': 'Incentives or pressures',
    'fraud.opportunities': 'Opportunities',
    'fraud.attitudesOrRationalizations': 'Attitudes or rationalizations',
    'fraud.conditionOrEvent': 'Condition or event present which could lead to a RMM due to fraud',
    'fraud.financialRisks': 'Financial risks',
    'fraud.managementGovernance': 'Management and governance',
    'fraud.otherInternalFactors': 'Other internal factors',
    'fraud.externalFactors': 'External factors',
    'fraud.misappropriationAssets': 'Misappropriation of assets',
    'fraud.otherFactors': 'Other factors',
    'fraud.assertionLevel': 'Assertion level',
    'fraud.inherentRisk': 'Inherent risk',
    'fraud.assertions': 'Assertions',
    'fraud.controlApproach': 'Control approach',
    'fraud.financialStatementLevel': 'Financial statement level',
    'fraud.fraudulentReporting': 'Fraudulent financial reporting',
    'fraud.revenueRecognition': 'Have we identified fraud risks involving improper revenue recognition?',
    'fraud.highRiskCriteria': 'High Risk Criteria',
    'fraud.rationale': 'Rationale',
    'fraud.method': 'Method',
    'fraud.linkedPopulations': 'Linked populations',
    'fraud.summary': 'Summary',
    
    // Main Business Processes Section
    'mainBusinessProcesses.title': 'Business Processes',
    'mainBusinessProcesses.financialReporting': 'Financial reporting',
    'mainBusinessProcesses.litigationClaims': 'Litigation, claims and assessments',
    'mainBusinessProcesses.ventesClients': 'Ventes - Clients',
    'mainBusinessProcesses.achatsFournisseurs': 'Achats - Fournisseurs',
    'mainBusinessProcesses.immobilisations': 'Immobilisations Incorporelles',
    'mainBusinessProcesses.stocks': 'Stocks',
    'mainBusinessProcesses.tresorerie': 'Trésorerie',
    'mainBusinessProcesses.mnsaAccounts': 'MNSA. Material non-significant accounts',
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
    'common.pickDate': 'Choisir une date',
    'common.upload': 'Télécharger',
    'common.remove': 'Supprimer',
    'common.download': 'Télécharger',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.submit': 'Soumettre',
    'common.confirm': 'Confirmer',
    'common.id': 'ID',
    'common.reference': 'Référence',
    'common.attachment': 'Pièce jointe',
    'common.noDataYet': 'Aucune donnée ajoutée',
    'common.clickToAdd': 'Cliquez sur "Ajouter" pour créer votre première entrée',
    
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
    'engagement.auditType': "Type d'audit",
    'engagement.language': 'Langue',
    'engagement.jurisdiction': 'Juridiction',
    'engagement.bumexOffice': 'Bureau BUMEX',
    'engagement.periodStart': 'Début de période',
    'engagement.periodEnd': 'Fin de période',
    'engagement.expectedStartDate': 'Date de début prévue',
    'engagement.firstTimeAudit': 'Premier audit',
    'engagement.planToRollForward': 'Prévoir de reporter un engagement',
    'engagement.enableExternalDocuments': 'Activer la capacité de recevoir des documents externes',
    'engagement.evaluationInfo': "Évaluation et approbation de l'engagement",
    'engagement.evaluationId': "ID d'évaluation de l'engagement",
    'engagement.evaluationStatus': "Statut d'évaluation de l'engagement",
    'engagement.evaluationApprovalDate': "Date d'approbation de l'évaluation",
    'engagement.plannedExpirationDate': "Date d'expiration prévue",
    'engagement.sentinelApprovalNumber': "Numéro d'approbation",
    'engagement.sentinelApprovalStatus': "Statut d'approbation",
    'engagement.sentinelApprovalDate': "Date d'approbation",
    'engagement.sentinelExpirationDate': "Date d'expiration",
    'engagement.firstPeriodAuditing': "Pendant la première période de cette relation de service d'audit, la direction ou le personnel du client effectue-t-il les procédures substantielles relatives aux soldes initiaux en collaboration avec les auditeurs BUMEX?",
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
    'engagement.placeholders.engagementId': "Entrer l'ID de la mission",
    'engagement.placeholders.projectId': "Entrer l'ID du projet",
    'engagement.placeholders.selectAuditType': "Sélectionner un type d'audit",
    'engagement.placeholders.jurisdiction': 'Entrer la juridiction',
    'engagement.placeholders.selectBumexOffice': 'Sélectionner un bureau BUMEX',
    'engagement.placeholders.evaluationId': "Entrer l'ID d'évaluation",
    'engagement.placeholders.sentinelNumber': "Entrer le numéro d'approbation",
    'engagement.selectEngagementStructure': "Sélectionner la structure d'engagement",
    'engagement.uploadPdf': 'Télécharger PDF',
    
    // File Upload Section
    'fileUpload.uploadStructure': "Télécharger le fichier de structure d'engagement",
    'fileUpload.dragDrop': 'Glissez et déposez votre fichier ici, ou cliquez pour parcourir',
    'fileUpload.supportedFormats': 'Formats pris en charge: PDF, DOC, DOCX, XLS, XLSX',
    'fileUpload.uploading': 'Téléchargement...',
    'fileUpload.uploaded': 'Fichier téléchargé avec succès',
    'fileUpload.download': 'Télécharger',
    'fileUpload.remove': 'Supprimer',
    'engagement.performProcedures': "Effectuer des procédures sur l'acceptation ou la continuité du client et de l'engagement",
    'engagement.isFirstPeriod': "S'agit-il d'une première période où nous auditerons l'entité?",
    'engagement.attachDocuments': "Joindre les documents d'acceptation/continuité client/engagement suivants:",
    'engagement.evaluationApprovalDocuments': "Documents d'évaluation / approbation",
    'engagement.otherDocuments': 'Autres documents, le cas échéant',
    'engagement.entityProfile': "Profil de l'entité",
    'engagement.teamAssignment': "Affectation d'équipe",
    'engagement.scopeAndScale': "Portée et échelle de l'engagement et autres questions stratégiques",
    
    // Engagement Type Section
    'engagementType.selectType': "Sélectionner le type d'engagement",
    'engagementType.financialStatementAuditReport': "Rapport d'audit des états financiers",
    'engagementType.auditReportDate': "Date du rapport d'audit",
    'engagementType.requiredAuditFileCloseoutDate': "Date de clôture du dossier d'audit requise",
    
    // Auditing Standards Section
    'auditingStandards.title': "Normes d'audit applicables et autres exigences législatives et réglementaires:",
    'auditingStandards.placeholder': "Entrer la norme d'audit",
    
    // Reporting Framework Section
    'reportingFramework.title': "Cadre de présentation de l'information financière applicable et autres exigences législatives et réglementaires:",
    'reportingFramework.placeholder': "Entrer le cadre de présentation de l'information financière",
    
    // Component Reporting Section
    'componentReporting.title': 'Rapport de composant',
    'componentReporting.details': 'Détails du rapport de composant',
    'componentReporting.placeholder': "Décrire la nature et la portée des exigences de rapport de composant, y compris toute instruction spécifique reçue des auditeurs de groupe...",
    'componentReporting.groupAuditor': 'Auditeur de groupe',
    'componentReporting.applicableAuditingStandards': "Normes d'audit applicables et autres exigences législatives et réglementaires:",
    'componentReporting.applicableFinancialFramework': "Cadre de présentation de l'information financière applicable et autres exigences législatives et réglementaires:",
    'componentReporting.componentReportingDate': 'Date du rapport de composant',
    'componentReporting.groupAuditReportDate': "Date du rapport d'audit de groupe",
    'componentReporting.requiredComponentCloseoutDate': 'Date de clôture du composant requise',
    'componentReporting.independenceRules': "Règles d'indépendance applicables au composant telles que communiquées par les instructions d'audit de groupe - Sélectionnez l'une des options suivantes:",
    'componentReporting.iesbaPie': 'IESBA PIE',
    'componentReporting.iesbaNonPie': 'IESBA non-PIE',
    'componentReporting.reportingToKpmgOffice': 'Rapport à un autre bureau ou cabinet membre BUMEX',
    'componentReporting.reportingToNonKpmgEntity': 'Rapport à une entité non-BUMEX',
    'componentReporting.auditingFinancialStatements': "Auditons-nous des états financiers qui sont l'un des suivants:",
    'componentReporting.consolidatedStatements': '- États financiers consolidés;',
    'componentReporting.proportionateConsolidation': '- États financiers préparés en utilisant la consolidation proportionnelle;',
    'componentReporting.equityMethod': "- États financiers qui incluent au moins un investissement comptabilisé selon la méthode de la mise en équivalence; ou",
    'componentReporting.combinedStatements': "- États financiers combinés des informations financières d'entités ou d'unités commerciales qui n'ont pas de société mère mais sont sous contrôle commun ou gestion commune?",
    
    // Reviewer Selection Section
    'reviewerSelection.title': "Sélectionner le type de réviseur(s) qui ont été identifiés pour la mission:",
    'reviewerSelection.engagementQualityControlReviewer': 'Réviseur de contrôle qualité de la mission',
    'reviewerSelection.limitedScopeQualityControlReviewer': 'Réviseur de contrôle qualité à portée limitée',
    'reviewerSelection.otherReviewer': 'Autre réviseur',
    'reviewerSelection.notApplicable': 'Non applicable',
    
    // Management Governance Section
    'managementGovernance.title': "Direction, responsables de la gouvernance et fonction d'audit interne:",
    'managementGovernance.samePersons': 'Les responsables de la gouvernance et la direction sont les mêmes personnes',
    'managementGovernance.internalAuditFunction': "L'entité a une fonction d'audit interne ou équivalente, y compris d'autres sous la direction de la direction ou des responsables de la gouvernance",
    
    // Involvement of Others Section
    'involvementOfOthers.title': "Implication d'autres personnes et compétences ou connaissances spécialisées",
    'involvementOfOthers.usesServiceOrganization': "L'entité utilise une ou plusieurs organisations de services",
    'involvementOfOthers.planToInvolveSpecialists': "Nous prévoyons d'impliquer des membres de l'équipe ayant des compétences spécialisées en comptabilité et audit et/ou d'utiliser le travail de spécialistes Bumex employés/engagés et/ou de spécialistes de la direction",
    'involvementOfOthers.specialistTeams': 'Équipes de spécialistes',
    'involvementOfOthers.noSpecialistTeams': "Aucune équipe de spécialistes ajoutée. Cliquez sur le bouton + pour ajouter une équipe de spécialistes.",
    
    // Engagement Team Section
    'engagementTeam.title': "Équipe de mission",
    'engagementTeam.sufficientResources': "Confirmer que des ressources suffisantes et appropriées pour exécuter la mission sont affectées ou mises à disposition de la mission en temps opportun",
    'engagementTeam.competenceAndCapabilities': "Confirmer que les membres de l'équipe de mission et les spécialistes BUMEX engagés et les auditeurs internes qui fournissent une assistance directe ont collectivement les compétences et capacités appropriées, y compris un temps suffisant, pour exécuter la mission",
    
    // Direction Supervision Section
    'directionSupervision.title': "Déterminer la nature, le calendrier et l'étendue de la direction et de la supervision des membres de l'équipe de mission, et la revue de leur travail",
    'directionSupervision.documentLabel': "Documenter comment nous prévoyons de diriger et superviser les membres de l'équipe de mission, y compris la revue de leur travail.",
    'directionSupervision.placeholder': "Documenter votre approche de la direction et supervision de l'équipe, y compris les procédures de revue et les méthodes de communication...",
    
    // Strategy Considerations Section
    'strategyConsiderations.title': "Autres considérations stratégiques ou de planification",
    'strategyConsiderations.significantFactors': "Identifier les facteurs qui sont significatifs pour orienter les activités de l'équipe de mission, par exemple les questions importantes et les domaines d'audit clés.",
    'strategyConsiderations.significantFactorsPlaceholder': "Identifier et décrire les facteurs significatifs, les questions et les domaines d'audit clés qui guideront les activités de l'équipe de mission...",
    'strategyConsiderations.additionalInfo': "Documenter toute information supplémentaire, par exemple le calendrier global des activités d'audit et les décisions préliminaires sur les emplacements à inclure dans notre périmètre d'audit.",
    'strategyConsiderations.additionalInfoPlaceholder': "Documenter les informations de planification supplémentaires, y compris le calendrier des activités d'audit, les décisions sur le périmètre des emplacements et autres considérations pertinentes...",
    
    // Audit Strategy Section
    'auditStrategy.infoText': "Nous considérons les informations obtenues pour définir la stratégie d'audit et planifier nos procédures d'audit sur cet écran, dans 3.x.1 Compréhension, risques et réponse pour chaque processus métier et aux emplacements suivants:",
    'auditStrategy.activateGaap': "Activer la conversion GAAP et/ou les différences GAAS pour ce rapport",
    'auditStrategy.gaapConversion': 'Activité de conversion GAAP',
    'auditStrategy.gaasConversion': 'Activité de conversion GAAS',
    'auditStrategy.methodTitle': "Méthode utilisée pour évaluer les anomalies identifiées:",
    'auditStrategy.currentPeriod': 'Période en cours',
    'auditStrategy.priorPeriod': 'Période précédente',
    'auditStrategy.dualMethod': 'Méthode duale',
    'auditStrategy.balanceSheetMethod': 'Méthode du bilan',
    'auditStrategy.incomeStatementMethod': 'Méthode du compte de résultat',
    
    // Entity Profile Section
    'entityProfile.internationalCriteria': "Nous confirmons que l'entité/mission répond à tous les critères internationaux suivants:",
    'entityProfile.entityCriteria': "L'entité:",
    'entityProfile.notPie': "- n'est pas une Entité d'Intérêt Public (EIP), telle que déterminée par le cabinet membre sur la base de la définition du Manuel mondial de gestion de la qualité et des risques (GQ&RMM)",
    'entityProfile.notPubliclyTraded': "- n'est pas une entité cotée en bourse",
    'entityProfile.notBank': "- n'est pas une Banque, telle que définie pour les critères EIP améliorés internationaux",
    'entityProfile.notInsurance': "- n'est pas une entité d'assurance dont l'une des fonctions principales est de fournir des assurances au public",
    'entityProfile.satsTitle': "Créer une liste des SAT à utiliser sur la mission",
    'entityProfile.satsQuestion': "Outre Bumex Auditcore – Standard, utilisez-vous des SAT sur la mission qui ne figurent pas déjà sur la liste SAT du cabinet membre?",
    'entityProfile.satsList': 'Liste des SAT',
    'entityProfile.addSat': 'Ajouter SAT',
    'entityProfile.reliabilityEvaluation': "Considérer la fiabilité des résultats fournis en évaluant la conception et en testant le fonctionnement cohérent de ces outils dans la mesure nécessaire.",
    'entityProfile.enterReliability': "Entrer votre évaluation de la fiabilité...",
    
    // IT Environment Section
    'itEnvironment.title': "Comprendre l'organisation informatique et les systèmes informatiques de l'entité",
    'itEnvironment.relyOnAutomatedControls': "Prévoyez-vous de vous appuyer sur des contrôles automatisés?",
    'itEnvironment.benchmarkingStrategy': "Prévoyez-vous de prendre la stratégie de benchmarking pour tester les contrôles automatisés?",
    'itEnvironment.keyMembersInquired': "Nous avons interrogé les membres clés suivants de l'organisation informatique principalement responsables de l'environnement informatique:",
    'itEnvironment.intervieweesTitle': "Personnes interrogées de l'organisation informatique",
    'itEnvironment.addInterviewee': 'Ajouter un interviewé',
    'itEnvironment.intervieweeName': "Nom de l'interviewé",
    'itEnvironment.intervieweePosition': "Poste de l'interviewé",
    'itEnvironment.bumexInterviewers': 'Intervieweurs Bumex',
    'itEnvironment.dateOfMeeting': 'Date de la réunion',
    'itEnvironment.itLayersDocumentation': "Documenter la ou les couches informatiques (y compris le titre et la version) qui composent les systèmes informatiques utilisés par l'entité dans le cadre de leurs processus de reporting financier et métier, y compris le(s) processus utilisant chaque système(s) informatique(s) (par couche informatique), et indication de l'externalisation:",
    'itEnvironment.addItLayer': 'Ajouter une couche informatique',
    'itEnvironment.itLayers': 'Couche(s) informatique(s)',
    'itEnvironment.descriptionOfItSystem': 'Description de la couche du système informatique',
    'itEnvironment.layerType': 'Type de couche',
    'itEnvironment.financialReporting': 'Reporting financier',
    'itEnvironment.process': 'Processus',
    'itEnvironment.outsourced': 'Externalisé',
    'itEnvironment.serviceOrganizations': 'Organisations de services',
    'itEnvironment.newAccountingSoftware': 'Nouveau logiciel comptable',
    'itEnvironment.softwareEffects': 'Description des effets du logiciel',
    'itEnvironment.processesUnderstanding': 'Compréhension des processus',
    'itEnvironment.riskAssessmentProcedures': "Procédures d'évaluation des risques",
    'itEnvironment.cybersecurityRisks': 'Risques de cybersécurité',
    
    // Multi Reporting Section
    'multiReporting.title': 'Multi-reporting',
    'multiReporting.planningToUse': "Prévoyez-vous d'utiliser le Multi-reporting?",
    'multiReporting.identifyReports': "Identifier les rapports (compléter ce tableau uniquement après l'exécution du report si nous prévoyons de reporter les rapports de la période précédente)",
    'multiReporting.reportId': 'ID du rapport',
    'multiReporting.reportName': 'Nom du rapport',
    'multiReporting.legalEntity': 'Entité juridique',
    'multiReporting.isPrimaryReport': 'Est le rapport principal?',
    'multiReporting.noReports': "Aucun rapport ajouté. Cliquez sur le bouton + pour ajouter un rapport.",
    
    // RAPD Section
    'rapd.title': "Discuter des questions affectant l'identification et l'évaluation des RMM parmi l'équipe de mission",
    'rapd.meetingDate': 'Date de la réunion:',
    'rapd.identifyTeamMembers': "Identifier les membres clés de l'équipe de mission",
    'rapd.teamMember': "Membre de l'équipe de mission",
    'rapd.role': 'Rôle',
    'rapd.attendedMeeting': 'A assisté à la réunion',
    'rapd.documentMatters': "Documenter les questions importantes communiquées à ceux qui n'ont pas pu assister",
    'rapd.noTeamMembers': 'Aucun membre d\'équipe ajouté. Cliquez sur "Ajouter" pour créer votre première entrée.',
    'rapd.fraudBrainstorming': 'La discussion de brainstorming sur la fraude a-t-elle eu lieu lors de la même réunion que le RAPD?',
    'rapd.agendaConfirmation': "Nous confirmons avoir discuté, au minimum, des éléments inclus dans l'ordre du jour RAPD, sauf si l'élément est indiqué comme optionnel.",
    'rapd.settingTone': "Donner le ton de notre audit",
    'rapd.toneA': "Le but de notre pratique d'audit est de servir et protéger les marchés des capitaux et l'intérêt public",
    'rapd.toneB': "Nous définissons la qualité de l'audit comme le résultat lorsque les audits sont exécutés de manière cohérente, conformément aux exigences et à l'intention des normes professionnelles applicables et des exigences légales et réglementaires applicables, ainsi qu'aux politiques Bumex, dans un système solide de contrôles qualité.",
    'rapd.toneC': "Nous nous engageons au plus haut professionnalisme, intégrité, objectivité et indépendance",
    'rapd.toneD': "Donner le ton est une responsabilité partagée qui est menée au niveau de la mission par l'associé responsable",
    'rapd.toneE': 'Notre culture',
    'rapd.toneE1': "importance du scepticisme professionnel",
    'rapd.toneE2': "s'assurer que notre travail est cohérent avec l'objectif de notre travail",
    'rapd.toneE3': 'faire ce qui est juste',
    'rapd.toneE4': 'être conscient des pressions indues',
    'rapd.toneE5': "lever la main si vous voyez quelque chose d'incohérent dans notre travail ou dans notre équipe ou en conflit avec nos valeurs fondamentales",
    'rapd.toneE6': "moyens de lever la main sans crainte de représailles",
    'rapd.toneF': "S'engager et adopter une gestion de projet efficace et une amélioration continue",
    'rapd.itemsToEmphasize': 'Points à souligner',
    'rapd.duringDiscussion': "Pendant cette discussion et tout au long de l'audit:",
    'rapd.emphasisA': "Tous les membres de l'équipe de mission contribuent à la gestion et à la réalisation de la qualité au niveau de la mission",
    'rapd.emphasisB': "Maintenir un esprit interrogatif et exercer un scepticisme professionnel dans la collecte et l'évaluation des preuves",
    'rapd.emphasisC': "Maintenir une communication ouverte et robuste au sein de l'équipe de mission",
    'rapd.emphasisD': "Rester attentif aux informations ou autres conditions qui pourraient affecter notre évaluation des risques de fraude",
    'rapd.emphasisE': "Considérer toute information contradictoire ou incohérente que nous identifions en:",
    'rapd.emphasisE1': 'Approfondissant les questions',
    'rapd.emphasisE2': 'Obtenant des preuves supplémentaires, si nécessaire',
    'rapd.emphasisE3': "Consultant d'autres membres de l'équipe et d'autres au sein du cabinet – y compris des spécialistes, le cas échéant",
    'rapd.emphasisF': "Maintenir l'indépendance et se conformer aux exigences éthiques et signaler tout manquement (voir \"Responsabilités personnelles en matière d'indépendance et d'exigences éthiques\" ci-dessous pour plus de détails)",
    'rapd.emphasisG': "Mettre de côté les croyances selon lesquelles la direction et les responsables de la gouvernance sont honnêtes et intègres.",
    'rapd.accountingPrinciples': "Pour discuter de la sélection et de l'application par l'entité des principes comptables, y compris les exigences de divulgation connexes",
    'rapd.errorSusceptibility': "Pour discuter de la susceptibilité des états financiers aux anomalies significatives dues à des erreurs",
    'rapd.fraudSusceptibility': "Pour discuter de la susceptibilité des états financiers aux anomalies significatives dues à la fraude",
    'rapd.personalResponsibilities': "Responsabilités personnelles en matière d'indépendance et d'exigences éthiques",
    
    // CERAMIC Section
    'ceramic.title': "Évaluation des risques CERAMIC",
    'ceramic.description': "Identifier et évaluer les risques d'anomalies significatives",
    
    // TCWG Communications Section
    'tcwg.title': 'Communications avec les responsables de la gouvernance',
    
    // Independence Requirements Section
    'independence.title': "Exigences d'indépendance",
    
    // Entity Environment Section
    'entityEnvironment.title': "L'entité et son environnement",
    
    // Business Processes Section
    'businessProcesses.title': 'Processus métier',
    
    // DI Section
    'di.title': 'Index de documentation',
    
    // Comptes A Pouvoir Section
    'comptesAPouvoir.title': 'Comptes à pouvoir',
    
    // Financial Reporting Process Section
    'financialReporting.title': 'Processus de reporting financier',
    
    // Materiality Section
    'materiality.title': 'Seuil de signification',
    'materiality.identifyMetrics': "Identifier les métriques pertinentes et déterminer le benchmark",
    'materiality.mbtApplicable': "Tableau des métriques et benchmarks (MBT) applicable à l'entité",
    'materiality.mbtIndustry': 'Industrie ou scénarios MBT',
    'materiality.financialInfo': "Informations financières utilisées pour le calcul du seuil de signification",
    'materiality.periodSelection': 'Sélection de la période',
    'materiality.relevantMetric': 'Métrique(s) pertinente(s)',
    'materiality.benchmark': 'Benchmark',
    'materiality.mbt': 'MBT',
    'materiality.amount': 'Montant',
    'materiality.metricType': 'Type de métrique',
    'materiality.relevant': 'Pertinent',
    'materiality.manualAdjustment': 'Ajustement manuel',
    'materiality.adjustedAmount': 'Montant ajusté',
    'materiality.expectedHigherRange': 'Fourchette supérieure attendue',
    'materiality.expectedLowerRange': 'Fourchette inférieure attendue',
    'materiality.qualitativeFactors': 'Facteurs qualitatifs',
    'materiality.factors': 'Facteurs',
    'materiality.higherLowerAmount': 'Montant supérieur/inférieur',
    'materiality.consideration': 'Considération',
    'materiality.materialityAssessment': 'Évaluation du seuil de signification',
    'materiality.amountOfMetric': 'Montant de la métrique',
    'materiality.materialityPercentage': 'Seuil de signification en %',
    'materiality.guidelineRange': 'Fourchette indicative',
    'materiality.changesInCircumstances': "Déterminer s'il faut réviser le seuil de signification et les autres mesures de signification",
    'materiality.considerChanges': "Considérer si des changements de circonstances se sont produits",
    'materiality.eventsQuestion': "Y a-t-il eu des événements ou des changements de conditions survenus après l'établissement du seuil de signification pour les états financiers dans leur ensemble (et les mesures de signification connexes), susceptibles d'affecter les perceptions des utilisateurs concernant l'entité?",
    'materiality.determineActualAmount': "Déterminer le montant réel des métriques pertinentes, y compris le benchmark",
    'materiality.compareAmounts': "Comparer les montants des métriques pertinentes que nous avons utilisés pour établir le seuil de signification aux montants réels des métriques pertinentes",
    'materiality.initialAmount': 'Montant initial',
    'materiality.actualAmount': 'Montant réel',
    'materiality.adjustActualAmount': "Ajuster le montant réel, le cas échéant",
    'materiality.adjustedActualAmount': 'Montant réel ajusté',
    'materiality.percentageChange': '% de variation du montant',
    'materiality.significantlyDifferent': "Les montants réels ajustés des métriques pertinentes, y compris le benchmark, indiquent-ils un seuil de signification significativement différent?",
    
    // Fraud Risk Assessment Section
    'fraud.title': 'Évaluation des risques de fraude',
    'fraud.riskFactors': 'Facteurs de risque de fraude',
    'fraud.identified': 'Identifié',
    'fraud.incentivesOrPressures': 'Incitations ou pressions',
    'fraud.opportunities': 'Opportunités',
    'fraud.attitudesOrRationalizations': 'Attitudes ou rationalisations',
    'fraud.conditionOrEvent': "Condition ou événement présent pouvant conduire à un RMM dû à la fraude",
    'fraud.financialRisks': 'Risques financiers',
    'fraud.managementGovernance': 'Direction et gouvernance',
    'fraud.otherInternalFactors': 'Autres facteurs internes',
    'fraud.externalFactors': 'Facteurs externes',
    'fraud.misappropriationAssets': "Détournement d'actifs",
    'fraud.otherFactors': 'Autres facteurs',
    'fraud.assertionLevel': "Niveau d'assertion",
    'fraud.inherentRisk': 'Risque inhérent',
    'fraud.assertions': 'Assertions',
    'fraud.controlApproach': 'Approche de contrôle',
    'fraud.financialStatementLevel': 'Niveau des états financiers',
    'fraud.fraudulentReporting': 'Reporting financier frauduleux',
    'fraud.revenueRecognition': "Avons-nous identifié des risques de fraude impliquant une reconnaissance inappropriée des revenus?",
    'fraud.highRiskCriteria': 'Critères à haut risque',
    'fraud.rationale': 'Justification',
    'fraud.method': 'Méthode',
    'fraud.linkedPopulations': 'Populations liées',
    'fraud.summary': 'Résumé',
    
    // Main Business Processes Section
    'mainBusinessProcesses.title': 'Processus métier',
    'mainBusinessProcesses.financialReporting': 'Reporting financier',
    'mainBusinessProcesses.litigationClaims': 'Litiges, réclamations et évaluations',
    'mainBusinessProcesses.ventesClients': 'Ventes - Clients',
    'mainBusinessProcesses.achatsFournisseurs': 'Achats - Fournisseurs',
    'mainBusinessProcesses.immobilisations': 'Immobilisations incorporelles',
    'mainBusinessProcesses.stocks': 'Stocks',
    'mainBusinessProcesses.tresorerie': 'Trésorerie',
    'mainBusinessProcesses.mnsaAccounts': 'MNSA. Comptes non significatifs mais matériels',
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
