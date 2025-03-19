import * as React from "react";
import { useAuth } from "./useAuthClient";
import "./CampaignDetails.css";

const CampaignDetails = () => {
  const [category, setCategory] = React.useState("");
  const [campaign, setCampaign] = React.useState({});
  const [status, setStatus] = React.useState({ message: '', isError: false });

  const { backendActor } = useAuth();

  const changeCategory = (event) => {
    setCategory(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: 'Searching...', isError: false });

    try {
      let adCampaign = await backendActor.get_campaign(category);
      console.log('adCampaign', adCampaign);
      
      // Convert Principal to string if it exists
      if (adCampaign.advertiser) {
        adCampaign = {
          ...adCampaign,
          advertiser: adCampaign.advertiser.toString()
        };
      }
      
      if (Object.keys(adCampaign).length === 0) {
        setStatus({ message: 'No campaign found for this category', isError: true });
      } else {
        setStatus({ message: '', isError: false });
      }
      
      setCampaign(adCampaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      setStatus({ 
        message: 'Error fetching campaign details', 
        isError: true 
      });
    }
  };

  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!campaign.base_64_img) return;

    const img = new Image();
    img.src = campaign.base_64_img;

    img.onload = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const sampledPixels = [];
      for (let i = 0; i < 10; i++) {
        const x = Math.floor(Math.random() * img.width);
        const y = Math.floor(Math.random() * img.height);
        const pixel = ctx.getImageData(x, y, 1, 1).data;

        const sampledData = {
          coordinate: { x, y },
          pixel: { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] }
        };
        sampledPixels.push(sampledData);
      }

      console.log('sampledPixels', sampledPixels);
      await backendActor.verify_ad_interaction(campaign.id, sampledPixels);
    };
  }, [campaign]);

  return (
    <div className="campaign-details-container">
      <div className="search-section">
        <h2>Search Campaign</h2>
        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <div className="search-input-group">
              <input
                id="category"
                type="text"
                name="category"
                value={category}
                onChange={changeCategory}
                className="form-control"
                placeholder="Enter category to search"
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </div>
          </div>
        </form>
        
        {status.message && (
          <div className={`status-message ${status.isError ? 'error' : 'success'}`}>
            {status.message}
          </div>
        )}
      </div>

      {Object.keys(campaign).length > 0 && !status.isError && (
        <div className="details-section">
          <h2>Campaign Details</h2>
          <div className="campaign-grid">
            <div className="info-group">
              <label>Advertiser</label>
              <div className="info-value">{campaign.advertiser || "N/A"}</div>
            </div>

            <div className="info-group">
              <label>Bid Amount</label>
              <div className="info-value">
                {parseInt(campaign.bid, 10) || 0} tokens
              </div>
            </div>

            <div className="info-group">
              <label>Category</label>
              <div className="info-value">{campaign.category || "N/A"}</div>
            </div>

            <div className="info-group">
              <label>Advertisement</label>
              <div className="info-value">{campaign.ad || "N/A"}</div>
            </div>
          </div>

          {campaign.base_64_img && (
            <div className="canvas-container">
              <h3>Advertisement Image</h3>
              <canvas ref={canvasRef} className="ad-canvas" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignDetails;