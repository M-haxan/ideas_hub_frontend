# 💡 Ideas Hub - Innovation Sharing Platform

**Ideas Hub** is a full-stack social platform designed for innovators to share, discuss, and refine their creative ideas. It features a robust authentication system, real-time interactions, and a hierarchical commenting system to foster community collaboration.

---

## 🚀 Key Features

### 🔐 Authentication & Security
* **Secure Login/Signup:** JWT-based authentication using HTTP-only cookies.
* **Google OAuth:** Seamless social login integration.
* **Session Management:** Automatic token refresh via Axios Interceptors to maintain user sessions without interruption.
* **Protected Routes:** Role-based access control ensuring secure navigation.

### 📝 Idea Management
* **Create & Edit:** Markdown-supported rich text editor for detailed idea descriptions.
* **Image Uploads:** Integrated with **Cloudinary** for handling multiple image attachments.
* **Dashboard:** Personalized dashboard to manage (Edit/Delete) your own posts.
* **Public Feed:** Filtered feed to explore ideas from other community members.

### 💬 Community Interaction
* **Voting System:** Real-time upvote mechanism to highlight popular ideas.
* **Recursive Comments:** Facebook-style nested commenting system (Tree Structure) allowing infinite reply depth.
* **Optimistic UI:** Instant feedback on likes and comments using React Query for a snappy user experience.

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React.js, Vite, JavaScript (ES6+) |
| **Styling** | Tailwind CSS |
| **State Management** | Zustand (Auth Store), TanStack Query (Server State) |
| **API Integration** | Axios (with Interceptors) |
| **Routing** | React Router DOM v6 |
| **Backend** | Python FastAPI (Integrated) |
| **Database** | PostgreSQL / SQLAlchemy |
