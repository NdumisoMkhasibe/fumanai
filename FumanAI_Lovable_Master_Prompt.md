# FumanAI -- Master Lovable Prompt (Starter Specification)

> **Product:** FumanAI\
> **Slogan:** *Your Autonomous Dream Job Assistant*

## Mission

FumanAI empowers job seekers by using artificial intelligence to
simplify the job application process. It helps users identify suitable
opportunities, analyze job requirements, and generate personalized
application documents that improve their chances of securing interviews.

## Vision

To become the smartest AI-powered career application assistant, helping
millions of people connect with opportunities that match their skills
and ambitions.

## Branding

-   Official logo: User-provided logo.
-   Primary colour: `#F5E2C9`
-   Secondary colour: `#242423`
-   Headings: Poppins
-   Body: Inter

## Core Principles

-   No sign-up or login.
-   Profiles stored locally using browser local storage.
-   Multiple profiles supported.
-   Last active profile loads automatically.
-   Conversational onboarding ("Let me get to know you").
-   One profile represents one career path.

## Navigation

1.  Home
2.  Job Tracker
3.  Smart Email Generator
4.  Meeting Notes Summarizer
5.  AI Research Assistant
6.  AI Chat
7.  Profile Management
8.  Settings

## Home

If no profiles exist, start conversational onboarding.

Otherwise display:

-   Welcome back
-   Two action cards:
    -   Search Jobs (only if a working API is available)
    -   Paste Job Advertisement

If reliable job-search integration cannot be implemented for the MVP,
remove the Search Jobs option entirely and only support pasting a job
advertisement.

## Generated Outputs

Generate: - ATS-friendly CV - Cover Letter - Application Email

CV and Cover Letter: - PDF - DOCX

Application Email: - Email address (copy) - Subject (copy) - Body (copy)

## CV Structure

1.  Header (Name, Email, Phone)
2.  Professional Summary
3.  Education
4.  Core Skills
5.  Work Experience
6.  Additional Information

Never fabricate qualifications or highlight missing skills.

## Job Tracker

Kanban board with draggable cards.

Columns: - Applied - No Response - Online Assessment - Interview - Offer
Received - Hired - Declined

Cards may move freely between all columns.

## Smart Email Generator

Inputs: - Tone - Prompt

Outputs: - Subject - Email Body

## Meeting Notes Summarizer

-   Summarize notes
-   Extract action items
-   Extract decisions
-   Extract deadlines

## AI Research Assistant

-   Summarize articles
-   Generate insights
-   Generate recommendations

## AI Chat

General-purpose AI assistant with a custom FumanAI greeting.

## Profile Management

-   View Profiles
-   Create Profile
-   Edit Profile
-   Delete Profile
-   Switch Active Profile

## Settings

-   Appearance
-   Responsible AI
-   Privacy
-   Clear Local Data
-   About

## UI

Desktop: - Vertical sidebar

Mobile: - Hamburger navigation

Animations: - Smooth fade transitions

Loading: - Spinner only

## Technical Requirements

-   React
-   TypeScript
-   Tailwind CSS
-   Responsive design
-   Reusable components
-   Central AI service
-   Environment variables for API keys
-   Prefer the AI model/provider with the most generous free-tier tokens
    while maintaining high-quality responses.

## Final Instruction

Build a polished MVP focused on reliability, clean UX, and modular
architecture suitable for future expansion.
