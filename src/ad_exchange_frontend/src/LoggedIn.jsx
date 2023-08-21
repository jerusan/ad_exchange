import React from "react";
import { useAuth } from "./useAuthClient";

const whoamiStyles = {
    border: "1px solid #1a1a1a",
    marginBottom: "1rem",
};

function LoggedIn() {
    const [principalVal, setPrincipal] = React.useState("");

    const { logout, principal } = useAuth();

    React.useEffect(() => {
        setPrincipal(principal);
    }, [principal]);

    return (
        <>
            <div className="container">
                <h1>Internet Identity Client</h1>
                <h2>You are authenticated!</h2>
                <h3>Your identity: </h3>
                <input type="text" value={principalVal} placeholder="ID" style={whoamiStyles} readOnly />
            </div>
            <button id="logout" onClick={logout}>
                log out
            </button>
        </>
    );
}

export default LoggedIn;