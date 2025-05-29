# TalentFilterAI

## Overview

TalentFilterAI is a platform designed to help recruiters and hiring managers filter and shortlist candidates based on job requirements, utilizing AI-powered email parsing with Postmark.

Recruiters can create jobs by providing a job title, description, qualifications, and requirements. Once applications are sent to the platform through Postmark Inbound Parse Feature, they are parsed, and the applicant is added to the database.

The AI parses the email to match the applicant to a job. It then analyzes the job's qualifications and requirements alongside the applicant's details to determine if the applicant meets the specified criteria.

As a recruiter, you can view applicants and their applications, and then shortlist them. The platform provides a list of applicants per job, indicating whether they have passed or failed the job requirements.

## Installation

1. Clone the repository
2. Run `npm install --legacy-peer-deps` to install the dependencies
3. Run `npm run dev` to start the development server

## Environment Variables

```
APP_NAME="TalentFilterAI"

TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
OPENAI_API_KEY=

R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET_NAME=
R2_BUCKET_PUBLIC_URL=

POSTMARK_API_TOKEN=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
```
