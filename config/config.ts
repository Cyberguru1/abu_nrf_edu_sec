interface Env {
  WS_URL: string;
  API_BASE_URL: string;
}

export const env: Env = {
  WS_URL: process.env.NEXT_PUBLIC_WS_URL as string,
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL as string,
};

(() => {
  const missingVars: string[] = [];

  if (!process.env.NEXT_PUBLIC_WS_URL) {
    console.warn('WS_URL not found in environment, using default value');
    missingVars.push("NEXT_PUBLIC_WS_URL");
  }
  if (!process.env.NEXT_PUBLIC_API_BASEURL) {
    console.warn('env.API_BASE_URL not found in environment, using default value');
    missingVars.push("NEXT_PUBLIC_env.API_BASE_URL");
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
})();
