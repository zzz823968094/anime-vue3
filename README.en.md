# Anime Vue3

An anime video website management system built with Vue 3.

## Project Overview

Anime Vue3 is a feature-rich frontend application for an anime video website, developed using the Vue 3 + Vite technology stack. The system consists of two main modules: a user-facing frontend and an administrative backend, supporting anime browsing, video playback, search, user management, and data crawling functionalities.

## Technology Stack

- **Frontend Framework**: Vue 3  
- **Build Tool**: Vite  
- **State Management**: Pinia  
- **Routing**: Vue Router  
- **Internationalization**: vue-i18n  
- **UI**: Custom components  
- **Deployment**: Docker  

## Project Structure

```
├── src/                    # Main Vue 3 application
│   ├── api/               # API interfaces
│   ├── components/        # Reusable components
│   │   ├── AnimeCard.vue  # Anime card component
│   │   ├── Footer.vue     # Footer component
│   │   ├── NavBar.vue     # Navigation bar component
│   │   └── Pager.vue      # Pagination component
│   ├── views/             # Page views
│   │   ├── HomeView.vue   # Home page
│   │   ├── DetailView.vue # Detail page
│   │   ├── PlayerView.vue # Player page
│   │   ├── SearchView.vue # Search page
│   │   ├── UserView.vue   # User page
│   │   └── LoginView.vue  # Login page
│   ├── stores/            # Pinia state management
│   │   ├── auth.js        # Authentication state
│   │   ├── i18n.js        # Internationalization configuration
│   │   └── theme.js       # Theme state
│   ├── router/            # Routing configuration
│   ├── App.vue            # Root component
│   └── main.js            # Entry file
├── admin/                  # Admin backend frontend
├── index.html              # Main application entry HTML
├── vite.config.js          # Vite configuration
├── Dockerfile              # Docker image build script
├── docker-compose.yml      # Docker Compose configuration
└── deploy.sh               # Deployment script
```

## Features

### User Frontend
- 🎬 Anime browsing and display  
- 🔍 Keyword search and trending search terms  
- ▶️ Video player  
- 👤 User profile center  
- 📱 Responsive design  

### Admin Backend
- 📊 Data statistics dashboard (anime count, video count, user count, visits, etc.)  
- 📈 UV trend analysis  
- 🎯 Category distribution statistics  
- 🔄 Crawler management  
- 👥 User management  
- 📝 Anime management  
- 🔍 Search management  

## Quick Start

### Prerequisites

- Node.js 18+  
- npm or yarn  

### Install Dependencies

```bash
npm install
```

### Run in Development Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Deploy with Docker

Start services using Docker Compose:

```bash
docker-compose up -d
```

After startup, services will be available at:
- Main App: http://localhost:3000

## Directory Overview

| Directory | Description |
|-----------|-------------|
| `src/api` | Encapsulated API requests |
| `src/components` | Reusable Vue components |
| `src/views` | Page-level components |
| `src/stores` | Pinia state management |
| `src/router` | Routing configuration |
| `admin/` | Admin backend static assets |

## License

This project is intended solely for learning and communication purposes.

## Contribution Guidelines

Issues and pull requests are welcome.