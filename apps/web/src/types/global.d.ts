declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL?: string;
      NEXT_PUBLIC_APP_NAME?: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }

  interface WindowEventMap {
    "auth:unauthorized": CustomEvent<void>;
  }
}

export {};
