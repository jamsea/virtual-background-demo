import Daily from "@daily-co/daily-js";
import { DailyProvider } from "@daily-co/daily-react-hooks";
import { DailyCallOptions } from "@daily-co/daily-js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

// Account & room settings
const dailyConfig: DailyCallOptions["dailyConfig"] = {
  experimentalChromeVideoMuteLightOff: true,
  useDevicePreferenceCookies: true,
};

const callObject = Daily.createCallObject({
  subscribeToTracksAutomatically: true,
  dailyConfig,
});

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <StrictMode>
    <DailyProvider callObject={callObject}>
      <App />
    </DailyProvider>
  </StrictMode>
);
