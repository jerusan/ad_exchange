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
          <button className="close-button" type="button">
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </section>
      </header>
      <main id="pageContent">
        {isAuthenticated ? <> <LoggedIn /> <Main /> </>: <LoggedOut />}
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


const Main = () => {
  const [userPage, setUserPage] = React.useState(true);
  return (
    <div style={{ fontSize: "30px" }}>
       <button onClick={() => setUserPage(!userPage)}>
        Toggle for {userPage ? "Advertiser " : "User "} view
      </button>

      {userPage ? (
        <CampaignDetails />
      ) : (
        <AddCampaignForm />
      )}
    </div>
  );
};

render(<App />, document.getElementById("app"));
