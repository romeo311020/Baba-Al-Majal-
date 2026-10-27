/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SPORTS_DATA_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
