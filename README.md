This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Run this command in supabase sql editor to ensure that on sign up user gets added to DB
-- 1. Create a function that handles copying the user profile row
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (uid, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (uid) do update
  set email = excluded.email,
      name = excluded.name;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Bind this function to run automatically every time a user signs up
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();




## Run this command to add created at COLUMN in job logs table 
ALTER TABLE job_logs 
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

## ENvironment Variables used 
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BACKEND_API_URL=

## Prompt

You are an expert Frontend Architect and UI Developer. I will provide you with a frontend component's code (HTML/CSS, React, Tailwind, etc.). Your goal is to **deeply redesign** this component so that it perfectly captures the structural DNA, spacing system, and visual vibe of a target reference design, without losing any of its original functionality.

### 1. The Core Vibe & Aesthetic
* **The Vibe:** Clean, ultra-minimal, organic tech, calming, and premium. It feels approachable yet highly polished, using a soft, low-contrast canvas mixed with high-contrast structural focal points.
* **The Background Environment:** Soft, warm off-white/light gray (e.g., `#EFEFEC` to `#F7F7F7`). The primary app interface uses pure white surfaces stacked over this soft background.

### 2. Spacing & Spatial Geometry (Critical for the "Vibe")
* **The Box Model:** Generous, expansive white space. Elements must never feel cramped. Use wide paddings inside containers (e.g., `padding: 2.5rem` to `3rem`) and ample vertical margins between groups to let the design breathe.
* **Alignment:** Perfectly centered layouts. Content groups should be stacked vertically with strict, balanced alignment.
* **Border Radii:** Highly rounded, smooth geometry. Outer containers and screen frames use massive corner smoothing (e.g., `border-radius: 32px` to `40px`). Buttons, input fields, and interactive tabs use mid-to-high roundness (e.g., `border-radius: 16px` to `24px` / full pills).

### 3. Precision Color Palette
* **Primary Forest Accent:** `#283711` (A deep, elegant forest green. Used for heavy primary buttons, main headers, and dominant text).
* **Secondary Lime Accent:** `#93E963` (A vibrant, fresh lime green. Used as a high-visibility background for active selections, accent tabs, or secondary states).
* **Neutral Surfaces:** * `#FFFFFF` (Pure White: Used for the primary container card backgrounds).
    * `#EFEFEC` (Soft Gray: Used for neutral, non-primary action items, secondary buttons, and input tracks).
* **Typography/Icons:**
    * Primary Text: `#283711` (Deep Forest)
    * Muted/Placeholder Text: `#BDBDBB` (Soft, desaturated gray for secondary copy and input helpers).

### 4. Element Specific Art-Direction
* **Typography Hierarchy:** Large, confident, semi-bold titles (`#283711`) contrasted immediately against small, center-aligned, highly legible secondary body text using the muted gray. 
* **Buttons:** * *Primary CTA:* Solid Forest Green (`#283711`) background with crisp white or high-contrast text.
    * *Active/Highlighted Option:* Solid Lime Green (`#93E963`) background with dark forest text.
    * *Secondary/OAuth Buttons:* Neutral Soft Gray (`#EFEFEC`) background with dark forest text and left-aligned, simple minimalist icons.
* **Form Inputs:** Full-width, pill-shaped or softly rounded inputs with a solid white or ultra-light background. Placeholders and simple line-art icons must be perfectly centered or cleanly integrated with generous internal padding.
* **Illustrations & Icons:** If the component uses graphics, pivot toward clean, minimalist, pure black-and-white line-art illustrations with open paths and generous negative space.
* **Progress Indicators:** Thin, structural segmented bar lines using the signature lime green for active steps and light gray for inactive steps.

---

### Redesign Instructions & Guardrails

1.  **Do Not Just Swap Colors:** Restructure the layout variables, margins, paddings, and border-radii to match the structural rules defined above. The layout density must match the reference vibe.
2.  **Preserve All Functionality (CRITICAL):**
    * Do NOT modify, rename, or remove any JavaScript/framework state variables (e.g., `useState`, `v-model`, data hooks).
    * Do NOT break any event handlers (`onClick`, `onChange`, `onSubmit`). 
    * All dynamic data properties, props, and conditional rendering logic must remain completely intact—only the visual markup and CSS/Tailwind classes wrapping them should change.
3.  **Code Output:** Output only the clean, updated, fully refactored component code.

Here is the frontend component code to redesign:

[PASTE YOUR COMPONENT CODE HERE]