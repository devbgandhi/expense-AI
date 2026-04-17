# Expense AI - Frontend Setup

## 📱 Mobile App with React Native (Expo)

This is a React Native app built with Expo for capturing and tracking expenses via receipt photos.

## Prerequisites

- **Node.js** (v16+)
- **Expo CLI**: `npm install -g expo-cli`
- **Android Emulator** or **iOS Simulator**
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator)

## Installation

```bash
# Navigate to the project directory
cd expense-AI

# Install dependencies
npm install

# (Already done) Install Expo Camera
npm install expo-camera
```

## Project Structure

```
expense-AI/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Main home screen with recent expenses
│   │   ├── CameraScreen.tsx      # Camera capture functionality
│   │   └── ReviewScreen.tsx      # Receipt details review & editing
│   └── components/               # (To be added) Reusable components
├── App.tsx                        # Main app with screen navigation
├── package.json
├── tsconfig.json
└── index.ts
```

## Running the App

### Android Emulator

```bash
npm run android
```

This will:

1. Start the Expo development server
2. Build the APK
3. Install and launch the app on Android Emulator

### iOS Simulator (macOS only)

```bash
npm run ios
```

### Web (for testing UI, but no camera access)

```bash
npm run web
```

### Development Server

```bash
npm start
```

Then press:

- `a` for Android
- `i` for iOS
- `w` for web

## Features Implemented

### ✅ Home Screen

- Display app title and greeting
- "Capture Receipt" CTA button
- Stats cards (Total Expenses, This Month)
- Recent expenses list

### ✅ Camera Screen

- Full camera view with focus frame overlay
- Capture photo button with loading indicator
- Photo preview with Retake/Confirm options
- Camera permission handling

### ✅ Review Screen

- Display captured receipt image
- Manual form to edit extracted data:
  - Merchant name
  - Amount
  - Date
  - Category (Food, Transport, Shopping, etc.)
- Cancel/Save buttons

### ✅ Navigation

- Simple state-based navigation (Home → Camera → Review → Home)
- Local storage of expenses in app state

## Next Steps

1. **Backend Integration** (FastAPI + Tesseract OCR)
   - Set up FastAPI server
   - Implement OCR image processing
   - Create API endpoint for expense extraction
   - Implement automatic categorization

2. **Image Upload**
   - Connect ReviewScreen to backend
   - Send image + form data to FastAPI
   - Display extracted data pre-filled in ReviewScreen

3. **Database Integration**
   - Set up PostgreSQL or Supabase
   - Implement persistent data storage
   - Add expense history queries

4. **Analytics Dashboard**
   - Create charts/graphs for spending patterns
   - Category breakdown views
   - Monthly/weekly summaries

## Debugging Tips

### Permission Issues

If the app doesn't access the camera:

1. Check permissions in device settings
2. Restart the emulator
3. Check app logs: `expo start` and look for permission errors

### Hot Reload

The app supports hot reloading in development:

- Save changes and they'll auto-reload
- For camera permissions changes, restart the app

### Logs

View logs while developing:

```bash
expo start --clear
```

## Common Issues

### "Camera permission denied"

- Android: Grant permissions when prompted
- iOS: Go to Settings > Expense AI > Camera > Allow

### App crashes on camera open

- Ensure `expo-camera` is installed
- Restart Expo server: `npm start`
- Clear cache: `npm start -- --clear`

### "CameraView is not defined"

- Make sure `expo-camera` package is installed
- Run `npm install expo-camera` if needed

## Environment Variables

Create a `.env.local` file (not committed to git):

```
BACKEND_URL=http://192.168.1.100:8000
```

Then use in code:

```typescript
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
```

## TypeScript

The project uses TypeScript for type safety. Key type definitions:

```typescript
interface ExpenseData {
  merchant: string;
  amount: string;
  date: string;
  category: string;
  imageUri: string;
}
```

## Performance Tips

- Keep images at 0.8 quality (reduced file size)
- Compress images before upload
- Use lazy loading for expense lists
- Implement pagination for many expenses

## Resources

- [Expo Camera Docs](https://docs.expo.dev/versions/latest/sdk/camera/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TypeScript with React Native](https://reactnative.dev/docs/typescript)

## Support

For issues or questions:

1. Check the logs in Expo server
2. Review the provided TypeScript types
3. Check browser console for web version: `npm run web`
