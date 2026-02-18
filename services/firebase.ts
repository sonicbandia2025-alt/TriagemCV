// MOCK IMPLEMENTATION - NO REAL FIREBASE CONNECTION
// This file exists only to satisfy imports if necessary, but logic is handled by services.

export const firebaseConfig = {
  apiKey: "MOCK_KEY",
  authDomain: "mock.firebaseapp.com",
  projectId: "mock-project",
  storageBucket: "mock.appspot.com",
  messagingSenderId: "000000000",
  appId: "mock:app:id"
};

export const auth = {} as any;
export const db = {} as any;

console.log("⚠️ MOCK MODE ACTIVATED: Using LocalStorage instead of Firebase Database.");