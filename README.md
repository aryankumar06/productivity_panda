# 🐼 Productivity Panda

Effortlessly manage your tasks, habits, and projects with a delightful and intuitive interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/License-None-lightgrey)
![Stars](https://img.shields.io/github/stars/aryankumar06/productivity_panda?style=social)
![Forks](https://img.shields.io/github/forks/aryankumar06/productivity_panda?style=social)
![Top Language](https://img.shields.io/github/languages/top/aryankumar06/productivity_panda)

![Productivity Panda Preview](/preview_example.png)

## ✨ Features

*   ✅ **Intuitive Task Management**: Organize your daily to-dos with support for hierarchical tasks, ensuring clarity and focus on what matters most.
*   🗓️ **Robust Habit Tracking**: Cultivate positive routines with a dedicated habit tracker, helping you build consistency and achieve your long-term goals.
*   📊 **Comprehensive Project Organization**: Structure complex projects with ease, leveraging hierarchical project views and robust data management powered by Supabase.
*   🚀 **Modern User Interface**: Enjoy a smooth and responsive experience built with TypeScript, React, Radix UI, and animated with Framer Motion, featuring drag-and-drop functionality.
*   📈 **Insightful Progress Visualization**: Track your productivity trends and project progress with interactive charts and data visualizations powered by Recharts.

## ⚙️ Installation Guide

Follow these steps to get Productivity Panda up and running on your local machine.

### Prerequisites

Ensure you have the following installed:

*   Node.js (LTS version recommended)
*   npm or Yarn package manager
*   Git

### Step-by-Step Installation

1.  **Clone the Repository**

    Start by cloning the `productivity_panda` repository to your local machine:

    ```bash
    git clone https://github.com/aryankumar06/productivity_panda.git
    cd productivity_panda
    ```

2.  **Install Dependencies**

    Install the project dependencies using your preferred package manager:

    ```bash
    # Using npm
    npm install

    # Or using Yarn
    yarn install
    ```

3.  **Set Up Supabase Backend**

    Productivity Panda uses Supabase for its backend. You'll need to set up a new Supabase project and configure your environment variables.

    *   Go to [Supabase](https://supabase.com/) and create a new project.
    *   Once your project is created, navigate to `Settings > API` to find your `Project URL` and `Anon Public Key`.
    *   Create a `.env` file in the root of your `productivity_panda` directory:

        ```dotenv
        VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
        VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"
        ```
        Replace `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_ANON_PUBLIC_KEY` with your actual Supabase credentials.

    *   **Database Schema Setup**:
        The repository includes several SQL files for setting up the Supabase schema. You can run these directly in your Supabase SQL Editor.
        It's recommended to run them in the following order to ensure proper foreign key relationships:

        ```sql
        -- Create RBAC schema (if needed for user roles)
        -- supabase_rbac_schema.sql

        -- Core tables
        -- supabase_projects_table.sql
        -- supabase_hierarchical_tasks.sql
        -- supabase_habit_tracker.sql

        -- Additional features/fixes
        -- supabase_projects_hierarchy.sql
        -- supabase_projects_hierarchy_fixed.sql
        -- supabase_projects_update.sql
        -- check_projects_table.sql
        ```
        You can also use the Supabase CLI to link your local project and push migrations.

4.  **Run the Development Server**

    Once dependencies are installed and Supabase is configured, you can start the development server:

    ```bash
    # Using npm
    npm run dev

    # Or using Yarn
    yarn dev
    ```

    The application will typically be available at `http://localhost:5173` (or another port if 5173 is in use).

## 🚀 Usage Examples

Productivity Panda provides a clean and interactive interface for managing your productivity.

### Basic Usage

After starting the development server and setting up your Supabase backend, open your browser to the local address (e.g., `http://localhost:5173`).

1.  **Sign Up / Log In**: Create an account or log in using your Supabase credentials.
2.  **Create a Project**: Navigate to the projects section and add your first project.
3.  **Add Tasks**: Within a project, start adding tasks. You can nest tasks to create sub-tasks for better organization.
4.  **Track Habits**: Visit the habit tracker to define new habits and mark them complete daily.
5.  **Visualize Progress**: Check the dashboard for an overview of your tasks, habits, and project progress.

![Productivity Panda Usage Screenshot Placeholder](https://via.placeholder.com/800x450?text=Productivity+Panda+Usage+Screenshot)

### Key Interactions

*   **Drag-and-Drop**: Reorder tasks and projects effortlessly using drag-and-drop functionality.
*   **Filtering & Sorting**: Use the command palette (CMDK) or built-in UI elements to quickly filter and sort your data.
*   **Context Menus**: Right-click or use popovers for quick actions like editing, deleting, or moving items.

## 🗺️ Project Roadmap

Productivity Panda is continuously evolving. Here are some planned features and improvements:

*   **Version 1.1.0 - Enhanced Collaboration**:
    *   Implement real-time collaboration for projects and tasks.
    *   User role management within projects (e.g., viewer, editor).
*   **Version 1.2.0 - Advanced Analytics & Reporting**:
    *   More detailed productivity reports and trend analysis.
    *   Export functionality for tasks and project data.
*   **Future Enhancements**:
    *   Calendar integration for tasks and deadlines.
    *   Mobile application development.
    *   Customizable themes and UI elements.
    *   Integration with other productivity tools.

## 🤝 Contribution Guidelines

We welcome contributions from the community to make Productivity Panda even better!

### Code Style

*   We use ESLint and Prettier for code formatting. Please ensure your code adheres to the configured rules.
*   Run `npm run lint` and `npm run format` before committing.

### Branch Naming Conventions

*   Use descriptive branch names following this pattern:
    *   `feature/your-feature-name` for new features.
    *   `bugfix/issue-description` for bug fixes.
    *   `refactor/description-of-refactor` for code refactoring.
    *   `docs/documentation-updates` for documentation changes.

### Pull Request Process

1.  Fork the repository and create your branch from `main`.
2.  Ensure your code passes all linting and testing requirements.
3.  Write clear, concise commit messages.
4.  Open a pull request (PR) to the `main` branch.
5.  Provide a detailed description of your changes in the PR, including any relevant screenshots or steps to reproduce if it's a bug fix.
6.  Be responsive to feedback during the review process.

### Testing Requirements

*   All new features should ideally be accompanied by relevant unit or integration tests.
*   Ensure existing tests pass before submitting a PR.

## 📄 License Information

This project is currently **unlicensed**.

© 2023 aryankumar06. All rights reserved.

As this project has no explicit license, by default, all rights are reserved. This means you may not distribute, modify, or use this software without explicit permission from the copyright holder.
