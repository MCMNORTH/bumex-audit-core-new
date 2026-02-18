import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Client, User, Project } from '@/types';
import { ProjectFormData } from '@/types/formData';
import ProjectHeader from './ProjectHeader';
import ProjectDashboardSection from './ProjectDashboardSection';
import EngagementProfileSection from './EngagementProfileSection';
import IndependenceRequirementsSection from './IndependenceRequirementsSection';
import { Separator } from '@/components/ui/separator';
import TCWGCommunicationsSection from './TCWGCommunicationsSection';
import MaterialityMetricsSection from './MaterialityMetricsSection';
import EntityEnvironmentSection from './EntityEnvironmentSection';
import RAPDSection from './RAPDSection';
import CERAMICSection from './CERAMICSection';
import ITEnvironmentSection from './EngagementScope/ITEnvironmentSection';
import BusinessProcessesSection from './BusinessProcessesSection';
import DISection from './DISection';
import ComptesAPouvoirSection from './ComptesAPouvoirSection';
import FraudRiskAssessmentSection from './FraudRiskAssessmentSection';
import FinancialReportingProcessSection from './FinancialReportingProcessSection';
import TeamSection from './TeamSection';
import SectionWrapper from './SectionWrapper';
import ProjectSignOffsSummary from './ProjectSignOffsSummary';
import CompactReviewFooter from './CompactReviewFooter';
import KnowledgeBasePage from '@/pages/KnowledgeBasePage';
import { canEditProject, canViewTeamManagement, getPendingReviewRoles } from '@/utils/permissions';
import { CommentsProvider } from '@/contexts/CommentsContext';
import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type FsNode = {
  id: string;
  label: string;
  kind: 'group' | 'account';
  code?: string;
  accounts: string[];
  children: FsNode[];
};
interface ProjectEditContentProps {
  project: Project | null;
  clients: Client[];
  users: User[];
  formData: ProjectFormData;
  activeSection: string;
  saving: boolean;
  currentUserId?: string;
  uploadedFile: File | null;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  fileInputRef: React.RefObject<HTMLInputElement>;
  onBack: () => void;
  onSave: () => void;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
  onAssignmentChange: (field: string, value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onDownloadFile: () => void;
  projectId?: string;
  // MRR file upload props
  mrrUploadedFile: File | null;
  mrrUploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  mrrFileInputRef: React.RefObject<HTMLInputElement>;
  onMRRFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMRRFile: () => void;
  onDownloadMRRFile: () => void;
  onSectionChange?: (sectionId: string) => void; // NEW, optional, fallback gracefully
  sidebarSections?: any[]; // Accepts the sidebar sections for dynamic cards
  onReview?: (sectionId: string) => void;
  onUnreview?: (sectionId: string, role: string, userId: string) => void;
  // Comments props
  onCreateComment?: (fieldId: string, sectionId: string, fieldLabel?: string) => void;
  getFieldCommentCount?: (sectionId: string, fieldId: string) => number;
  // Dashboard props
  signOffData?: {
    total: number;
    unsigned: number;
    unsignedSections: { id: string; title: string; number?: string }[];
  };
  pendingReviews?: {
    sectionId: string;
    sectionTitle: string;
    pendingRoles: string[];
  }[];
  teamMemberCount?: number;
  currentSectionTitle?: string;
}
const ProjectEditContent = ({
  project,
  clients,
  users,
  formData,
  activeSection,
  saving,
  currentUserId,
  uploadedFile,
  uploadStatus,
  fileInputRef,
  onBack,
  onSave,
  onFormDataChange,
  onAssignmentChange,
  onFileUpload,
  onRemoveFile,
  onDownloadFile,
  projectId,
  // MRR file upload props
  mrrUploadedFile,
  mrrUploadStatus,
  mrrFileInputRef,
  onMRRFileUpload,
  onRemoveMRRFile,
  onDownloadMRRFile,
  onSectionChange = () => {},
  sidebarSections = [],
  onReview = () => {},
  onUnreview = () => {},
  onCreateComment = () => {},
  getFieldCommentCount = () => 0,
  signOffData = { total: 0, unsigned: 0, unsignedSections: [] },
  pendingReviews = [],
  teamMemberCount = 0,
  currentSectionTitle,
}: ProjectEditContentProps) => {
  const selectedClient = clients.find(c => c.id === formData.client_id);
  const currentUser = users.find(u => u.id === currentUserId);
  const canEdit = canEditProject(currentUser || null, formData);
  const [conclusionFsStructure, setConclusionFsStructure] = useState<{
    template: 'bumex_pcm' | 'manual';
    tree: FsNode[];
  } | null>(null);
  const [conclusionFsLoading, setConclusionFsLoading] = useState(false);
  const [conclusionFsError, setConclusionFsError] = useState<string | null>(null);
  const [conclusionFinalAnalyticsPeriod, setConclusionFinalAnalyticsPeriod] = useState<'CY' | 'PY' | 'CY_PY'>('CY_PY');
  const [conclusionFinalAnalyticsCollapsed, setConclusionFinalAnalyticsCollapsed] = useState<Set<string>>(new Set());
  const [conclusionFinalAnalyticsComments, setConclusionFinalAnalyticsComments] = useState<Record<string, string>>({});
  const [conclusionFinalAnalyticsUnexpectedItems, setConclusionFinalAnalyticsUnexpectedItems] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [conclusionFinalAnalyticsAdditionalProcedures, setConclusionFinalAnalyticsAdditionalProcedures] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [dynamicProcessMappingDoc, setDynamicProcessMappingDoc] = useState<{
    mappings?: Array<{ account: string; processId: string }>;
    processes?: Array<{ id: string; name: string }>;
  } | null>(null);
  const [dynamicProcessAnswers, setDynamicProcessAnswers] = useState<Record<string, 'YES' | 'NO' | 'NONE'>>({});
  const [dynamicProcessProcedureRows, setDynamicProcessProcedureRows] = useState<Record<string, Array<{ id: string; description: string }>>>({});
  const [dynamicProcessTecRows, setDynamicProcessTecRows] = useState<Record<string, Array<{ category: string; id: string; description: string; applicable: boolean; addNotes: boolean }>>>({});
  const [dynamicProcessWalkthroughRows, setDynamicProcessWalkthroughRows] = useState<Record<string, Array<{ processStep: string; activityStep: string; understanding: string }>>>({});
  const [dynamicProcessItLayerRows, setDynamicProcessItLayerRows] = useState<Record<string, Array<{ reference: string; itLayers: string; description: string; layerType: string; outsourced: boolean }>>>({});
  const [dynamicProcessControlRows, setDynamicProcessControlRows] = useState<Record<string, Array<{ controlId: string; controlDescription: string; processRiskPoints: string; diResult: string; toeResult: string }>>>({});
  const [dynamicProcessSubstantiveRows, setDynamicProcessSubstantiveRows] = useState<Record<string, Array<{ plannedResponse: string; applicable: boolean; addNotes: boolean }>>>({});
  const [dynamicProcessResultsChecks, setDynamicProcessResultsChecks] = useState<Record<string, {
    significantAccountsDisclosures: boolean;
    timingChanges: boolean;
    expertsInvolvementChanges: boolean;
    serviceOrganizationsIdentified: boolean;
    contradictoryEvidenceIdentified: boolean;
    otherCircumstances: boolean;
  }>>({});

  const [controlAttributesJudgment, setControlAttributesJudgment] = useState(false);
  const [procedureNature, setProcedureNature] = useState<'AUTOMATED' | 'MANUAL' | ''>('');
  const [procedureType, setProcedureType] = useState<'DETECTIVE' | 'PREVENTIVE' | ''>('');
  const [procedureFrequency, setProcedureFrequency] = useState('');
  const [processRiskCode, setProcessRiskCode] = useState('');
  const [processRiskDescription, setProcessRiskDescription] = useState('');
  const [controlOperators, setControlOperators] = useState([
    { id: 1, roleOrName: '', competence: '' }
  ]);
  const [authorityAnswer, setAuthorityAnswer] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [precisionAnswer, setPrecisionAnswer] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [evalMethods, setEvalMethods] = useState({
    inquiry: false,
    observation: false,
    inspection: false
  });
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [designAnswer, setDesignAnswer] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [implementationAnswer, setImplementationAnswer] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [preliminaryRawtc, setPreliminaryRawtc] = useState('');
  const [assessedRawtc, setAssessedRawtc] = useState('');
  const [priorEvidenceAnswer, setPriorEvidenceAnswer] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [designMethods, setDesignMethods] = useState({
    inquire: false,
    observe: false,
    inspect: false,
    reperform: false,
    involvesJudgment: false
  });
  const [proceduresDescription, setProceduresDescription] = useState('');
  const [timingFrom, setTimingFrom] = useState('');
  const [timingTo, setTimingTo] = useState('');
  const [extentDescription, setExtentDescription] = useState('');
  const [selectionInfoAnswer, setSelectionInfoAnswer] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [sampleSize, setSampleSize] = useState('');
  const [increaseSampleSize, setIncreaseSampleSize] = useState(false);
  const [unpredictability, setUnpredictability] = useState(false);
  const [operatingEvidence, setOperatingEvidence] = useState({
    samplingTool: false,
    generateTemplate: false,
    attachDocumentation: false
  });
  const [toeAttachments, setToeAttachments] = useState<string[]>([]);
  const [newToeAttachment, setNewToeAttachment] = useState('');
  const [deviationsAnswer, setDeviationsAnswer] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [operatingEffectivenessResult, setOperatingEffectivenessResult] = useState('');
  const [remediationRequired, setRemediationRequired] = useState('');
  const [relatedPartyReference, setRelatedPartyReference] = useState('');
  const [relatedPartyDescription, setRelatedPartyDescription] = useState('');
  const [relatedPartyAccounts, setRelatedPartyAccounts] = useState([
    { id: 1, label: '' }
  ]);
  const [relatedPartyCharacteristics, setRelatedPartyCharacteristics] = useState({
    unusualTransaction: false,
    significantTransaction: false,
    requiredDisclosure: false,
    armsLengthStatement: false
  });
  const [relatedPartyRisks, setRelatedPartyRisks] = useState([
    { id: 1, riskId: '', description: '', inherentRisk: '', controlsApproach: false }
  ]);
  const [relatedPartyControlsAnswer, setRelatedPartyControlsAnswer] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [relatedPartyImpact, setRelatedPartyImpact] = useState('');
  const [controlDeficiencies, setControlDeficiencies] = useState([
    { id: 1, deficiencyId: '', description: '' }
  ]);
  const [assertionRisks, setAssertionRisks] = useState([
    { id: 1, riskId: '', description: '', inherentRisk: '', inherentFactors: '', assertions: '', controlsApproach: false }
  ]);
  const [businessPurpose, setBusinessPurpose] = useState('');
  const [additionalProceduresAnswer, setAdditionalProceduresAnswer] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [evaluateFraudAnswer, setEvaluateFraudAnswer] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [evaluateEvidenceAnswer, setEvaluateEvidenceAnswer] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationProcessAnalytics, setLitigationProcessAnalytics] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationProcedureRows, setLitigationProcedureRows] = useState([
    { id: 1, ref: '', description: '' }
  ]);
  const [litigationProcedureInfo, setLitigationProcedureInfo] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationProcedureResults, setLitigationProcedureResults] = useState('');
  const [litigationApplicableRows, setLitigationApplicableRows] = useState([
    { id: 1, category: '', ref: '', description: '', applicable: false, notes: '' }
  ]);
  const [litigationEstimateRmm, setLitigationEstimateRmm] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationEstimatePriorRmm, setLitigationEstimatePriorRmm] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationPolicyChecks, setLitigationPolicyChecks] = useState({
    significantChanges: false,
    judgmentRequired: false,
    controversialPolicies: false,
    unusualTransactions: false,
    alternatives: false,
    managementBias: false,
  });
  const [litigationPolicyNotes, setLitigationPolicyNotes] = useState('');
  const [litigationWalkthrough, setLitigationWalkthrough] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationProcessSteps, setLitigationProcessSteps] = useState([
    { id: 1, processStep: '', activityStep: '', understanding: '' }
  ]);
  const [litigationItLayers, setLitigationItLayers] = useState([
    { id: 1, reference: '', layer: '', description: '', layerType: '', outsourced: false }
  ]);
  const [litigationItChecks, setLitigationItChecks] = useState({
    layerRelatesEstimates: false,
    serviceOrgRelevant: false,
    specialistsRelevant: false,
  });
  const [litigationRiskRows, setLitigationRiskRows] = useState([
    { id: 1, riskId: '', description: '', inherentRisk: '', riskFactors: '', assertions: '', substantiveOnly: false, controlsApproach: false }
  ]);
  const [litigationGeneralProcedures, setLitigationGeneralProcedures] = useState([
    { id: 1, procedureId: '', procedureName: '', description: '' }
  ]);
  const [litigationRmmSpecificProcedures, setLitigationRmmSpecificProcedures] = useState([
    {
      id: 1,
      rmId: '',
      rmDescription: '',
      inherentRisk: '',
      significantAccounts: '',
      assertions: '',
      procedures: [{ id: 1, type: '', procedureId: '', description: '', evidenceObtained: false }]
    }
  ]);
  const [litigationRmmAggregate, setLitigationRmmAggregate] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationRmmMagnitude, setLitigationRmmMagnitude] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationRmmSimilar, setLitigationRmmSimilar] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationOtherConsiderations, setLitigationOtherConsiderations] = useState(false);
  const [litigationResultsModifications, setLitigationResultsModifications] = useState({
    significantAccounts: false,
    timingChanges: false,
    expertsInvolvement: false,
    serviceOrganizations: false,
    contradictoryEvidence: false,
    otherCircumstances: false,
  });
  const [litigationResultsRiskAssessmentStillAppropriate, setLitigationResultsRiskAssessmentStillAppropriate] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationResultsSufficientEvidence, setLitigationResultsSufficientEvidence] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationTodClarifyDescription, setLitigationTodClarifyDescription] = useState(false);
  const [litigationTodUnpredictability, setLitigationTodUnpredictability] = useState(false);
  const [litigationTodSpecialists, setLitigationTodSpecialists] = useState(false);
  const [litigationTodNature, setLitigationTodNature] = useState({
    inspection: false,
    observation: false,
    inquiry: false,
    confirmation: false,
    recalculation: false,
    reperformance: false,
  });
  const [litigationTodAlternativeProcedures, setLitigationTodAlternativeProcedures] = useState(false);
  const [litigationTodInfoUsed, setLitigationTodInfoUsed] = useState({
    usesInformation: false,
    externalReliable: false,
    internalOrUncertain: false,
  });
  const [litigationTodInfoRelevanceNote, setLitigationTodInfoRelevanceNote] = useState('');
  const [litigationTodUseRoutines, setLitigationTodUseRoutines] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationTodTiming, setLitigationTodTiming] = useState<'INTERIM' | 'THROUGHOUT' | 'PERIOD_END' | 'NONE'>('NONE');
  const [litigationTodPeriodStartDate, setLitigationTodPeriodStartDate] = useState('');
  const [litigationTodPeriodEndDate, setLitigationTodPeriodEndDate] = useState('');
  const [litigationTodExtent, setLitigationTodExtent] = useState<'ALL_ITEMS' | 'SPECIFIC_ITEMS' | 'SUBSTANTIVE_SAMPLING' | 'NONE'>('NONE');
  const [litigationTodPopulationDefinition, setLitigationTodPopulationDefinition] = useState('');
  const [litigationTodPopulationCharacteristics, setLitigationTodPopulationCharacteristics] = useState({
    reciprocalPopulation: false,
    negativeAndPositiveItems: false,
    zeroValueItems: false,
    multipleLocations: false,
  });
  const [litigationTodProcedureResultDefinition, setLitigationTodProcedureResultDefinition] = useState('');
  const [litigationTodMisstatementDefinition, setLitigationTodMisstatementDefinition] = useState('');
  const [litigationTodPerformTemplateRows, setLitigationTodPerformTemplateRows] = useState([
    { id: 1, templateId: '', dataset: '', procedureTemplate: '', fileName: '', attachment: '' },
  ]);
  const [litigationTodPerformResults, setLitigationTodPerformResults] = useState('');
  const [conclusionRiskRemainAppropriate, setConclusionRiskRemainAppropriate] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [conclusionRaqaChecks, setConclusionRaqaChecks] = useState({
    planningRaqaMeeting: false,
    communicationFraudRisks: false,
    communicationSignificantMatters: false,
    communicationRelatedParties: false,
  });
  const [conclusionDisagreements, setConclusionDisagreements] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [conclusionGoingConcern, setConclusionGoingConcern] = useState({
    additionalFacts: 'NONE',
    circumstancesNotGoingConcern: 'NONE',
    useRemainsAppropriate: 'NONE',
    delayApprovalStatements: 'NONE',
    sufficientEvidence: 'NONE',
  });
  const [conclusionGoingConcernNotes, setConclusionGoingConcernNotes] = useState('');
  const [conclusionManagementBias, setConclusionManagementBias] = useState({
    accountingPoliciesAlternatives: 'NONE',
    disclosureAlternatives: 'NONE',
    disclosureSpecificBenefit: 'NONE',
    disclosureConclusion: 'NONE',
    estimatesGroupedEnds: 'NONE',
    qualitativeConcerns: 'NONE',
  });
  const [conclusionManagementBiasEstimateNote, setConclusionManagementBiasEstimateNote] = useState('');
  const [conclusionEvaluateFinancialStatements, setConclusionEvaluateFinancialStatements] = useState({
    frameworkReference: 'NONE',
    comparativeRequired: 'NONE',
    comparativeAgree: 'NONE',
    comparativePoliciesConsistent: 'NONE',
    disclosureChecklistRequired: 'NONE',
    requiredDisclosuresIncluded: 'NONE',
    policyChangesPresented: 'NONE',
    policiesConsistentWithFramework: 'NONE',
    policiesAppropriate: 'NONE',
    policiesDisclosed: 'NONE',
    estimatesReasonable: 'NONE',
    formArrangementAppropriate: 'NONE',
    substanceConsistentWithForm: 'NONE',
    reflectsUnderlyingTransactions: 'NONE',
    adequateTransactionDisclosures: 'NONE',
    relatedPartiesDisclosed: 'NONE',
    sufficientEvidenceForRmm: 'NONE',
  });
  const [conclusionFsChecklistAttachments, setConclusionFsChecklistAttachments] = useState<string[]>([]);
  const [conclusionFsChecklistAttachmentDraft, setConclusionFsChecklistAttachmentDraft] = useState('');
  const [conclusionFsPresentationMisstatement, setConclusionFsPresentationMisstatement] = useState('');
  const [conclusionFsUnderlyingMisstatement, setConclusionFsUnderlyingMisstatement] = useState('');
  const [conclusionFsRelatedPartiesMisstatement, setConclusionFsRelatedPartiesMisstatement] = useState('');
  const [conclusionFsEvidenceRows, setConclusionFsEvidenceRows] = useState([
    { topic: '', result: '' },
  ]);
  const [conclusionSummaryMisstatementRows, setConclusionSummaryMisstatementRows] = useState([
    {
      id: '',
      description: '',
      correctedStatus: '',
      likelyFraud: '',
      misstatementType: '',
      impactProcedures: '',
      accounts: [
        {
          account: '',
          debit: '',
          credit: '',
          incomeStatementEffect: '',
          equityYearEnd: '',
          currentAssets: '',
          nonCurrentAssets: '',
          currentLiabilities: '',
          nonCurrentLiabilities: '',
          comprehensiveIncome: '',
          cashFlowEffect: '',
        },
      ],
    },
  ]);
  const [conclusionSummaryEvaluateAggregate, setConclusionSummaryEvaluateAggregate] = useState({
    controlDeficiencies: 'NONE',
    fraudOccurred: 'NONE',
  });
  const [conclusionSummaryManagementBias, setConclusionSummaryManagementBias] = useState({
    additionalAdjustingEntries: 'NONE',
    refusedCorrections: 'NONE',
  });
  const [conclusionSummaryUndetectedConsiderations, setConclusionSummaryUndetectedConsiderations] = useState('');
  const [conclusionSummaryUndetected, setConclusionSummaryUndetected] = useState({
    totalEffectIncomeStatement: '',
    couldBeMaterialInCombination: 'NONE',
    aggregateApproachMateriality: 'NONE',
  });
  const [conclusionSummaryMaterialityMethod, setConclusionSummaryMaterialityMethod] = useState('');
  const [conclusionSummaryFinalMateriality, setConclusionSummaryFinalMateriality] = useState('');
  const [conclusionSummaryLowerMaterialityRows, setConclusionSummaryLowerMaterialityRows] = useState([
    { accountOrDisclosure: '', amount: '' },
  ]);
  const [conclusionSummaryConfirmMaterialityAppropriate, setConclusionSummaryConfirmMaterialityAppropriate] = useState(false);
  const [conclusionSummaryAttachSamSpreadsheet, setConclusionSummaryAttachSamSpreadsheet] = useState(false);
  const [conclusionSummarySamMaterial, setConclusionSummarySamMaterial] = useState('NONE');
  const [conclusionSummaryBasisConclusion, setConclusionSummaryBasisConclusion] = useState('');
  const [conclusionSubsequentEventsRmmRows, setConclusionSubsequentEventsRmmRows] = useState([
    {
      id: '',
      description: '',
      car: '',
    },
  ]);
  const [conclusionSubsequentInterimProcedures, setConclusionSubsequentInterimProcedures] = useState([
    {
      procedure: '',
      result: '',
    },
  ]);
  const [conclusionSubsequentEventProcedures, setConclusionSubsequentEventProcedures] = useState([
    {
      procedure: '',
      identified: '',
    },
  ]);
  const [conclusionCompletionConfirmRiskResponses, setConclusionCompletionConfirmRiskResponses] = useState(false);
  const [conclusionCompletionRiskSummaryRows, setConclusionCompletionRiskSummaryRows] = useState([
    {
      businessProcess: '',
      rmId: '',
      rmDescription: '',
      inherentRisk: '',
      controlRiskReassessed: '',
      significantAccounts: '',
      assertions: '',
    },
  ]);
  const [conclusionCompletionControlRows, setConclusionCompletionControlRows] = useState([
    {
      controlId: '',
      controlDescription: '',
      processRiskPoints: '',
      diResult: '',
      toeResult: '',
    },
  ]);
  const [conclusionCompletionProcedureRows, setConclusionCompletionProcedureRows] = useState([
    {
      procedureType: '',
      procedureId: '',
      procedureDescription: '',
      auditEvidenceObtained: '',
    },
  ]);
  const [conclusionCompletionFindingOptions, setConclusionCompletionFindingOptions] = useState({
    accountingSelection: false,
    needModifyProcedures: false,
    disagreements: false,
    difficultyApplyingProcedures: false,
    riskAssessmentChanges: false,
    interimFindings: false,
    contradictoryInformation: false,
    other: false,
  });
  const [conclusionCompletionOtherFindingText, setConclusionCompletionOtherFindingText] = useState('');
  const [conclusionCompletionFindingDetailRows, setConclusionCompletionFindingDetailRows] = useState([
    {
      nature: '',
      procedures: '',
      basis: '',
    },
  ]);
  const [conclusionCompletionFindingsDiscussion, setConclusionCompletionFindingsDiscussion] = useState('');
  const [conclusionCompletionQualityManagement, setConclusionCompletionQualityManagement] = useState({
    selectedSecondLineDefense: 'NONE',
    fileTailored: 'NONE',
    confirmTailoringAppropriate: false,
    confirmConsultationsImplemented: false,
    conflictOfInterestSafeguards: 'NONE',
    partnerTakesResponsibility: false,
  });
  const [conclusionCompletionConsultationsNote, setConclusionCompletionConsultationsNote] = useState('');
  const [conclusionCompletionEvaluateResultsRows, setConclusionCompletionEvaluateResultsRows] = useState([
    { procedure: '', documentedWhere: '' },
  ]);
  const [conclusionCompletionAuditMatrixReviewed, setConclusionCompletionAuditMatrixReviewed] = useState(false);
  const [conclusionCompletionAuditTopicRows, setConclusionCompletionAuditTopicRows] = useState([
    { topic: '', sufficientEvidence: '' },
  ]);
  const [conclusionCompletionNotIdentifiedRows, setConclusionCompletionNotIdentifiedRows] = useState([
    { item: '' },
  ]);
  const [conclusionCompletionFinalOpinion, setConclusionCompletionFinalOpinion] = useState('NONE');
  const [conclusionReportingView, setConclusionReportingView] = useState<'landing' | 'rep-letter-report'>('landing');
  const [conclusionReportingKams, setConclusionReportingKams] = useState({
    includeKamSection: 'NONE',
    mattersRequireAttention: 'NONE',
    identifiedButNotCommunicated: 'NONE',
  });
  const [conclusionReportingRepLetterDate, setConclusionReportingRepLetterDate] = useState('');
  const [conclusionReportingRepChecks, setConclusionReportingRepChecks] = useState({
    templateSelected: false,
    dateAppropriate: false,
    addressedToAuditor: false,
    noneRemoved: false,
    additionalConsidered: false,
    signatoriesAppropriate: false,
    summaryUncorrectedAttached: false,
  });
  const [conclusionReportingRepAttachments, setConclusionReportingRepAttachments] = useState<string[]>([]);
  const [conclusionReportingRepAttachmentDraft, setConclusionReportingRepAttachmentDraft] = useState('');
  const [conclusionReportingRepConcerns, setConclusionReportingRepConcerns] = useState({
    managementCompetenceConcerns: 'NONE',
    representationsContradictEvidence: 'NONE',
    managementFailedProvideRepresentations: 'NONE',
  });
  const [conclusionReportingAuditChecks, setConclusionReportingAuditChecks] = useState({
    proceduresCompleted: false,
    authorityAssertedResponsibility: false,
    supervisionInAccordance: false,
    reportPreparedInAccordance: false,
  });
  const [conclusionReportingAuditQuestions, setConclusionReportingAuditQuestions] = useState({
    mattersModifyOpinion: 'NONE',
    consultationRequirementsApplicable: 'NONE',
  });
  const [conclusionReportingDates, setConclusionReportingDates] = useState({
    auditReportDate: '',
    requiredCloseoutDate: '',
    expectedAssemblyDate: '',
  });
  const [conclusionReportingIssuedAttachments, setConclusionReportingIssuedAttachments] = useState<string[]>([]);
  const [conclusionReportingIssuedAttachmentDraft, setConclusionReportingIssuedAttachmentDraft] = useState('');
  const [conclusionReportingAttachAdditionalKpmgReports, setConclusionReportingAttachAdditionalKpmgReports] = useState(false);
  const [conclusionReportingFinalAttachments, setConclusionReportingFinalAttachments] = useState<string[]>([]);
  const [conclusionReportingFinalAttachmentDraft, setConclusionReportingFinalAttachmentDraft] = useState('');
  const [litigationInterviews, setLitigationInterviews] = useState([
    { id: 1, name: '', role: '', position: '', interviewer: '', date: '' }
  ]);
  const [litigationLawCategories, setLitigationLawCategories] = useState({
    directIndustryFinancialReporting: false,
    directTaxLegislation: false,
    directGovernmentLegislation: false,
    directOther: false,
    indirectFraudCorruptionBribery: false,
    indirectMoneyLaundering: false,
    indirectDataProtection: false,
    indirectEnvironmental: false,
    indirectPublicHealthSafety: false,
    indirectOther: false,
  });
  const [litigationFrameworkNotes, setLitigationFrameworkNotes] = useState('');
  const [litigationManagementPoliciesNotes, setLitigationManagementPoliciesNotes] = useState('');
  const [litigationLawyerSelectionCriteria, setLitigationLawyerSelectionCriteria] = useState('');
  const [litigationInquiryResponses, setLitigationInquiryResponses] = useState('');
  const [litigationInquiryQuestions, setLitigationInquiryQuestions] = useState({
    violations: 'NONE',
    correspondence: 'NONE',
    complaintProcess: '',
    reportsToGovernance: 'NONE',
    involvedInLitigation: 'NONE',
    legalNoCounsel: 'NONE',
    changedLawyers: 'NONE',
    sendLetter: 'NONE',
    alternativeProcedures: 'NONE',
  });
  const [litigationDocumentsRows, setLitigationDocumentsRows] = useState([
    { id: 1, description: '', procedures: '', attachments: '' }
  ]);
  const [litigationDocumentsConsistency, setLitigationDocumentsConsistency] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationCounselRows, setLitigationCounselRows] = useState([
    { id: 1, reference: '', counsel: '', matter: '', sendLetter: false, receivedLetter: false }
  ]);
  const [litigationCounselRationale, setLitigationCounselRationale] = useState('');
  const [litigationContradictEvidence, setLitigationContradictEvidence] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationEvidenceExpected, setLitigationEvidenceExpected] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationNonCompliance, setLitigationNonCompliance] = useState<'YES' | 'NO' | 'NONE'>('NONE');
  const [litigationNonComplianceRationale, setLitigationNonComplianceRationale] = useState('');
  
  const handleReviewWrapper = (sectionId: string) => {
    onReview(sectionId);
  };
  const handleAssignmentChange = (userId: string, checked: boolean) => {
    const currentAssignments = formData.assigned_to || [];
    const updatedAssignments = checked ? [...currentAssignments, userId] : currentAssignments.filter(id => id !== userId);
    onFormDataChange({
      assigned_to: updatedAssignments
    });
  };

  // Wrapper function to handle form data changes in individual field format
  const handleFormDataFieldChange = (field: string, value: any) => {
    onFormDataChange({ [field]: value });
  };

  useEffect(() => {
    if (!projectId) {
      setConclusionFsStructure(null);
      setConclusionFsLoading(false);
      setConclusionFsError(null);
      return;
    }

    setConclusionFsLoading(true);
    setConclusionFsError(null);

    const structurePath = `projects/${projectId}/knowledge_base/financial_statements`;
    const unsubscribe = onSnapshot(
      doc(db, structurePath),
      (snap) => {
        setConclusionFsLoading(false);
        if (snap.exists()) {
          const data = snap.data() as {
            template: 'bumex_pcm' | 'manual';
            tree?: FsNode[];
          };
          setConclusionFsStructure({
            template: data.template,
            tree: Array.isArray(data.tree) ? data.tree : [],
          });
        } else {
          setConclusionFsStructure(null);
        }
      },
      (error) => {
        setConclusionFsLoading(false);
        setConclusionFsError((error as Error).message);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  const finalAnalyticsBalanceNByAccount = useMemo(() => {
    const map = new Map<string, number>();
    const rows = formData.source_excel_balances?.balanceN ?? [];
    rows.forEach((row) => {
      const digits = String(row.account ?? '').replace(/\D/g, '');
      if (!digits) return;
      const key = digits.padEnd(6, '0').slice(0, 6);
      if (!key) return;
      map.set(key, (map.get(key) ?? 0) + (Number(row.balance) || 0));
    });
    return map;
  }, [formData.source_excel_balances]);

  const finalAnalyticsBalanceN1ByAccount = useMemo(() => {
    const map = new Map<string, number>();
    const rows = formData.source_excel_balances?.balanceN1 ?? [];
    rows.forEach((row) => {
      const digits = String(row.account ?? '').replace(/\D/g, '');
      if (!digits) return;
      const key = digits.padEnd(6, '0').slice(0, 6);
      if (!key) return;
      map.set(key, (map.get(key) ?? 0) + (Number(row.balance) || 0));
    });
    return map;
  }, [formData.source_excel_balances]);

  useEffect(() => {
    if (!projectId) {
      setDynamicProcessMappingDoc(null);
      return;
    }

    const mappingRef = doc(db, `projects/${projectId}/knowledge_base/process_mapping`);
    const unsubscribe = onSnapshot(mappingRef, (snap) => {
      if (!snap.exists()) {
        setDynamicProcessMappingDoc(null);
        return;
      }
      const data = snap.data() as {
        mappings?: Array<{ account: string; processId: string }>;
        processes?: Array<{ id: string; name: string }>;
      };
      setDynamicProcessMappingDoc(data);
    });

    return () => unsubscribe();
  }, [projectId]);

  // Renders summary info for the Engagement Management overview
  const renderOverviewInfo = () => {
    // Return null, an empty ReactNode, or placeholder JSX as needed
    return null;
  };
  const renderPlaceholderSection = (title: string) => <Card>
      <CardContent className="p-8 text-center">
        <p className="text-gray-500">{title} section coming soon</p>
      </CardContent>
    </Card>;
  const renderSectionHeader = (title: string, number?: string) => <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {number && `${number} `}{title}
      </h3>
      <Separator className="mt-2" />
    </div>;
  const renderEngagementProfileContent = () => <div className="space-y-6">
      <EngagementProfileSection formData={formData} clients={clients} users={users} uploadedFile={uploadedFile} uploadStatus={uploadStatus} canEdit={canEdit} onFormDataChange={onFormDataChange} onAssignmentChange={handleAssignmentChange} onFileUpload={onFileUpload} onRemoveFile={onRemoveFile} onDownloadFile={onDownloadFile} projectId={projectId} mrrUploadedFile={mrrUploadedFile} mrrUploadStatus={mrrUploadStatus} mrrFileInputRef={mrrFileInputRef} onMRRFileUpload={onMRRFileUpload} onRemoveMRRFile={onRemoveMRRFile} onDownloadMRRFile={onDownloadMRRFile} />
    </div>;
  const renderSignOffContent = (title: string = 'Sign-off') => <div className="space-y-4">
      {renderPlaceholderSection('Sign-off')}
    </div>;
  const renderSPSpecialistsContent = () => {
    // Find the SP. Specialists section under Engagement Management
    const spSection = engagementManagementSection?.children?.find(c => c.id === "sp-specialists-section");
    if (!spSection) return null;
    return <div className="space-y-8">
        {renderCardsForSection(spSection)}
      </div>;
  };
  const renderCommunicationsContent = () => <div className="space-y-6">
      <TCWGCommunicationsSection formData={formData} onFormDataChange={onFormDataChange} />
      
      <div className="ml-4 space-y-4">
        {renderSignOffContent()}
      </div>
    </div>;

  // Utility function: find a section by id recursively
  function findSectionById(sections, id) {
    for (const section of sections) {
      if (section.id === id) return section;
      if (section.children) {
        const child = findSectionById(section.children, id);
        if (child) return child;
      }
    }
    return null;
  }

  // -- Begin new dynamic rendering logic for Entity wide procedures:
  // Get the main entity-wide section and children
  const entitySection = sidebarSections.find(s => s.id === 'entity-wide-procedures');
  const entityChildren = entitySection?.children || [];

  // Utility to render a card list for any node with children (reused below)
  const renderCardsForSection = section => {
    if (!section?.children?.length) return null;
    return <div className="flex flex-row flex-wrap gap-6 mt-2 mb-4">
        {section.children.map(child => <div key={child.id} className="w-[260px] flex-shrink-0">
            <Card className="cursor-pointer border border-gray-200 shadow-md rounded-xl transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none h-full" tabIndex={0} onClick={() => onSectionChange(child.id)} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onSectionChange(child.id);
        }} aria-label={child.title} role="button">
              <CardContent className="flex flex-col p-8 items-start min-h-[120px] h-full">
                <span className="text-xs text-muted-foreground font-semibold mb-1">
                  {child.number ? `${child.number}` : ""}
                </span>
                <span className="text-gray-900 text-base font-medium">{child.title}</span>
              </CardContent>
            </Card>
          </div>)}
      </div>;
  };

  // Renders the content for "Entity wide procedures" and its tree
  const renderEntityWideProceduresContent = section => {
    // If not provided, show root entity section
    if (!section) section = entitySection;
    return <div className="space-y-8">
        {renderCardsForSection(section)}
      </div>;
  };

  // If the active section is in the entity tree, show either cards or placeholder:
  function getEntityActiveSectionChain(activeId) {
    // Returns an array of ancestor objects up to the active section
    const chain = [];
    function helper(sections) {
      for (const node of sections) {
        if (node.id === activeId) {
          chain.push(node);
          return true;
        }
        if (node.children && helper(node.children)) {
          chain.unshift(node);
          return true;
        }
      }
      return false;
    }
    helper(entityChildren);
    return chain;
  }

  // Decide renderEntityContent for active section if under entity wide procedures:
  let renderedEntityContent = null;
  if (activeSection === 'entity-wide-procedures') {
    renderedEntityContent = renderEntityWideProceduresContent(entitySection);
  } else {
    // Is the active section inside the entity-wide tree?
    const activeSectionChain = getEntityActiveSectionChain(activeSection);
    if (activeSectionChain.length > 0) {
      // Find the current node
      const targetSection = activeSectionChain[activeSectionChain.length - 1];
      if (targetSection.children && targetSection.children.length > 0) {
        // Render cards for children
        renderedEntityContent = renderEntityWideProceduresContent(targetSection);
      } else {
        // Check if this is a specific materiality section that should show content
        if (targetSection.id === 'materiality-materiality') {
          renderedEntityContent = (
            <SectionWrapper
              sectionId="materiality-materiality"
              formData={formData}
              users={users}
              currentUser={currentUser}
              signOffLevel="incharge"
              onReview={handleReviewWrapper}
              onUnreview={onUnreview}
              sidebarSections={sidebarSections}
            >
               <div className="space-y-4">
                 <MaterialityMetricsSection formData={formData} onFormDataChange={onFormDataChange} />
               </div>
            </SectionWrapper>
          );
        } else if (targetSection.id === 'materiality-reevaluate') {
          renderedEntityContent = (
            <SectionWrapper
              sectionId="materiality-reevaluate"
              formData={formData}
              users={users}
              currentUser={currentUser}
              signOffLevel="incharge"
              onReview={handleReviewWrapper}
              onUnreview={onUnreview}
              sidebarSections={sidebarSections}
            >
               <div className="space-y-4">
                 <MaterialityMetricsSection formData={formData} onFormDataChange={onFormDataChange} showReEvaluate={true} />
               </div>
            </SectionWrapper>
          );
        } else if (targetSection.id === 'entity-and-env') {
          renderedEntityContent = (
            <SectionWrapper
              sectionId="entity-and-env"
              formData={formData}
              users={users}
              currentUser={currentUser}
              signOffLevel="incharge"
              onReview={handleReviewWrapper}
              onUnreview={onUnreview}
              sidebarSections={sidebarSections}
            >
               <div className="space-y-4">
                 <EntityEnvironmentSection formData={formData} onFormDataChange={onFormDataChange} />
               </div>
            </SectionWrapper>
          );
        } else if (targetSection.id === 'rapd') {
          renderedEntityContent = (
            <SectionWrapper
              sectionId="rapd"
              formData={formData}
              users={users}
              currentUser={currentUser}
              signOffLevel="incharge"
              onReview={handleReviewWrapper}
              onUnreview={onUnreview}
              sidebarSections={sidebarSections}
            >
               <div className="space-y-4">
                 <RAPDSection formData={formData} onFormDataChange={onFormDataChange} />
               </div>
            </SectionWrapper>
          );
        } else if (targetSection.id === 'ceramic') {
          renderedEntityContent = (
            <SectionWrapper
              sectionId="ceramic"
              formData={formData}
              users={users}
              currentUser={currentUser}
              signOffLevel="incharge"
              onReview={handleReviewWrapper}
              onUnreview={onUnreview}
              sidebarSections={sidebarSections}
            >
               <div className="space-y-4">
                 <CERAMICSection formData={formData} onFormDataChange={onFormDataChange} />
               </div>
            </SectionWrapper>
          );
        } else if (targetSection.id === 'it-understanding') {
           renderedEntityContent = <div className="space-y-4">
               <Card>
                 <CardContent className="p-6">
                   <ITEnvironmentSection formData={formData} onFormDataChange={onFormDataChange} />
                 </CardContent>
               </Card>
             </div>;
        } else if (targetSection.id === 'risk-business-processes') {
           renderedEntityContent = <div className="space-y-4">
                <BusinessProcessesSection formData={formData} onFormDataChange={onFormDataChange} />
              </div>;
         } else if (targetSection.id === 'gitc-controls') {
           // Show cards for GITC Controls children
           renderedEntityContent = renderEntityWideProceduresContent(targetSection);
          } else if (targetSection.id === 'ad-1-1-apd-1') {
            // Show cards for AD 1.1APD-1 children
            renderedEntityContent = renderEntityWideProceduresContent(targetSection);
          } else if (targetSection.id === 'ad-1-1-apd-1-d-i') {
            // D&I Section content
             renderedEntityContent = <div className="space-y-4">
                 <Card>
                   <CardContent className="p-6">
                     <DISection formData={formData} onFormDataChange={onFormDataChange} />
                   </CardContent>
                 </Card>
               </div>;
           } else if (targetSection.id === 'ad-1-1-apd-1-2-toe') {
             // 2 - TOE Section content (moved from Comptes à pouvoir)
              renderedEntityContent = <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <ComptesAPouvoirSection formData={formData} handleFormDataChange={handleFormDataFieldChange} />
                    </CardContent>
                  </Card>
                </div>;
           } else if (targetSection.id === 'ad-1-4-apd-1') {
             // AD 1.4 APD-1 - Comptes à pouvoir Section content (empty state restored)
              renderedEntityContent = <div className="space-y-4">
                  {renderPlaceholderSection('AD 1.4 APD-1 - Comptes à pouvoir')}
                </div>;
          } else if (targetSection.id.startsWith('ad-1-1-apd-1-') || targetSection.id.startsWith('ad-') || targetSection.id.startsWith('seebi-') || targetSection.id.startsWith('talend-')) {
            // Individual GITC control items and their children
             renderedEntityContent = <div className="space-y-4">
                 {renderPlaceholderSection(targetSection.title)}
                </div>;
          } else if (targetSection.id !== 'fraud-risk') {
           // Render placeholder for other leaves (fraud-risk handled separately below)
            renderedEntityContent = <div className="space-y-8">
                {renderPlaceholderSection(targetSection.title + " coming soon")}
              </div>;
        }
      }
    }
  }

  // Business processes section logic
  const businessProcessesSection = sidebarSections.find(s => s.id === 'business-processes');
  
  const renderBusinessProcessesContent = () => {
    if (!businessProcessesSection) return null;
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap gap-4">
          {(businessProcessesSection.children ?? []).map((child: any) => (
            <div key={child.id} className="w-[220px]">
              <Card
                className="cursor-pointer rounded-none border border-gray-200 shadow-sm transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none h-full"
                tabIndex={0}
                onClick={() => onSectionChange(child.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSectionChange(child.id);
                }}
                role="button"
              >
                <CardContent className="p-4 space-y-2">
                  <div className="text-3xl leading-none text-gray-900">{child.number || ''}</div>
                  <div className="text-[30px] h-px bg-gray-200" />
                  <div className="text-lg text-gray-900">{child.title}</div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFinancialReportingContent = () => {
    const financialReportingSection = businessProcessesSection?.children?.find(c => c.id === 'financial-reporting');
    if (!financialReportingSection) return null;
    return (
      <div className="space-y-8">
        {renderCardsForSection(financialReportingSection)}
      </div>
    );
  };

  const renderControlActivitiesLanding = () => (
    <div className="space-y-10">
      
      <div className="flex flex-row flex-wrap gap-6">
        <div className="w-[220px]">
          <Card className="cursor-pointer border border-gray-200 shadow-md rounded-lg transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none h-full" tabIndex={0} onClick={() => onSectionChange('controle-24')} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onSectionChange('controle-24');
        }} aria-label="Contrôle 24" role="button">
            <CardContent className="p-6 space-y-2">
              <div className="text-sm text-muted-foreground">Contrôle 24</div>
              <div className="text-gray-900">Réconciliation des états financiers</div>
            </CardContent>
          </Card>
        </div>
        <div className="w-[220px]">
          <Card className="cursor-pointer border border-gray-200 shadow-md rounded-lg transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none h-full" tabIndex={0} onClick={() => onSectionChange('controle-25')} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onSectionChange('controle-25');
        }} aria-label="Contrôle 25" role="button">
            <CardContent className="p-6 space-y-2">
              <div className="text-sm text-muted-foreground">Contrôle 25</div>
              <div className="text-gray-900">SOD</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderControle24Landing = () => (
    <div className="space-y-10">
      
      <div className="flex flex-row flex-wrap gap-6">
        <div className="w-[220px]">
          <Card className="cursor-pointer border border-gray-200 shadow-md rounded-lg transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none h-full" tabIndex={0} onClick={() => onSectionChange('controle-24-d-i')} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onSectionChange('controle-24-d-i');
        }} aria-label="D&I" role="button">
            <CardContent className="p-6 space-y-2">
              <div className="text-sm text-muted-foreground">1</div>
              <div className="text-gray-900">D&I</div>
            </CardContent>
          </Card>
        </div>
        <div className="w-[220px]">
          <Card className="cursor-pointer border border-gray-200 shadow-md rounded-lg transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none h-full" tabIndex={0} onClick={() => onSectionChange('controle-24-toe')} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onSectionChange('controle-24-toe');
        }} aria-label="TOE" role="button">
            <CardContent className="p-6 space-y-2">
              <div className="text-sm text-muted-foreground">2</div>
              <div className="text-gray-900">TOE</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderControle24DI = () => (
    <div className="space-y-8">
      
      <Card>
        <CardContent className="p-8 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Understand the process control activities and how they are performed</h3>
          <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm text-gray-700">
            <div className="font-semibold">Control</div>
            <div>Réconciliation des états financiers</div>
            <div className="font-semibold">Contrôle 24</div>
            <div>&nbsp;</div>
          </div>
          <div className="text-sm text-gray-700">
            In addition to the documentation below, include a description of each control attribute (e.g., in an adhoc text box or in the TOE testwork), and the documentation maintained to evidence performance of the process control activity.
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-900">Process risk points</div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-[160px_1fr] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
                <div>PRP(s)</div>
                <div>Process risk</div>
              </div>
              <div className="grid grid-cols-[160px_1fr] gap-3 px-4 py-3 text-sm text-gray-700">
                <Input
                  value={processRiskCode}
                  onChange={(event) => setProcessRiskCode(event.target.value)}
                  placeholder="PRP FS"
                />
                <Textarea
                  value={processRiskDescription}
                  onChange={(event) => setProcessRiskDescription(event.target.value)}
                  placeholder="Add process risk description"
                  className="min-h-[72px]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <div className="flex items-center justify-between bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-t-lg">
          <span>Do any of the control attributes involve judgment?</span>
          <div className="flex items-center gap-2">
            <Switch
              checked={controlAttributesJudgment}
              onCheckedChange={setControlAttributesJudgment}
            />
            <span>{controlAttributesJudgment ? 'True' : 'False'}</span>
          </div>
        </div>
        <CardContent className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Determine the nature of procedures</h4>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Label className="text-sm font-medium mb-2 block">Nature</Label>
              <div className="flex">
                <Button
                  variant={procedureNature === 'AUTOMATED' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setProcedureNature('AUTOMATED')}
                >
                  Automated
                </Button>
                <Button
                  variant={procedureNature === 'MANUAL' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setProcedureNature('MANUAL')}
                >
                  Manual
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Type</Label>
              <div className="flex">
                <Button
                  variant={procedureType === 'DETECTIVE' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setProcedureType('DETECTIVE')}
                >
                  Detective
                </Button>
                <Button
                  variant={procedureType === 'PREVENTIVE' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setProcedureType('PREVENTIVE')}
                >
                  Preventive
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Label className="text-sm font-medium mb-2 block">Frequency</Label>
            <Input
              value={procedureFrequency}
              onChange={(event) => setProcedureFrequency(event.target.value)}
              placeholder="Monthly"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h4 className="font-medium text-gray-900">Add control operator(s).</h4>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[1fr_1fr] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>Control operator role and/or name</div>
              <div>Assess the competence of the control operator(s)</div>
            </div>
            <div className="divide-y divide-gray-200">
              {controlOperators.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[1fr_1fr] gap-4 px-4 py-3">
                  <Input
                    value={row.roleOrName}
                    onChange={(event) => {
                      const next = [...controlOperators];
                      next[index] = { ...row, roleOrName: event.target.value };
                      setControlOperators(next);
                    }}
                    placeholder="Add name or role"
                  />
                  <Input
                    value={row.competence}
                    onChange={(event) => {
                      const next = [...controlOperators];
                      next[index] = { ...row, competence: event.target.value };
                      setControlOperators(next);
                    }}
                    placeholder="Add competence assessment"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setControlOperators([
                  ...controlOperators,
                  { id: Math.max(...controlOperators.map(row => row.id)) + 1, roleOrName: '', competence: '' }
                ])
              }
            >
              Add row
            </Button>
            {controlOperators.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setControlOperators(controlOperators.slice(0, -1))}
              >
                Remove last row
              </Button>
            )}
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              Based on our understanding of the company's organizational structure does the control operator(s) have appropriate authority to perform the control effectively (i.e. the ability to sufficiently challenge process owners in a way that would influence their behavior)?
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant={authorityAnswer === 'YES' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAuthorityAnswer('YES')}
              >
                Yes
              </Button>
              <Button
                variant={authorityAnswer === 'NO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAuthorityAnswer('NO')}
              >
                No
              </Button>
              <Button
                variant={authorityAnswer === 'NONE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAuthorityAnswer('NONE')}
              >
                Not selected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-3">
          <h4 className="text-lg font-semibold text-gray-900">Understand the level of precision of the process control activity</h4>
          <p className="text-sm text-gray-700">
            Is the control designed to operate with sufficient precision to effectively prevent or detect a material misstatement in the financial statements?
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant={precisionAnswer === 'YES' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPrecisionAnswer('YES')}
            >
              Yes
            </Button>
            <Button
              variant={precisionAnswer === 'NO' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPrecisionAnswer('NO')}
            >
              No
            </Button>
            <Button
              variant={precisionAnswer === 'NONE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPrecisionAnswer('NONE')}
            >
              Not selected
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Evaluate design and implementation</h4>
          <p className="text-sm text-gray-700">
            Document procedures performed, results of those procedures and evidence obtained for each control attribute to evaluate design and implementation.
          </p>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox
                checked={evalMethods.inquiry}
                onCheckedChange={(checked) =>
                  setEvalMethods({ ...evalMethods, inquiry: Boolean(checked) })
                }
              />
              Inquiry
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox
                checked={evalMethods.observation}
                onCheckedChange={(checked) =>
                  setEvalMethods({ ...evalMethods, observation: Boolean(checked) })
                }
              />
              Observation
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox
                checked={evalMethods.inspection}
                onCheckedChange={(checked) =>
                  setEvalMethods({ ...evalMethods, inspection: Boolean(checked) })
                }
              />
              Inspection
            </label>
          </div>
          <Textarea
            value={evaluationNotes}
            onChange={(event) => setEvaluationNotes(event.target.value)}
            placeholder="Add evaluation notes"
            className="min-h-[140px]"
          />
          <div className="space-y-2">
            <Label className="text-sm font-medium">Conclusion</Label>
            <Input
              value={conclusion}
              onChange={(event) => setConclusion(event.target.value)}
              placeholder="Add conclusion"
            />
            <Label className="text-sm font-medium">Recommendation</Label>
            <Textarea
              value={recommendation}
              onChange={(event) => setRecommendation(event.target.value)}
              placeholder="Add recommendation"
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <span className="font-medium">Design:</span> Is the control capable of effectively preventing or detecting and correcting material misstatements?
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant={designAnswer === 'YES' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDesignAnswer('YES')}
                >
                  Yes
                </Button>
                <Button
                  variant={designAnswer === 'NO' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDesignAnswer('NO')}
                >
                  No
                </Button>
                <Button
                  variant={designAnswer === 'NONE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDesignAnswer('NONE')}
                >
                  Not selected
                </Button>
              </div>
            </div>
            <div>
              <span className="font-medium">Implementation:</span> Does the control exist and is the entity using it as designed?
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant={implementationAnswer === 'YES' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImplementationAnswer('YES')}
                >
                  Yes
                </Button>
                <Button
                  variant={implementationAnswer === 'NO' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImplementationAnswer('NO')}
                >
                  No
                </Button>
                <Button
                  variant={implementationAnswer === 'NONE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImplementationAnswer('NONE')}
                >
                  Not selected
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderControle24TOE = () => (
    <div className="space-y-8">
      

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Assess the risk associated with the control (RAWTC)</h3>
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Preliminary RAWTC:</Label>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-600 text-white text-sm font-semibold flex items-center justify-center">
                B
              </div>
              <Input
                value={preliminaryRawtc}
                onChange={(event) => setPreliminaryRawtc(event.target.value)}
                placeholder="Base"
                className="w-[180px]"
              />
            </div>
          </div>
          <div className="text-sm text-gray-700">
            In addition to inherent risk, consider the following factors to determine RAWTC:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Substantive procedures alone will not be sufficient (elevated RAWTC or higher)</li>
              <li>Changes in the volume or nature of transactions</li>
              <li>Related account has a history of errors</li>
              <li>Deficiencies were identified in CERAMIC that relate to this control</li>
              <li>Nature of the control is complex</li>
              <li>Control operates infrequently</li>
              <li>Control relies on the effectiveness of other controls</li>
              <li>Issues with the competence of the personnel performing the control or monitoring its performance</li>
              <li>Changes in key personnel who perform the control or monitor its performance</li>
              <li>Significance of judgments made in the control's operation</li>
            </ul>
          </div>
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Assessed RAWTC</Label>
            <Input
              value={assessedRawtc}
              onChange={(event) => setAssessedRawtc(event.target.value)}
              placeholder="Base"
              className="w-[180px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Obtain evidence about the operating effectiveness of the manual process control activity using prior period audit evidence</h3>
          <p className="text-sm text-gray-700">
            Do you intend to use audit evidence from prior period(s) to conclude on the operating effectiveness of controls in the current period?
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant={priorEvidenceAnswer === 'YES' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPriorEvidenceAnswer('YES')}
            >
              Yes
            </Button>
            <Button
              variant={priorEvidenceAnswer === 'NO' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPriorEvidenceAnswer('NO')}
            >
              No
            </Button>
            <Button
              variant={priorEvidenceAnswer === 'NONE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPriorEvidenceAnswer('NONE')}
            >
              Not selected
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Design procedures to obtain persuasive evidence</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[1.2fr_repeat(4,110px)_140px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div> </div>
              <div className="text-center">Inquire</div>
              <div className="text-center">Observe</div>
              <div className="text-center">Inspect</div>
              <div className="text-center">Reperform</div>
              <div className="text-center">Involves judgment</div>
            </div>
            <div className="grid grid-cols-[1.2fr_repeat(4,110px)_140px] items-center px-4 py-3 text-sm text-gray-700">
              <div>Determine the nature of procedures</div>
              <div className="flex justify-center">
                <Checkbox
                  checked={designMethods.inquire}
                  onCheckedChange={(checked) => setDesignMethods({ ...designMethods, inquire: Boolean(checked) })}
                />
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={designMethods.observe}
                  onCheckedChange={(checked) => setDesignMethods({ ...designMethods, observe: Boolean(checked) })}
                />
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={designMethods.inspect}
                  onCheckedChange={(checked) => setDesignMethods({ ...designMethods, inspect: Boolean(checked) })}
                />
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={designMethods.reperform}
                  onCheckedChange={(checked) => setDesignMethods({ ...designMethods, reperform: Boolean(checked) })}
                />
              </div>
              <div className="flex justify-center">
                <Switch
                  checked={designMethods.involvesJudgment}
                  onCheckedChange={(checked) => setDesignMethods({ ...designMethods, involvesJudgment: checked })}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Describe the procedures to be performed</Label>
            <Textarea
              value={proceduresDescription}
              onChange={(event) => setProceduresDescription(event.target.value)}
              placeholder="Add procedure description"
              className="min-h-[140px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Determine the timing of procedures</h3>
          <p className="text-sm text-gray-700">Determine when we obtain the evidence about the operating effectiveness of the control.</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
            <span>Period covered by audit procedure:</span>
            <Input
              type="date"
              value={timingFrom}
              onChange={(event) => setTimingFrom(event.target.value)}
              className="w-[160px]"
            />
            <span>through:</span>
            <Input
              type="date"
              value={timingTo}
              onChange={(event) => setTimingTo(event.target.value)}
              className="w-[160px]"
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Determine the extent of procedures</h4>
            <p className="text-sm text-gray-700">Define the population and how we determined the population is complete.</p>
            <Textarea
              value={extentDescription}
              onChange={(event) => setExtentDescription(event.target.value)}
              placeholder="Describe the population"
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Did we use information to select items for testing?</h3>
            <div className="flex items-center gap-2">
              <Button
                variant={selectionInfoAnswer === 'YES' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectionInfoAnswer('YES')}
              >
                Yes
              </Button>
              <Button
                variant={selectionInfoAnswer === 'NO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectionInfoAnswer('NO')}
              >
                No
              </Button>
              <Button
                variant={selectionInfoAnswer === 'NONE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectionInfoAnswer('NONE')}
              >
                Not selected
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Determine sample size</h4>
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium">Control sample size</Label>
              <Input
                value={sampleSize}
                onChange={(event) => setSampleSize(event.target.value)}
                className="w-[120px]"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox
                checked={increaseSampleSize}
                onCheckedChange={(checked) => setIncreaseSampleSize(Boolean(checked))}
              />
              We increased the control sample size over the control sample size table.
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox
                checked={unpredictability}
                onCheckedChange={(checked) => setUnpredictability(Boolean(checked))}
              />
              Procedure incorporates an element of unpredictability
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Test operating effectiveness</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p className="font-medium">Obtain evidence about operating effectiveness</p>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={operatingEvidence.samplingTool}
                onCheckedChange={(checked) =>
                  setOperatingEvidence({ ...operatingEvidence, samplingTool: Boolean(checked) })
                }
              />
              Use sampling tool to select samples and generate testwork template.
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={operatingEvidence.generateTemplate}
                onCheckedChange={(checked) =>
                  setOperatingEvidence({ ...operatingEvidence, generateTemplate: Boolean(checked) })
                }
              />
              Generate testwork template and manually select samples.
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={operatingEvidence.attachDocumentation}
                onCheckedChange={(checked) =>
                  setOperatingEvidence({ ...operatingEvidence, attachDocumentation: Boolean(checked) })
                }
              />
              Attach other testing documentation that includes: the control operator(s) and whether they are consistent with our assessment in the evaluation of design and implementation, and procedures over each of the attributes.
            </label>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Attachment(s)</Label>
            <div className="flex gap-2">
              <Input
                value={newToeAttachment}
                onChange={(event) => setNewToeAttachment(event.target.value)}
                placeholder="Add attachment name"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!newToeAttachment.trim()) return;
                  setToeAttachments([...toeAttachments, newToeAttachment.trim()]);
                  setNewToeAttachment('');
                }}
              >
                Add
              </Button>
            </div>
            {toeAttachments.length > 0 && (
              <ul className="text-sm text-gray-700 space-y-1">
                {toeAttachments.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-center justify-between">
                    <span>{item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setToeAttachments(toeAttachments.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Determine the effect of any identified control deviations</h3>
          <p className="text-sm text-gray-700">Based on procedures performed and evidence obtained, were any deviations identified?</p>
          <div className="flex items-center gap-2">
            <Button
              variant={deviationsAnswer === 'YES' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviationsAnswer('YES')}
            >
              Yes
            </Button>
            <Button
              variant={deviationsAnswer === 'NO' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviationsAnswer('NO')}
            >
              No
            </Button>
            <Button
              variant={deviationsAnswer === 'NONE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviationsAnswer('NONE')}
            >
              Not selected
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Result of test of operating effectiveness</Label>
            <Input
              value={operatingEffectivenessResult}
              onChange={(event) => setOperatingEffectivenessResult(event.target.value)}
              placeholder="Effective"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Remediation required</Label>
            <Textarea
              value={remediationRequired}
              onChange={(event) => setRemediationRequired(event.target.value)}
              placeholder="Add remediation details"
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRelatedPartiesLanding = () => (
    <div className="space-y-10">
      
      <div className="flex flex-row flex-wrap gap-6">
        <div className="w-[220px]">
          <Card className="cursor-pointer border border-gray-200 shadow-md rounded-lg transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none h-full" tabIndex={0} onClick={() => onSectionChange('related-parties-intercos')} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onSectionChange('related-parties-intercos');
        }} aria-label="Intercos" role="button">
            <CardContent className="p-6 space-y-2">
              <div className="text-sm text-muted-foreground">Intercos</div>
              <div className="text-gray-900">Réconciliation des comptes intercos</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderRelatedPartiesIntercos = () => (
    <div className="space-y-8">
      

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Related party transaction</h3>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Related party transaction reference</Label>
            <Input
              value={relatedPartyReference}
              onChange={(event) => setRelatedPartyReference(event.target.value)}
              placeholder="Intercos"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Related party transaction description</Label>
            <Textarea
              value={relatedPartyDescription}
              onChange={(event) => setRelatedPartyDescription(event.target.value)}
              placeholder="Réconciliation des comptes intercos"
              className="min-h-[90px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="bg-blue-900 text-white text-sm font-semibold px-4 py-2">Accounts</div>
          <div className="p-4 space-y-3">
            {relatedPartyAccounts.map((row, index) => (
              <div key={row.id} className="flex items-center gap-2">
                <Input
                  value={row.label}
                  onChange={(event) => {
                    const next = [...relatedPartyAccounts];
                    next[index] = { ...row, label: event.target.value };
                    setRelatedPartyAccounts(next);
                  }}
                  placeholder="Add account"
                />
                {relatedPartyAccounts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRelatedPartyAccounts(relatedPartyAccounts.filter(r => r.id !== row.id))}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRelatedPartyAccounts([
                ...relatedPartyAccounts,
                { id: Math.max(...relatedPartyAccounts.map(r => r.id)) + 1, label: '' }
              ])}
            >
              Add account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Relevant characteristics of the related party transaction</h3>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Checkbox
              checked={relatedPartyCharacteristics.unusualTransaction}
              onCheckedChange={(checked) =>
                setRelatedPartyCharacteristics({ ...relatedPartyCharacteristics, unusualTransaction: Boolean(checked) })
              }
            />
            Significant unusual transaction
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Checkbox
              checked={relatedPartyCharacteristics.significantTransaction}
              onCheckedChange={(checked) =>
                setRelatedPartyCharacteristics({ ...relatedPartyCharacteristics, significantTransaction: Boolean(checked) })
              }
            />
            Significant related party transaction
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Checkbox
              checked={relatedPartyCharacteristics.requiredDisclosure}
              onCheckedChange={(checked) =>
                setRelatedPartyCharacteristics({ ...relatedPartyCharacteristics, requiredDisclosure: Boolean(checked) })
              }
            />
            Required to be disclosed in the financial statements in accordance with the applicable reporting framework
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Checkbox
              checked={relatedPartyCharacteristics.armsLengthStatement}
              onCheckedChange={(checked) =>
                setRelatedPartyCharacteristics({ ...relatedPartyCharacteristics, armsLengthStatement: Boolean(checked) })
              }
            />
            Financial statements include a statement that the related party transaction was conducted on an arm's length basis
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Assess the risks of misstatement, identify PRPs and evaluate controls related to the related party transaction</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[160px_1fr_140px_140px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>ID</div>
              <div>Description</div>
              <div className="text-center">Inherent risk</div>
              <div className="text-center">Controls approach</div>
            </div>
            <div className="divide-y divide-gray-200">
              {relatedPartyRisks.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[160px_1fr_140px_140px] gap-3 px-4 py-3 items-center text-sm">
                  <Input
                    value={row.riskId}
                    onChange={(event) => {
                      const next = [...relatedPartyRisks];
                      next[index] = { ...row, riskId: event.target.value };
                      setRelatedPartyRisks(next);
                    }}
                    placeholder="FRP002.1.01"
                  />
                  <Input
                    value={row.description}
                    onChange={(event) => {
                      const next = [...relatedPartyRisks];
                      next[index] = { ...row, description: event.target.value };
                      setRelatedPartyRisks(next);
                    }}
                    placeholder="Add description"
                  />
                  <Input
                    value={row.inherentRisk}
                    onChange={(event) => {
                      const next = [...relatedPartyRisks];
                      next[index] = { ...row, inherentRisk: event.target.value };
                      setRelatedPartyRisks(next);
                    }}
                    placeholder="B"
                  />
                  <div className="flex justify-center">
                    <Switch
                      checked={row.controlsApproach}
                      onCheckedChange={(checked) => {
                        const next = [...relatedPartyRisks];
                        next[index] = { ...row, controlsApproach: checked };
                        setRelatedPartyRisks(next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRelatedPartyRisks([
              ...relatedPartyRisks,
              { id: Math.max(...relatedPartyRisks.map(r => r.id)) + 1, riskId: '', description: '', inherentRisk: '', controlsApproach: false }
            ])}
          >
            Add risk row
          </Button>
          <div className="space-y-2 text-sm text-gray-700">
            <p>Have we identified controls activities in place to ensure that the transaction is authorized and approved?</p>
            <div className="flex items-center gap-2">
              <Button
                variant={relatedPartyControlsAnswer === 'YES' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRelatedPartyControlsAnswer('YES')}
              >
                Yes
              </Button>
              <Button
                variant={relatedPartyControlsAnswer === 'NO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRelatedPartyControlsAnswer('NO')}
              >
                No
              </Button>
              <Button
                variant={relatedPartyControlsAnswer === 'NONE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRelatedPartyControlsAnswer('NONE')}
              >
                Not selected
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Document the impact on the audit</Label>
            <Textarea
              value={relatedPartyImpact}
              onChange={(event) => setRelatedPartyImpact(event.target.value)}
              placeholder="Add impact on the audit"
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setControlDeficiencies([
                ...controlDeficiencies,
                { id: Math.max(...controlDeficiencies.map(r => r.id)) + 1, deficiencyId: '', description: '' }
              ])}
            >
              Add deficiency
            </Button>
            <h3 className="text-lg font-semibold text-gray-900">Identify the control deficiency(ies):</h3>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[160px_1fr] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>ID</div>
              <div>Control Deficiency Description</div>
            </div>
            <div className="divide-y divide-gray-200">
              {controlDeficiencies.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[160px_1fr] gap-3 px-4 py-3">
                  <Input
                    value={row.deficiencyId}
                    onChange={(event) => {
                      const next = [...controlDeficiencies];
                      next[index] = { ...row, deficiencyId: event.target.value };
                      setControlDeficiencies(next);
                    }}
                    placeholder="ID"
                  />
                  <Input
                    value={row.description}
                    onChange={(event) => {
                      const next = [...controlDeficiencies];
                      next[index] = { ...row, description: event.target.value };
                      setControlDeficiencies(next);
                    }}
                    placeholder="Add description"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600"> </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[140px_1fr_140px_160px_160px_140px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>ID</div>
              <div>Description</div>
              <div className="text-center">Inherent risk</div>
              <div className="text-center">Inherent risk factors</div>
              <div className="text-center">Assertions</div>
              <div className="text-center">Controls approach</div>
            </div>
            <div className="divide-y divide-gray-200">
              {assertionRisks.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[140px_1fr_140px_160px_160px_140px] gap-3 px-4 py-3 items-center text-sm">
                  <Input
                    value={row.riskId}
                    onChange={(event) => {
                      const next = [...assertionRisks];
                      next[index] = { ...row, riskId: event.target.value };
                      setAssertionRisks(next);
                    }}
                    placeholder="ID"
                  />
                  <Input
                    value={row.description}
                    onChange={(event) => {
                      const next = [...assertionRisks];
                      next[index] = { ...row, description: event.target.value };
                      setAssertionRisks(next);
                    }}
                    placeholder="Add description"
                  />
                  <Input
                    value={row.inherentRisk}
                    onChange={(event) => {
                      const next = [...assertionRisks];
                      next[index] = { ...row, inherentRisk: event.target.value };
                      setAssertionRisks(next);
                    }}
                    placeholder="B"
                  />
                  <Input
                    value={row.inherentFactors}
                    onChange={(event) => {
                      const next = [...assertionRisks];
                      next[index] = { ...row, inherentFactors: event.target.value };
                      setAssertionRisks(next);
                    }}
                    placeholder="Factors"
                  />
                  <Input
                    value={row.assertions}
                    onChange={(event) => {
                      const next = [...assertionRisks];
                      next[index] = { ...row, assertions: event.target.value };
                      setAssertionRisks(next);
                    }}
                    placeholder="Assertions"
                  />
                  <div className="flex justify-center">
                    <Switch
                      checked={row.controlsApproach}
                      onCheckedChange={(checked) => {
                        const next = [...assertionRisks];
                        next[index] = { ...row, controlsApproach: checked };
                        setAssertionRisks(next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAssertionRisks([
              ...assertionRisks,
              { id: Math.max(...assertionRisks.map(r => r.id)) + 1, riskId: '', description: '', inherentRisk: '', inherentFactors: '', assertions: '', controlsApproach: false }
            ])}
          >
            Add assertion risk
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Document our understanding of the business purpose (or lack thereof) of the related party transaction</h3>
          <Textarea
            value={businessPurpose}
            onChange={(event) => setBusinessPurpose(event.target.value)}
            placeholder="Add business purpose"
            className="min-h-[140px]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Perform additional substantive procedures, as necessary, to respond to assessed risks of material misstatement</h3>
          <p className="text-sm text-gray-700">Will we perform any additional substantive procedures to respond to the above risks of material misstatement?</p>
          <div className="flex items-center gap-2">
            <Button
              variant={additionalProceduresAnswer === 'YES' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAdditionalProceduresAnswer('YES')}
            >
              Yes
            </Button>
            <Button
              variant={additionalProceduresAnswer === 'NO' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAdditionalProceduresAnswer('NO')}
            >
              No
            </Button>
            <Button
              variant={additionalProceduresAnswer === 'NONE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAdditionalProceduresAnswer('NONE')}
            >
              Not selected
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Evaluate results</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>Did we determine that the related party transaction may have been entered into to engage in fraudulent financial reporting or to conceal misappropriation of assets?</p>
            <div className="flex items-center gap-2">
              <Button
                variant={evaluateFraudAnswer === 'YES' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEvaluateFraudAnswer('YES')}
              >
                Yes
              </Button>
              <Button
                variant={evaluateFraudAnswer === 'NO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEvaluateFraudAnswer('NO')}
              >
                No
              </Button>
              <Button
                variant={evaluateFraudAnswer === 'NONE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEvaluateFraudAnswer('NONE')}
              >
                Not selected
              </Button>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <p>Have we obtained sufficient appropriate audit evidence for every relevant RMM and financial statement assertion related to the related party transaction?</p>
            <div className="flex items-center gap-2">
              <Button
                variant={evaluateEvidenceAnswer === 'YES' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEvaluateEvidenceAnswer('YES')}
              >
                Yes
              </Button>
              <Button
                variant={evaluateEvidenceAnswer === 'NO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEvaluateEvidenceAnswer('NO')}
              >
                No
              </Button>
              <Button
                variant={evaluateEvidenceAnswer === 'NONE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEvaluateEvidenceAnswer('NONE')}
              >
                Not selected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLitigationClaimsLanding = () => (
    <div className="space-y-8">
      
      <div className="flex flex-row flex-wrap gap-4">
        {[
          { id: 'litigation-claims-leadsheet', number: '0', title: 'Leadsheet' },
          { id: 'litigation-claims-understanding', number: '1', title: 'Understanding, Risks and Response' },
          { id: 'litigation-claims-laws', number: '1.1', title: 'Understand laws & litigation' },
          { id: 'litigation-claims-results', number: '2', title: 'Results' },
          { id: 'litigation-claims-substantive', number: 'SUB', title: 'Substantive Procedures' },
        ].map(card => (
          <div key={card.id} className="w-[220px]">
            <Card
              className="cursor-pointer rounded-none border border-gray-200 shadow-sm transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none h-full"
              tabIndex={0}
              onClick={() => onSectionChange(card.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') onSectionChange(card.id);
              }}
              aria-label={card.title}
              role="button"
            >
              <CardContent className="p-4 space-y-2">
                <div className="text-3xl leading-none text-gray-900">{card.number}</div>
                <div className="text-[30px] h-px bg-gray-200" />
                <div className="text-lg text-gray-900">{card.title}</div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLitigationUnderstanding = () => (
    <div className="space-y-8">
      
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Understand the accounts and disclosures</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p className="font-medium">Process-level risk assessment</p>
            <p>Do we plan to perform analytical procedures in addition to those performed in 2.2.2 Planning analytics?</p>
            <div className="flex items-center gap-2">
              <Button variant={litigationProcessAnalytics === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationProcessAnalytics('YES')}>Yes</Button>
              <Button variant={litigationProcessAnalytics === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationProcessAnalytics('NO')}>No</Button>
              <Button variant={litigationProcessAnalytics === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationProcessAnalytics('NONE')}>Not selected</Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Identify process-level risk assessment procedures.</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setLitigationProcedureRows([
                  ...litigationProcedureRows,
                  { id: Math.max(...litigationProcedureRows.map(r => r.id)) + 1, ref: '', description: '' },
                ])
              }
            >
              Add
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[120px_1fr] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>ID</div>
              <div>Procedure description</div>
            </div>
            <div className="divide-y divide-gray-200">
              {litigationProcedureRows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
                  <Input
                    value={row.ref}
                    onChange={(event) => {
                      const next = [...litigationProcedureRows];
                      next[index] = { ...row, ref: event.target.value };
                      setLitigationProcedureRows(next);
                    }}
                    placeholder="L1"
                  />
                  <Input
                    value={row.description}
                    onChange={(event) => {
                      const next = [...litigationProcedureRows];
                      next[index] = { ...row, description: event.target.value };
                      setLitigationProcedureRows(next);
                    }}
                    placeholder="Add description"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <p>Is information used in our process-level risk assessment procedures?</p>
            <div className="flex items-center gap-2">
              <Button variant={litigationProcedureInfo === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationProcedureInfo('YES')}>Yes</Button>
              <Button variant={litigationProcedureInfo === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationProcedureInfo('NO')}>No</Button>
              <Button variant={litigationProcedureInfo === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationProcedureInfo('NONE')}>Not selected</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Document the results of process-level risk assessment procedures performed.</Label>
            <Textarea
              value={litigationProcedureResults}
              onChange={(event) => setLitigationProcedureResults(event.target.value)}
              placeholder=""
              className="min-h-[140px]"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Identify applicable types of transactions, events and conditions in the accounts and disclosures within this process.</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setLitigationApplicableRows([
                  ...litigationApplicableRows,
                  { id: Math.max(...litigationApplicableRows.map(r => r.id)) + 1, category: '', ref: '', description: '', applicable: false, notes: '' },
                ])
              }
            >
              Add
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[140px_120px_1fr_120px_160px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>Category</div>
              <div>ID</div>
              <div>Description</div>
              <div className="text-center">Applicable</div>
              <div>Add notes</div>
            </div>
            <div className="divide-y divide-gray-200">
              {litigationApplicableRows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[140px_120px_1fr_120px_160px] gap-3 px-4 py-3 items-center text-sm">
                  <Input
                    value={row.category}
                    onChange={(event) => {
                      const next = [...litigationApplicableRows];
                      next[index] = { ...row, category: event.target.value };
                      setLitigationApplicableRows(next);
                    }}
                    placeholder="Category"
                  />
                  <Input
                    value={row.ref}
                    onChange={(event) => {
                      const next = [...litigationApplicableRows];
                      next[index] = { ...row, ref: event.target.value };
                      setLitigationApplicableRows(next);
                    }}
                    placeholder="ID"
                  />
                  <Input
                    value={row.description}
                    onChange={(event) => {
                      const next = [...litigationApplicableRows];
                      next[index] = { ...row, description: event.target.value };
                      setLitigationApplicableRows(next);
                    }}
                    placeholder="Description"
                  />
                  <div className="flex justify-center">
                    <Checkbox
                      checked={row.applicable}
                      onCheckedChange={(checked) => {
                        const next = [...litigationApplicableRows];
                        next[index] = { ...row, applicable: Boolean(checked) };
                        setLitigationApplicableRows(next);
                      }}
                    />
                  </div>
                  <Input
                    value={row.notes}
                    onChange={(event) => {
                      const next = [...litigationApplicableRows];
                      next[index] = { ...row, notes: event.target.value };
                      setLitigationApplicableRows(next);
                    }}
                    placeholder="Notes"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <h4 className="font-semibold">Identify estimates in accounts and disclosures</h4>
            <p>Is there an estimate(s) within this process with a reasonable possibility of a risk of material misstatement?</p>
            <div className="flex items-center gap-2">
              <Button variant={litigationEstimateRmm === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationEstimateRmm('YES')}>Yes</Button>
              <Button variant={litigationEstimateRmm === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationEstimateRmm('NO')}>No</Button>
              <Button variant={litigationEstimateRmm === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationEstimateRmm('NONE')}>Not selected</Button>
            </div>
            <p>Is there an estimate(s) within this process that gave rise to a risk of material misstatement in the prior year but not in the current year?</p>
            <div className="flex items-center gap-2">
              <Button variant={litigationEstimatePriorRmm === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationEstimatePriorRmm('YES')}>Yes</Button>
              <Button variant={litigationEstimatePriorRmm === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationEstimatePriorRmm('NO')}>No</Button>
              <Button variant={litigationEstimatePriorRmm === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationEstimatePriorRmm('NONE')}>Not selected</Button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <h4 className="font-semibold">Understand the entity's selection and application of accounting policies or principles</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Checkbox checked={litigationPolicyChecks.significantChanges} onCheckedChange={(checked) => setLitigationPolicyChecks({ ...litigationPolicyChecks, significantChanges: Boolean(checked) })} />
                There are significant changes in the entity's accounting policies or principles, financial reporting policies or principles, or disclosures relevant to these accounting policies or principles.
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={litigationPolicyChecks.judgmentRequired} onCheckedChange={(checked) => setLitigationPolicyChecks({ ...litigationPolicyChecks, judgmentRequired: Boolean(checked) })} />
                There is judgment required by management in the application of significant accounting policies or principles.
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={litigationPolicyChecks.controversialPolicies} onCheckedChange={(checked) => setLitigationPolicyChecks({ ...litigationPolicyChecks, controversialPolicies: Boolean(checked) })} />
                There are accounting policies or principles that are in controversial or emerging areas lacking authoritative guidance.
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={litigationPolicyChecks.unusualTransactions} onCheckedChange={(checked) => setLitigationPolicyChecks({ ...litigationPolicyChecks, unusualTransactions: Boolean(checked) })} />
                The policies or principles relate to methods the entity uses to account for significant and unusual transaction(s).
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={litigationPolicyChecks.alternatives} onCheckedChange={(checked) => setLitigationPolicyChecks({ ...litigationPolicyChecks, alternatives: Boolean(checked) })} />
                There are alternatives in the selection and application of accounting principles related to these policies.
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={litigationPolicyChecks.managementBias} onCheckedChange={(checked) => setLitigationPolicyChecks({ ...litigationPolicyChecks, managementBias: Boolean(checked) })} />
                There are indicators of management bias present in the entity's selection and application of these significant accounting policies or principles.
              </label>
            </div>
            <Label className="text-sm font-medium">Document our understanding and evaluation.</Label>
            <Textarea
              value={litigationPolicyNotes}
              onChange={(event) => setLitigationPolicyNotes(event.target.value)}
              placeholder=""
              className="min-h-[140px]"
            />
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <p>Will we perform a walkthrough to obtain an understanding of types of transactions or events and conditions where an RMM could exist?</p>
            <div className="flex items-center gap-2">
              <Button variant={litigationWalkthrough === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationWalkthrough('YES')}>Yes</Button>
              <Button variant={litigationWalkthrough === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationWalkthrough('NO')}>No</Button>
              <Button variant={litigationWalkthrough === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationWalkthrough('NONE')}>Not selected</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Document through a narrative or a flowchart our understanding of transactions, events and conditions (TECs)</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setLitigationProcessSteps([
                  ...litigationProcessSteps,
                  { id: Math.max(...litigationProcessSteps.map(r => r.id)) + 1, processStep: '', activityStep: '', understanding: '' },
                ])
              }
            >
              Add
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[160px_160px_1fr] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>Process step</div>
              <div>Activity step</div>
              <div>Understanding, and how it was obtained</div>
            </div>
            <div className="divide-y divide-gray-200">
              {litigationProcessSteps.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[160px_160px_1fr] gap-3 px-4 py-3">
                  <Input
                    value={row.processStep}
                    onChange={(event) => {
                      const next = [...litigationProcessSteps];
                      next[index] = { ...row, processStep: event.target.value };
                      setLitigationProcessSteps(next);
                    }}
                    placeholder="Process step"
                  />
                  <Input
                    value={row.activityStep}
                    onChange={(event) => {
                      const next = [...litigationProcessSteps];
                      next[index] = { ...row, activityStep: event.target.value };
                      setLitigationProcessSteps(next);
                    }}
                    placeholder="Activity step"
                  />
                  <Input
                    value={row.understanding}
                    onChange={(event) => {
                      const next = [...litigationProcessSteps];
                      next[index] = { ...row, understanding: event.target.value };
                      setLitigationProcessSteps(next);
                    }}
                    placeholder="Understanding"
                  />
                </div>
              ))}
            </div>
          </div>

          <h4 className="text-sm font-semibold text-gray-900">Identify relevant IT system layers</h4>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[140px_140px_1fr_140px_120px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>Reference</div>
              <div>IT Layer(s)</div>
              <div>Description of IT system layer</div>
              <div>Layer type</div>
              <div>Outsourced</div>
            </div>
            <div className="divide-y divide-gray-200">
              {litigationItLayers.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[140px_140px_1fr_140px_120px] gap-3 px-4 py-3 items-center text-sm">
                  <Input
                    value={row.reference}
                    onChange={(event) => {
                      const next = [...litigationItLayers];
                      next[index] = { ...row, reference: event.target.value };
                      setLitigationItLayers(next);
                    }}
                    placeholder="Reference"
                  />
                  <Input
                    value={row.layer}
                    onChange={(event) => {
                      const next = [...litigationItLayers];
                      next[index] = { ...row, layer: event.target.value };
                      setLitigationItLayers(next);
                    }}
                    placeholder="Layer"
                  />
                  <Input
                    value={row.description}
                    onChange={(event) => {
                      const next = [...litigationItLayers];
                      next[index] = { ...row, description: event.target.value };
                      setLitigationItLayers(next);
                    }}
                    placeholder="Description"
                  />
                  <Input
                    value={row.layerType}
                    onChange={(event) => {
                      const next = [...litigationItLayers];
                      next[index] = { ...row, layerType: event.target.value };
                      setLitigationItLayers(next);
                    }}
                    placeholder="Type"
                  />
                  <div className="flex justify-center">
                    <Checkbox
                      checked={row.outsourced}
                      onCheckedChange={(checked) => {
                        const next = [...litigationItLayers];
                        next[index] = { ...row, outsourced: Boolean(checked) };
                        setLitigationItLayers(next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <Checkbox checked={litigationItChecks.layerRelatesEstimates} onCheckedChange={(checked) => setLitigationItChecks({ ...litigationItChecks, layerRelatesEstimates: Boolean(checked) })} />
              One of the IT system layers identified above related to estimates
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={litigationItChecks.serviceOrgRelevant} onCheckedChange={(checked) => setLitigationItChecks({ ...litigationItChecks, serviceOrgRelevant: Boolean(checked) })} />
              The entity uses a service organization that is relevant to this process
            </label>
            <p className="font-semibold">Other considerations including involving specific team members and specialists as appropriate</p>
            <label className="flex items-center gap-2">
              <Checkbox checked={litigationItChecks.specialistsRelevant} onCheckedChange={(checked) => setLitigationItChecks({ ...litigationItChecks, specialistsRelevant: Boolean(checked) })} />
              Specific team members or specialists are relevant to this process
            </label>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Risks</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setLitigationRiskRows([
                  ...litigationRiskRows,
                  { id: Math.max(...litigationRiskRows.map(r => r.id)) + 1, riskId: '', description: '', inherentRisk: '', riskFactors: '', assertions: '', substantiveOnly: false, controlsApproach: false },
                ])
              }
            >
              Add risk
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[120px_1fr_120px_160px_120px_180px_160px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>ID</div>
              <div>Description</div>
              <div>Inherent risk</div>
              <div>Inherent risk factors</div>
              <div>Assertions</div>
              <div>Substantive procedures alone insufficient</div>
              <div>Controls approach</div>
            </div>
            <div className="divide-y divide-gray-200">
              {litigationRiskRows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[120px_1fr_120px_160px_120px_180px_160px] gap-3 px-4 py-3 items-center text-sm">
                  <Input
                    value={row.riskId}
                    onChange={(event) => {
                      const next = [...litigationRiskRows];
                      next[index] = { ...row, riskId: event.target.value };
                      setLitigationRiskRows(next);
                    }}
                    placeholder="ID"
                  />
                  <Input
                    value={row.description}
                    onChange={(event) => {
                      const next = [...litigationRiskRows];
                      next[index] = { ...row, description: event.target.value };
                      setLitigationRiskRows(next);
                    }}
                    placeholder="Description"
                  />
                  <Input
                    value={row.inherentRisk}
                    onChange={(event) => {
                      const next = [...litigationRiskRows];
                      next[index] = { ...row, inherentRisk: event.target.value };
                      setLitigationRiskRows(next);
                    }}
                    placeholder="B"
                  />
                  <Input
                    value={row.riskFactors}
                    onChange={(event) => {
                      const next = [...litigationRiskRows];
                      next[index] = { ...row, riskFactors: event.target.value };
                      setLitigationRiskRows(next);
                    }}
                    placeholder="Factors"
                  />
                  <Input
                    value={row.assertions}
                    onChange={(event) => {
                      const next = [...litigationRiskRows];
                      next[index] = { ...row, assertions: event.target.value };
                      setLitigationRiskRows(next);
                    }}
                    placeholder="Assertions"
                  />
                  <div className="flex justify-center">
                    <Switch
                      checked={row.substantiveOnly}
                      onCheckedChange={(checked) => {
                        const next = [...litigationRiskRows];
                        next[index] = { ...row, substantiveOnly: checked };
                        setLitigationRiskRows(next);
                      }}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={row.controlsApproach}
                      onCheckedChange={(checked) => {
                        const next = [...litigationRiskRows];
                        next[index] = { ...row, controlsApproach: checked };
                        setLitigationRiskRows(next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <h4 className="font-semibold">Consider whether there is an RMM in aggregate</h4>
            <p>
              For those accounts and disclosures we did not identify as significant and the assertions we did not identify as relevant, step back and assess both individually and in aggregate whether they have a reasonable possibility of containing an RMM.
            </p>
            <p>Did we identify multiple RMMs that relate to the same accounts/disclosures and assertions?</p>
            <div className="flex items-center gap-2">
              <Button variant={litigationRmmAggregate === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationRmmAggregate('YES')}>Yes</Button>
              <Button variant={litigationRmmAggregate === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationRmmAggregate('NO')}>No</Button>
              <Button variant={litigationRmmAggregate === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationRmmAggregate('NONE')}>Not selected</Button>
            </div>
            <p>Did we determine that the combined magnitude of potential misstatements related to the remaining risks is material?</p>
            <div className="flex items-center gap-2">
              <Button variant={litigationRmmMagnitude === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationRmmMagnitude('YES')}>Yes</Button>
              <Button variant={litigationRmmMagnitude === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationRmmMagnitude('NO')}>No</Button>
              <Button variant={litigationRmmMagnitude === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationRmmMagnitude('NONE')}>Not selected</Button>
            </div>
            <p>Did we identify multiple risks with similar characteristics, which may indicate several potential misstatements that could aggregate to a material misstatement?</p>
            <div className="flex items-center gap-2">
              <Button variant={litigationRmmSimilar === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationRmmSimilar('YES')}>Yes</Button>
              <Button variant={litigationRmmSimilar === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationRmmSimilar('NO')}>No</Button>
              <Button variant={litigationRmmSimilar === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationRmmSimilar('NONE')}>Not selected</Button>
            </div>
            <label className="flex items-center gap-2">
              <Checkbox checked={litigationOtherConsiderations} onCheckedChange={(checked) => setLitigationOtherConsiderations(Boolean(checked))} />
              There are other considerations that might have impact on the audit.
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-3xl font-semibold text-gray-900">Response</h3>
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-gray-900">Identified general procedures</h4>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-[160px_240px_1fr] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
                <div>Procedure ID</div>
                <div>Procedure name</div>
                <div>Procedure description</div>
              </div>
              <div className="divide-y divide-gray-200">
                {litigationGeneralProcedures.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[160px_240px_1fr] gap-3 px-4 py-3">
                    <Input
                      value={row.procedureId}
                      onChange={(event) => {
                        const next = [...litigationGeneralProcedures];
                        next[index] = { ...row, procedureId: event.target.value };
                        setLitigationGeneralProcedures(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.procedureName}
                      onChange={(event) => {
                        const next = [...litigationGeneralProcedures];
                        next[index] = { ...row, procedureName: event.target.value };
                        setLitigationGeneralProcedures(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.description}
                      onChange={(event) => {
                        const next = [...litigationGeneralProcedures];
                        next[index] = { ...row, description: event.target.value };
                        setLitigationGeneralProcedures(next);
                      }}
                      placeholder=""
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-gray-900">RMM specific procedures</h4>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-[160px_1fr_120px_260px_220px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
                <div>RM ID</div>
                <div>RM description</div>
                <div>Inherent risk</div>
                <div>Significant account(s) / disclosure(s)</div>
                <div>Assertions</div>
              </div>
              <div className="divide-y divide-gray-200">
                {litigationRmmSpecificProcedures.map((row, index) => (
                  <div key={row.id} className="space-y-3 px-4 py-3">
                    <div className="grid grid-cols-[160px_1fr_120px_260px_220px] gap-3">
                      <Input
                        value={row.rmId}
                        onChange={(event) => {
                          const next = [...litigationRmmSpecificProcedures];
                          next[index] = { ...row, rmId: event.target.value };
                          setLitigationRmmSpecificProcedures(next);
                        }}
                        placeholder=""
                      />
                      <Input
                        value={row.rmDescription}
                        onChange={(event) => {
                          const next = [...litigationRmmSpecificProcedures];
                          next[index] = { ...row, rmDescription: event.target.value };
                          setLitigationRmmSpecificProcedures(next);
                        }}
                        placeholder=""
                      />
                      <Input
                        value={row.inherentRisk}
                        onChange={(event) => {
                          const next = [...litigationRmmSpecificProcedures];
                          next[index] = { ...row, inherentRisk: event.target.value };
                          setLitigationRmmSpecificProcedures(next);
                        }}
                        placeholder=""
                      />
                      <Input
                        value={row.significantAccounts}
                        onChange={(event) => {
                          const next = [...litigationRmmSpecificProcedures];
                          next[index] = { ...row, significantAccounts: event.target.value };
                          setLitigationRmmSpecificProcedures(next);
                        }}
                        placeholder=""
                      />
                      <Input
                        value={row.assertions}
                        onChange={(event) => {
                          const next = [...litigationRmmSpecificProcedures];
                          next[index] = { ...row, assertions: event.target.value };
                          setLitigationRmmSpecificProcedures(next);
                        }}
                        placeholder=""
                      />
                    </div>

                    <div className="overflow-hidden rounded-md border border-gray-200">
                      <div className="grid grid-cols-[120px_160px_1fr_220px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
                        <div>Process type</div>
                        <div>Process ID</div>
                        <div>Procedure description</div>
                        <div>Audit evidence obtained</div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {row.procedures.map((proc, procIndex) => (
                          <div key={proc.id} className="grid grid-cols-[120px_160px_1fr_220px] gap-3 px-4 py-3 items-center">
                            <Input
                              value={proc.type}
                              onChange={(event) => {
                                const next = [...litigationRmmSpecificProcedures];
                                const procedureRows = [...next[index].procedures];
                                procedureRows[procIndex] = { ...proc, type: event.target.value };
                                next[index] = { ...next[index], procedures: procedureRows };
                                setLitigationRmmSpecificProcedures(next);
                              }}
                              placeholder=""
                            />
                            <Input
                              value={proc.procedureId}
                              onChange={(event) => {
                                const next = [...litigationRmmSpecificProcedures];
                                const procedureRows = [...next[index].procedures];
                                procedureRows[procIndex] = { ...proc, procedureId: event.target.value };
                                next[index] = { ...next[index], procedures: procedureRows };
                                setLitigationRmmSpecificProcedures(next);
                              }}
                              placeholder=""
                            />
                            <Input
                              value={proc.description}
                              onChange={(event) => {
                                const next = [...litigationRmmSpecificProcedures];
                                const procedureRows = [...next[index].procedures];
                                procedureRows[procIndex] = { ...proc, description: event.target.value };
                                next[index] = { ...next[index], procedures: procedureRows };
                                setLitigationRmmSpecificProcedures(next);
                              }}
                              placeholder=""
                            />
                            <div className="flex items-center justify-center">
                              <Switch
                                checked={proc.evidenceObtained}
                                onCheckedChange={(checked) => {
                                  const next = [...litigationRmmSpecificProcedures];
                                  const procedureRows = [...next[index].procedures];
                                  procedureRows[procIndex] = { ...proc, evidenceObtained: checked };
                                  next[index] = { ...next[index], procedures: procedureRows };
                                  setLitigationRmmSpecificProcedures(next);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLitigationLeadsheet = () => (
    <div className="space-y-8">
      
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Leadsheet</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[180px_1fr_180px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>Reference</div>
              <div>Description</div>
              <div>Amount</div>
            </div>
            <div className="grid grid-cols-[180px_1fr_180px] gap-3 px-4 py-3">
              <Input value="" readOnly placeholder="" />
              <Input value="" readOnly placeholder="" />
              <Input value="" readOnly placeholder="" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLitigationLaws = () => {
    const renderTriStateButtons = (
      value: 'YES' | 'NO' | 'NONE',
      onChange: (value: 'YES' | 'NO' | 'NONE') => void
    ) => (
      <div className="flex items-center gap-2">
        <Button variant={value === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => onChange('YES')}>
          Yes
        </Button>
        <Button variant={value === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => onChange('NO')}>
          No
        </Button>
        <Button variant={value === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => onChange('NONE')}>
          Not selected
        </Button>
      </div>
    );

    return (
      <div className="space-y-8">
        

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-2xl font-semibold leading-tight text-gray-900">
              Understand the applicable legal and regulatory framework and how management is made aware of actual or suspected non-compliance
            </h3>
            <p className="text-sm text-gray-700">
              Document our understanding of the legal and regulatory framework, including direct and indirect laws and regulations, in which the entity operates (including those that apply to the industry or sector in which the entity operates), and how the entity complies with that framework.
            </p>

            <div className="space-y-2 text-sm text-gray-700">
              <p className="text-base font-semibold text-gray-900">Direct laws</p>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={litigationLawCategories.directIndustryFinancialReporting}
                  onCheckedChange={(checked) =>
                    setLitigationLawCategories({
                      ...litigationLawCategories,
                      directIndustryFinancialReporting: Boolean(checked),
                    })
                  }
                />
                Industry specific financial reporting issues
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={litigationLawCategories.directTaxLegislation}
                  onCheckedChange={(checked) =>
                    setLitigationLawCategories({
                      ...litigationLawCategories,
                      directTaxLegislation: Boolean(checked),
                    })
                  }
                />
                Tax or legislative requirements
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={litigationLawCategories.directGovernmentLegislation}
                  onCheckedChange={(checked) =>
                    setLitigationLawCategories({
                      ...litigationLawCategories,
                      directGovernmentLegislation: Boolean(checked),
                    })
                  }
                />
                Governmental legislation
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={litigationLawCategories.directOther}
                  onCheckedChange={(checked) =>
                    setLitigationLawCategories({
                      ...litigationLawCategories,
                      directOther: Boolean(checked),
                    })
                  }
                />
                Other
              </label>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p className="text-base font-semibold text-gray-900">Indirect laws</p>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={litigationLawCategories.indirectFraudCorruptionBribery}
                  onCheckedChange={(checked) =>
                    setLitigationLawCategories({
                      ...litigationLawCategories,
                      indirectFraudCorruptionBribery: Boolean(checked),
                    })
                  }
                />
                Fraud, corruption and bribery
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={litigationLawCategories.indirectMoneyLaundering}
                  onCheckedChange={(checked) =>
                    setLitigationLawCategories({
                      ...litigationLawCategories,
                      indirectMoneyLaundering: Boolean(checked),
                    })
                  }
                />
                Money laundering, terrorist financing and proceeds of crime regulations
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={litigationLawCategories.indirectDataProtection}
                  onCheckedChange={(checked) =>
                    setLitigationLawCategories({
                      ...litigationLawCategories,
                      indirectDataProtection: Boolean(checked),
                    })
                  }
                />
                Data protection regulations
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={litigationLawCategories.indirectEnvironmental}
                  onCheckedChange={(checked) =>
                    setLitigationLawCategories({
                      ...litigationLawCategories,
                      indirectEnvironmental: Boolean(checked),
                    })
                  }
                />
                Environmental protection regulations
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={litigationLawCategories.indirectPublicHealthSafety}
                  onCheckedChange={(checked) =>
                    setLitigationLawCategories({
                      ...litigationLawCategories,
                      indirectPublicHealthSafety: Boolean(checked),
                    })
                  }
                />
                Public health and safety regulations
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={litigationLawCategories.indirectOther}
                  onCheckedChange={(checked) =>
                    setLitigationLawCategories({
                      ...litigationLawCategories,
                      indirectOther: Boolean(checked),
                    })
                  }
                />
                Other
              </label>
            </div>

            <Textarea
              value={litigationFrameworkNotes}
              onChange={(event) => setLitigationFrameworkNotes(event.target.value)}
              placeholder=""
              className="min-h-[140px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Inquire of management and, where appropriate, those charged with governance concerning compliance with laws and regulations
            </h3>
            <p className="text-sm text-gray-700">We inquired of the following person(s) or organization(s):</p>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_160px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
                <div>Interviewee name</div>
                <div>Interviewee role</div>
                <div>Interviewee position</div>
                <div>KPMG interviewer(s)</div>
                <div>Date of meeting</div>
              </div>
              <div className="divide-y divide-gray-200">
                {litigationInterviews.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[1.3fr_1fr_1fr_1fr_160px] gap-3 px-4 py-3">
                    <Input
                      value={row.name}
                      onChange={(event) => {
                        const next = [...litigationInterviews];
                        next[index] = { ...row, name: event.target.value };
                        setLitigationInterviews(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.role}
                      onChange={(event) => {
                        const next = [...litigationInterviews];
                        next[index] = { ...row, role: event.target.value };
                        setLitigationInterviews(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.position}
                      onChange={(event) => {
                        const next = [...litigationInterviews];
                        next[index] = { ...row, position: event.target.value };
                        setLitigationInterviews(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.interviewer}
                      onChange={(event) => {
                        const next = [...litigationInterviews];
                        next[index] = { ...row, interviewer: event.target.value };
                        setLitigationInterviews(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      type="date"
                      value={row.date}
                      onChange={(event) => {
                        const next = [...litigationInterviews];
                        next[index] = { ...row, date: event.target.value };
                        setLitigationInterviews(next);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setLitigationInterviews([
                  ...litigationInterviews,
                  { id: Math.max(...litigationInterviews.map((r) => r.id)) + 1, name: '', role: '', position: '', interviewer: '', date: '' },
                ])
              }
            >
              Add interviewee
            </Button>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-[2fr_1fr] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
                <div>Inquiry</div>
                <div>Entity's Response</div>
              </div>
              <div className="grid grid-cols-[2fr_1fr] gap-3 px-4 py-3 text-sm text-gray-700">
                <p>Have there been any instances of actual or possible violations of laws and regulations, including illegal acts (irrespective of materiality threshold)?</p>
                <select
                  className="h-9 rounded-md border border-gray-300 px-2 text-sm"
                  value={litigationInquiryQuestions.violations}
                  onChange={(event) =>
                    setLitigationInquiryQuestions({
                      ...litigationInquiryQuestions,
                      violations: event.target.value,
                    })
                  }
                >
                  <option value="NONE">Not selected</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p className="font-semibold">Inspect correspondence with relevant licensing or regulatory bodies</p>
              <p>Has there been any correspondence with regulators or licensing authorities?</p>
              {renderTriStateButtons(
                litigationInquiryQuestions.correspondence as 'YES' | 'NO' | 'NONE',
                (value) =>
                  setLitigationInquiryQuestions({
                    ...litigationInquiryQuestions,
                    correspondence: value,
                  })
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p className="font-semibold">Obtain an understanding of how management is made aware of actual or non-compliance, including illegal acts</p>
              <p>
                Document our understanding of the entity's process to be made aware of potential or suspected non-compliance with laws and regulations, including how information is collected, actioned and reported on.
              </p>
              <Textarea
                value={litigationInquiryQuestions.complaintProcess}
                onChange={(event) =>
                  setLitigationInquiryQuestions({
                    ...litigationInquiryQuestions,
                    complaintProcess: event.target.value,
                  })
                }
                placeholder=""
                className="min-h-[120px]"
              />
              <p>Is there information or reports provided to those charged with governance from complaints or other similar processes?</p>
              {renderTriStateButtons(
                litigationInquiryQuestions.reportsToGovernance as 'YES' | 'NO' | 'NONE',
                (value) =>
                  setLitigationInquiryQuestions({
                    ...litigationInquiryQuestions,
                    reportsToGovernance: value,
                  })
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p className="font-semibold">
                Inquire of management regarding policies and procedures for identifying, evaluating, and accounting for litigation, claims and assessments.
              </p>
              <Textarea
                value={litigationManagementPoliciesNotes}
                onChange={(event) => setLitigationManagementPoliciesNotes(event.target.value)}
                placeholder=""
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p className="font-semibold">Inquire of management regarding the following matters as of the balance sheet date and document the results.</p>
              <p>Is the entity involved in any litigation, claims or assessments?</p>
              {renderTriStateButtons(
                litigationInquiryQuestions.involvedInLitigation as 'YES' | 'NO' | 'NONE',
                (value) =>
                  setLitigationInquiryQuestions({
                    ...litigationInquiryQuestions,
                    involvedInLitigation: value,
                  })
              )}
              <p>Are there any legal matters in which management has not consulted with legal counsel and we believe they should have?</p>
              {renderTriStateButtons(
                litigationInquiryQuestions.legalNoCounsel as 'YES' | 'NO' | 'NONE',
                (value) =>
                  setLitigationInquiryQuestions({
                    ...litigationInquiryQuestions,
                    legalNoCounsel: value,
                  })
              )}
              <p>Has management changed lawyers on any legal matters from the prior year?</p>
              {renderTriStateButtons(
                litigationInquiryQuestions.changedLawyers as 'YES' | 'NO' | 'NONE',
                (value) =>
                  setLitigationInquiryQuestions({
                    ...litigationInquiryQuestions,
                    changedLawyers: value,
                  })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-2xl font-semibold leading-tight text-gray-900">
              Examine documents in the client's possession concerning litigation and review meeting minutes
            </h3>
            <p className="text-sm text-gray-700">Document the specific items examined and procedures performed.</p>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-[1.2fr_1.2fr_1fr] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
                <div>Description</div>
                <div>Clarify and document procedures performed</div>
                <div>Attachment(s) if applicable</div>
              </div>
              <div className="divide-y divide-gray-200">
                {litigationDocumentsRows.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[1.2fr_1.2fr_1fr] gap-3 px-4 py-3">
                    <Input
                      value={row.description}
                      onChange={(event) => {
                        const next = [...litigationDocumentsRows];
                        next[index] = { ...row, description: event.target.value };
                        setLitigationDocumentsRows(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.procedures}
                      onChange={(event) => {
                        const next = [...litigationDocumentsRows];
                        next[index] = { ...row, procedures: event.target.value };
                        setLitigationDocumentsRows(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.attachments}
                      onChange={(event) => {
                        const next = [...litigationDocumentsRows];
                        next[index] = { ...row, attachments: event.target.value };
                        setLitigationDocumentsRows(next);
                      }}
                      placeholder=""
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setLitigationDocumentsRows([
                  ...litigationDocumentsRows,
                  { id: Math.max(...litigationDocumentsRows.map((r) => r.id)) + 1, description: '', procedures: '', attachments: '' },
                ])
              }
            >
              Add document item
            </Button>

            <p className="text-sm text-gray-700">
              Based on the documents we examined, did we identify anything new or inconsistent with management's evaluation?
            </p>
            {renderTriStateButtons(litigationDocumentsConsistency, setLitigationDocumentsConsistency)}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-2xl font-semibold leading-tight text-gray-900">Inquire of the client's lawyer</h3>
            <p className="text-sm text-gray-700">
              Will we send a letter of audit inquiry to the client's in-house or external lawyer(s)?
            </p>
            {renderTriStateButtons(
              litigationInquiryQuestions.sendLetter as 'YES' | 'NO' | 'NONE',
              (value) =>
                setLitigationInquiryQuestions({
                  ...litigationInquiryQuestions,
                  sendLetter: value,
                })
            )}
            <p className="text-sm text-gray-700">
              Will we perform alternative procedures instead of sending a letter of audit inquiry to any of the client's in-house or external lawyer(s)?
            </p>
            {renderTriStateButtons(
              litigationInquiryQuestions.alternativeProcedures as 'YES' | 'NO' | 'NONE',
              (value) =>
                setLitigationInquiryQuestions({
                  ...litigationInquiryQuestions,
                  alternativeProcedures: value,
                })
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-[120px_1fr_120px_160px_140px_160px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
                <div>ID</div>
                <div>Description</div>
                <div>Inherent risk</div>
                <div>Inherent risk factors</div>
                <div>Assertions</div>
                <div>Control approach</div>
              </div>
              <div className="divide-y divide-gray-200">
                {litigationRiskRows.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[120px_1fr_120px_160px_140px_160px] gap-3 px-4 py-3 items-center">
                    <Input
                      value={row.riskId}
                      onChange={(event) => {
                        const next = [...litigationRiskRows];
                        next[index] = { ...row, riskId: event.target.value };
                        setLitigationRiskRows(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.description}
                      onChange={(event) => {
                        const next = [...litigationRiskRows];
                        next[index] = { ...row, description: event.target.value };
                        setLitigationRiskRows(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.inherentRisk}
                      onChange={(event) => {
                        const next = [...litigationRiskRows];
                        next[index] = { ...row, inherentRisk: event.target.value };
                        setLitigationRiskRows(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.riskFactors}
                      onChange={(event) => {
                        const next = [...litigationRiskRows];
                        next[index] = { ...row, riskFactors: event.target.value };
                        setLitigationRiskRows(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.assertions}
                      onChange={(event) => {
                        const next = [...litigationRiskRows];
                        next[index] = { ...row, assertions: event.target.value };
                        setLitigationRiskRows(next);
                      }}
                      placeholder=""
                    />
                    <div className="flex justify-center">
                      <Switch
                        checked={row.controlsApproach}
                        onCheckedChange={(checked) => {
                          const next = [...litigationRiskRows];
                          next[index] = { ...row, controlsApproach: checked };
                          setLitigationRiskRows(next);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-700">
              Document our criteria for selecting the lawyer(s) to send a letter of audit inquiry (or perform alternative procedures, when appropriate), including any materiality thresholds.
            </p>
            <Textarea
              value={litigationLawyerSelectionCriteria}
              onChange={(event) => setLitigationLawyerSelectionCriteria(event.target.value)}
              placeholder=""
              className="min-h-[120px]"
            />

            <p className="text-sm text-gray-700">
              Identify the legal counsel to send inquiry letters to (or perform alternative procedures, if appropriate).
            </p>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-[180px_1fr_1fr_120px_140px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
                <div>Reference</div>
                <div>Name of legal counsel</div>
                <div>Description of legal matter(s)</div>
                <div>Send letter</div>
                <div>Received letter</div>
              </div>
              <div className="divide-y divide-gray-200">
                {litigationCounselRows.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[180px_1fr_1fr_120px_140px] gap-3 px-4 py-3 items-center">
                    <Input
                      value={row.reference}
                      onChange={(event) => {
                        const next = [...litigationCounselRows];
                        next[index] = { ...row, reference: event.target.value };
                        setLitigationCounselRows(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.counsel}
                      onChange={(event) => {
                        const next = [...litigationCounselRows];
                        next[index] = { ...row, counsel: event.target.value };
                        setLitigationCounselRows(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.matter}
                      onChange={(event) => {
                        const next = [...litigationCounselRows];
                        next[index] = { ...row, matter: event.target.value };
                        setLitigationCounselRows(next);
                      }}
                      placeholder=""
                    />
                    <div className="flex justify-center">
                      <Checkbox
                        checked={row.sendLetter}
                        onCheckedChange={(checked) => {
                          const next = [...litigationCounselRows];
                          next[index] = { ...row, sendLetter: Boolean(checked) };
                          setLitigationCounselRows(next);
                        }}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={row.receivedLetter}
                        onCheckedChange={(checked) => {
                          const next = [...litigationCounselRows];
                          next[index] = { ...row, receivedLetter: Boolean(checked) };
                          setLitigationCounselRows(next);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setLitigationCounselRows([
                  ...litigationCounselRows,
                  {
                    id: Math.max(...litigationCounselRows.map((r) => r.id)) + 1,
                    reference: '',
                    counsel: '',
                    matter: '',
                    sendLetter: false,
                    receivedLetter: false,
                  },
                ])
              }
            >
              Add legal counsel
            </Button>

            <p className="text-sm text-gray-700">
              Document the rationale for not sending legal inquiry letters (or performing alternative procedures, when appropriate) to the remaining population of lawyers with whom management has consulted during the current period.
            </p>
            <Textarea
              value={litigationCounselRationale}
              onChange={(event) => setLitigationCounselRationale(event.target.value)}
              placeholder=""
              className="min-h-[120px]"
            />

            <p className="text-sm text-gray-700">
              Did we obtain evidence that contradicts the evidence on which the original risk assessment was based?
            </p>
            {renderTriStateButtons(litigationContradictEvidence, setLitigationContradictEvidence)}
            <p className="text-sm text-gray-700">Did we obtain the evidence we expected from this procedure?</p>
            {renderTriStateButtons(litigationEvidenceExpected, setLitigationEvidenceExpected)}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-2xl font-semibold leading-tight text-gray-900">
              Identify actual or suspected non-compliance, including illegal acts and fraud
            </h3>
            <p className="text-sm text-gray-700">
              Based on our understanding obtained, has specific information come to our attention concerning the existence of actual or suspected non-compliance with laws and regulations, including illegal acts and fraud, that are not clearly inconsequential?
            </p>
            {renderTriStateButtons(litigationNonCompliance, setLitigationNonCompliance)}
            <p className="text-sm text-gray-700">Document rationale as to why the matter is clearly inconsequential.</p>
            <Textarea
              value={litigationNonComplianceRationale}
              onChange={(event) => setLitigationNonComplianceRationale(event.target.value)}
              placeholder=""
              className="min-h-[140px]"
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  const processBalanceRows = useMemo(() => {
    const map = new Map<string, { account: string; label: string; cy: number; py: number }>();
    const cyRows = formData.source_excel_balances?.balanceN ?? [];
    const pyRows = formData.source_excel_balances?.balanceN1 ?? [];

    cyRows.forEach((row) => {
      const account = String(row.account ?? '').trim();
      if (!account) return;
      const existing = map.get(account) ?? { account, label: row.label || '', cy: 0, py: 0 };
      existing.cy += Number(row.balance) || 0;
      if (!existing.label && row.label) existing.label = row.label;
      map.set(account, existing);
    });

    pyRows.forEach((row) => {
      const account = String(row.account ?? '').trim();
      if (!account) return;
      const existing = map.get(account) ?? { account, label: row.label || '', cy: 0, py: 0 };
      existing.py += Number(row.balance) || 0;
      if (!existing.label && row.label) existing.label = row.label;
      map.set(account, existing);
    });

    return map;
  }, [formData.source_excel_balances]);

  const renderDynamicProcessAnswerButtons = (key: string) => {
    const value = dynamicProcessAnswers[key] ?? 'NONE';
    return (
      <div className="flex items-center gap-2">
        <Button variant={value === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setDynamicProcessAnswers((prev) => ({ ...prev, [key]: 'YES' }))}>Yes</Button>
        <Button variant={value === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setDynamicProcessAnswers((prev) => ({ ...prev, [key]: 'NO' }))}>No</Button>
        <Button variant={value === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setDynamicProcessAnswers((prev) => ({ ...prev, [key]: 'NONE' }))}>Not selected</Button>
      </div>
    );
  };

  const renderDynamicProcessSection = () => {
    const processSections = (businessProcessesSection?.children ?? []).filter(
      (child: any) => typeof child.id === 'string' && child.id.startsWith('bp-process-')
    );
    const rootSection = processSections.find(
      (section: any) =>
        activeSection === section.id ||
        activeSection.startsWith(`${section.id}-`)
    );

    if (!rootSection) return null;

    const processId = String(rootSection?.meta?.processId ?? rootSection.id);
    const processName = String(rootSection?.meta?.processName ?? rootSection.title ?? 'Process');
    const processChildren = rootSection.children ?? [];

    const leadsheetId = `${rootSection.id}-leadsheet`;
    const understandingId = `${rootSection.id}-understanding`;
    const resultsId = `${rootSection.id}-results`;
    const caId = `${rootSection.id}-ca`;
    const subId = `${rootSection.id}-sub`;

    const mappedAccounts = (dynamicProcessMappingDoc?.mappings ?? [])
      .filter((entry) => entry.processId === processId)
      .map((entry) => {
        const row = processBalanceRows.get(entry.account);
        return {
          account: entry.account,
          label: row?.label ?? '',
          cy: row?.cy ?? 0,
          py: row?.py ?? 0,
        };
      });

    const procedures = dynamicProcessProcedureRows[rootSection.id] ?? [
      { id: 'PRP1', description: '' },
    ];
    const tecs = dynamicProcessTecRows[rootSection.id] ?? [
      { category: '', id: '', description: '', applicable: false, addNotes: false },
    ];
    const walkthroughs = dynamicProcessWalkthroughRows[rootSection.id] ?? [
      { processStep: '', activityStep: '', understanding: '' },
    ];
    const itLayers = dynamicProcessItLayerRows[rootSection.id] ?? [
      { reference: '', itLayers: '', description: '', layerType: '', outsourced: false },
    ];
    const controlRows = dynamicProcessControlRows[rootSection.id] ?? [
      { controlId: '', controlDescription: '', processRiskPoints: '', diResult: '', toeResult: '' },
    ];
    const substantiveRows = dynamicProcessSubstantiveRows[rootSection.id] ?? [
      { plannedResponse: '', applicable: false, addNotes: false },
    ];

    if (activeSection === rootSection.id) {
      return (
        <div className="space-y-8">
          <div className="flex flex-wrap gap-4">
            {processChildren.map((child: any) => (
              <div key={child.id} className="w-[220px]">
                <Card
                  className="cursor-pointer rounded-none border border-gray-200 shadow-sm transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none"
                  tabIndex={0}
                  onClick={() => onSectionChange(child.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onSectionChange(child.id);
                  }}
                  role="button"
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="text-3xl leading-none text-gray-900">{child.number || ''}</div>
                    <div className="text-[30px] h-px bg-gray-200" />
                    <div className="text-lg text-gray-900">{child.title}</div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === leadsheetId) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-2 text-sm text-gray-700">
              <h3 className="text-2xl font-semibold text-gray-900">0. Leadsheet</h3>
              <p>Mapped accounts for process: <span className="font-semibold">{processName}</span></p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-900 text-left text-white">
                    <tr>
                      <th className="px-3 py-2 text-sm font-semibold">Account</th>
                      <th className="px-3 py-2 text-sm font-semibold">Label</th>
                      <th className="px-3 py-2 text-sm font-semibold">CY</th>
                      <th className="px-3 py-2 text-sm font-semibold">PY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-3 text-sm text-gray-500">No mapped accounts yet.</td>
                      </tr>
                    ) : (
                      mappedAccounts.map((row, idx) => (
                        <tr key={`mapped-account-${idx}`} className="border-t border-gray-200">
                          <td className="px-3 py-2 text-sm">{row.account}</td>
                          <td className="px-3 py-2 text-sm">{row.label}</td>
                          <td className="px-3 py-2 text-sm">{row.cy}</td>
                          <td className="px-3 py-2 text-sm">{row.py}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeSection === understandingId) {
      return (
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6 space-y-4 text-sm text-gray-700">
              <h3 className="text-2xl font-semibold text-gray-900">Understand the accounts and disclosures</h3>
              <p className="font-semibold">Process-level risk assessment</p>
              <p>Do we plan to perform analytical procedures in addition to those performed in 2.2.2 Planning analytics?</p>
              {renderDynamicProcessAnswerButtons(`${rootSection.id}:analytical-procedures`)}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <p>Identify process-level risk assessment procedures.</p>
                <Button type="button" size="sm" variant="outline" onClick={() => setDynamicProcessProcedureRows((prev) => ({
                  ...prev,
                  [rootSection.id]: [...procedures, { id: '', description: '' }],
                }))}>Add row</Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-900 text-left text-white">
                    <tr>
                      <th className="px-3 py-2 text-sm font-semibold">ID</th>
                      <th className="px-3 py-2 text-sm font-semibold">Procedure description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {procedures.map((row, idx) => (
                      <tr key={`proc-row-${idx}`} className="border-t border-gray-200">
                        <td className="px-3 py-2"><Input value={row.id} onChange={(event) => {
                          const next = [...procedures];
                          next[idx] = { ...row, id: event.target.value };
                          setDynamicProcessProcedureRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                        <td className="px-3 py-2"><Textarea value={row.description} onChange={(event) => {
                          const next = [...procedures];
                          next[idx] = { ...row, description: event.target.value };
                          setDynamicProcessProcedureRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} className="min-h-[72px]" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>Document the results of process-level risk assessment procedures performed.</p>
              <Textarea className="min-h-[120px]" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <p>Identify applicable types of transactions, events and conditions in the accounts and disclosures within this process.</p>
                <Button type="button" size="sm" variant="outline" onClick={() => setDynamicProcessTecRows((prev) => ({
                  ...prev,
                  [rootSection.id]: [...tecs, { category: '', id: '', description: '', applicable: false, addNotes: false }],
                }))}>Add row</Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-900 text-left text-white">
                    <tr>
                      <th className="px-3 py-2 text-sm font-semibold">Category</th>
                      <th className="px-3 py-2 text-sm font-semibold">ID</th>
                      <th className="px-3 py-2 text-sm font-semibold">Description</th>
                      <th className="px-3 py-2 text-sm font-semibold">Applicable</th>
                      <th className="px-3 py-2 text-sm font-semibold">Add notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tecs.map((row, idx) => (
                      <tr key={`tec-row-${idx}`} className="border-t border-gray-200">
                        <td className="px-2 py-2"><Input value={row.category} onChange={(event) => {
                          const next = [...tecs];
                          next[idx] = { ...row, category: event.target.value };
                          setDynamicProcessTecRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                        <td className="px-2 py-2"><Input value={row.id} onChange={(event) => {
                          const next = [...tecs];
                          next[idx] = { ...row, id: event.target.value };
                          setDynamicProcessTecRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                        <td className="px-2 py-2"><Textarea value={row.description} onChange={(event) => {
                          const next = [...tecs];
                          next[idx] = { ...row, description: event.target.value };
                          setDynamicProcessTecRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} className="min-h-[72px]" /></td>
                        <td className="px-2 py-2 text-center"><Checkbox checked={row.applicable} onCheckedChange={(checked) => {
                          const next = [...tecs];
                          next[idx] = { ...row, applicable: Boolean(checked) };
                          setDynamicProcessTecRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                        <td className="px-2 py-2 text-center"><Checkbox checked={row.addNotes} onCheckedChange={(checked) => {
                          const next = [...tecs];
                          next[idx] = { ...row, addNotes: Boolean(checked) };
                          setDynamicProcessTecRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3 text-sm text-gray-700">
              <p className="font-semibold">Identify estimates in accounts and disclosures</p>
              <p>Is there an estimate(s) within this process with a reasonable possibility of a risk of material misstatement?</p>
              {renderDynamicProcessAnswerButtons(`${rootSection.id}:estimates-rmm`)}
              <p>Is there an estimate(s) within this process that gave rise to a risk of material misstatement in the prior year but not in the current year?</p>
              {renderDynamicProcessAnswerButtons(`${rootSection.id}:estimates-prior`)}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3 text-sm text-gray-700">
              <p className="font-semibold">Will we perform a walkthrough to obtain an understanding of types of transactions or events and conditions where an RMM could exist?</p>
              {renderDynamicProcessAnswerButtons(`${rootSection.id}:walkthrough-required`)}
              <div className="flex justify-end">
                <Button type="button" size="sm" variant="outline" onClick={() => setDynamicProcessWalkthroughRows((prev) => ({
                  ...prev,
                  [rootSection.id]: [...walkthroughs, { processStep: '', activityStep: '', understanding: '' }],
                }))}>Add row</Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-900 text-left text-white">
                    <tr>
                      <th className="px-3 py-2 text-sm font-semibold">Process step</th>
                      <th className="px-3 py-2 text-sm font-semibold">Activity step</th>
                      <th className="px-3 py-2 text-sm font-semibold">Understanding, and how it was obtained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walkthroughs.map((row, idx) => (
                      <tr key={`walkthrough-row-${idx}`} className="border-t border-gray-200">
                        <td className="px-2 py-2"><Input value={row.processStep} onChange={(event) => {
                          const next = [...walkthroughs];
                          next[idx] = { ...row, processStep: event.target.value };
                          setDynamicProcessWalkthroughRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                        <td className="px-2 py-2"><Input value={row.activityStep} onChange={(event) => {
                          const next = [...walkthroughs];
                          next[idx] = { ...row, activityStep: event.target.value };
                          setDynamicProcessWalkthroughRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                        <td className="px-2 py-2"><Textarea value={row.understanding} onChange={(event) => {
                          const next = [...walkthroughs];
                          next[idx] = { ...row, understanding: event.target.value };
                          setDynamicProcessWalkthroughRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} className="min-h-[72px]" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="font-semibold">Identify relevant IT system layers</p>
              <div className="flex justify-end">
                <Button type="button" size="sm" variant="outline" onClick={() => setDynamicProcessItLayerRows((prev) => ({
                  ...prev,
                  [rootSection.id]: [...itLayers, { reference: '', itLayers: '', description: '', layerType: '', outsourced: false }],
                }))}>Add row</Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-900 text-left text-white">
                    <tr>
                      <th className="px-3 py-2 text-sm font-semibold">Reference</th>
                      <th className="px-3 py-2 text-sm font-semibold">IT Layer(s)</th>
                      <th className="px-3 py-2 text-sm font-semibold">Description of IT system layer</th>
                      <th className="px-3 py-2 text-sm font-semibold">Layer type</th>
                      <th className="px-3 py-2 text-sm font-semibold">Outsourced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itLayers.map((row, idx) => (
                      <tr key={`it-row-${idx}`} className="border-t border-gray-200">
                        <td className="px-2 py-2"><Input value={row.reference} onChange={(event) => {
                          const next = [...itLayers];
                          next[idx] = { ...row, reference: event.target.value };
                          setDynamicProcessItLayerRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                        <td className="px-2 py-2"><Input value={row.itLayers} onChange={(event) => {
                          const next = [...itLayers];
                          next[idx] = { ...row, itLayers: event.target.value };
                          setDynamicProcessItLayerRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                        <td className="px-2 py-2"><Textarea value={row.description} onChange={(event) => {
                          const next = [...itLayers];
                          next[idx] = { ...row, description: event.target.value };
                          setDynamicProcessItLayerRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} className="min-h-[60px]" /></td>
                        <td className="px-2 py-2"><Input value={row.layerType} onChange={(event) => {
                          const next = [...itLayers];
                          next[idx] = { ...row, layerType: event.target.value };
                          setDynamicProcessItLayerRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                        <td className="px-2 py-2 text-center"><Checkbox checked={row.outsourced} onCheckedChange={(checked) => {
                          const next = [...itLayers];
                          next[idx] = { ...row, outsourced: Boolean(checked) };
                          setDynamicProcessItLayerRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeSection === resultsId) {
      const resultsChecks = dynamicProcessResultsChecks[rootSection.id] ?? {
        significantAccountsDisclosures: false,
        timingChanges: false,
        expertsInvolvementChanges: false,
        serviceOrganizationsIdentified: false,
        contradictoryEvidenceIdentified: false,
        otherCircumstances: false,
      };
      const setResultsCheck = (
        key: keyof typeof resultsChecks,
        checked: boolean
      ) => {
        setDynamicProcessResultsChecks((prev) => ({
          ...prev,
          [rootSection.id]: {
            ...resultsChecks,
            [key]: checked,
          },
        }));
      };

      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4 text-sm text-gray-700">
              <h3 className="text-2xl font-semibold text-gray-900">2. Results</h3>
              <h4 className="text-2xl font-semibold text-gray-900">Modify the audit strategy and audit plan if circumstances change</h4>
              <p>
                Identify all applicable circumstances that changed significantly since we developed our audit strategy and audit plan for this business process:
              </p>
              <label className="flex items-start gap-2">
                <Checkbox
                  checked={resultsChecks.significantAccountsDisclosures}
                  onCheckedChange={(checked) => setResultsCheck('significantAccountsDisclosures', Boolean(checked))}
                />
                <span>Identification of significant accounts and disclosures initially identified as non-significant.</span>
              </label>
              <label className="flex items-start gap-2">
                <Checkbox
                  checked={resultsChecks.timingChanges}
                  onCheckedChange={(checked) => setResultsCheck('timingChanges', Boolean(checked))}
                />
                <span>Changes in the timing of our audit procedures.</span>
              </label>
              <label className="flex items-start gap-2">
                <Checkbox
                  checked={resultsChecks.expertsInvolvementChanges}
                  onCheckedChange={(checked) => setResultsCheck('expertsInvolvementChanges', Boolean(checked))}
                />
                <span>Changes in the involvement of experts.</span>
              </label>
              <label className="flex items-start gap-2">
                <Checkbox
                  checked={resultsChecks.serviceOrganizationsIdentified}
                  onCheckedChange={(checked) => setResultsCheck('serviceOrganizationsIdentified', Boolean(checked))}
                />
                <span>Identification of service organizations used by the entity.</span>
              </label>
              <label className="flex items-start gap-2">
                <Checkbox
                  checked={resultsChecks.contradictoryEvidenceIdentified}
                  onCheckedChange={(checked) => setResultsCheck('contradictoryEvidenceIdentified', Boolean(checked))}
                />
                <span>Identification of potential disconfirming or contradictory evidence while performing other audit procedures.</span>
              </label>
              <label className="flex items-start gap-2">
                <Checkbox
                  checked={resultsChecks.otherCircumstances}
                  onCheckedChange={(checked) => setResultsCheck('otherCircumstances', Boolean(checked))}
                />
                <span>Other circumstances that resulted in modification(s) to our audit strategy and audit plan.</span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4 text-sm text-gray-700">
              <h4 className="text-2xl font-semibold text-gray-900">Evaluate whether risk assessments remain appropriate</h4>
              <p>Do our initial assessments of the risks of material misstatements (RMMs) and CARs remain appropriate?</p>
              {renderDynamicProcessAnswerButtons(`${rootSection.id}:results-risk-remain-appropriate`)}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4 text-sm text-gray-700">
              <h4 className="text-2xl font-semibold text-gray-900">Conclude on whether sufficient appropriate audit evidence has been obtained</h4>
              <p>Have we obtained sufficient appropriate audit evidence for every relevant financial statement assertion within this process?</p>
              {renderDynamicProcessAnswerButtons(`${rootSection.id}:results-sufficient-evidence`)}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeSection === caId) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4 text-sm text-gray-700">
              <h3 className="text-2xl font-semibold text-gray-900">CA. Control activities</h3>
              <div className="flex justify-end">
                <Button type="button" size="sm" variant="outline" onClick={() => setDynamicProcessControlRows((prev) => ({
                  ...prev,
                  [rootSection.id]: [...controlRows, { controlId: '', controlDescription: '', processRiskPoints: '', diResult: '', toeResult: '' }],
                }))}>Add row</Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-900 text-left text-white">
                    <tr>
                      <th className="px-3 py-2 text-sm font-semibold">Control ID</th>
                      <th className="px-3 py-2 text-sm font-semibold">Control Description</th>
                      <th className="px-3 py-2 text-sm font-semibold">Process risk points description</th>
                      <th className="px-3 py-2 text-sm font-semibold">D&I result</th>
                      <th className="px-3 py-2 text-sm font-semibold">TOE result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {controlRows.map((row, idx) => (
                      <tr key={`ca-row-${idx}`} className="border-t border-gray-200">
                        <td className="px-2 py-2"><Input value={row.controlId} onChange={(event) => {
                          const next = [...controlRows];
                          next[idx] = { ...row, controlId: event.target.value };
                          setDynamicProcessControlRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                        <td className="px-2 py-2"><Textarea value={row.controlDescription} onChange={(event) => {
                          const next = [...controlRows];
                          next[idx] = { ...row, controlDescription: event.target.value };
                          setDynamicProcessControlRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} className="min-h-[72px]" /></td>
                        <td className="px-2 py-2"><Textarea value={row.processRiskPoints} onChange={(event) => {
                          const next = [...controlRows];
                          next[idx] = { ...row, processRiskPoints: event.target.value };
                          setDynamicProcessControlRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} className="min-h-[72px]" /></td>
                        <td className="px-2 py-2"><Input value={row.diResult} onChange={(event) => {
                          const next = [...controlRows];
                          next[idx] = { ...row, diResult: event.target.value };
                          setDynamicProcessControlRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                        <td className="px-2 py-2"><Input value={row.toeResult} onChange={(event) => {
                          const next = [...controlRows];
                          next[idx] = { ...row, toeResult: event.target.value };
                          setDynamicProcessControlRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeSection === subId) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4 text-sm text-gray-700">
              <h3 className="text-2xl font-semibold text-gray-900">SUB. Substantive Procedures</h3>
              <div className="flex justify-end">
                <Button type="button" size="sm" variant="outline" onClick={() => setDynamicProcessSubstantiveRows((prev) => ({
                  ...prev,
                  [rootSection.id]: [...substantiveRows, { plannedResponse: '', applicable: false, addNotes: false }],
                }))}>Add row</Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-900 text-left text-white">
                    <tr>
                      <th className="px-3 py-2 text-sm font-semibold">Document our planned response</th>
                      <th className="px-3 py-2 text-sm font-semibold">Applicable?</th>
                      <th className="px-3 py-2 text-sm font-semibold">Add notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {substantiveRows.map((row, idx) => (
                      <tr key={`sub-row-${idx}`} className="border-t border-gray-200">
                        <td className="px-2 py-2"><Textarea value={row.plannedResponse} onChange={(event) => {
                          const next = [...substantiveRows];
                          next[idx] = { ...row, plannedResponse: event.target.value };
                          setDynamicProcessSubstantiveRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} className="min-h-[72px]" /></td>
                        <td className="px-2 py-2 text-center"><Checkbox checked={row.applicable} onCheckedChange={(checked) => {
                          const next = [...substantiveRows];
                          next[idx] = { ...row, applicable: Boolean(checked) };
                          setDynamicProcessSubstantiveRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                        <td className="px-2 py-2 text-center"><Checkbox checked={row.addNotes} onCheckedChange={(checked) => {
                          const next = [...substantiveRows];
                          next[idx] = { ...row, addNotes: Boolean(checked) };
                          setDynamicProcessSubstantiveRows((prev) => ({ ...prev, [rootSection.id]: next }));
                        }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  const renderLitigationResults = () => (
    <div className="space-y-8">
      
      <Card>
        <CardContent className="p-6 space-y-4 text-sm text-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900">
            Modify the audit strategy and audit plan if circumstances change
          </h3>
          <p>
            Identify all applicable circumstances that changed significantly since we developed our audit strategy and audit plan for this business process:
          </p>
          <label className="flex items-center gap-2">
            <Checkbox checked={litigationResultsModifications.significantAccounts} onCheckedChange={(checked) => setLitigationResultsModifications({ ...litigationResultsModifications, significantAccounts: Boolean(checked) })} />
            Identification of significant accounts and disclosures initially identified as non-significant.
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={litigationResultsModifications.timingChanges} onCheckedChange={(checked) => setLitigationResultsModifications({ ...litigationResultsModifications, timingChanges: Boolean(checked) })} />
            Changes in the timing of our audit procedures.
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={litigationResultsModifications.expertsInvolvement} onCheckedChange={(checked) => setLitigationResultsModifications({ ...litigationResultsModifications, expertsInvolvement: Boolean(checked) })} />
            Changes in the involvement of experts.
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={litigationResultsModifications.serviceOrganizations} onCheckedChange={(checked) => setLitigationResultsModifications({ ...litigationResultsModifications, serviceOrganizations: Boolean(checked) })} />
            Identification of service organizations used by the entity.
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={litigationResultsModifications.contradictoryEvidence} onCheckedChange={(checked) => setLitigationResultsModifications({ ...litigationResultsModifications, contradictoryEvidence: Boolean(checked) })} />
            Identification of potential disconfirming or contradictory evidence while performing other audit procedures.
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={litigationResultsModifications.otherCircumstances} onCheckedChange={(checked) => setLitigationResultsModifications({ ...litigationResultsModifications, otherCircumstances: Boolean(checked) })} />
            Other circumstances that resulted in modification(s) to our audit strategy and audit plan.
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-2 text-sm text-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900">Evaluate whether risk assessments remain appropriate</h3>
          <p>Do our initial assessments of the risks of material misstatements (RMMs) and CARs remain appropriate?</p>
          <div className="flex items-center gap-2">
            <Button variant={litigationResultsRiskAssessmentStillAppropriate === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationResultsRiskAssessmentStillAppropriate('YES')}>Yes</Button>
            <Button variant={litigationResultsRiskAssessmentStillAppropriate === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationResultsRiskAssessmentStillAppropriate('NO')}>No</Button>
            <Button variant={litigationResultsRiskAssessmentStillAppropriate === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationResultsRiskAssessmentStillAppropriate('NONE')}>Not selected</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-2 text-sm text-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900">Conclude on whether sufficient appropriate audit evidence has been obtained</h3>
          <p>Have we obtained sufficient appropriate audit evidence for every relevant financial statement assertion within this process?</p>
          <div className="flex items-center gap-2">
            <Button variant={litigationResultsSufficientEvidence === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationResultsSufficientEvidence('YES')}>Yes</Button>
            <Button variant={litigationResultsSufficientEvidence === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationResultsSufficientEvidence('NO')}>No</Button>
            <Button variant={litigationResultsSufficientEvidence === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationResultsSufficientEvidence('NONE')}>Not selected</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLitigationSubstantive = () => (
    <div className="space-y-8">
      
      <div className="flex flex-wrap gap-4">
        <div className="w-[220px]">
          <Card
            className="cursor-pointer rounded-none border border-gray-200 shadow-sm transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none"
            tabIndex={0}
            onClick={() => onSectionChange('litigation-claims-substantive-tod-01')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSectionChange('litigation-claims-substantive-tod-01');
            }}
            role="button"
            aria-label="TOD_01. Revue des PRC"
          >
            <CardContent className="p-4 space-y-2">
              <div className="text-3xl leading-none text-gray-900">TOD_01</div>
              <div className="text-[30px] h-px bg-gray-200" />
              <div className="text-lg text-gray-900">Revue des PRC</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderLitigationSubstantiveTod01 = () => (
    <div className="space-y-8">
      
      <div className="flex flex-wrap gap-4">
        <div className="w-[220px]">
          <Card
            className="cursor-pointer rounded-none border border-gray-200 shadow-sm transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none"
            tabIndex={0}
            onClick={() => onSectionChange('litigation-claims-substantive-tod-01-design')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSectionChange('litigation-claims-substantive-tod-01-design');
            }}
            role="button"
            aria-label="1. Design TOD"
          >
            <CardContent className="p-4 space-y-2">
              <div className="text-3xl leading-none text-gray-900">1</div>
              <div className="text-[30px] h-px bg-gray-200" />
              <div className="text-lg text-gray-900">Design TOD</div>
            </CardContent>
          </Card>
        </div>
        <div className="w-[220px]">
          <Card
            className="cursor-pointer rounded-none border border-gray-200 shadow-sm transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none"
            tabIndex={0}
            onClick={() => onSectionChange('litigation-claims-substantive-tod-01-perform')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSectionChange('litigation-claims-substantive-tod-01-perform');
            }}
            role="button"
            aria-label="2. Perform TOD"
          >
            <CardContent className="p-4 space-y-2">
              <div className="text-3xl leading-none text-gray-900">2</div>
              <div className="text-[30px] h-px bg-gray-200" />
              <div className="text-lg text-gray-900">Perform TOD</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderLitigationSubstantiveTod01Design = () => (
    <div className="space-y-8">
      
      <Card>
        <CardContent className="p-6 space-y-4 text-sm text-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900">Design and perform substantive procedures to respond to the level of CAR</h3>
          <Input value="Revue des PRC" readOnly />
          <Input value="TOD" readOnly />
          <label className="flex items-center gap-2">
            <Checkbox checked={litigationTodClarifyDescription} onCheckedChange={(checked) => setLitigationTodClarifyDescription(Boolean(checked))} />
            Clarify procedure description
          </label>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[120px_1fr_120px_200px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>ID</div>
              <div>Description</div>
              <div>CAR</div>
              <div>Assertions</div>
            </div>
            {litigationRiskRows.slice(0, 2).map((row) => (
              <div key={`tod-rmm-${row.id}`} className="grid grid-cols-[120px_1fr_120px_200px] gap-3 px-4 py-3 border-t border-gray-200">
                <div>{row.riskId || ''}</div>
                <div>{row.description || ''}</div>
                <div>{row.inherentRisk || ''}</div>
                <div>{row.assertions || ''}</div>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2">
            <Checkbox checked={litigationTodUnpredictability} onCheckedChange={(checked) => setLitigationTodUnpredictability(Boolean(checked))} />
            Procedure incorporates an element of unpredictability
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={litigationTodSpecialists} onCheckedChange={(checked) => setLitigationTodSpecialists(Boolean(checked))} />
            We plan to involve specialist(s) in the performance of this procedure
          </label>

          <div className="space-y-2">
            <p className="font-semibold">Nature</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="flex items-center gap-2"><Checkbox checked={litigationTodNature.inspection} onCheckedChange={(checked) => setLitigationTodNature({ ...litigationTodNature, inspection: Boolean(checked) })} />Inspection</label>
              <label className="flex items-center gap-2"><Checkbox checked={litigationTodNature.observation} onCheckedChange={(checked) => setLitigationTodNature({ ...litigationTodNature, observation: Boolean(checked) })} />Observation</label>
              <label className="flex items-center gap-2"><Checkbox checked={litigationTodNature.inquiry} onCheckedChange={(checked) => setLitigationTodNature({ ...litigationTodNature, inquiry: Boolean(checked) })} />Inquiry</label>
              <label className="flex items-center gap-2"><Checkbox checked={litigationTodNature.confirmation} onCheckedChange={(checked) => setLitigationTodNature({ ...litigationTodNature, confirmation: Boolean(checked) })} />Confirmation</label>
              <label className="flex items-center gap-2"><Checkbox checked={litigationTodNature.recalculation} onCheckedChange={(checked) => setLitigationTodNature({ ...litigationTodNature, recalculation: Boolean(checked) })} />Recalculation</label>
              <label className="flex items-center gap-2"><Checkbox checked={litigationTodNature.reperformance} onCheckedChange={(checked) => setLitigationTodNature({ ...litigationTodNature, reperformance: Boolean(checked) })} />Reperformance</label>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[160px_1fr_160px_160px_120px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>Reference</div>
              <div>Description</div>
              <div>Step is applied</div>
              <div>Clarify step</div>
              <div>RMM(s)</div>
            </div>
            <div className="grid grid-cols-[160px_1fr_160px_160px_120px] gap-3 px-4 py-3 border-t border-gray-200 items-center">
              <Input value="1" readOnly />
              <Textarea value="" placeholder="" className="min-h-[88px]" />
              <div className="flex justify-center"><Checkbox checked /></div>
              <div className="flex justify-center"><Checkbox checked={false} /></div>
              <Input value="PROV02" readOnly />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <Checkbox checked={litigationTodAlternativeProcedures} onCheckedChange={(checked) => setLitigationTodAlternativeProcedures(Boolean(checked))} />
            Design alternative procedures because the planned steps cannot be completed for all items to be tested
          </label>

          <div className="space-y-2">
            <p className="font-semibold">Information used in the procedure</p>
            <label className="flex items-center gap-2">
              <Checkbox checked={litigationTodInfoUsed.usesInformation} onCheckedChange={(checked) => setLitigationTodInfoUsed({ ...litigationTodInfoUsed, usesInformation: Boolean(checked) })} />
              The substantive procedure uses information to support the account being tested.
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={litigationTodInfoUsed.externalReliable} onCheckedChange={(checked) => setLitigationTodInfoUsed({ ...litigationTodInfoUsed, externalReliable: Boolean(checked) })} />
              Information is an external source document and no doubts exist over its reliability.
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={litigationTodInfoUsed.internalOrUncertain} onCheckedChange={(checked) => setLitigationTodInfoUsed({ ...litigationTodInfoUsed, internalOrUncertain: Boolean(checked) })} />
              Information is internal and/or doubts exist over reliability.
            </label>
            <Textarea value={litigationTodInfoRelevanceNote} onChange={(event) => setLitigationTodInfoRelevanceNote(event.target.value)} placeholder="" className="min-h-[120px]" />
          </div>

          <div className="space-y-2">
            <p>Will we use ready-to-use or end-user routine(s) to facilitate obtaining audit evidence for this procedure?</p>
            <div className="flex items-center gap-2">
              <Button variant={litigationTodUseRoutines === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationTodUseRoutines('YES')}>Yes</Button>
              <Button variant={litigationTodUseRoutines === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationTodUseRoutines('NO')}>No</Button>
              <Button variant={litigationTodUseRoutines === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationTodUseRoutines('NONE')}>Not selected</Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Timing</p>
            <div className="flex flex-wrap gap-2">
              <Button variant={litigationTodTiming === 'INTERIM' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationTodTiming('INTERIM')}>Interim</Button>
              <Button variant={litigationTodTiming === 'THROUGHOUT' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationTodTiming('THROUGHOUT')}>Throughout the period</Button>
              <Button variant={litigationTodTiming === 'PERIOD_END' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationTodTiming('PERIOD_END')}>Period-end</Button>
              <Button variant={litigationTodTiming === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationTodTiming('NONE')}>Not selected</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Period start date</Label>
                <Input type="date" value={litigationTodPeriodStartDate} onChange={(event) => setLitigationTodPeriodStartDate(event.target.value)} />
              </div>
              <div>
                <Label>Period end date</Label>
                <Input type="date" value={litigationTodPeriodEndDate} onChange={(event) => setLitigationTodPeriodEndDate(event.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Extent</p>
            <div className="flex flex-wrap gap-2">
              <Button variant={litigationTodExtent === 'ALL_ITEMS' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationTodExtent('ALL_ITEMS')}>All items</Button>
              <Button variant={litigationTodExtent === 'SPECIFIC_ITEMS' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationTodExtent('SPECIFIC_ITEMS')}>Specific items</Button>
              <Button variant={litigationTodExtent === 'SUBSTANTIVE_SAMPLING' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationTodExtent('SUBSTANTIVE_SAMPLING')}>Substantive sampling</Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-gray-900">Define the population, including relevant characteristics</h3>
            <Textarea value={litigationTodPopulationDefinition} onChange={(event) => setLitigationTodPopulationDefinition(event.target.value)} placeholder="" className="min-h-[120px]" />
            <label className="flex items-center gap-2">
              <Checkbox checked={litigationTodPopulationCharacteristics.reciprocalPopulation} onCheckedChange={(checked) => setLitigationTodPopulationCharacteristics({ ...litigationTodPopulationCharacteristics, reciprocalPopulation: Boolean(checked) })} />
              The population we are testing is a reciprocal population
            </label>
            <p className="font-semibold">Determine whether the following characteristics apply to the population:</p>
            <label className="flex items-center gap-2">
              <Checkbox checked={litigationTodPopulationCharacteristics.negativeAndPositiveItems} onCheckedChange={(checked) => setLitigationTodPopulationCharacteristics({ ...litigationTodPopulationCharacteristics, negativeAndPositiveItems: Boolean(checked) })} />
              The population includes both negative and positive items
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={litigationTodPopulationCharacteristics.zeroValueItems} onCheckedChange={(checked) => setLitigationTodPopulationCharacteristics({ ...litigationTodPopulationCharacteristics, zeroValueItems: Boolean(checked) })} />
              The population contains zero value items
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={litigationTodPopulationCharacteristics.multipleLocations} onCheckedChange={(checked) => setLitigationTodPopulationCharacteristics({ ...litigationTodPopulationCharacteristics, multipleLocations: Boolean(checked) })} />
              The population is spread across multiple locations
            </label>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 bg-blue-900 text-white text-sm font-semibold px-4 py-2">
              <div>Procedure</div>
              <div>Results of procedure</div>
            </div>
            <div className="space-y-3 p-4 border-t border-gray-200">
              <Label>Define the items to be tested.</Label>
              <Textarea value={litigationTodProcedureResultDefinition} onChange={(event) => setLitigationTodProcedureResultDefinition(event.target.value)} placeholder="" className="min-h-[100px]" />
              <Label>Define a misstatement or error.</Label>
              <Textarea value={litigationTodMisstatementDefinition} onChange={(event) => setLitigationTodMisstatementDefinition(event.target.value)} placeholder="" className="min-h-[100px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLitigationSubstantiveTod01Perform = () => (
    <div className="space-y-8">
      
      <Card>
        <CardContent className="p-6 space-y-6 text-sm text-gray-700">
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-gray-900">Select procedure template</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setLitigationTodPerformTemplateRows([
                  ...litigationTodPerformTemplateRows,
                  {
                    id: Math.max(...litigationTodPerformTemplateRows.map((r) => r.id)) + 1,
                    templateId: '',
                    dataset: '',
                    procedureTemplate: '',
                    fileName: '',
                    attachment: '',
                  },
                ])
              }
            >
              Add
            </Button>
            <p className="text-base">Data enabled procedure template</p>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-[120px_1fr_1fr_1fr_180px] bg-blue-900 text-white text-sm font-semibold px-4 py-2">
                <div>ID</div>
                <div>Dataset</div>
                <div>Procedure template</div>
                <div>File name</div>
                <div>Attachment</div>
              </div>
              <div className="divide-y divide-gray-200">
                {litigationTodPerformTemplateRows.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[120px_1fr_1fr_1fr_180px] gap-3 px-4 py-3">
                    <Input
                      value={row.templateId}
                      onChange={(event) => {
                        const next = [...litigationTodPerformTemplateRows];
                        next[index] = { ...row, templateId: event.target.value };
                        setLitigationTodPerformTemplateRows(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.dataset}
                      onChange={(event) => {
                        const next = [...litigationTodPerformTemplateRows];
                        next[index] = { ...row, dataset: event.target.value };
                        setLitigationTodPerformTemplateRows(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.procedureTemplate}
                      onChange={(event) => {
                        const next = [...litigationTodPerformTemplateRows];
                        next[index] = { ...row, procedureTemplate: event.target.value };
                        setLitigationTodPerformTemplateRows(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.fileName}
                      onChange={(event) => {
                        const next = [...litigationTodPerformTemplateRows];
                        next[index] = { ...row, fileName: event.target.value };
                        setLitigationTodPerformTemplateRows(next);
                      }}
                      placeholder=""
                    />
                    <Input
                      value={row.attachment}
                      onChange={(event) => {
                        const next = [...litigationTodPerformTemplateRows];
                        next[index] = { ...row, attachment: event.target.value };
                        setLitigationTodPerformTemplateRows(next);
                      }}
                      placeholder=""
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-gray-900">Perform procedures over selected items</h3>
            <p>Document the results of our procedures.</p>
            <Textarea
              value={litigationTodPerformResults}
              onChange={(event) => setLitigationTodPerformResults(event.target.value)}
              placeholder=""
              className="min-h-[180px]"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-gray-900">Document conclusions reached</h3>
            <p>Did we obtain evidence that contradicts the evidence on which the original risk assessment was based?</p>
            <div className="flex items-center gap-2">
              <Button variant={litigationContradictEvidence === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationContradictEvidence('YES')}>Yes</Button>
              <Button variant={litigationContradictEvidence === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationContradictEvidence('NO')}>No</Button>
              <Button variant={litigationContradictEvidence === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationContradictEvidence('NONE')}>Not selected</Button>
            </div>
            <p>Did we obtain the evidence we expected from this procedure?</p>
            <div className="flex items-center gap-2">
              <Button variant={litigationEvidenceExpected === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationEvidenceExpected('YES')}>Yes</Button>
              <Button variant={litigationEvidenceExpected === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationEvidenceExpected('NO')}>No</Button>
              <Button variant={litigationEvidenceExpected === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setLitigationEvidenceExpected('NONE')}>Not selected</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConclusionsFinalAnalytics = () => {
    type FinalAnalyticsRow = {
      id: string;
      caption: string;
      parentId: string | null;
      level: number;
      cy: number;
      py: number;
      delta: number;
      deltaPct: number | null;
      hasChildren: boolean;
    };

    const normalizeAccount = (value?: string) => {
      const digits = String(value ?? '').replace(/\D/g, '');
      if (!digits) return '';
      return digits.padEnd(6, '0').slice(0, 6);
    };

    const rows: FinalAnalyticsRow[] = [];
    const walk = (
      node: FsNode,
      level: number,
      parentId: string | null
    ): { cy: number; py: number } => {
      const directAccounts = new Set<string>();
      (node.accounts ?? []).forEach((account) => {
        const normalized = normalizeAccount(account);
        if (normalized) directAccounts.add(normalized);
      });
      if (node.kind === 'account' && node.code) {
        const normalized = normalizeAccount(node.code);
        if (normalized) directAccounts.add(normalized);
      }

      let cy = 0;
      let py = 0;
      directAccounts.forEach((account) => {
        cy += finalAnalyticsBalanceNByAccount.get(account) ?? 0;
        py += finalAnalyticsBalanceN1ByAccount.get(account) ?? 0;
      });

      (node.children ?? []).forEach((child) => {
        const childTotals = walk(child, level + 1, node.id);
        cy += childTotals.cy;
        py += childTotals.py;
      });

      const delta = cy - py;
      const deltaPct = py === 0 ? null : (delta / Math.abs(py)) * 100;

      rows.push({
        id: node.id,
        caption: node.label || 'Untitled',
        parentId,
        level,
        cy,
        py,
        delta,
        deltaPct,
        hasChildren: (node.children ?? []).length > 0,
      });

      return { cy, py };
    };

    (conclusionFsStructure?.tree ?? []).forEach((rootNode) => walk(rootNode, 0, null));
    rows.reverse();

    const rowById = new Map(rows.map((row) => [row.id, row]));
    const isRowVisible = (row: FinalAnalyticsRow) => {
      let currentParentId = row.parentId;
      while (currentParentId) {
        if (conclusionFinalAnalyticsCollapsed.has(currentParentId)) return false;
        currentParentId = rowById.get(currentParentId)?.parentId ?? null;
      }
      return true;
    };
    const visibleRows = rows.filter(isRowVisible);
    const allCollapsibleRowIds = rows.filter((row) => row.hasChildren).map((row) => row.id);

    const formatNumber = (value: number) =>
      new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Perform final analytical procedures and evaluate the results</h3>
            <p>Select financial period used for final analytics</p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="w-full max-w-sm rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
                value={conclusionFinalAnalyticsPeriod}
                onChange={(event) =>
                  setConclusionFinalAnalyticsPeriod(event.target.value as 'CY' | 'PY' | 'CY_PY')
                }
              >
                <option value="CY_PY">Current Year (N) vs Past Year (N-1)</option>
                <option value="CY">Current Year (N)</option>
                <option value="PY">Past Year (N-1)</option>
              </select>
              <Button type="button" variant="outline">Set selected period</Button>
            </div>
            <div className="space-y-2">
              <p>Period navigator</p>
              <Input value="Current Year (N) / Past Year (N-1)" readOnly className="max-w-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setConclusionFinalAnalyticsCollapsed(new Set())}
              >
                Expand All
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setConclusionFinalAnalyticsCollapsed(new Set(allCollapsibleRowIds))}
              >
                Collapse All
              </Button>
            </div>
            {conclusionFsLoading && <p className="text-muted-foreground">Loading structure...</p>}
            {conclusionFsError && <p className="text-red-600">{conclusionFsError}</p>}
            {!conclusionFsLoading && !conclusionFsError && !conclusionFsStructure && (
              <p className="text-amber-700">No Financial Statements structure found for this project.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-blue-900 text-left text-white">
                  <tr>
                    <th className="px-3 py-2 text-sm font-semibold">Financial statement caption</th>
                    <th className="px-3 py-2 text-sm font-semibold">CY</th>
                    <th className="px-3 py-2 text-sm font-semibold">PY</th>
                    <th className="px-3 py-2 text-sm font-semibold">Delta</th>
                    <th className="px-3 py-2 text-sm font-semibold">Delta %</th>
                    <th className="px-3 py-2 text-sm font-semibold">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-sm text-gray-500">
                        No structure lines to display.
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((row, index) => (
                      <tr key={`final-analytics-row-${row.id}-${index}`} className="border-t border-gray-200">
                        <td className="px-3 py-2 text-sm text-gray-900">
                          <span style={{ paddingLeft: `${row.level * 20}px` }} className={`inline-flex items-center gap-2 ${row.level === 0 ? 'font-semibold' : ''}`}>
                            {row.hasChildren ? (
                              <button
                                type="button"
                                className="h-5 w-5 rounded border border-slate-300 text-xs leading-none"
                                onClick={() => {
                                  setConclusionFinalAnalyticsCollapsed((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(row.id)) next.delete(row.id);
                                    else next.add(row.id);
                                    return next;
                                  });
                                }}
                              >
                                {conclusionFinalAnalyticsCollapsed.has(row.id) ? '+' : '-'}
                              </button>
                            ) : (
                              <span className="inline-block h-5 w-5" />
                            )}
                            {row.caption}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700">{formatNumber(row.cy)}</td>
                        <td className="px-3 py-2 text-sm text-gray-700">{formatNumber(row.py)}</td>
                        <td className="px-3 py-2 text-sm text-gray-700">{formatNumber(row.delta)}</td>
                        <td className="px-3 py-2 text-sm text-gray-700">
                          {row.deltaPct === null ? '' : `${row.deltaPct.toFixed(2)}%`}
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            value={conclusionFinalAnalyticsComments[row.id] ?? ''}
                            onChange={(event) =>
                              setConclusionFinalAnalyticsComments((prev) => ({
                                ...prev,
                                [row.id]: event.target.value,
                              }))
                            }
                            className="h-8"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <p>Did we identify any unusual or unexpected items while performing the final analytical procedures?</p>
            <div className="flex items-center gap-2">
              <Button variant={conclusionFinalAnalyticsUnexpectedItems === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionFinalAnalyticsUnexpectedItems('YES')}>Yes</Button>
              <Button variant={conclusionFinalAnalyticsUnexpectedItems === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionFinalAnalyticsUnexpectedItems('NO')}>No</Button>
              <Button variant={conclusionFinalAnalyticsUnexpectedItems === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionFinalAnalyticsUnexpectedItems('NONE')}>Not selected</Button>
            </div>

            <p>After performing the above final analytical procedures, are there any additional procedures that need to be performed to assist in forming an overall conclusion about whether the financial statements are consistent with your understanding of the entity?</p>
            <div className="flex items-center gap-2">
              <Button variant={conclusionFinalAnalyticsAdditionalProcedures === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionFinalAnalyticsAdditionalProcedures('YES')}>Yes</Button>
              <Button variant={conclusionFinalAnalyticsAdditionalProcedures === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionFinalAnalyticsAdditionalProcedures('NO')}>No</Button>
              <Button variant={conclusionFinalAnalyticsAdditionalProcedures === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionFinalAnalyticsAdditionalProcedures('NONE')}>Not selected</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderConclusionsLanding = () => (
    <div className="space-y-8">
      
      <div className="flex flex-wrap gap-4">
        <div className="w-[220px]">
          <Card
            className="cursor-pointer rounded-none border border-gray-200 shadow-sm transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none"
            tabIndex={0}
            onClick={() => onSectionChange('conclusions-reporting-evaluate-result')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSectionChange('conclusions-reporting-evaluate-result');
            }}
            role="button"
          >
            <CardContent className="p-4 space-y-2">
              <div className="text-3xl leading-none text-gray-900">1</div>
              <div className="text-[30px] h-px bg-gray-200" />
              <div className="text-lg text-gray-900">Evaluate audit result</div>
            </CardContent>
          </Card>
        </div>
        <div className="w-[220px]">
          <Card
            className="cursor-pointer rounded-none border border-gray-200 shadow-sm transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none"
            tabIndex={0}
            onClick={() => onSectionChange('conclusions-reporting-reporting')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSectionChange('conclusions-reporting-reporting');
            }}
            role="button"
          >
            <CardContent className="p-4 space-y-2">
              <div className="text-3xl leading-none text-gray-900">2</div>
              <div className="text-[30px] h-px bg-gray-200" />
              <div className="text-lg text-gray-900">Reporting</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderConclusionsEvaluateAuditResult = () => (
    <div className="space-y-8">
      
      <div className="flex flex-wrap gap-4">
        {[
          ['conclusions-reporting-final-analytics', '0', 'Final analytics'],
          ['conclusions-reporting-risk-update', '1', 'Risk assessment update'],
          ['conclusions-reporting-management-bias', '2', 'Management bias'],
          ['conclusions-reporting-evaluate-financial-statements', '3', 'Evaluate financial statements'],
          ['conclusions-reporting-summary-misstatements', '4', 'Summary of audit misstatements'],
          ['conclusions-reporting-subsequent-events', '5', 'Subsequent events'],
          ['conclusions-reporting-completion', '6', 'Completion'],
        ].map(([id, number, title]) => (
          <div key={id} className="w-[190px]">
            <Card
              className="cursor-pointer rounded-none border border-gray-200 shadow-sm transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none"
              tabIndex={0}
              onClick={() => onSectionChange(id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSectionChange(id);
              }}
              role="button"
            >
              <CardContent className="p-4 space-y-2">
                <div className="text-3xl leading-none text-gray-900">{number}</div>
                <div className="text-[30px] h-px bg-gray-200" />
                <div className="text-lg text-gray-900">{title}</div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConclusionsRiskUpdate = () => (
    <div className="space-y-8">
      
      <Card>
        <CardContent className="p-6 space-y-4 text-sm text-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900">Evaluate whether risk assessments remain appropriate</h3>
          <p>
            Based on the audit procedures performed and the audit evidence obtained during our audit, do our current assessment of the risks of material misstatements (RMMs), fraud risks, and CARs remain appropriate?
          </p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionRiskRemainAppropriate === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionRiskRemainAppropriate('YES')}>Yes</Button>
            <Button variant={conclusionRiskRemainAppropriate === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionRiskRemainAppropriate('NO')}>No</Button>
            <Button variant={conclusionRiskRemainAppropriate === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionRiskRemainAppropriate('NONE')}>Not selected</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3 text-sm text-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900">Hold a RAQA meeting and document the details, and evaluate our assessment of the fraud risks.</h3>
          <label className="flex items-center gap-2">
            <Checkbox checked={conclusionRaqaChecks.planningRaqaMeeting} onCheckedChange={(checked) => setConclusionRaqaChecks({ ...conclusionRaqaChecks, planningRaqaMeeting: Boolean(checked) })} />
            Team is planning to hold a Risk and Audit Quality Assessment (RAQA) meeting
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={conclusionRaqaChecks.communicationFraudRisks} onCheckedChange={(checked) => setConclusionRaqaChecks({ ...conclusionRaqaChecks, communicationFraudRisks: Boolean(checked) })} />
            Confirm appropriate communication with engagement team members regarding information or conditions indicative of fraud risks.
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={conclusionRaqaChecks.communicationSignificantMatters} onCheckedChange={(checked) => setConclusionRaqaChecks({ ...conclusionRaqaChecks, communicationSignificantMatters: Boolean(checked) })} />
            Confirm communication about significant matters affecting risks of material misstatement.
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={conclusionRaqaChecks.communicationRelatedParties} onCheckedChange={(checked) => setConclusionRaqaChecks({ ...conclusionRaqaChecks, communicationRelatedParties: Boolean(checked) })} />
            Confirm communication regarding related parties and related transactions.
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-2 text-sm text-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900">Disagreements or differences of opinion</h3>
          <p>Were there any disagreements or differences of opinion within the engagement team or with quality reviewers?</p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionDisagreements === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionDisagreements('YES')}>Yes</Button>
            <Button variant={conclusionDisagreements === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionDisagreements('NO')}>No</Button>
            <Button variant={conclusionDisagreements === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionDisagreements('NONE')}>Not selected</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-2 text-sm text-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900">Going concern</h3>
          <p>Have additional facts or information become available since the date on which management made its evaluation?</p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionGoingConcern.additionalFacts === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, additionalFacts: 'YES' })}>Yes</Button>
            <Button variant={conclusionGoingConcern.additionalFacts === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, additionalFacts: 'NO' })}>No</Button>
            <Button variant={conclusionGoingConcern.additionalFacts === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, additionalFacts: 'NONE' })}>Not selected</Button>
          </div>
          <p>Are there any circumstances or events that indicate the entity should not use the going concern basis of accounting?</p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionGoingConcern.circumstancesNotGoingConcern === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, circumstancesNotGoingConcern: 'YES' })}>Yes</Button>
            <Button variant={conclusionGoingConcern.circumstancesNotGoingConcern === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, circumstancesNotGoingConcern: 'NO' })}>No</Button>
            <Button variant={conclusionGoingConcern.circumstancesNotGoingConcern === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, circumstancesNotGoingConcern: 'NONE' })}>Not selected</Button>
          </div>
          <p>Does management's use of the going concern basis of accounting remain appropriate?</p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionGoingConcern.useRemainsAppropriate === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, useRemainsAppropriate: 'YES' })}>Yes</Button>
            <Button variant={conclusionGoingConcern.useRemainsAppropriate === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, useRemainsAppropriate: 'NO' })}>No</Button>
            <Button variant={conclusionGoingConcern.useRemainsAppropriate === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, useRemainsAppropriate: 'NONE' })}>Not selected</Button>
          </div>
          <p>Is there a significant delay in the approval of the financial statements?</p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionGoingConcern.delayApprovalStatements === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, delayApprovalStatements: 'YES' })}>Yes</Button>
            <Button variant={conclusionGoingConcern.delayApprovalStatements === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, delayApprovalStatements: 'NO' })}>No</Button>
            <Button variant={conclusionGoingConcern.delayApprovalStatements === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, delayApprovalStatements: 'NONE' })}>Not selected</Button>
          </div>
          <p>Have we obtained sufficient appropriate audit evidence over going concern matters?</p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionGoingConcern.sufficientEvidence === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, sufficientEvidence: 'YES' })}>Yes</Button>
            <Button variant={conclusionGoingConcern.sufficientEvidence === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, sufficientEvidence: 'NO' })}>No</Button>
            <Button variant={conclusionGoingConcern.sufficientEvidence === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionGoingConcern({ ...conclusionGoingConcern, sufficientEvidence: 'NONE' })}>Not selected</Button>
          </div>
          <Textarea value={conclusionGoingConcernNotes} onChange={(event) => setConclusionGoingConcernNotes(event.target.value)} placeholder="" className="min-h-[120px]" />
        </CardContent>
      </Card>
    </div>
  );

  const renderConclusionsManagementBias = () => (
    <div className="space-y-8">
      
      <Card>
        <CardContent className="p-6 space-y-3 text-sm text-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900">Evaluate management bias in significant accounting policies in aggregate</h3>
          <p className="font-semibold">Indicators of management bias, if any</p>
          <p>Do patterns in the selection and application of significant accounting principles/policies exist?</p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionManagementBias.accountingPoliciesAlternatives === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, accountingPoliciesAlternatives: 'YES' })}>Yes</Button>
            <Button variant={conclusionManagementBias.accountingPoliciesAlternatives === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, accountingPoliciesAlternatives: 'NO' })}>No</Button>
            <Button variant={conclusionManagementBias.accountingPoliciesAlternatives === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, accountingPoliciesAlternatives: 'NONE' })}>Not selected</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3 text-sm text-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900">Evaluate management bias in the preparation of disclosures individually and in aggregate</h3>
          <p className="font-semibold">Indicators of management bias, if any</p>
          <p>Did management choose alternatives in the preparation of disclosures that do not appear to be the most appropriate?</p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionManagementBias.disclosureAlternatives === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, disclosureAlternatives: 'YES' })}>Yes</Button>
            <Button variant={conclusionManagementBias.disclosureAlternatives === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, disclosureAlternatives: 'NO' })}>No</Button>
            <Button variant={conclusionManagementBias.disclosureAlternatives === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, disclosureAlternatives: 'NONE' })}>Not selected</Button>
          </div>
          <p>Do the disclosures appear to be prepared in a way that results in a specific benefit to management or the entity?</p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionManagementBias.disclosureSpecificBenefit === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, disclosureSpecificBenefit: 'YES' })}>Yes</Button>
            <Button variant={conclusionManagementBias.disclosureSpecificBenefit === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, disclosureSpecificBenefit: 'NO' })}>No</Button>
            <Button variant={conclusionManagementBias.disclosureSpecificBenefit === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, disclosureSpecificBenefit: 'NONE' })}>Not selected</Button>
          </div>
          <p className="font-semibold">Conclusion</p>
          <p>Based on the information above, have we identified management bias in the preparation of disclosures?</p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionManagementBias.disclosureConclusion === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, disclosureConclusion: 'YES' })}>Yes</Button>
            <Button variant={conclusionManagementBias.disclosureConclusion === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, disclosureConclusion: 'NO' })}>No</Button>
            <Button variant={conclusionManagementBias.disclosureConclusion === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, disclosureConclusion: 'NONE' })}>Not selected</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3 text-sm text-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900">Evaluate management bias in the cumulative effect of changes in estimates from the prior period to the current period</h3>
          <p className="font-semibold">Indicators of management bias, if any</p>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="h-12 bg-blue-900" />
            <div className="p-4 border-t border-gray-200">Estimate item</div>
          </div>
          <p>Document how each estimate is prepared by management.</p>
          <Textarea value={conclusionManagementBiasEstimateNote} onChange={(event) => setConclusionManagementBiasEstimateNote(event.target.value)} placeholder="" className="min-h-[120px]" />
          <p>Are many (or all) of the entity's estimates grouped at one end of the range of reasonable estimates?</p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionManagementBias.estimatesGroupedEnds === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, estimatesGroupedEnds: 'YES' })}>Yes</Button>
            <Button variant={conclusionManagementBias.estimatesGroupedEnds === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, estimatesGroupedEnds: 'NO' })}>No</Button>
            <Button variant={conclusionManagementBias.estimatesGroupedEnds === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, estimatesGroupedEnds: 'NONE' })}>Not selected</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-2 text-sm text-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900">Evaluate qualitative aspects of accounting practices and respond to that evaluation</h3>
          <p>In addition to management bias, are there any other concerns regarding the qualitative aspects of accounting practices?</p>
          <div className="flex items-center gap-2">
            <Button variant={conclusionManagementBias.qualitativeConcerns === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, qualitativeConcerns: 'YES' })}>Yes</Button>
            <Button variant={conclusionManagementBias.qualitativeConcerns === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, qualitativeConcerns: 'NO' })}>No</Button>
            <Button variant={conclusionManagementBias.qualitativeConcerns === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => setConclusionManagementBias({ ...conclusionManagementBias, qualitativeConcerns: 'NONE' })}>Not selected</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEvaluateFsAnswerButtons = (
    value: string,
    onChange: (nextValue: string) => void,
    options?: { includeNotApplicable?: boolean }
  ) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant={value === 'YES' ? 'default' : 'outline'} size="sm" onClick={() => onChange('YES')}>
        Yes
      </Button>
      <Button variant={value === 'NO' ? 'default' : 'outline'} size="sm" onClick={() => onChange('NO')}>
        No
      </Button>
      {options?.includeNotApplicable && (
        <Button
          variant={value === 'NOT_APPLICABLE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange('NOT_APPLICABLE')}
        >
          Not applicable
        </Button>
      )}
      <Button variant={value === 'NONE' ? 'default' : 'outline'} size="sm" onClick={() => onChange('NONE')}>
        Not selected
      </Button>
    </div>
  );

  const renderConclusionsEvaluateFinancialStatements = () => {
    const setConclusionFsAnswer = (
      field: keyof typeof conclusionEvaluateFinancialStatements,
      value: string
    ) => {
      setConclusionEvaluateFinancialStatements({
        ...conclusionEvaluateFinancialStatements,
        [field]: value,
      });
    };

    const addChecklistAttachment = () => {
      const value = conclusionFsChecklistAttachmentDraft.trim();
      if (!value) return;
      setConclusionFsChecklistAttachments([...conclusionFsChecklistAttachments, value]);
      setConclusionFsChecklistAttachmentDraft('');
    };

    const addFsEvidenceRow = () => {
      setConclusionFsEvidenceRows([...conclusionFsEvidenceRows, { topic: '', result: '' }]);
    };

    return (
      <div className="space-y-8">
        

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Evaluate the presentation of the financial statements</h3>
            <p className="font-semibold">Evaluate whether the financial statements are presented fairly</p>
            <p>Evaluate the following, taking into account:</p>
            <p>a) the financial reporting framework; and</p>
            <p>
              b) the facts and circumstances of the entity, including changes thereto, based on our understanding of the entity and the audit evidence obtained during the audit.
            </p>
            <p>Consider whether additional disclosures beyond those specifically required by the framework are necessary to achieve fair presentation.</p>
            <p>Consider whether a departure from a requirement of the framework is necessary to achieve fair presentation in extremely rare circumstances.</p>

            <p>Do the financial statements adequately refer to or describe the applicable financial reporting framework?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.frameworkReference,
              (value) => setConclusionFsAnswer('frameworkReference', value)
            )}

            <p>Does the financial reporting framework require (or does the entity voluntarily present) comparative financial statements or corresponding figures?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.comparativeRequired,
              (value) => setConclusionFsAnswer('comparativeRequired', value)
            )}

            <p>Do the comparative financial statements or corresponding figures agree with the prior period information, or when appropriate, have been restated or adjusted?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.comparativeAgree,
              (value) => setConclusionFsAnswer('comparativeAgree', value)
            )}

            <p>Are the accounting policies reflected in the comparative financial statements or corresponding figures consistent with those applied in the current period?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.comparativePoliciesConsistent,
              (value) => setConclusionFsAnswer('comparativePoliciesConsistent', value)
            )}

            <p>Is completion of an accounting disclosure checklist required?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.disclosureChecklistRequired,
              (value) => setConclusionFsAnswer('disclosureChecklistRequired', value)
            )}

            <div className="space-y-3 rounded-md border border-gray-200 p-4">
              <p className="font-medium">Complete and attach the accounting disclosure checklist (or comparable procedure)</p>
              <div className="flex flex-wrap gap-2">
                <Input
                  value={conclusionFsChecklistAttachmentDraft}
                  onChange={(event) => setConclusionFsChecklistAttachmentDraft(event.target.value)}
                  placeholder="Add checklist attachment"
                  className="max-w-md"
                />
                <Button type="button" variant="outline" onClick={addChecklistAttachment}>
                  Add
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-[1fr_auto] bg-blue-900 px-4 py-2 text-sm font-semibold text-white">
                  <div>Attachments</div>
                  <div>Action</div>
                </div>
                {conclusionFsChecklistAttachments.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-muted-foreground">No attachments added.</div>
                ) : (
                  conclusionFsChecklistAttachments.map((attachment, index) => (
                    <div key={`${attachment}-${index}`} className="grid grid-cols-[1fr_auto] items-center border-t border-gray-200 px-4 py-2 text-sm">
                      <div className="truncate">{attachment}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setConclusionFsChecklistAttachments(
                            conclusionFsChecklistAttachments.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <p>Do the financial statements include all required disclosures?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.requiredDisclosuresIncluded,
              (value) => setConclusionFsAnswer('requiredDisclosuresIncluded', value)
            )}

            <p>Have the changes in accounting policies been properly accounted for and adequately presented and disclosed (if any)?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.policyChangesPresented,
              (value) => setConclusionFsAnswer('policyChangesPresented', value),
              { includeNotApplicable: true }
            )}

            <p>Are the accounting policies/principles selected and applied consistent with the financial reporting framework applicable to the entity?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.policiesConsistentWithFramework,
              (value) => setConclusionFsAnswer('policiesConsistentWithFramework', value)
            )}

            <p>Are the accounting policies/principles selected and applied appropriate in the circumstances of the entity?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.policiesAppropriate,
              (value) => setConclusionFsAnswer('policiesAppropriate', value)
            )}

            <p>Do the financial statements appropriately disclose the significant accounting policies selected and applied?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.policiesDisclosed,
              (value) => setConclusionFsAnswer('policiesDisclosed', value)
            )}

            <p>Are the accounting estimates and related disclosures made by management reasonable (if any)?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.estimatesReasonable,
              (value) => setConclusionFsAnswer('estimatesReasonable', value),
              { includeNotApplicable: true }
            )}

            <p>Is the form, arrangement and content of the financial statements appropriate?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.formArrangementAppropriate,
              (value) => setConclusionFsAnswer('formArrangementAppropriate', value)
            )}

            <div className="space-y-2">
              <p className="font-medium">Identify relevant audit misstatement.</p>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-[120px_1fr] bg-blue-900 px-4 py-2 text-sm font-semibold text-white">
                  <div>ID</div>
                  <div>Description</div>
                </div>
                <div className="border-t border-gray-200 px-4 py-3 text-sm text-muted-foreground">
                  Document the impact on the audit as a result of answering No to any of the questions above.
                </div>
              </div>
              <Textarea
                value={conclusionFsPresentationMisstatement}
                onChange={(event) => setConclusionFsPresentationMisstatement(event.target.value)}
                className="min-h-[110px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Evaluate the underlying transactions and events</h3>
            <p>Is the substance of transactions or events represented in the financial statements materially consistent with their form?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.substanceConsistentWithForm,
              (value) => setConclusionFsAnswer('substanceConsistentWithForm', value)
            )}

            <p>Do the financial statements reflect the underlying transactions and events in a manner that presents the balance sheet, income statement and cash flows, without being materially misstated?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.reflectsUnderlyingTransactions,
              (value) => setConclusionFsAnswer('reflectsUnderlyingTransactions', value)
            )}

            <p>Do the financial statements provide adequate disclosures to enable users to understand the effect of material transactions and events on the entity&apos;s balance sheet, income statement and cash flows?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.adequateTransactionDisclosures,
              (value) => setConclusionFsAnswer('adequateTransactionDisclosures', value)
            )}

            <div className="space-y-2">
              <p className="font-medium">Identify relevant audit misstatement</p>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-[120px_1fr] bg-blue-900 px-4 py-2 text-sm font-semibold text-white">
                  <div>ID</div>
                  <div>Description</div>
                </div>
              </div>
              <Textarea
                value={conclusionFsUnderlyingMisstatement}
                onChange={(event) => setConclusionFsUnderlyingMisstatement(event.target.value)}
                className="min-h-[90px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Evaluate related parties</h3>
            <p>Has related party information been properly accounted for and disclosed in the financial statements, including achieving fair presentation?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.relatedPartiesDisclosed,
              (value) => setConclusionFsAnswer('relatedPartiesDisclosed', value)
            )}

            <div className="space-y-2">
              <p className="font-medium">Identify relevant audit misstatement</p>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-[120px_1fr] bg-blue-900 px-4 py-2 text-sm font-semibold text-white">
                  <div>ID</div>
                  <div>Description</div>
                </div>
              </div>
              <Textarea
                value={conclusionFsRelatedPartiesMisstatement}
                onChange={(event) => setConclusionFsRelatedPartiesMisstatement(event.target.value)}
                className="min-h-[90px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Conclusion on sufficiency and appropriateness of audit evidence obtained</h3>
            <p>Evaluate the sufficiency and appropriateness of the audit evidence obtained for each of the following areas that relate to the period-end financial reporting process:</p>
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addFsEvidenceRow}>
                Add row
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 bg-blue-900 px-4 py-2 text-sm font-semibold text-white">
                <div>Financial reporting topic</div>
                <div>Result</div>
              </div>
              {conclusionFsEvidenceRows.map((row, rowIndex) => (
                <div key={`fs-evidence-${rowIndex}`} className="grid grid-cols-2 gap-2 border-t border-gray-200 px-4 py-2">
                  <Input
                    value={row.topic}
                    onChange={(event) => {
                      const next = [...conclusionFsEvidenceRows];
                      next[rowIndex] = { ...row, topic: event.target.value };
                      setConclusionFsEvidenceRows(next);
                    }}
                    placeholder=""
                  />
                  <Input
                    value={row.result}
                    onChange={(event) => {
                      const next = [...conclusionFsEvidenceRows];
                      next[rowIndex] = { ...row, result: event.target.value };
                      setConclusionFsEvidenceRows(next);
                    }}
                    placeholder=""
                  />
                </div>
              ))}
            </div>
            <p>Have we obtained sufficient appropriate audit evidence for every RMM and relevant assertions associated with the period-end financial reporting process?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionEvaluateFinancialStatements.sufficientEvidenceForRmm,
              (value) => setConclusionFsAnswer('sufficientEvidenceForRmm', value)
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderConclusionsSummaryOfAuditMisstatements = () => {
    const setAggregateAnswer = (
      field: keyof typeof conclusionSummaryEvaluateAggregate,
      value: string
    ) => {
      setConclusionSummaryEvaluateAggregate({
        ...conclusionSummaryEvaluateAggregate,
        [field]: value,
      });
    };

    const setManagementBiasAnswer = (
      field: keyof typeof conclusionSummaryManagementBias,
      value: string
    ) => {
      setConclusionSummaryManagementBias({
        ...conclusionSummaryManagementBias,
        [field]: value,
      });
    };

    const addMisstatementRow = () => {
      setConclusionSummaryMisstatementRows([
        ...conclusionSummaryMisstatementRows,
        {
          id: '',
          description: '',
          correctedStatus: '',
          likelyFraud: '',
          misstatementType: '',
          impactProcedures: '',
          accounts: [
            {
              account: '',
              debit: '',
              credit: '',
              incomeStatementEffect: '',
              equityYearEnd: '',
              currentAssets: '',
              nonCurrentAssets: '',
              currentLiabilities: '',
              nonCurrentLiabilities: '',
              comprehensiveIncome: '',
              cashFlowEffect: '',
            },
          ],
        },
      ]);
    };

    const updateMisstatementRow = (
      rowIndex: number,
      updates: Partial<(typeof conclusionSummaryMisstatementRows)[number]>
    ) => {
      const next = [...conclusionSummaryMisstatementRows];
      next[rowIndex] = { ...next[rowIndex], ...updates };
      setConclusionSummaryMisstatementRows(next);
    };

    const addAccountImpactRow = (rowIndex: number) => {
      const next = [...conclusionSummaryMisstatementRows];
      next[rowIndex] = {
        ...next[rowIndex],
        accounts: [
          ...next[rowIndex].accounts,
          {
            account: '',
            debit: '',
            credit: '',
            incomeStatementEffect: '',
            equityYearEnd: '',
            currentAssets: '',
            nonCurrentAssets: '',
            currentLiabilities: '',
            nonCurrentLiabilities: '',
            comprehensiveIncome: '',
            cashFlowEffect: '',
          },
        ],
      };
      setConclusionSummaryMisstatementRows(next);
    };

    const updateAccountImpactRow = (
      rowIndex: number,
      accountRowIndex: number,
      field: string,
      value: string
    ) => {
      const next = [...conclusionSummaryMisstatementRows];
      const accounts = [...next[rowIndex].accounts];
      accounts[accountRowIndex] = { ...accounts[accountRowIndex], [field]: value };
      next[rowIndex] = { ...next[rowIndex], accounts };
      setConclusionSummaryMisstatementRows(next);
    };

    const addLowerMaterialityRow = () => {
      setConclusionSummaryLowerMaterialityRows([
        ...conclusionSummaryLowerMaterialityRows,
        { accountOrDisclosure: '', amount: '' },
      ]);
    };

    return (
      <div className="space-y-8">
        

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Accumulate identified misstatements</h3>
            <div className="flex items-center justify-between">
              <p className="text-lg text-gray-900">Add misstatements</p>
              <Button type="button" size="sm" onClick={addMisstatementRow}>
                +
              </Button>
            </div>
            <div className="overflow-x-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-blue-900 text-left text-white">
                  <tr>
                    <th className="px-3 py-2 text-sm font-semibold break-words">ID</th>
                    <th className="px-3 py-2 text-sm font-semibold break-words">Audit misstatement Description</th>
                    <th className="px-3 py-2 text-sm font-semibold break-words">Corrected/Uncorrected</th>
                    <th className="px-3 py-2 text-sm font-semibold break-words">Is likely to be the result of fraud?</th>
                    <th className="px-3 py-2 text-sm font-semibold break-words">Type of misstatement</th>
                  </tr>
                </thead>
                <tbody>
                  {conclusionSummaryMisstatementRows.map((row, rowIndex) => (
                    <tr key={`input-${rowIndex}`} className="border-t border-gray-200 align-top">
                      <td className="px-2 py-2">
                        <Input
                          value={row.id}
                          onChange={(event) => updateMisstatementRow(rowIndex, { id: event.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Textarea
                          value={row.description}
                          onChange={(event) => updateMisstatementRow(rowIndex, { description: event.target.value })}
                          className="min-h-[72px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
                          value={row.correctedStatus}
                          onChange={(event) => updateMisstatementRow(rowIndex, { correctedStatus: event.target.value })}
                        >
                          <option value="">Select</option>
                          <option value="Corrected">Corrected</option>
                          <option value="Uncorrected">Uncorrected</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
                          value={row.likelyFraud}
                          onChange={(event) => updateMisstatementRow(rowIndex, { likelyFraud: event.target.value })}
                        >
                          <option value="">Select</option>
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={row.misstatementType}
                          onChange={(event) => updateMisstatementRow(rowIndex, { misstatementType: event.target.value })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <p className="text-xl font-semibold text-gray-900">Evaluate corrected and uncorrected misstatements in aggregate</p>
            <p>Do the corrected and uncorrected misstatements in aggregate indicate the existence of one or more control deficiency(ies)?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionSummaryEvaluateAggregate.controlDeficiencies,
              (value) => setAggregateAnswer('controlDeficiencies', value)
            )}
            <p>Do the corrected and uncorrected misstatements in aggregate indicate that fraud has occurred or is likely to have occurred?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionSummaryEvaluateAggregate.fraudOccurred,
              (value) => setAggregateAnswer('fraudOccurred', value)
            )}
            <p className="font-semibold">Communicate accumulated misstatements to management and request their correction</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Evaluate management bias</h3>
            <p>Has management identified additional adjusting entries that offset misstatements accumulated by us?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionSummaryManagementBias.additionalAdjustingEntries,
              (value) => setManagementBiasAnswer('additionalAdjustingEntries', value)
            )}
            <p>Did management refuse to correct some or all of the misstatements communicated by us?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionSummaryManagementBias.refusedCorrections,
              (value) => setManagementBiasAnswer('refusedCorrections', value)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Consider the possibility of undetected misstatements and its implications</h3>
            <div>
              <Label>Total effect of corrected + uncorrected misstatements on the income statement:</Label>
              <Input
                value={conclusionSummaryUndetected.totalEffectIncomeStatement}
                onChange={(event) =>
                  setConclusionSummaryUndetected({
                    ...conclusionSummaryUndetected,
                    totalEffectIncomeStatement: event.target.value,
                  })
                }
                className="mt-2 max-w-md"
              />
            </div>
            <p>Does the nature of and reason for the accumulated misstatements indicate that other misstatements might exist that, in combination with accumulated misstatements (both corrected and uncorrected), could be material?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionSummaryUndetected.couldBeMaterialInCombination,
              (value) =>
                setConclusionSummaryUndetected({
                  ...conclusionSummaryUndetected,
                  couldBeMaterialInCombination: value,
                })
            )}
            <Label>Document our considerations.</Label>
            <Textarea
              value={conclusionSummaryUndetectedConsiderations}
              onChange={(event) => setConclusionSummaryUndetectedConsiderations(event.target.value)}
              className="min-h-[120px]"
            />
            <p>Does the aggregate of all corrected and uncorrected misstatements approach materiality (or lower materiality for particular accounts and disclosures)?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionSummaryUndetected.aggregateApproachMateriality,
              (value) =>
                setConclusionSummaryUndetected({
                  ...conclusionSummaryUndetected,
                  aggregateApproachMateriality: value,
                })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Evaluate whether uncorrected misstatements are material and the implications</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Method used to evaluate identified misstatements:</Label>
                <Input
                  value={conclusionSummaryMaterialityMethod}
                  onChange={(event) => setConclusionSummaryMaterialityMethod(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Final materiality:</Label>
                <Input
                  value={conclusionSummaryFinalMateriality}
                  onChange={(event) => setConclusionSummaryFinalMateriality(event.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addLowerMaterialityRow}>
                Add row
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 bg-blue-900 px-4 py-2 text-sm font-semibold text-white">
                <div>Account or disclosure</div>
                <div>Amount of lower materiality</div>
              </div>
              {conclusionSummaryLowerMaterialityRows.map((row, rowIndex) => (
                <div key={`lower-materiality-${rowIndex}`} className="grid grid-cols-2 gap-2 border-t border-gray-200 px-4 py-2">
                  <Input
                    value={row.accountOrDisclosure}
                    onChange={(event) => {
                      const next = [...conclusionSummaryLowerMaterialityRows];
                      next[rowIndex] = { ...row, accountOrDisclosure: event.target.value };
                      setConclusionSummaryLowerMaterialityRows(next);
                    }}
                    placeholder=""
                  />
                  <Input
                    value={row.amount}
                    onChange={(event) => {
                      const next = [...conclusionSummaryLowerMaterialityRows];
                      next[rowIndex] = { ...row, amount: event.target.value };
                      setConclusionSummaryLowerMaterialityRows(next);
                    }}
                    placeholder=""
                  />
                </div>
              ))}
            </div>

            <label className="flex items-start gap-2">
              <Checkbox
                checked={conclusionSummaryConfirmMaterialityAppropriate}
                onCheckedChange={(checked) => setConclusionSummaryConfirmMaterialityAppropriate(Boolean(checked))}
              />
              <span>
                Confirm that the materiality level(s) remain appropriate in the context of the entity&apos;s actual financial results or that the materiality level(s) have been adjusted accordingly.
              </span>
            </label>

            <p className="font-semibold">Evaluate uncorrected misstatements individually and in combination with other misstatements, and taking into account quantitative and qualitative factors</p>
            <p>Evaluate whether the uncorrected misstatements are material to the current-period financial statements.</p>
            <p>This evaluation includes:</p>
            <p>-current-period misstatements</p>
            <p>-the effect of prior-period uncorrected misstatements</p>
            <p>-the cumulative effect of lack of neutrality, if any (i.e. management bias)</p>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={conclusionSummaryAttachSamSpreadsheet}
                onCheckedChange={(checked) => setConclusionSummaryAttachSamSpreadsheet(Boolean(checked))}
              />
              <span>Attach the SAM spreadsheet.</span>
            </label>
            <p>Are the uncorrected misstatements in the attached SAM spreadsheet quantitatively or qualitatively material, individually or in combination with others, in relation to the specific financial statement captions and disclosures involved or the financial statements as a whole?</p>
            {renderEvaluateFsAnswerButtons(conclusionSummarySamMaterial, setConclusionSummarySamMaterial)}
            <Label>Document the basis for our conclusion.</Label>
            <Textarea
              value={conclusionSummaryBasisConclusion}
              onChange={(event) => setConclusionSummaryBasisConclusion(event.target.value)}
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Summary of corrected and uncorrected audit misstatements</h3>
            <div className="max-w-full overflow-x-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-blue-900 text-left text-white">
                  <tr>
                    <th className="px-3 py-2 text-sm font-semibold break-words">ID</th>
                    <th className="px-3 py-2 text-sm font-semibold break-words">Description of misstatement</th>
                    <th className="px-3 py-2 text-sm font-semibold break-words">Corrected/Uncorrected</th>
                    <th className="px-3 py-2 text-sm font-semibold break-words">Type of misstatement</th>
                    <th className="px-3 py-2 text-sm font-semibold break-words">Indicative of fraud (Y/N)</th>
                    <th className="px-3 py-2 text-sm font-semibold break-words">Impact on nature, timing, extent of procedures? (Y/N)</th>
                  </tr>
                </thead>
                <tbody>
                  {conclusionSummaryMisstatementRows.map((misstatement, rowIndex) => (
                    <tr key={`summary-head-${rowIndex}`} className="border-t border-gray-200">
                      <td className="px-2 py-2">
                        <Input
                          value={misstatement.id}
                          onChange={(event) => updateMisstatementRow(rowIndex, { id: event.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Textarea
                          value={misstatement.description}
                          onChange={(event) => updateMisstatementRow(rowIndex, { description: event.target.value })}
                          className="min-h-[72px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
                          value={misstatement.correctedStatus}
                          onChange={(event) => updateMisstatementRow(rowIndex, { correctedStatus: event.target.value })}
                        >
                          <option value="">Select</option>
                          <option value="Corrected">Corrected</option>
                          <option value="Uncorrected">Uncorrected</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={misstatement.misstatementType}
                          onChange={(event) => updateMisstatementRow(rowIndex, { misstatementType: event.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
                          value={misstatement.likelyFraud}
                          onChange={(event) => updateMisstatementRow(rowIndex, { likelyFraud: event.target.value })}
                        >
                          <option value="">Select</option>
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
                          value={misstatement.impactProcedures}
                          onChange={(event) => updateMisstatementRow(rowIndex, { impactProcedures: event.target.value })}
                        >
                          <option value="">Select</option>
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {conclusionSummaryMisstatementRows.map((misstatement, rowIndex) => (
              <div key={`detail-block-${rowIndex}`} className="max-w-full space-y-2 rounded-lg border border-gray-200 p-2">
                <div className="flex justify-end">
                  <Button type="button" size="sm" variant="outline" onClick={() => addAccountImpactRow(rowIndex)}>
                    Add account row
                  </Button>
                </div>
                <table className="w-full table-fixed border-collapse">
                  <thead className="bg-blue-900 text-left text-white">
                    <tr>
                      <th className="px-3 py-2 text-sm font-semibold break-words">Accounts</th>
                      <th className="px-3 py-2 text-sm font-semibold break-words">Debit</th>
                      <th className="px-3 py-2 text-sm font-semibold break-words">(Credit)</th>
                      <th className="px-3 py-2 text-sm font-semibold break-words">Income statement effect - Debit (Credit)</th>
                      <th className="px-3 py-2 text-sm font-semibold break-words">Equity at year-end</th>
                      <th className="px-3 py-2 text-sm font-semibold break-words">Current assets</th>
                      <th className="px-3 py-2 text-sm font-semibold break-words">Non current assets</th>
                      <th className="px-3 py-2 text-sm font-semibold break-words">Current liabilities</th>
                      <th className="px-3 py-2 text-sm font-semibold break-words">Non current liabilities</th>
                      <th className="px-3 py-2 text-sm font-semibold break-words">Statement of comprehensive income effect - Debit (Credit)</th>
                      <th className="px-3 py-2 text-sm font-semibold break-words">Statement of cash flow effect - Debit (Credit)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {misstatement.accounts.map((accountRow, accountRowIndex) => (
                      <tr key={`acc-${rowIndex}-${accountRowIndex}`} className="border-t border-gray-200">
                        <td className="px-2 py-2">
                          <Input
                            value={accountRow.account}
                            onChange={(event) =>
                              updateAccountImpactRow(rowIndex, accountRowIndex, 'account', event.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            value={accountRow.debit}
                            onChange={(event) =>
                              updateAccountImpactRow(rowIndex, accountRowIndex, 'debit', event.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            value={accountRow.credit}
                            onChange={(event) =>
                              updateAccountImpactRow(rowIndex, accountRowIndex, 'credit', event.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            value={accountRow.incomeStatementEffect}
                            onChange={(event) =>
                              updateAccountImpactRow(rowIndex, accountRowIndex, 'incomeStatementEffect', event.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            value={accountRow.equityYearEnd}
                            onChange={(event) =>
                              updateAccountImpactRow(rowIndex, accountRowIndex, 'equityYearEnd', event.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            value={accountRow.currentAssets}
                            onChange={(event) =>
                              updateAccountImpactRow(rowIndex, accountRowIndex, 'currentAssets', event.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            value={accountRow.nonCurrentAssets}
                            onChange={(event) =>
                              updateAccountImpactRow(rowIndex, accountRowIndex, 'nonCurrentAssets', event.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            value={accountRow.currentLiabilities}
                            onChange={(event) =>
                              updateAccountImpactRow(rowIndex, accountRowIndex, 'currentLiabilities', event.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            value={accountRow.nonCurrentLiabilities}
                            onChange={(event) =>
                              updateAccountImpactRow(rowIndex, accountRowIndex, 'nonCurrentLiabilities', event.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            value={accountRow.comprehensiveIncome}
                            onChange={(event) =>
                              updateAccountImpactRow(rowIndex, accountRowIndex, 'comprehensiveIncome', event.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            value={accountRow.cashFlowEffect}
                            onChange={(event) =>
                              updateAccountImpactRow(rowIndex, accountRowIndex, 'cashFlowEffect', event.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderConclusionsSubsequentEvents = () => {
    const addRmmRow = () => {
      setConclusionSubsequentEventsRmmRows([
        ...conclusionSubsequentEventsRmmRows,
        { id: '', description: '', car: '' },
      ]);
    };

    const addInterimProcedureRow = () => {
      setConclusionSubsequentInterimProcedures([
        ...conclusionSubsequentInterimProcedures,
        { procedure: '', result: '' },
      ]);
    };

    const addSubsequentProcedureRow = () => {
      setConclusionSubsequentEventProcedures([
        ...conclusionSubsequentEventProcedures,
        { procedure: '', identified: '' },
      ]);
    };

    return (
      <div className="space-y-8">
        

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Summary of RMM(s) identified related to subsequent events</h3>
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addRmmRow}>
                Add row
              </Button>
            </div>
            <div className="overflow-x-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-blue-900 text-left text-white">
                  <tr>
                    <th className="px-3 py-2 text-sm font-semibold">ID</th>
                    <th className="px-3 py-2 text-sm font-semibold">Description</th>
                    <th className="px-3 py-2 text-sm font-semibold">CAR</th>
                  </tr>
                </thead>
                <tbody>
                  {conclusionSubsequentEventsRmmRows.map((row, index) => (
                    <tr key={`rmm-${index}`} className="border-t border-gray-200">
                      <td className="px-2 py-2">
                        <Input
                          value={row.id}
                          onChange={(event) => {
                            const next = [...conclusionSubsequentEventsRmmRows];
                            next[index] = { ...row, id: event.target.value };
                            setConclusionSubsequentEventsRmmRows(next);
                          }}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Textarea
                          value={row.description}
                          onChange={(event) => {
                            const next = [...conclusionSubsequentEventsRmmRows];
                            next[index] = { ...row, description: event.target.value };
                            setConclusionSubsequentEventsRmmRows(next);
                          }}
                          className="min-h-[72px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
                          value={row.car}
                          onChange={(event) => {
                            const next = [...conclusionSubsequentEventsRmmRows];
                            next[index] = { ...row, car: event.target.value };
                            setConclusionSubsequentEventsRmmRows(next);
                          }}
                        >
                          <option value="">Select</option>
                          <option value="B">B</option>
                          <option value="N">N</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Identify subsequent events that may require adjustment or disclosure</h3>
            <p>Perform procedures on the latest interim financial information:</p>
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addInterimProcedureRow}>
                Add row
              </Button>
            </div>
            <div className="overflow-x-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-blue-900 text-left text-white">
                  <tr>
                    <th className="px-3 py-2 text-sm font-semibold">Procedure</th>
                    <th className="px-3 py-2 text-sm font-semibold">Results</th>
                  </tr>
                </thead>
                <tbody>
                  {conclusionSubsequentInterimProcedures.map((row, rowIndex) => (
                    <tr key={`interim-${rowIndex}`} className="border-t border-gray-200 align-top">
                      <td className="px-2 py-2">
                        <Textarea
                          value={row.procedure}
                          onChange={(event) => {
                            const next = [...conclusionSubsequentInterimProcedures];
                            next[rowIndex] = { ...row, procedure: event.target.value };
                            setConclusionSubsequentInterimProcedures(next);
                          }}
                          className="min-h-[72px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={row.result}
                          onChange={(event) => {
                            const next = [...conclusionSubsequentInterimProcedures];
                            next[rowIndex] = { ...row, result: event.target.value };
                            setConclusionSubsequentInterimProcedures(next);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p>Perform the following procedures to identify subsequent events:</p>
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addSubsequentProcedureRow}>
                Add row
              </Button>
            </div>
            <div className="overflow-x-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-blue-900 text-left text-white">
                  <tr>
                    <th className="px-3 py-2 text-sm font-semibold">Procedure</th>
                    <th className="px-3 py-2 text-sm font-semibold">Subsequent event identified?</th>
                  </tr>
                </thead>
                <tbody>
                  {conclusionSubsequentEventProcedures.map((row, rowIndex) => (
                    <tr key={`subsequent-${rowIndex}`} className="border-t border-gray-200 align-top">
                      <td className="px-2 py-2">
                        <Textarea
                          value={row.procedure}
                          onChange={(event) => {
                            const next = [...conclusionSubsequentEventProcedures];
                            next[rowIndex] = { ...row, procedure: event.target.value };
                            setConclusionSubsequentEventProcedures(next);
                          }}
                          className="min-h-[72px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
                          value={row.identified}
                          onChange={(event) => {
                            const next = [...conclusionSubsequentEventProcedures];
                            next[rowIndex] = { ...row, identified: event.target.value };
                            setConclusionSubsequentEventProcedures(next);
                          }}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderConclusionsCompletion = () => {
    const addRiskSummaryRow = () => {
      setConclusionCompletionRiskSummaryRows([
        ...conclusionCompletionRiskSummaryRows,
        {
          businessProcess: '',
          rmId: '',
          rmDescription: '',
          inherentRisk: '',
          controlRiskReassessed: '',
          significantAccounts: '',
          assertions: '',
        },
      ]);
    };

    const addControlRow = () => {
      setConclusionCompletionControlRows([
        ...conclusionCompletionControlRows,
        {
          controlId: '',
          controlDescription: '',
          processRiskPoints: '',
          diResult: '',
          toeResult: '',
        },
      ]);
    };

    const addProcedureRow = () => {
      setConclusionCompletionProcedureRows([
        ...conclusionCompletionProcedureRows,
        {
          procedureType: '',
          procedureId: '',
          procedureDescription: '',
          auditEvidenceObtained: '',
        },
      ]);
    };

    const addFindingDetailRow = () => {
      setConclusionCompletionFindingDetailRows([
        ...conclusionCompletionFindingDetailRows,
        { nature: '', procedures: '', basis: '' },
      ]);
    };

    const addEvaluateResultRow = () => {
      setConclusionCompletionEvaluateResultsRows([
        ...conclusionCompletionEvaluateResultsRows,
        { procedure: '', documentedWhere: '' },
      ]);
    };

    const addAuditTopicRow = () => {
      setConclusionCompletionAuditTopicRows([
        ...conclusionCompletionAuditTopicRows,
        { topic: '', sufficientEvidence: '' },
      ]);
    };

    const addNotIdentifiedRow = () => {
      setConclusionCompletionNotIdentifiedRows([
        ...conclusionCompletionNotIdentifiedRows,
        { item: '' },
      ]);
    };

    return (
      <div className="space-y-8">
        

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Document significant findings or issues</h3>
            <p>The following significant findings or issues are in 4.1.4 Summary of audit misstatements and 4.2 Reporting (if applicable).</p>
            <label className="flex items-start gap-2">
              <Checkbox
                checked={conclusionCompletionConfirmRiskResponses}
                onCheckedChange={(checked) => setConclusionCompletionConfirmRiskResponses(Boolean(checked))}
              />
              <span>Confirm the response to the significant risk(s) summarized below addresses the risk and special audit considerations described in each risk fly in.</span>
            </label>

            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addRiskSummaryRow}>
                Add risk row
              </Button>
            </div>
            <div className="overflow-x-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-blue-900 text-left text-white">
                  <tr>
                    <th className="px-2 py-2 text-sm font-semibold">Business Process</th>
                    <th className="px-2 py-2 text-sm font-semibold">RM ID</th>
                    <th className="px-2 py-2 text-sm font-semibold">RM description</th>
                    <th className="px-2 py-2 text-sm font-semibold">Inherent risk</th>
                    <th className="px-2 py-2 text-sm font-semibold">Control risk reliance reassessed?</th>
                    <th className="px-2 py-2 text-sm font-semibold">Significant accounts / disclosures</th>
                    <th className="px-2 py-2 text-sm font-semibold">Assertions</th>
                  </tr>
                </thead>
                <tbody>
                  {conclusionCompletionRiskSummaryRows.map((row, rowIndex) => (
                    <tr key={`comp-risk-${rowIndex}`} className="border-t border-gray-200 align-top">
                      <td className="px-2 py-2"><Input value={row.businessProcess} onChange={(event) => {
                        const next = [...conclusionCompletionRiskSummaryRows];
                        next[rowIndex] = { ...row, businessProcess: event.target.value };
                        setConclusionCompletionRiskSummaryRows(next);
                      }} /></td>
                      <td className="px-2 py-2"><Input value={row.rmId} onChange={(event) => {
                        const next = [...conclusionCompletionRiskSummaryRows];
                        next[rowIndex] = { ...row, rmId: event.target.value };
                        setConclusionCompletionRiskSummaryRows(next);
                      }} /></td>
                      <td className="px-2 py-2"><Textarea value={row.rmDescription} onChange={(event) => {
                        const next = [...conclusionCompletionRiskSummaryRows];
                        next[rowIndex] = { ...row, rmDescription: event.target.value };
                        setConclusionCompletionRiskSummaryRows(next);
                      }} className="min-h-[72px]" /></td>
                      <td className="px-2 py-2"><Input value={row.inherentRisk} onChange={(event) => {
                        const next = [...conclusionCompletionRiskSummaryRows];
                        next[rowIndex] = { ...row, inherentRisk: event.target.value };
                        setConclusionCompletionRiskSummaryRows(next);
                      }} /></td>
                      <td className="px-2 py-2">
                        <select className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm" value={row.controlRiskReassessed} onChange={(event) => {
                          const next = [...conclusionCompletionRiskSummaryRows];
                          next[rowIndex] = { ...row, controlRiskReassessed: event.target.value };
                          setConclusionCompletionRiskSummaryRows(next);
                        }}>
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </td>
                      <td className="px-2 py-2"><Textarea value={row.significantAccounts} onChange={(event) => {
                        const next = [...conclusionCompletionRiskSummaryRows];
                        next[rowIndex] = { ...row, significantAccounts: event.target.value };
                        setConclusionCompletionRiskSummaryRows(next);
                      }} className="min-h-[72px]" /></td>
                      <td className="px-2 py-2"><Input value={row.assertions} onChange={(event) => {
                        const next = [...conclusionCompletionRiskSummaryRows];
                        next[rowIndex] = { ...row, assertions: event.target.value };
                        setConclusionCompletionRiskSummaryRows(next);
                      }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addControlRow}>
                Add control row
              </Button>
            </div>
            <div className="overflow-x-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-blue-900 text-left text-white">
                  <tr>
                    <th className="px-2 py-2 text-sm font-semibold">Control ID</th>
                    <th className="px-2 py-2 text-sm font-semibold">Control description</th>
                    <th className="px-2 py-2 text-sm font-semibold">Process risk points description</th>
                    <th className="px-2 py-2 text-sm font-semibold">D&I result</th>
                    <th className="px-2 py-2 text-sm font-semibold">TOE result</th>
                  </tr>
                </thead>
                <tbody>
                  {conclusionCompletionControlRows.map((row, rowIndex) => (
                    <tr key={`comp-control-${rowIndex}`} className="border-t border-gray-200 align-top">
                      <td className="px-2 py-2"><Input value={row.controlId} onChange={(event) => {
                        const next = [...conclusionCompletionControlRows];
                        next[rowIndex] = { ...row, controlId: event.target.value };
                        setConclusionCompletionControlRows(next);
                      }} /></td>
                      <td className="px-2 py-2"><Textarea value={row.controlDescription} onChange={(event) => {
                        const next = [...conclusionCompletionControlRows];
                        next[rowIndex] = { ...row, controlDescription: event.target.value };
                        setConclusionCompletionControlRows(next);
                      }} className="min-h-[72px]" /></td>
                      <td className="px-2 py-2"><Textarea value={row.processRiskPoints} onChange={(event) => {
                        const next = [...conclusionCompletionControlRows];
                        next[rowIndex] = { ...row, processRiskPoints: event.target.value };
                        setConclusionCompletionControlRows(next);
                      }} className="min-h-[72px]" /></td>
                      <td className="px-2 py-2"><Input value={row.diResult} onChange={(event) => {
                        const next = [...conclusionCompletionControlRows];
                        next[rowIndex] = { ...row, diResult: event.target.value };
                        setConclusionCompletionControlRows(next);
                      }} /></td>
                      <td className="px-2 py-2"><Input value={row.toeResult} onChange={(event) => {
                        const next = [...conclusionCompletionControlRows];
                        next[rowIndex] = { ...row, toeResult: event.target.value };
                        setConclusionCompletionControlRows(next);
                      }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addProcedureRow}>
                Add procedure row
              </Button>
            </div>
            <div className="overflow-x-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-blue-900 text-left text-white">
                  <tr>
                    <th className="px-2 py-2 text-sm font-semibold">Procedure type</th>
                    <th className="px-2 py-2 text-sm font-semibold">Procedure ID</th>
                    <th className="px-2 py-2 text-sm font-semibold">Procedure description</th>
                    <th className="px-2 py-2 text-sm font-semibold">Audit evidence obtained</th>
                  </tr>
                </thead>
                <tbody>
                  {conclusionCompletionProcedureRows.map((row, rowIndex) => (
                    <tr key={`comp-proc-${rowIndex}`} className="border-t border-gray-200 align-top">
                      <td className="px-2 py-2"><Input value={row.procedureType} onChange={(event) => {
                        const next = [...conclusionCompletionProcedureRows];
                        next[rowIndex] = { ...row, procedureType: event.target.value };
                        setConclusionCompletionProcedureRows(next);
                      }} /></td>
                      <td className="px-2 py-2"><Input value={row.procedureId} onChange={(event) => {
                        const next = [...conclusionCompletionProcedureRows];
                        next[rowIndex] = { ...row, procedureId: event.target.value };
                        setConclusionCompletionProcedureRows(next);
                      }} /></td>
                      <td className="px-2 py-2"><Textarea value={row.procedureDescription} onChange={(event) => {
                        const next = [...conclusionCompletionProcedureRows];
                        next[rowIndex] = { ...row, procedureDescription: event.target.value };
                        setConclusionCompletionProcedureRows(next);
                      }} className="min-h-[72px]" /></td>
                      <td className="px-2 py-2">
                        <select className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm" value={row.auditEvidenceObtained} onChange={(event) => {
                          const next = [...conclusionCompletionProcedureRows];
                          next[rowIndex] = { ...row, auditEvidenceObtained: event.target.value };
                          setConclusionCompletionProcedureRows(next);
                        }}>
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionCompletionFindingOptions.accountingSelection} onCheckedChange={(checked) => setConclusionCompletionFindingOptions({ ...conclusionCompletionFindingOptions, accountingSelection: Boolean(checked) })} />
              <span>Significant matters involving selection/application/consistency of accounting principles and related disclosures</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionCompletionFindingOptions.needModifyProcedures} onCheckedChange={(checked) => setConclusionCompletionFindingOptions({ ...conclusionCompletionFindingOptions, needModifyProcedures: Boolean(checked) })} />
              <span>Results indicating significant modification of planned auditing procedures</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionCompletionFindingOptions.disagreements} onCheckedChange={(checked) => setConclusionCompletionFindingOptions({ ...conclusionCompletionFindingOptions, disagreements: Boolean(checked) })} />
              <span>Disagreements among engagement team members or others consulted</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionCompletionFindingOptions.difficultyApplyingProcedures} onCheckedChange={(checked) => setConclusionCompletionFindingOptions({ ...conclusionCompletionFindingOptions, difficultyApplyingProcedures: Boolean(checked) })} />
              <span>Circumstances causing significant difficulty in applying auditing procedures</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionCompletionFindingOptions.riskAssessmentChanges} onCheckedChange={(checked) => setConclusionCompletionFindingOptions({ ...conclusionCompletionFindingOptions, riskAssessmentChanges: Boolean(checked) })} />
              <span>Significant changes in our risk assessments</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionCompletionFindingOptions.interimFindings} onCheckedChange={(checked) => setConclusionCompletionFindingOptions({ ...conclusionCompletionFindingOptions, interimFindings: Boolean(checked) })} />
              <span>Significant findings or issues identified in an interim review</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionCompletionFindingOptions.contradictoryInformation} onCheckedChange={(checked) => setConclusionCompletionFindingOptions({ ...conclusionCompletionFindingOptions, contradictoryInformation: Boolean(checked) })} />
              <span>Information inconsistent with or contradicting final conclusions</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionCompletionFindingOptions.other} onCheckedChange={(checked) => setConclusionCompletionFindingOptions({ ...conclusionCompletionFindingOptions, other: Boolean(checked) })} />
              <span>Other</span>
            </label>
            {conclusionCompletionFindingOptions.other && (
              <Input value={conclusionCompletionOtherFindingText} onChange={(event) => setConclusionCompletionOtherFindingText(event.target.value)} placeholder="" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addFindingDetailRow}>
                Add row
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-blue-900 text-left text-white">
                  <tr>
                    <th className="px-2 py-2 text-sm font-semibold">Nature of the significant finding or issue</th>
                    <th className="px-2 py-2 text-sm font-semibold">Procedures performed</th>
                    <th className="px-2 py-2 text-sm font-semibold">Basis for conclusions reached</th>
                  </tr>
                </thead>
                <tbody>
                  {conclusionCompletionFindingDetailRows.map((row, rowIndex) => (
                    <tr key={`finding-row-${rowIndex}`} className="border-t border-gray-200 align-top">
                      <td className="px-2 py-2"><Textarea value={row.nature} onChange={(event) => {
                        const next = [...conclusionCompletionFindingDetailRows];
                        next[rowIndex] = { ...row, nature: event.target.value };
                        setConclusionCompletionFindingDetailRows(next);
                      }} className="min-h-[80px]" /></td>
                      <td className="px-2 py-2"><Textarea value={row.procedures} onChange={(event) => {
                        const next = [...conclusionCompletionFindingDetailRows];
                        next[rowIndex] = { ...row, procedures: event.target.value };
                        setConclusionCompletionFindingDetailRows(next);
                      }} className="min-h-[80px]" /></td>
                      <td className="px-2 py-2"><Textarea value={row.basis} onChange={(event) => {
                        const next = [...conclusionCompletionFindingDetailRows];
                        next[rowIndex] = { ...row, basis: event.target.value };
                        setConclusionCompletionFindingDetailRows(next);
                      }} className="min-h-[80px]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>Document discussions of significant findings or issues with management, those charged with governance, and others.</p>
            <Textarea value={conclusionCompletionFindingsDiscussion} onChange={(event) => setConclusionCompletionFindingsDiscussion(event.target.value)} className="min-h-[120px]" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Quality management</h3>
            <p>Was this engagement selected for second line of defense review?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionCompletionQualityManagement.selectedSecondLineDefense,
              (value) => setConclusionCompletionQualityManagement({ ...conclusionCompletionQualityManagement, selectedSecondLineDefense: value })
            )}
            <p>Was this engagement file tailored?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionCompletionQualityManagement.fileTailored,
              (value) => setConclusionCompletionQualityManagement({ ...conclusionCompletionQualityManagement, fileTailored: value })
            )}
            <label className="flex items-start gap-2">
              <Checkbox checked={conclusionCompletionQualityManagement.confirmTailoringAppropriate} onCheckedChange={(checked) => setConclusionCompletionQualityManagement({ ...conclusionCompletionQualityManagement, confirmTailoringAppropriate: Boolean(checked) })} />
              <span>We confirm the engagement file tailoring is appropriate.</span>
            </label>
            <label className="flex items-start gap-2">
              <Checkbox checked={conclusionCompletionQualityManagement.confirmConsultationsImplemented} onCheckedChange={(checked) => setConclusionCompletionQualityManagement({ ...conclusionCompletionQualityManagement, confirmConsultationsImplemented: Boolean(checked) })} />
              <span>We confirm all appropriate consultations have been undertaken and conclusions reached have been implemented.</span>
            </label>
            <p>Was a conflict of interest identified that resulted in safeguards being applied to address the threat?</p>
            {renderEvaluateFsAnswerButtons(
              conclusionCompletionQualityManagement.conflictOfInterestSafeguards,
              (value) => setConclusionCompletionQualityManagement({ ...conclusionCompletionQualityManagement, conflictOfInterestSafeguards: value })
            )}
            <label className="flex items-start gap-2">
              <Checkbox checked={conclusionCompletionQualityManagement.partnerTakesResponsibility} onCheckedChange={(checked) => setConclusionCompletionQualityManagement({ ...conclusionCompletionQualityManagement, partnerTakesResponsibility: Boolean(checked) })} />
              <span>The engagement partner confirms overall responsibility for managing and achieving quality on the audit engagement.</span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Document consultations</h3>
            <Textarea value={conclusionCompletionConsultationsNote} onChange={(event) => setConclusionCompletionConsultationsNote(event.target.value)} className="min-h-[100px]" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Evaluate the audit results and form an opinion</h3>
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addEvaluateResultRow}>
                Add row
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-blue-900 text-left text-white">
                  <tr>
                    <th className="px-2 py-2 text-sm font-semibold">Procedure to evaluate results</th>
                    <th className="px-2 py-2 text-sm font-semibold">Where documented</th>
                  </tr>
                </thead>
                <tbody>
                  {conclusionCompletionEvaluateResultsRows.map((row, rowIndex) => (
                    <tr key={`eval-row-${rowIndex}`} className="border-t border-gray-200 align-top">
                      <td className="px-2 py-2"><Textarea value={row.procedure} onChange={(event) => {
                        const next = [...conclusionCompletionEvaluateResultsRows];
                        next[rowIndex] = { ...row, procedure: event.target.value };
                        setConclusionCompletionEvaluateResultsRows(next);
                      }} className="min-h-[72px]" /></td>
                      <td className="px-2 py-2"><Input value={row.documentedWhere} onChange={(event) => {
                        const next = [...conclusionCompletionEvaluateResultsRows];
                        next[rowIndex] = { ...row, documentedWhere: event.target.value };
                        setConclusionCompletionEvaluateResultsRows(next);
                      }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <label className="flex items-start gap-2">
              <Checkbox checked={conclusionCompletionAuditMatrixReviewed} onCheckedChange={(checked) => setConclusionCompletionAuditMatrixReviewed(Boolean(checked))} />
              <span>We confirm we have reviewed the Audit matrix and evaluated sufficiency and appropriateness of audit evidence obtained.</span>
            </label>

            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addAuditTopicRow}>
                Add topic
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-blue-900 text-left text-white">
                  <tr>
                    <th className="px-2 py-2 text-sm font-semibold">Audit topic</th>
                    <th className="px-2 py-2 text-sm font-semibold">Sufficient appropriate evidence obtained</th>
                  </tr>
                </thead>
                <tbody>
                  {conclusionCompletionAuditTopicRows.map((row, rowIndex) => (
                    <tr key={`topic-${rowIndex}`} className="border-t border-gray-200">
                      <td className="px-2 py-2"><Input value={row.topic} onChange={(event) => {
                        const next = [...conclusionCompletionAuditTopicRows];
                        next[rowIndex] = { ...row, topic: event.target.value };
                        setConclusionCompletionAuditTopicRows(next);
                      }} /></td>
                      <td className="px-2 py-2">
                        <select className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm" value={row.sufficientEvidence} onChange={(event) => {
                          const next = [...conclusionCompletionAuditTopicRows];
                          next[rowIndex] = { ...row, sufficientEvidence: event.target.value };
                          setConclusionCompletionAuditTopicRows(next);
                        }}>
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addNotIdentifiedRow}>
                Add item
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-blue-900 px-3 py-2 text-sm font-semibold text-white">We have not identified any:</div>
              {conclusionCompletionNotIdentifiedRows.map((row, rowIndex) => (
                <div key={`not-identified-${rowIndex}`} className="border-t border-gray-200 px-2 py-2">
                  <Input value={row.item} onChange={(event) => {
                    const next = [...conclusionCompletionNotIdentifiedRows];
                    next[rowIndex] = { ...row, item: event.target.value };
                    setConclusionCompletionNotIdentifiedRows(next);
                  }} />
                </div>
              ))}
            </div>

            <p>Based on the procedures performed and conclusions reached, have we obtained sufficient appropriate audit evidence to form the audit opinion?</p>
            {renderEvaluateFsAnswerButtons(conclusionCompletionFinalOpinion, setConclusionCompletionFinalOpinion)}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderConclusionsReporting = () => {
    const addRepAttachment = () => {
      const value = conclusionReportingRepAttachmentDraft.trim();
      if (!value) return;
      setConclusionReportingRepAttachments([...conclusionReportingRepAttachments, value]);
      setConclusionReportingRepAttachmentDraft('');
    };

    const addIssuedAttachment = () => {
      const value = conclusionReportingIssuedAttachmentDraft.trim();
      if (!value) return;
      setConclusionReportingIssuedAttachments([...conclusionReportingIssuedAttachments, value]);
      setConclusionReportingIssuedAttachmentDraft('');
    };

    const addFinalAttachment = () => {
      const value = conclusionReportingFinalAttachmentDraft.trim();
      if (!value) return;
      setConclusionReportingFinalAttachments([...conclusionReportingFinalAttachments, value]);
      setConclusionReportingFinalAttachmentDraft('');
    };

    if (conclusionReportingView === 'landing') {
      return (
        <div className="space-y-8">
          
          <div className="flex flex-wrap gap-4">
            <div className="w-[220px]">
              <Card
                className="cursor-pointer rounded-none border border-gray-200 shadow-sm transition-all hover:bg-accent focus:ring-2 focus:ring-primary outline-none"
                tabIndex={0}
                role="button"
                onClick={() => setConclusionReportingView('rep-letter-report')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setConclusionReportingView('rep-letter-report');
                  }
                }}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="text-3xl leading-none text-gray-900">1</div>
                  <div className="text-[30px] h-px bg-gray-200" />
                  <div className="text-lg text-gray-900">Rep Letter and Report</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">1. Rep Letter and Report</h2>
          <Button type="button" variant="outline" onClick={() => setConclusionReportingView('landing')}>
            Back
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Identify KAMs to be communicated in our audit report</h3>
            <p>Will we include the section "Key Audit Matters" in our report?</p>
            {renderEvaluateFsAnswerButtons(conclusionReportingKams.includeKamSection, (value) =>
              setConclusionReportingKams({ ...conclusionReportingKams, includeKamSection: value })
            )}
            <p>Did any of the matters communicated to those charged with governance require significant auditor attention?</p>
            {renderEvaluateFsAnswerButtons(conclusionReportingKams.mattersRequireAttention, (value) =>
              setConclusionReportingKams({ ...conclusionReportingKams, mattersRequireAttention: value })
            )}
            <p>Have we identified a matter that we have determined to be a key audit matter but do not intend to communicate in our report?</p>
            {renderEvaluateFsAnswerButtons(conclusionReportingKams.identifiedButNotCommunicated, (value) =>
              setConclusionReportingKams({ ...conclusionReportingKams, identifiedButNotCommunicated: value })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Representation Letter</h3>
            <p className="font-semibold">Obtain written representations from management</p>
            <div className="max-w-xs">
              <Label>Date of the representation letter</Label>
              <Input
                type="date"
                value={conclusionReportingRepLetterDate}
                onChange={(event) => setConclusionReportingRepLetterDate(event.target.value)}
                className="mt-2"
              />
            </div>
            <p>Confirm the following in regards to the representation letter:</p>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionReportingRepChecks.templateSelected} onCheckedChange={(checked) => setConclusionReportingRepChecks({ ...conclusionReportingRepChecks, templateSelected: Boolean(checked) })} />
              <span>The appropriate representation letter template has been selected for use.</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionReportingRepChecks.dateAppropriate} onCheckedChange={(checked) => setConclusionReportingRepChecks({ ...conclusionReportingRepChecks, dateAppropriate: Boolean(checked) })} />
              <span>The date of the representation letter is appropriate.</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionReportingRepChecks.addressedToAuditor} onCheckedChange={(checked) => setConclusionReportingRepChecks({ ...conclusionReportingRepChecks, addressedToAuditor: Boolean(checked) })} />
              <span>The representation letter is addressed to the auditor.</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionReportingRepChecks.noneRemoved} onCheckedChange={(checked) => setConclusionReportingRepChecks({ ...conclusionReportingRepChecks, noneRemoved: Boolean(checked) })} />
              <span>No required representations have been removed while modifying the standard template.</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionReportingRepChecks.additionalConsidered} onCheckedChange={(checked) => setConclusionReportingRepChecks({ ...conclusionReportingRepChecks, additionalConsidered: Boolean(checked) })} />
              <span>Additional representations, where applicable, have been considered.</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionReportingRepChecks.signatoriesAppropriate} onCheckedChange={(checked) => setConclusionReportingRepChecks({ ...conclusionReportingRepChecks, signatoriesAppropriate: Boolean(checked) })} />
              <span>The signatories are current members of management or those charged with governance.</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionReportingRepChecks.summaryUncorrectedAttached} onCheckedChange={(checked) => setConclusionReportingRepChecks({ ...conclusionReportingRepChecks, summaryUncorrectedAttached: Boolean(checked) })} />
              <span>The summary of uncorrected misstatements is attached.</span>
            </label>

            <p>Attach the signed representation letter that covers all periods presented in the related report.</p>
            <div className="flex gap-2">
              <Input value={conclusionReportingRepAttachmentDraft} onChange={(event) => setConclusionReportingRepAttachmentDraft(event.target.value)} />
              <Button type="button" variant="outline" onClick={addRepAttachment}>Add</Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-blue-900 px-3 py-2 text-sm font-semibold text-white">Attachments</div>
              {conclusionReportingRepAttachments.map((item, index) => (
                <div key={`rep-att-${index}`} className="border-t border-gray-200 px-3 py-2 text-sm">{item}</div>
              ))}
            </div>

            <p>Are there any concerns with the competence, integrity, ethical values or diligence of the members of management that have signed the representation letter?</p>
            {renderEvaluateFsAnswerButtons(conclusionReportingRepConcerns.managementCompetenceConcerns, (value) =>
              setConclusionReportingRepConcerns({ ...conclusionReportingRepConcerns, managementCompetenceConcerns: value })
            )}
            <p>Do any of the representations from management contradict other audit evidence obtained?</p>
            {renderEvaluateFsAnswerButtons(conclusionReportingRepConcerns.representationsContradictEvidence, (value) =>
              setConclusionReportingRepConcerns({ ...conclusionReportingRepConcerns, representationsContradictEvidence: value })
            )}
            <p>Did management fail to provide or modify any of the requested written representations?</p>
            {renderEvaluateFsAnswerButtons(conclusionReportingRepConcerns.managementFailedProvideRepresentations, (value) =>
              setConclusionReportingRepConcerns({ ...conclusionReportingRepConcerns, managementFailedProvideRepresentations: value })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4 text-sm text-gray-700">
            <h3 className="text-2xl font-semibold text-gray-900">Audit Report</h3>
            <label className="flex items-start gap-2">
              <Checkbox checked={conclusionReportingAuditChecks.proceduresCompleted} onCheckedChange={(checked) => setConclusionReportingAuditChecks({ ...conclusionReportingAuditChecks, proceduresCompleted: Boolean(checked) })} />
              <span>As of the date of our report(s), we have completed all necessary auditing procedures and obtained sufficient appropriate audit evidence.</span>
            </label>
            <label className="flex items-start gap-2">
              <Checkbox checked={conclusionReportingAuditChecks.authorityAssertedResponsibility} onCheckedChange={(checked) => setConclusionReportingAuditChecks({ ...conclusionReportingAuditChecks, authorityAssertedResponsibility: Boolean(checked) })} />
              <span>Those with recognized authority have asserted responsibility for prepared financial statements.</span>
            </label>
            <label className="flex items-start gap-2">
              <Checkbox checked={conclusionReportingAuditChecks.supervisionInAccordance} onCheckedChange={(checked) => setConclusionReportingAuditChecks({ ...conclusionReportingAuditChecks, supervisionInAccordance: Boolean(checked) })} />
              <span>Direction, supervision and review of audit documentation is performed in accordance with relevant standards and requirements.</span>
            </label>
            <p>Are there any matters that resulted or could have resulted in a modification to the audit opinion?</p>
            {renderEvaluateFsAnswerButtons(conclusionReportingAuditQuestions.mattersModifyOpinion, (value) =>
              setConclusionReportingAuditQuestions({ ...conclusionReportingAuditQuestions, mattersModifyOpinion: value })
            )}
            <p>Are any of the reporting consultation requirements applicable to the engagement?</p>
            {renderEvaluateFsAnswerButtons(conclusionReportingAuditQuestions.consultationRequirementsApplicable, (value) =>
              setConclusionReportingAuditQuestions({ ...conclusionReportingAuditQuestions, consultationRequirementsApplicable: value })
            )}
            <label className="flex items-start gap-2">
              <Checkbox checked={conclusionReportingAuditChecks.reportPreparedInAccordance} onCheckedChange={(checked) => setConclusionReportingAuditChecks({ ...conclusionReportingAuditChecks, reportPreparedInAccordance: Boolean(checked) })} />
              <span>Written audit report(s) has been prepared in accordance with relevant standards and KPMG requirements.</span>
            </label>

            <div className="grid gap-3 md:grid-cols-3">
              <div><Label>Audit report date</Label><Input type="date" value={conclusionReportingDates.auditReportDate} onChange={(event) => setConclusionReportingDates({ ...conclusionReportingDates, auditReportDate: event.target.value })} className="mt-2" /></div>
              <div><Label>Required audit file closeout date</Label><Input type="date" value={conclusionReportingDates.requiredCloseoutDate} onChange={(event) => setConclusionReportingDates({ ...conclusionReportingDates, requiredCloseoutDate: event.target.value })} className="mt-2" /></div>
              <div><Label>Expected audit file assembly date</Label><Input type="date" value={conclusionReportingDates.expectedAssemblyDate} onChange={(event) => setConclusionReportingDates({ ...conclusionReportingDates, expectedAssemblyDate: event.target.value })} className="mt-2" /></div>
            </div>

            <p>Attach a) the issued report(s) and b) the final relevant financial statements, disclosures, schedules and other information.</p>
            <div className="flex gap-2">
              <Input value={conclusionReportingIssuedAttachmentDraft} onChange={(event) => setConclusionReportingIssuedAttachmentDraft(event.target.value)} />
              <Button type="button" variant="outline" onClick={addIssuedAttachment}>Add</Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-blue-900 px-3 py-2 text-sm font-semibold text-white">Attachments</div>
              {conclusionReportingIssuedAttachments.map((item, index) => (
                <div key={`issued-att-${index}`} className="border-t border-gray-200 px-3 py-2 text-sm">{item}</div>
              ))}
            </div>

            <label className="flex items-center gap-2">
              <Checkbox checked={conclusionReportingAttachAdditionalKpmgReports} onCheckedChange={(checked) => setConclusionReportingAttachAdditionalKpmgReports(Boolean(checked))} />
              <span>Attach additional KPMG report(s), if any, and supporting documentation.</span>
            </label>

            <p>Attach the final auditors report, final audited financial statements with related footnote disclosures, schedules and other information.</p>
            <div className="flex gap-2">
              <Input value={conclusionReportingFinalAttachmentDraft} onChange={(event) => setConclusionReportingFinalAttachmentDraft(event.target.value)} />
              <Button type="button" variant="outline" onClick={addFinalAttachment}>Add</Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-blue-900 px-3 py-2 text-sm font-semibold text-white">Attachments</div>
              {conclusionReportingFinalAttachments.map((item, index) => (
                <div key={`final-att-${index}`} className="border-t border-gray-200 px-3 py-2 text-sm">{item}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const dynamicProcessContent = renderDynamicProcessSection();

  // Engagement management cards logic
  const engagementManagementSection = sidebarSections.find(s => s.id === "engagement-management");

  // Independence cards logic: USE THE RECURSIVE LOOKUP HERE!
  const independenceSection = findSectionById(sidebarSections, "independence-section");

  const renderIndependenceContent = () => {
    if (!independenceSection) return null;
    return (
      <div className="space-y-8">
        {renderCardsForSection(independenceSection)}
      </div>
    );
  };

  return (
    <CommentsProvider
      activeSection={activeSection}
      onCreateComment={onCreateComment}
      getFieldCommentCount={getFieldCommentCount}
    >
      <div className="flex-1">
        <div className="p-8 pb-24 pr-20">
          <div className="w-full max-w-none">
            <ProjectHeader projectName={project?.engagement_name || ''} engagementId={project?.engagement_id || ''} activeSection={activeSection} currentSectionTitle={currentSectionTitle} clientName={selectedClient?.name} auditType={formData.audit_type} onBack={onBack} onSave={onSave} saving={saving} />

        {/* Project Dashboard */}
        {activeSection === 'project-dashboard' && (
          <ProjectDashboardSection
            formData={formData}
            project={project}
            users={users}
            clients={clients}
            sidebarSections={sidebarSections}
            onSectionChange={onSectionChange}
            signOffData={signOffData}
            pendingReviews={pendingReviews}
            teamMemberCount={teamMemberCount}
          />
        )}
        
        {activeSection === 'knowledge-base' && (
          <KnowledgeBasePage
            projectId={projectId}
            sourceExcelFile={formData.source_excel_file}
            onNavigateToUpload={() => onSectionChange('engagement-profile-section')}
            onRemoveSourceExcel={onRemoveFile}
          />
        )}

        {/* Main parent section - shows all nested content for 1. Engagement management */}
        {activeSection === 'engagement-management' && (
          <SectionWrapper
            sectionId="engagement-management"
            formData={formData}
            users={users}
            currentUser={currentUser}
            signOffLevel="manager"
            onReview={handleReviewWrapper}
            onUnreview={onUnreview}
            sidebarSections={sidebarSections}
          >
            <div className="space-y-8">
              {renderOverviewInfo()}
              {renderCardsForSection(engagementManagementSection)}
            </div>
          </SectionWrapper>
        )}

        {/* Section 1, Engagement management children with sign-off */}
        {activeSection === 'engagement-profile-section' && (
          <SectionWrapper
            sectionId="engagement-profile-section"
            formData={formData}
            users={users}
            currentUser={currentUser}
            signOffLevel="incharge"
            onReview={handleReviewWrapper}
            onUnreview={onUnreview}
            sidebarSections={sidebarSections}
          >
            {renderEngagementProfileContent()}
          </SectionWrapper>
        )}
        
        {activeSection === 'sp-specialists-section' && (
          <SectionWrapper
            sectionId="sp-specialists-section"
            formData={formData}
            users={users}
            currentUser={currentUser}
            signOffLevel="incharge"
            onReview={handleReviewWrapper}
            onUnreview={onUnreview}
            sidebarSections={sidebarSections}
          >
            {renderSPSpecialistsContent()}
          </SectionWrapper>
        )}
        
        {activeSection === 'independence-section' && (
          <SectionWrapper
            sectionId="independence-section"
            formData={formData}
            users={users}
            currentUser={currentUser}
            signOffLevel="incharge"
            onReview={handleReviewWrapper}
            onUnreview={onUnreview}
            sidebarSections={sidebarSections}
          >
            {renderIndependenceContent()}
          </SectionWrapper>
        )}
        
        {activeSection === 'communications-section' && (
          <SectionWrapper
            sectionId="communications-section"
            formData={formData}
            users={users}
            currentUser={currentUser}
            signOffLevel="incharge"
            onReview={handleReviewWrapper}
            onUnreview={onUnreview}
            sidebarSections={sidebarSections}
          >
            {renderCommunicationsContent()}
          </SectionWrapper>
        )}
        {activeSection === 'sign-off-1' && renderSignOffContent()}
        {activeSection === 'sign-off-2' && renderSignOffContent()}
        {activeSection === 'sign-off-3' && renderSignOffContent()}
        {activeSection === 'tech-risk-corp' && (
          <SectionWrapper
            sectionId="tech-risk-corp"
            formData={formData}
            users={users}
            currentUser={currentUser}
            signOffLevel="incharge"
            onReview={handleReviewWrapper}
            onUnreview={onUnreview}
            sidebarSections={sidebarSections}
          >
            <div className="space-y-4">
              {renderPlaceholderSection('Tech Risk Corp - IT Audit')}
            </div>
          </SectionWrapper>
        )}
        
        {activeSection === 'initial-independence' && (
          <SectionWrapper
            sectionId="initial-independence"
            formData={formData}
            users={users}
            currentUser={currentUser}
            signOffLevel="incharge"
            onReview={handleReviewWrapper}
            onUnreview={onUnreview}
            sidebarSections={sidebarSections}
          >
            <div className="space-y-4">
              <IndependenceRequirementsSection formData={formData} onFormDataChange={onFormDataChange} />
            </div>
          </SectionWrapper>
        )}
        
        {activeSection === 'fraud-risk' && (
          <SectionWrapper
            sectionId="fraud-risk"
            formData={formData}
            users={users}
            currentUser={currentUser}
            signOffLevel="incharge"
            onReview={handleReviewWrapper}
            onUnreview={onUnreview}
            sidebarSections={sidebarSections}
          >
            <div className="space-y-4">
              {renderSectionHeader('Fraud risk assessment and response', '1.')}
              <FraudRiskAssessmentSection formData={formData} onFormDataChange={onFormDataChange} />
            </div>
          </SectionWrapper>
        )}
        {/* END of engagement management custom blocks */}

        {/* BUSINESS PROCESSES LOGIC (section 3 and its tree) */}
        {activeSection === 'business-processes' && renderBusinessProcessesContent()}
        {activeSection === 'financial-reporting' && renderFinancialReportingContent()}
        {activeSection === 'financial-reporting-process' && (
          <SectionWrapper
            sectionId="financial-reporting-process"
            formData={formData}
            users={users}
            currentUser={currentUser}
            signOffLevel="incharge"
            onReview={handleReviewWrapper}
            onUnreview={onUnreview}
            sidebarSections={sidebarSections}
          >
            <div className="space-y-4">
              <FinancialReportingProcessSection formData={formData} onFormDataChange={onFormDataChange} />
            </div>
          </SectionWrapper>
        )}
        {activeSection === 'control-activities' && (
          renderControlActivitiesLanding()
        )}
        {activeSection === 'controle-24' && (
          renderControle24Landing()
        )}
        {activeSection === 'controle-24-d-i' && (
          renderControle24DI()
        )}
        
{activeSection === 'controle-24-toe' && (
          renderControle24TOE()
        )}
        
{activeSection === 'controle-25' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">SOD</p>
            {renderPlaceholderSection('Contr?le 25 - SOD')}
          </div>
        )}
        {activeSection === 'related-parties' && renderRelatedPartiesLanding()}
        {activeSection === 'related-parties-intercos' && renderRelatedPartiesIntercos()}
        {activeSection === 'litigation-claims' && renderLitigationClaimsLanding()}
        {activeSection === 'litigation-claims-leadsheet' && renderLitigationLeadsheet()}
        {activeSection === 'litigation-claims-understanding' && renderLitigationUnderstanding()}
        {activeSection === 'litigation-claims-laws' && renderLitigationLaws()}
        {activeSection === 'litigation-claims-results' && renderLitigationResults()}
        {activeSection === 'litigation-claims-substantive' && renderLitigationSubstantive()}
        {activeSection === 'litigation-claims-substantive-tod-01' && renderLitigationSubstantiveTod01()}
        {activeSection === 'litigation-claims-substantive-tod-01-design' && renderLitigationSubstantiveTod01Design()}
        {activeSection === 'litigation-claims-substantive-tod-01-perform' && renderLitigationSubstantiveTod01Perform()}
        {dynamicProcessContent && (
          <SectionWrapper
            sectionId={activeSection}
            formData={formData}
            users={users}
            currentUser={currentUser}
            signOffLevel="incharge"
            onReview={handleReviewWrapper}
            onUnreview={onUnreview}
            sidebarSections={sidebarSections}
          >
            <div className="space-y-4">{dynamicProcessContent}</div>
          </SectionWrapper>
        )}
        {activeSection === 'conclusions-and-reporting' && renderConclusionsLanding()}
        {activeSection === 'conclusions-reporting-evaluate-result' && renderConclusionsEvaluateAuditResult()}
        {activeSection === 'conclusions-reporting-risk-update' && renderConclusionsRiskUpdate()}
        {activeSection === 'conclusions-reporting-management-bias' && renderConclusionsManagementBias()}
        {activeSection === 'conclusions-reporting-reporting' && renderConclusionsReporting()}
        {activeSection === 'conclusions-reporting-final-analytics' && renderConclusionsFinalAnalytics()}
        {activeSection === 'conclusions-reporting-evaluate-financial-statements' && renderConclusionsEvaluateFinancialStatements()}
        {activeSection === 'conclusions-reporting-summary-misstatements' && renderConclusionsSummaryOfAuditMisstatements()}
        {activeSection === 'conclusions-reporting-subsequent-events' && renderConclusionsSubsequentEvents()}
        {activeSection === 'conclusions-reporting-completion' && renderConclusionsCompletion()}
        
        {/* ENTITY WIDE PROCEDURES LOGIC (section 2 and its entire tree) */}
        {renderedEntityContent}

        {/* TEAM SECTION */}
        {activeSection === 'team-section' && (
          <div className="space-y-4">
            <TeamSection
              formData={formData}
              users={users}
              currentUser={currentUser}
              currentUserId={currentUserId || ''}
              isLeadDeveloper={currentUserId === formData.lead_developer_id}
              onFormDataChange={onFormDataChange}
              onSave={onSave}
              saving={saving}
              projectId={project?.id}
            />
          </div>
        )}
        
        {/* PROJECT SIGN-OFFS SUMMARY */}
        {activeSection === 'project-signoffs-summary' && (
          <ProjectSignOffsSummary
            formData={formData}
            users={users}
            sidebarSections={sidebarSections}
            currentUser={currentUser}
            onUnsign={(sectionId: string) => {}} // This is for sign-offs, not reviews
          />
        )}
          </div>
        </div>
      </div>
      
      {/* Compact Review Footer - always visible */}
      {findSectionById(sidebarSections, activeSection) && (
        <CompactReviewFooter
          sectionId={activeSection}
          formData={formData}
          currentUser={currentUser}
          onReview={handleReviewWrapper}
          onSave={onSave}
          saving={saving}
        />
      )}
    </CommentsProvider>
  );
};
export default ProjectEditContent;

