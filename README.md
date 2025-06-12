# Smart Study Assistant

A multi-platform learning application that helps students and learners manage their study time, take notes, review with flashcards, practice for exams, and interact with an AI assistant.

## Features

- AI Study Assistant
- Smart Notes
- Flashcards
- Study Planner
- Question bank and test preparation
- Notifications and learning motivation
- User Authentication

## Tech Stack

### Backend
- Node.js & Express
- Firebase Authentication
- Firebase Firestore
- Google ML Kit

### Mobile App
- React Native
- React Navigation
- Firebase SDK

## Project Structure

```
/smart-study-assistant
├── /backend                      # Backend server (Node.js & Express)
│   ├── /controllers             # API controllers
│   ├── /models                  # Data models
│   ├── /routes                  # API routes
│   ├── /services                # Business logic services
│   └── /config                  # Backend configuration
│
├── /mobile-app                   # React Native mobile app
│   ├── /src
│   │   ├── /components          # Reusable UI components
│   │   ├── /screens            # App screens
│   │   ├── /services           # API services
│   │   └── /navigation         # Navigation configuration
│
├── /database                     # Database configuration
│   ├── /config                  # Firebase config
│   └── /repositories           # Data access layer
│
├── /external-services           # External service integrations
│   ├── /ml-kit                 # Google ML Kit integration
│   └── /notifications          # Firebase Cloud Messaging
│
└── /tests                       # Test suites
    ├── /unit-tests             # Unit tests
    └── /integration-tests      # Integration tests
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create `.env` file in the root directory
   - Add required environment variables (see `.env.example`)

4. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. # study-assistant-app
