import React, { useState } from "react";
import { useAuth } from "./useAuthClient";
import AddCampaignForm from "./AddCampaignForm";
import CampaignDetails from "./CampaignDetails";
import "./LoggedIn.css";

const LoggedIn = () => {
    const { principal, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('search'); // 'search' or 'create'

    const [principalVal, setPrincipal] = React.useState("");
    const [copyStatus, setCopyStatus] = React.useState(''); // For copy feedback

    React.useEffect(() => {
        console.log('principal', principal);
        if (principal) {
            setPrincipal(principal.toString());
        }
    }, [principal]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(principal);
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus(''), 2000); // Clear status after 2 seconds
        } catch (err) {
            setCopyStatus('Failed to copy');
            setTimeout(() => setCopyStatus(''), 2000);
        }
    };
    
    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <h1>Ad Exchange Platform</h1>
                    <div className="header-right">
                        <div className="principal-id">
                            <span className="principal-label">Principal ID:</span>
                            <div className="principal-value-container">
                                <span className="principal-value" title={principalVal}>
                                    {principalVal ? `${principalVal}` : ''}
                                </span>
                                <button 
                                    className="copy-button" 
                                    onClick={handleCopy}
                                    title="Copy full Principal ID"
                                >
                                    {copyStatus || 'Copy'}
                                </button>
                            </div>
                        </div>
                        <button onClick={logout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <div className="tabs">
                    <button 
                        className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        Search Campaigns
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create Campaign
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'search' ? (
                        <CampaignDetails />
                    ) : (
                        <AddCampaignForm />
                    )}
                </div>
            </main>
        </div>
    );
};

export default LoggedIn;