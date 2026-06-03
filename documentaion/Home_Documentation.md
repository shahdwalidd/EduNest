# documentaion — EduNest (Home + Auth Pages)

## Chapter 1: Main Landing Page (Pre-Login)

### 1.1 Route

**`src/pages/Home.tsx`**

### 1.2 Purpose

The Home page is the **public landing page** shown before the user creates an account or logs in.

### 1.3 UI Composition (Page-level)

`Home` composes the landing sections as separate components:

- `HeroSection`
- `ServicesSection`
- `WhyChooseUsSection`
- `MentorshipsSection`
- `AboutSection`
- `Blog`
- `Testimonials`
- `ContactUsSection`
- `FooterSection`

The page also uses:

- `useHomeImages()` to supply images for the hero/landing visuals.
- constants from `src/utils/constants.ts` for the About section visuals/stats and dummy blog data.

### 1.4 Functional Highlights

- Uses Tailwind utility classes for responsive layout.
- Each block is wrapped into a `<section id="...">` anchor to support in-page navigation:
  - `services`, `why-us`, `mentorships`, `about`, `blogs`, `testimonials`, `contactUs`, `footerSection`

### 1.5 Component interaction overview

- `Home.tsx` is a **composition-only page**.
- It passes data down to section components via props:
  - `HeroSection img={img}`
  - `AboutSection images={ABOUT_IMAGES} stats={[...ABOUT_STATS]}`
  - `Blog dummyBlogs={dummyBlogs}`

---

## Chapter 2: Authentication Pages (Login / Register / Verify / Reset)

> These pages are part of the shared auth flow used before accessing role dashboards.

### 2.1 Login Page

**Route:** `src/pages/Login/Login.tsx`

#### Purpose

Allow a user to sign in with email + password.

#### Key behaviors

- Uses hook: `useLogin()` (`src/hooks/useLogin.ts`)
- Includes:
  - Email input with live validation feedback (green check when email matches regex)
  - Password input with show/hide toggle
  - “Forgot password?” link → `/forgot-password`
  - “Remember me” checkbox
  - Submit button triggers `handleSubmit`

#### Technologies

- `react-router-dom` for `Link`
- Tailwind for UI

---

### 2.2 Register (Sign Up) Page

**Route:** `src/pages/register/Register.tsx`

#### Purpose

Register as **Student or Mentor** using a single screen.

#### Key behaviors

- Uses hook: `useRegisterForm()` (`src/hooks/useRegisterForm.ts`)
- The register form includes a `joinAs` toggle:
  - If `joinAs === "student"`: calls `registerStudent(form.formData)`
  - Else: calls `registerMentor(form.formData)`
- OTP step:
  - On success, it tries to send OTP:
    - stores:
      - `localStorage.setItem("registrationEmail", form.formData.email)`
      - `localStorage.setItem("registrationType", form.joinAs)`
    - calls `sendOtp(form.formData.email)`
  - Then navigates to `navigate("/verify")`
- Error handling includes special handling for “unverified account” cases:
  - if backend indicates not verified, it re-sends OTP and still navigates to `/verify`

#### UI components

Imports from `src/components/register-com/*`:

- `FormHeader`
- `JoinAsToggle`
- `PasswordInput`
- `FirstNameInput`
- `LastNameInput`
- `EmailInput`
- `PhoneInput`
- `SubmitButton`

---

### 2.3 OTP Verify Page

**Route:** `src/pages/verifiy/Verify.tsx`

#### Purpose

Validate the **6-digit OTP** sent to the registered email.

#### Key behaviors

- Uses hook: `useVerifyForm()` (`src/hooks/useVerifyForm.ts`)
- Reads email from `localStorage.getItem("registrationEmail")`.
- If email missing → redirects to `/register`.
- Timer countdown:
  - starts from 120 seconds
  - disables resend until timer ends
