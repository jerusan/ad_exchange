import * as React from "react";
import { render } from "react-dom";
import CampaignDetails from "./CampaignDetails";
import AddCampaignForm from "./AddCampaignForm";

import LoggedOut from "./LoggedOut";
import { useAuth, AuthProvider } from "./useAuthClient";
import LoggedIn from "./LoggedIn";

function AuthApp() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <header id="header">
        <section id="status" className="toast hidden">
          <span id="content"></span>
        </section>
      </header>
      <main id="pageContent">
        {isAuthenticated ? <LoggedIn />: <LoggedOut />}
      </main>
    </>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <AuthApp />
    </AuthProvider>
  );
}

render(<App />, document.getElementById("app"));
