import { PlaywrightTestConfig } from "@playwright/test"
const config: PlaywrightTestConfig = {
  globalSetup: 'global-setup.ts'
}

export default config
