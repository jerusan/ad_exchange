import React, { useState } from "react";
import { useAuth } from "./useAuthClient";
import AddCampaignForm from "./AddCampaignForm";
import CampaignDetails from "./CampaignDetails";
import "./LoggedIn.css";

const LoggedIn = () => {
    const { actor, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('search'); // 'search' or 'create'

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <h1>Ad Exchange Platform</h1>
                    <button onClick={logout} className="logout-button">
                        Logout
                    </button>
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