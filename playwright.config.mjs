import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser', workers:1, timeout:30_000, fullyParallel:false,
 use:{baseURL:'http://127.0.0.1:3100',headless:true,launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,args:['--no-sandbox']}},
 webServer:[
  {command:'node tests/fixture-server.mjs',url:'http://127.0.0.1:4711/health',reuseExistingServer:false,timeout:30_000},
  {command:'npm run start -- --hostname 127.0.0.1 --port 3100',url:'http://127.0.0.1:3100/groom/NGV',reuseExistingServer:false,timeout:30_000,env:{WEDDING_DATABASE_ENABLED:'true',WEDDING_ALLOW_DRAFTS:'false',SUPABASE_URL:'http://127.0.0.1:4711',SUPABASE_SERVICE_ROLE_KEY:'fixture-server-key-not-a-real-credential'}},
  {command:'npm run start -- --hostname 127.0.0.1 --port 3101',url:'http://127.0.0.1:3101/groom/NGV',reuseExistingServer:false,timeout:30_000,env:{WEDDING_DATABASE_ENABLED:'true',SUPABASE_SERVICE_ROLE_KEY:''}},
 ],
});
