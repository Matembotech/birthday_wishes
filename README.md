# 🎂 Birthday Wishes App

A beautiful, interactive web application built to create personalized, AI-generated birthday wishes for your loved ones. The application allows users to upload a photo, select a relationship, and generate a unique shareable link featuring a dark-themed, animated, and luxurious celebration page.

## ✨ Features

- **Dynamic UI & Animations**: Built with React and Framer Motion for stunning entry animations, floating particles, glowing borders, and interactive micro-interactions.
- **Image Uploads**: Direct-to-Cloudinary unsigned image uploads to ensure fast and secure media hosting.
- **AI-Powered Messages**: Integrates with Google's Gemini 1.5 Flash API to automatically generate three heartfelt, contextual birthday messages in Swahili based on the recipient's name and relationship.
- **Shareable Links**: Stores the generated wishes in a Supabase PostgreSQL database and creates a unique `URL` for each recipient.
- **Responsive Design**: Looks gorgeous on both desktop and mobile devices.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS (v4)
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Media Storage**: Cloudinary REST API
- **AI Integration**: Google Generative AI (`@google/generative-ai`)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/Matembotech/birthday_wishes.git
cd birthday_wishes
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root of the project by duplicating the provided `.env.example` file. 

```bash
cp .env.example .env
```

Fill in the required keys:
- `VITE_CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name.
- `VITE_CLOUDINARY_UPLOAD_PRESET`: Your Unsigned Upload Preset name.
- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Project API Key.
- `VITE_GEMINI_API_KEY`: Your Gemini API Key from Google AI Studio.

### 4. Database Setup (Supabase)

To allow the application to store and retrieve wishes, you must create the `wishes` table in your Supabase SQL Editor. 

Run the following SQL snippet in your Supabase dashboard:

```sql
create table wishes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  relationship text not null,
  image_url text not null,
  message_1 text,
  message_2 text,
  message_3 text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Allow public insert and read access
alter table wishes enable row level security;
create policy "Allow public insert" on wishes for insert with check (true);
create policy "Allow public read" on wishes for select using (true);
```

### 5. Run the Application

Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🎨 Design System

The application utilizes a tailored design system:
- **Creator Form**: "Warm Celebration" aesthetic (`#FFF9F0` background, Coral, Yellow, and Teal accents).
- **Recipient Page**: "Dark Magical" aesthetic (`#1A1A2E` gradient background, Glassmorphism cards, glowing avatars).
- **Typography**: Playfair Display (Headings), DM Sans (Body), Dancing Script (Accents).

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Built By

Built with ❤️ by **Matembo Tech**.
