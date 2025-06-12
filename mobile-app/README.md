# Smart Study Assistant Mobile App

A React Native mobile application for managing notes, flashcards, and AI-powered study assistance.

## Features

- Create and manage notes
- Create and review flashcards with spaced repetition
- AI-powered study assistance
- Modern and intuitive UI
- Authentication system

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Install iOS dependencies (macOS only):
```bash
cd ios && pod install && cd ..
```

## Running the App

### Android

```bash
npm run android
# or
yarn android
```

### iOS (macOS only)

```bash
npm run ios
# or
yarn ios
```

## Project Structure

```
mobile-app/
  ├── assets/         # Images, fonts, etc.
  ├── components/     # Reusable UI components
  ├── navigation/     # Navigation configuration
  ├── screens/        # Screen components
  │   ├── HomeScreen/
  │   ├── NoteScreen/
  │   ├── FlashcardScreen/
  │   ├── AskAIScreen/
  │   └── AuthScreen/
  ├── services/       # API services
  ├── constants/      # Theme, colors, etc.
  ├── App.tsx         # Root component
  └── package.json
```

## Development

The app follows a modular structure with:

- Screens: Main UI components organized by feature
- Components: Reusable UI components
- Services: API and business logic
- Navigation: Screen navigation configuration
- Constants: Theme and configuration values

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 