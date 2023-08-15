import * as React from "react";
import { render } from "react-dom";
import { Principal } from "@dfinity/principal";
import { ad_exchange_backend } from "../../declarations/ad_exchange_backend/index";
import Modal from "react-modal";

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

const AddCampaignForm = () => {
  const [inputs, setInputs] = React.useState({});

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const setBase64Image = (base64Image) => {
    inputs.base64Img = base64Image
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const campaign = {
      advertiser: Principal.fromText(inputs.advertiser),
      bid: parseInt(inputs.bid, 10),
      category: inputs.category,
      ad: inputs.ad,
      base_64_img: inputs.base64Img,
    };

    let response = await ad_exchange_backend.create_campaign(campaign);
    alert(response);
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <label>
            Advertiser:
            <input
              name="advertiser"
              value={inputs.advertiser || ""}
              onChange={handleChange}
            />
          </label>

          <label>
            Bid:
            <input
              name="bid"
              type="number"
              value={inputs.bid || 0}
              onChange={handleChange}
            />
          </label>

          <label>
            Category:
            <input
              name="category"
              value={inputs.category || ""}
              onChange={handleChange}
            />
          </label>

          <label>
            Ad:
            <input name="ad" value={inputs.ad || ""} onChange={handleChange} />
          </label>

          <label>
            Image:
            <ImageUpload onImageConvert={setBase64Image} />
          </label>
          <button type="submit">Add Campaign</button>
        </form>
      </div>
    </>
  );
};

const CampaignDetails = () => {
  const [category, setCategory] = React.useState("");
  const [campaign, setCampaign] = React.useState({});

  const changeCategory = (event) => {
    const { name, value } = event.target;
    setCategory(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let adCampaign = await ad_exchange_backend.get_campaign(category);

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

const ImageUpload = ({ onImageConvert }) => {
  const [base64, setBase64] = React.useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    let file = e.dataTransfer.files[0];
    convertToBase64(file);
  };

  const handleChange = (e) => {
    let file = e.target.files[0];
    convertToBase64(file);
  };

  const convertToBase64 = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setBase64(reader.result);
      onImageConvert(reader.result);
    };
  };

  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <p>Add Advert:</p>

      <input type="file" onChange={handleChange} />
    </div>
  );
};

const App = () => {
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
