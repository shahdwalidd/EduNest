# Documentaion — EduNest (Mentor Sections)

## Chapter 4: Mentor Registration & Verification

### 4.1 Mentor Join Flow (Register)

**Route:** `src/pages/register/Register.tsx`

#### Purpose

This screen enables a user to register as either **Student** or **Mentor**, but it includes the **Mentor** flow logic through the shared form.

#### Key behaviors

- Uses the hook `useRegisterForm()` to manage form state, field validation, and UI toggles.
- On submit:
  - Calls `registerMentor(form.formData)` when `joinAs === "mentor"`.
  - Calls `sendOtp(form.formData.email)` to trigger email OTP delivery.
- Persists registration context:
  - `localStorage.setItem("registrationEmail", form.formData.email)`
  - `localStorage.setItem("registrationType", form.joinAs)`
- Navigates to the OTP verification page: `navigate("/verify")`.

#### Notable components & dependencies

- **UI layout**: `BasicLayout` (`src/components/layout/BasicLayout`)
- **Register UI components**: imported from `src/components/register-com/*`
- **Services**: `registerMentor`, `registerStudent`, `sendOtp` from `src/services/authService.ts`
- **Notifications**: `react-hot-toast`

#### Mentor-only notes

- The form is shared; Mentor vs Student is determined by `joinAs`.

---

### 4.2 Email Verification (OTP Verify)

**Route:** `src/pages/verifiy/Verify.tsx`

#### Purpose

Verifies the 6-digit OTP sent to the email used during registration.

#### Key behaviors

- Reads email from `localStorage.getItem("registrationEmail")`.
- If no email is found, redirects to `/register`.
- Manages:
  - OTP inputs (via `useVerifyForm()`)
  - Timer countdown (120 seconds)
  - Resend OTP and timer reset
- On confirm:
  - `handleSubmit()` runs verification
  - If successful, navigates to `/success`

#### UI components

- `CodeInput`, `ConfirmButton`, `ResendLink` from `src/components/verify-com/*`
- Uses FontAwesome icon `faEnvelope`

---

### 4.3 Forget Password (Mentor users included)

Although this chapter focuses on Mentor docs, the password-reset flow is shared across roles.

#### Route: Start Reset

- `src/pages/forgetPass/ForgetPass.tsx`
- Uses `useForgetPassForm()`.
- Calls the forget-password request.
- Navigates to the OTP/code step.

#### Route: Code Check

- `src/pages/forgetPass/CheckEmail.tsx`
- Uses local OTP state (6 inputs) and timer.
- Calls:
  - `forgetPasswordVerifyOtp(email, otp)`
- Stores `resetEmail` in `localStorage` as a fallback.
- Navigates to `/reset-password`.

#### Route: Change Password

- `src/pages/forgetPass/ResetPassword.tsx`
- Uses `useResetPassForm()`.
- Reads email from:
  - `location.state?.email` OR `localStorage.getItem("resetEmail")`
- Calls `forgetResetPassword(email, form.formData.password)`.
- On success: navigates to `/reset-success`.

#### Route: Reset Success

- `src/pages/forgetPass/ResetSuccess.tsx`
- Shows a confirmation page with a return-to-login CTA.

---

## Chapter 5: Mentor UI System Architecture

### 5.1 Folder structure (Mentor-related)

Mentor features are implemented under these main areas:

- **Mentor pages**
  - `src/pages/mentor-pages/**`
  - Includes:
    - `mentordash/` (Dashboard)
    - `mentorProfile/` (Profile)
    - `mentorMessages/` (Messages)
    - `mentorNotifications/` (Notifications)
    - `mentorSettings/` (Settings)
    - mentorship content CRUD flows (quizzes/tasks/sessions/content/mentorship-detail, etc.)

- **Mentor components**
  - `src/components/mentor-components/**`
  - Includes:
    - `mentor-dash-com/` (Dashboard widgets)
    - `mentor-message-com/` (Chat UI)
    - `mentor-notifications-com/` (Notification UI)
    - `mentor-profile-com/` (Profile UI)
    - `mentor-setting-com/` (Settings UI)

- **Mentor services**
  - `src/services/mentorDashboardService/**`
  - `src/services/Mentorprofileservice.ts`
  - `src/services/Mentorsettingsservice.ts`

- **Mentor hooks**
  - Examples:
    - `src/pages/mentor-pages/mentordash/hooks/useDashboardData.ts`
    - `src/hooks/Usementorprofile.ts`
    - `src/hooks/Usementorsettings.ts`
    - `src/hooks/Usedirectchat.ts`, `src/hooks/Useroomchat.ts`

