# Expo Sweb

React Native app built with Expo, featuring authentication, real-time backend, and cross-platform support.

## Tech Stack

- **Expo Router** - File-based routing
- **Clerk** - Authentication
- **Convex** - Backend & real-time database
- **TanStack Query** - Data fetching & caching
- **NativeWind** - Tailwind CSS for React Native
- **Sentry** - Error tracking
- **i18next** - Internationalization (EN, SK)

## Starting a New Project

```bash
# Clone this repository
git clone https://github.com/swebSi/expo-sweb my-new-project
cd my-new-project

# Install dependencies
npm install

# Update app.json with your project details
# Configure environment variables for Clerk, Convex, and Sentry

# Start development server
npm start
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Scripts

- `npm start` - Start Expo dev server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run ESLint
- `npm run gen:i18n` - Generate i18n translation keys

## Project Structure

- `src/app/` - App routes (Expo Router)
- `src/screens/` - Screen components
- `src/shared/` - Shared components & utilities
- `src/core/` - Core providers & layouts
- `convex/` - Convex backend functions
