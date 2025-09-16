
// Type definitions for Chrome extension API
interface Chrome {
  storage: {
    local: {
      get: (keys: string | string[] | object | null, callback?: (items: { [key: string]: unknown }) => void) => void;
      set: (items: object, callback?: () => void) => void;
      remove: (keys: string | string[], callback?: () => void) => void;
      clear: (callback?: () => void) => void;
    };
    sync: {
      get: (keys: string | string[] | object | null, callback?: (items: { [key: string]: unknown }) => void) => void;
      set: (items: object, callback?: () => void) => void;
      remove: (keys: string | string[], callback?: () => void) => void;
      clear: (callback?: () => void) => void;
    };
  };
}

// Declare Chrome as a global variable
declare const chrome: Chrome;