---

### 5.2 Component communication patterns

The Mentor UI follows a predictable pattern:

1. **Page** (`src/pages/mentor-pages/.../*.tsx`)
   - Composes multiple Mentor UI components.
   - Owns route-level UI concerns (layout, navigation, screen-level modals).

2. **Hooks**
   - Data fetching and transformation live in hooks:
     - `useDashboardData()` for dashboard
     - profile/settings hooks for mentor profile updates
     - chat hooks for message state

3. **Services**
   - Hooks call services under `src/services/**`.
   - Services expose request helpers (e.g. `getMentorDashboard`, `updateMentorProfile`).

4. **UI components**
   - Pure components accept typed props (e.g. chart data, notifications list, pagination handlers).

---

## Chapter 6: Technologies Used

### 6.1 Core Technologies

- **React + TypeScript** (`.tsx`, `.ts`)
- **Vite** (project build tooling)
- **React Router** (`useNavigate`, `useLocation`)
- **Tailwind CSS** for styling (utility classes throughout)
- **Lucide React** for icons
- **FontAwesome React** for specific OTP/UX iconography

### 6.2 Data & State Management

- **React Query** (`@tanstack/react-query`)
  - Used in Mentor hooks such as `src/hooks/useMentorships.ts`.

- **Auth store**
  - `src/store/authStore.ts` is used for token hydration and logout redirects.

- **WebSockets**
  - Dashboard uses `useNotificationsSocket` (mentor dashboard notifications refresh).

---

## Chapter 7: Functional Requirements (Mentor)

### 7.1 Mentor Dashboard

**Route:** `src/pages/mentor-pages/mentordash/MentorDash.tsx`

#### Required capabilities

- Display stat cards (total students, mentorships, rating, revenue)
- Show:
  - Revenue chart
  - Reviews list with pagination
  - Scheduled sessions with pagination
  - Recent notifications/activity with pagination

#### Implementation summary

- Uses `useDashboardData()` hook.
- Renders skeleton while hydration/data are loading.
- Uses dashboard widgets from:
  - `src/components/mentor-components/mentor-dash-com/**`

#### Data fetching architecture

- `useDashboardData.ts` calls:
  - `getMentorDashboard()` for initial load
  - `getDashboardReviews(page)` and `getDashboardSessions(page)` for section pagination
- Service layer:
  - `src/services/mentorDashboardService/dashboard.ts`

---

### 7.2 Mentor Profile

**Route:** `src/pages/mentor-pages/mentorProfile/ProfilePage.tsx`

#### Required capabilities

- View mentor personal information
- Edit sections:
  - Personal Information
  - Bio
  - Links (LinkedIn + GitHub)
- Upload profile image

#### Implementation summary

- Uses `useMentorProfile()` (`src/hooks/Usementorprofile.ts`)
- Uses modal edit UI:
  - Local `EditModal` state inside `ProfilePage.tsx`
- Uses `uploadImage(file)` from the hook.

---

### 7.3 Mentor Messages (Direct + Rooms)

**Route:** `src/pages/mentor-pages/mentorMessages/Messages.tsx`

#### Required capabilities

- Chat list sidebar
- Switching between:
  - Direct messages
  - Group/room messages
- Message sending, editing, deleting
- Create room modal
- Room image modal

#### Implementation summary

- Uses:
  - `useDirectChat()` for direct conversations
  - `useRoomChat()` for rooms
- Virtual conversation support:
  - If navigation provides an email that doesn’t exist as a conversation, it creates a virtual item `direct-new-${email}` and later resolves it.

---

### 7.4 Mentor Notifications

**Route:** `src/pages/mentor-pages/mentorNotifications/NotificationsList.tsx`

#### Required capabilities

- Tabs:
  - All notifications
  - Unread notifications
- Mark as read actions handled via context
- Dismiss/delete actions
- Pagination UI

#### Implementation summary

- Uses `useNotificationsContext()` from `src/context/NotificationsContext.tsx`.
- Local pagination is done by slicing filtered results.
- UI components:
  - `NotificationTabs`
  - `NotificationCard`

---

## Chapter 8: Screenshots

> Screenshot placeholders (add actual images from your running app):

### Mentor Dashboard

- `Screenshots/MentorDashboard.png`

### Mentor Profile

- `Screenshots/MentorProfile.png`

### Mentor Messages

- `Screenshots/MentorMessages.png`

### Mentor Notifications

- `Screenshots/MentorNotifications.png`
