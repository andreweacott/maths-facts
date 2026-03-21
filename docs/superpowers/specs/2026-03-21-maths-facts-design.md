# Maths Facts Homework Helper — Design Spec
**Date:** 2026-03-21

## Overview

A locally-hosted web app that helps 10–11 year olds with their weekly maths homework. Each week, students receive a "maths facts" sheet covering one topic (e.g. place value, negative numbers, times tables). Their homework is to create a hand-drawn/written page explaining that topic. The app helps them understand the topic and gives ideas for their page — it does not do the homework for them.

## Stack

| Layer | Technology |
|---|---|
| Frontend + API routes | Next.js (React) |
| Database | SQLite (via Prisma, local file) — migrate to PostgreSQL later |
| AI | Claude API |
| Hosting | Local (this machine) |

## Users

- Multiple users supported
- Account creation is adult-assisted (parent/guardian sets up account and uploads images)
- Each user has:
  - A **profile image** (e.g. a photo of themselves) — shown in the app header/nav when logged in
  - A **maths character** with a chosen name (e.g. "Mathsie") — an uploaded photo or drawing that acts as their guide

## Screens

### 1. Login / Sign Up
- Username and password fields
- New user signup includes (adult-assisted):
  - Profile image — either upload a photo or choose from a built-in library of pre-made character images
  - Character image upload (drawing or photo of their maths character)
  - Character name entry (e.g. "Mathsie")

### 2. Home
- Displays the user's character
- Lists previously completed topics
- Button to start this week's new topic

### 3. New Topic
- Single text area where the user types or pastes the topic name and the teacher's requirements from the homework sheet
- Submit button ("Go!") to proceed

### 4. Chat Screen
The main screen. A chat-style interface where the user's character acts as a guide.

**Layout:**
- Character panel on one side (left or right — user's choice, swappable any time from settings)
  - The character panel has its own independently chosen background (e.g. a colour, pattern, or scene)
- Chat messages on the other side
- The user's messages appear on the opposite side to the character, with their profile image as the avatar
- Landscape background behind the chat area (chosen by user)

**What Mathsie (the character) sends:**
- A plain-English explanation of the topic, pitched at age 10–11
- Diagrams relevant to the topic (e.g. place value chart, number line) — rendered as HTML/CSS by the app based on structured data returned by the Claude API
- Inspiration pictures — sourced from a free image search API (e.g. Unsplash) using search terms suggested by Claude
- Ideas for what to draw and write on the homework sheet, including how to incorporate the character
- Answers to follow-up questions from the user

**What the app does NOT do:**
- Write the homework for the user
- Complete or fill in the homework sheet

## Settings
- **Character position:** toggle between left and right side of chat
- **Chat background:** pick a landscape from a manually curated library of ~10–20 real photos and illustrated/cartoon scenes, bundled with the app
- **Character panel background:** independently chosen background for the character panel (separate from the chat background)

## Profile & Character Images
- **Profile image:** shown in the app header/nav on all pages when the user is logged in; also used as the chat avatar on the user's own messages (cropped to a circle). Set by either uploading a photo or selecting from a built-in library of pre-made character images (~10–20 options, bundled with the app)
- **Character image:** displayed as a static image in the character panel; also used as the avatar on the character's chat messages (cropped to a circle)
- **Character name:** set at signup, displayed in the character panel and used in the character's chat messages
- All images stored on disk and served locally

## Authentication
Session-based authentication using HTTP-only cookies. Passwords stored as bcrypt hashes in PostgreSQL.

## Data Model (outline)

**users** — id, username, password_hash, profile_image_path, character_image_path, character_name, settings (JSON)

**topics** — id, user_id, created_at, raw_input (teacher's description), title

**messages** — id, topic_id, role (user/assistant), content, created_at

## Key Design Principles

- Language and explanations pitched at age 10–11
- Personal character makes the experience feel unique to each user
- Encourages the student to think and create, not copy
- Simple enough for a child to use independently after first setup
