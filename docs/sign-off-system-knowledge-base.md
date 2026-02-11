# Sign-Off System & Team Management - Knowledge Base

## Overview
This document provides comprehensive instructions for maintaining and extending the sign-off system and team management functionality in the project.

## Core Components

### 1. Permission System (`src/utils/permissions.ts`)
Contains all role-based permission logic:
- `isDev()`, `isAdmin()`, `isDevOrAdmin()` - Basic role checks
- `getProjectRole()` - Gets user's specific role within a project team
- `isStaffUp()`, `isInChargeUp()`, `isManagerUp()` - Hierarchy checks
- `canEditProject()` - Determines if user can edit project data
- `canSignOffSection()` - Determines if user can sign off sections based on level
- `canViewTeamManagement()` - Team management visibility (dev only)

### 2. Sign-Off Components
- **`SignOffBar.tsx`** - Displays sign-off status and handles sign/unsign actions
- **`SectionWrapper.tsx`** - Wraps sections to add sign-off functionality and lock overlay
- **`ProjectSignOffsSummary.tsx`** - Summary page showing all section sign-offs

### 3. Data Models
- **Project & ProjectFormData types** - Include `signoffs` field as map of section IDs to sign-off data
- **Sign-off data structure**: `{ signed: boolean, signed_by?: string, signed_at?: string, role?: string }`

### 4. Logging System (`src/hooks/useLogging.ts`)
Comprehensive logging for all CRUD operations:
- Sign-off/unsign actions
- Project creation/updates
- Client creation/updates
- Team assignment changes
- Login/logout events

## Adding Sign-Off to New Sections

### Step 1: Update Sidebar Metadata
In `src/pages/ProjectEdit.tsx`, add `signOffLevel` to your section:

```typescript
const sidebarSections = [
  // ... existing sections
  {
    id: 'my-new-section',
    title: 'My New Section',
    active: false,
    number: 'X.',
    signOffLevel: 'incharge' // or 'manager' for higher-level sections
  }
];
```

### Step 2: Wrap Section Content
In `src/components/ProjectEdit/ProjectEditContent.tsx`, wrap your section with `SectionWrapper`:

```tsx
{activeSection === 'my-new-section' && (
  <SectionWrapper
    sectionId="my-new-section"
    formData={formData}
    users={users}
    currentUser={currentUser}
    signOffLevel="incharge" // or 'manager'
    onSignOff={handleSignOffWrapper}
    onUnsign={onUnsign}
  >
    <div className="space-y-8">
      {/* Your section content here */}
    </div>
  </SectionWrapper>
)}
```

### Step 3: Update Sign-Off Summary
The summary page automatically includes all sections with `signOffLevel` defined in `sidebarSections`. No additional work needed.

## Sign-Off Levels

### 'incharge' Level (Default)
- **Who can sign**: In Charge, Manager, Partner, Lead Partner, Lead Developer
- **Who can unsign**: Same roles + dev/admin override
- **Use for**: Standard sections like individual processes, assessments

### 'manager' Level (Restricted)
- **Who can sign**: Manager, Partner, Lead Partner, Lead Developer
- **Who can unsign**: Same roles + dev/admin override  
- **Use for**: Major umbrella sections like "Engagement Management", "Entity-wide Procedures", "Business Processes"

## Team Management Restrictions

### Visibility Rules
- **Team Management section**: Only visible to `dev` users
- **Project editing**: Requires Staff+ role on project team OR dev/admin override
- **Sign-off actions**: Based on section's `signOffLevel` and user's project role

### Implementation Points
- Check `canViewTeamManagement(user)` before showing team management UI
- Check `canEditProject(user, formData)` for overall project edit permissions
- Apply read-only overlay when `!canEditProject()` is true

## Logging Integration

### Automatic Logging Points
All these actions are automatically logged with IP, location, and user details:

1. **Sign-off actions**: Section signed/unsigned
2. **Project CRUD**: Create, update operations  
3. **Client CRUD**: Create, update operations
4. **Team changes**: Assignment additions/removals
5. **Authentication**: Login/logout events

### Adding Logging to New Operations
```typescript
import { useLogging } from '@/hooks/useLogging';

const { logProjectAction, logClientAction, logUserAction } = useLogging();

// Example usage
await logProjectAction.update(projectId, 'Custom action description');
await logClientAction.create(clientId, 'Client created with special params');
```

## Data Initialization

### For Existing Projects
The system handles backward compatibility:
- Missing `signoffs` field defaults to `{}`
- Sign-off data defaults to `{ signed: false }`

### For New Projects
Projects are initialized with empty signoffs in `getInitialFormData()`.

## Security Considerations

### Override Rules
- **Dev users**: Can always view team management, sign/unsign any section
- **Admin users**: Can always sign/unsign any section (but not view team management)
- **Permission inheritance**: Higher roles can perform actions of lower roles

### Validation
- Client-side permissions are enforced but should be backed by server-side rules
- All sign-off state changes are immediately persisted to Firestore
- Logging captures all permission-sensitive actions

## Common Patterns

### Creating a Major Section (Manager+ Sign-off)
```typescript
// In sidebar sections
{ id: 'major-section', title: 'Major Section', signOffLevel: 'manager' }

// In content rendering
<SectionWrapper sectionId="major-section" signOffLevel="manager" {...props}>
  {/* Major section content */}
</SectionWrapper>
```

### Creating a Standard Section (In Charge+ Sign-off)
```typescript
// In sidebar sections  
{ id: 'standard-section', title: 'Standard Section' } // defaults to 'incharge'

// In content rendering
<SectionWrapper sectionId="standard-section" signOffLevel="incharge" {...props}>
  {/* Standard section content */}
</SectionWrapper>
```

### Adding Logging to Custom Operations
```typescript
const handleCustomAction = async () => {
  try {
    // Perform action
    await performAction();
    
    // Log the action
    await logProjectAction.update(projectId, 'Custom action performed');
    
    toast({ title: 'Success', description: 'Action completed' });
  } catch (error) {
    console.error('Action failed:', error);
    toast({ title: 'Error', description: 'Action failed', variant: 'destructive' });
  }
};
```

## Troubleshooting

### Sign-off Not Working
1. Check if `sectionId` in `SectionWrapper` matches the ID in `sidebarSections`
2. Verify `signOffLevel` is consistent between sidebar and wrapper
3. Ensure user has correct project role permissions

### Team Management Not Visible
1. Verify user has `dev` role
2. Check `canViewTeamManagement(user)` returns true

### Logging Not Appearing
1. Ensure `useLogging` hook is imported and used correctly
2. Check network requests for Firebase write operations
3. Verify user permissions for writing to logs collection

## Future Extensions

When adding new functionality:
1. **Always** add appropriate logging
2. **Consider** if sign-off should be required
3. **Implement** proper permission checks
4. **Update** this documentation with new patterns
