

# Plan: Connect All Project Edit Sections to Database

## Problem Found

After auditing the code, I found **three categories of issues** where data entered in project sections is NOT being saved/loaded properly:

---

## Issue 1: D&I Section Fields - Hardcoded Defaults (Not Reading from Database)

**File:** `src/hooks/useProjectForm.ts` (lines 184-197)

The D&I section fields are initialized with hardcoded values instead of reading from the saved project data. This means every time you open a project, these fields reset to their defaults -- any saved values are lost.

**Affected fields:**
- `control_attributes_judgment`
- `procedure_nature`
- `procedure_type`
- `procedure_frequency`
- `operator_authority`
- `information_used`
- `eval_inquiry`, `eval_inspection`, `eval_observation`
- `eval_procedures_documentation`
- `design_conclusion`
- `implementation_conclusion`
- `plan_operating_test`

**Fix:** Change each line from hardcoded defaults to read from `projectData`, e.g.:
`control_attributes_judgment: (projectData as any).control_attributes_judgment || ''`

---

## Issue 2: D&I Section Local State Tables - Never Saved

**File:** `src/components/ProjectEdit/DISection.tsx` (lines 22-27)

The RAFIT table and Operator table in the D&I section use local `useState` -- they are never written to `formData` and therefore never saved to the database. Closing and reopening the project loses all data in these tables.

**Fix:**
1. Add two new fields to `ProjectFormData`: `di_rafit_rows` and `di_operator_rows`
2. Add them to `getInitialFormData()` and `initializeFormData()`
3. Update DISection.tsx to use `formData` and `onFormDataChange` instead of local state

---

## Issue 3: Missing Fields in initializeFormData (Comptes a Pouvoir and Fraud)

**File:** `src/hooks/useProjectForm.ts`

Many fields defined in `ProjectFormData` are missing from `initializeFormData()`, so their saved values are never loaded from the database:

**Comptes a Pouvoir fields (all `comptesaPouvoir_*`):**
- `comptesaPouvoir_rawtc_impact`, `_deficiencies`, `_infrequent`, `_competence`, `_complex`, `_prior_deficiencies`, `_changes`, `_judgments`, `_other`
- `comptesaPouvoir_rawtc_significant`, `comptesaPouvoir_assessed_rawtc`
- `comptesaPouvoir_procedures`, `comptesaPouvoir_procedures_description`
- `comptesaPouvoir_period_start`, `comptesaPouvoir_period_end`
- `comptesaPouvoir_extent_description`, `comptesaPouvoir_internal_info`
- `comptesaPouvoir_sample_size`, `comptesaPouvoir_increased_sample`
- `comptesaPouvoir_unpredictability`, `comptesaPouvoir_sampling_tool`
- `comptesaPouvoir_generate_template`, `comptesaPouvoir_attach_documentation`
- `comptesaPouvoir_deviations`, `comptesaPouvoir_test_result`, `comptesaPouvoir_period_result`

**TOE extra fields:**
- `comptesAPouvoir_gitc_rawtc_assessment`
- `comptesAPouvoir_timing_procedures`
- `comptesAPouvoir_extent_procedures`
- `comptesAPouvoir_sample_size`
- `comptesAPouvoir_test_operating_effectiveness`

**Fraud Risk Assessment:**
- `high_risk_criteria_items`

**Fix:** Add all these fields to `initializeFormData()` reading from `(projectData as any).fieldName || defaultValue`.

---

## Summary of Changes

| File | Change |
|---|---|
| `src/types/formData.ts` | Add `di_rafit_rows` and `di_operator_rows` to `ProjectFormData` and `getInitialFormData()` |
| `src/hooks/useProjectForm.ts` | Fix D&I hardcoded defaults (Issue 1) and add all missing field initializations (Issue 3) |
| `src/components/ProjectEdit/DISection.tsx` | Replace local `useState` tables with `formData` props (Issue 2) |

## Technical Details

- The `handleSave` function already spreads all of `formData` (`...formData`) when saving, so any field in the state will be written to the database. The problem is exclusively on the **loading side** -- fields not in `initializeFormData` get reset to defaults on load.
- Total: approximately 30+ fields that need to be connected properly.
- No database schema changes needed -- Firebase/Firestore is schemaless, so all these fields will be stored as-is in the project document.

