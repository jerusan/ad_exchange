import Modal from "react-modal";
import * as React from "react";
import { useAuth } from "./useAuthClient";
const ImagePopup = ({ imageBase64 }) => {
    const [isOpen, setIsOpen] = React.useState(false);
  
    return (
      <>
        <button onClick={() => setIsOpen(true)}>View Image</button>
  
        <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
          <img src={imageBase64} />
  
          <button onClick={() => setIsOpen(false)}>Close</button>
        </Modal>
      </>
    );
  };
  
  
  
  const CampaignDetails = () => {
    const [category, setCategory] = React.useState("");
    const [campaign, setCampaign] = React.useState({});
    

    const { backendActor } = useAuth();
    const changeCategory = (event) => {
      const { name, value } = event.target;
      setCategory(value);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      let adCampaign = await backendActor.get_campaign(category);
  
      setCampaign(adCampaign);
    };
  
    return (
      <>
        <div>
          <form onSubmit={handleSubmit}>
            <label>
              Category:
              <input
                type="text"
                name="category"
                value={category}
                onChange={changeCategory}
              />
            </label>
            <button type="submit"> Get Campaign</button>
          </form>
        </div>
        <div>
          <h2>Campaign Details</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Advertiser:
              <input
                name="advertiser"
                readOnly
                value={campaign.advertiser || ""}
              />
            </label>
  
            <label>
              Bid:
              <input
                name="bid"
                type="number"
                readOnly
                value={parseInt(campaign.bid, 10) || 0}
              />
            </label>
  
            <label>
              Category:
              <input name="category" readOnly value={campaign.category || ""} />
            </label>
  
            <label>
              Ad:
              <input name="ad" readOnly value={campaign.ad || ""} />
            </label>
            <ImagePopup imageBase64={campaign.base_64_img} />
          </form>
        </div>
      </>
    );
  };

  export default CampaignDetails;