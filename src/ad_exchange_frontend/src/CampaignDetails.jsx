import Modal from "react-modal";
import * as React from "react";
import { useAuth } from "./useAuthClient";

const ImagePopup = ({ campaignID, challenge, imageBase64 }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { backendActor, identity } = useAuth();

  const sendAdInteractionProof = async () => {
    // TODO: Ad interaction proof logic
    const message = Buffer.from(challenge);
    const messageSigned = await identity.sign(message).then(Buffer.from)
    console.log('signature', messageSigned.toString('hex'))

    // Send signed challenge to backend to get the ICP token
    let response = await backendActor.verify_ad_interaction(campaignID, messageSigned.toString('hex'));
    console.log("Verified ad interaction response:", response);
  }

  React.useEffect(() => {

    if (isOpen) {
      // // Modal just opened
      console.log("ad campaign visible", "challenge: ", challenge);
      sendAdInteractionProof().catch(console.error);
    }
  }, [isOpen]);

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


  const { backendActor, identity } = useAuth();
  const changeCategory = (event) => {
    const { name, value } = event.target;
    setCategory(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let adCampaign = await backendActor.get_campaign(category);
    console.log("Campaign details:", adCampaign);
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
          <ImagePopup imageBase64={campaign.base_64_img} challenge={campaign.challenge} campaignID={campaign.id} />
        </form>
      </div>
    </>
  );
};

export default CampaignDetails;