- On confirm:
  - runs `handleSubmit()` from `useVerifyForm()`
  - navigates to `/success` after success

#### UI components

From `src/components/verify-com/*`:

- `CodeInput`
- `ConfirmButton`
- `ResendLink`

Uses FontAwesome envelope icon.

---

### 2.4 Forget Password - Step 1 (Request Reset)

**Route:** `src/pages/forgetPass/ForgetPass.tsx`

#### Purpose

Start the password reset by entering email.

#### Key behaviors

- Uses hook: `useForgetPassForm()`
- Submits the request (`form.handleSubmit`)
- UI is built from `src/components/forgetPass-com/*`.
- After successful request, the flow proceeds to the OTP/check step (navigation handled inside the hook or related auth service layer).

---

### 2.5 Forget Password - Step 2 (Enter OTP / Code)

**Route:** `src/pages/forgetPass/CheckEmail.tsx`

#### Purpose

Verify the reset code (OTP) sent to the email.

#### Key behaviors

- OTP UI:
  - 6 separate code inputs
  - auto move to next input
  - backspace moves to previous input
- Timer:
  - 60 seconds countdown
  - resend resets timer and clears OTP inputs
- Calls services:
  - `forgetPasswordVerifyOtp(email, otp)` on confirm
  - `forgetPassword(email)` to resend
- Persists fallback:
  - `localStorage.setItem("resetEmail", email)`
- Navigates to reset page:
  - `/reset-password` with `state: { email }`

---

### 2.6 Reset Password - Step 3 (Set New Password)

**Route:** `src/pages/forgetPass/ResetPassword.tsx`

#### Purpose

Change password after OTP verification.

#### Key behaviors

- Uses hook: `useResetPassForm()`
- Reads email from:
  - `location.state?.email`
  - or `localStorage.getItem("resetEmail")`
- Validates the form with `form.validate()`
- Calls:
  - `forgetResetPassword(email, form.formData.password)`
- On success:
  - navigates to `/reset-success`

---

### 2.7 Reset Success Page

**Route:** `src/pages/forgetPass/ResetSuccess.tsx`

#### Purpose

Inform the user that the reset succeeded and provide a CTA to login.

#### UI behavior

- Shows `Reset successful !!` message
- Provides a button → `navigate("/login")`

---

## Chapter 3: System Architecture (High-level for Auth)

### 3.1 Architecture overview

Auth pages follow a common pattern:

- **Page components** under `src/pages/**`:
  - Render the layout (`BasicLayout`)
  - Use hooks for business logic
- **Hooks** under `src/hooks/**`:
  - Handle form state, validation, API calls
- **Services** under `src/services/**`:
  - Wrap HTTP requests to backend endpoints
- **UI components** under `src/components/**`:
  - Reusable form fields (inputs, headers, buttons)

### 3.2 Local persistence strategy

The auth flow uses `localStorage` for resilience across refresh/navigation:

- `registrationEmail`, `registrationType`
- `resetEmail`

---

## Chapter 4: Technologies Used

- React + TypeScript
- React Router (navigation + redirection)
- Tailwind CSS
- FontAwesome + Lucide (icons)
- react-hot-toast (user feedback)

---

## Chapter 5: Screenshots (placeholders)

> Add real screenshots from the deployed UI and replace placeholders.

- Home page sections
  - `Screenshots/Home/Hero.png`
  - `Screenshots/Home/Services.png`
  - `Screenshots/Home/Mentorships.png`
- Login
  - `Screenshots/Auth/Login.png`
- Register
  - `Screenshots/Auth/Register.png`
- OTP Verify
  - `Screenshots/Auth/VerifyOtp.png`
- Forget password
  - `Screenshots/Auth/ForgotPassword.png`
  - `Screenshots/Auth/CheckEmailOtp.png`
- Reset password
  - `Screenshots/Auth/ResetPassword.png`
  - `Screenshots/Auth/ResetSuccess.png`
