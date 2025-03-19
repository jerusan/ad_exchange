import { Principal } from "@dfinity/principal";
import { useAuth } from "./useAuthClient";
import * as React from "react";
import "./AddCampaignForm.css";  // We'll create this file next

const AddCampaignForm = () => {
  const [inputs, setInputs] = React.useState({});
  const [status, setStatus] = React.useState({ message: '', isError: false });
  const { ledgerActor, ledgerCanisterID, backendActor } = useAuth();

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
    setStatus({ message: '', isError: false });

    try {
      if (!inputs.bid || !inputs.category || !inputs.ad || !inputs.base64Img) {
        throw new Error('Please fill in all fields');
      }

      const campaign = {      
        bid: parseInt(inputs.bid, 10),
        category: inputs.category,
        ad: inputs.ad,
        base_64_img: inputs.base64Img,
      };

      const to_principal = {
        owner: Principal.fromText("bkyz2-fmaaa-aaaaa-qaaaq-cai"),
        subaccount: [], 
      }

      const transferArgs = {
        memo: [],
        from_subaccount: [],
        to: to_principal,
        fee: [],
        amount: campaign.bid,
        created_at_time: []
      };

      setStatus({ message: 'Processing transfer...', isError: false });
      
      let transferResult = await ledgerActor.icrc1_transfer(transferArgs);
      
      if ('Ok' in transferResult) {
        setStatus({ message: 'Creating campaign...', isError: false });
        let response = await backendActor.create_campaign(campaign);
        setStatus({ 
          message: 'Campaign created successfully!', 
          isError: false 
        });
        
        // Clear form
        setInputs({});
        
      } else {
        throw new Error('Transfer failed: ' + JSON.stringify(transferResult.Err));
      }
      
    } catch (error) {
      setStatus({ 
        message: `Error: ${error.message || 'Something went wrong'}`, 
        isError: true 
      });
    }
  };

  return (
    <div className="campaign-form-container">
      <h2>Create New Campaign</h2>
      
      {status.message && (
        <div className={`status-message ${status.isError ? 'error' : 'success'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="campaign-form">
        <div className="form-group">
          <label htmlFor="bid">Bid Amount:</label>
          <input
            id="bid"
            name="bid"
            type="number"
            value={inputs.bid || 0}
            onChange={handleChange}
            className="form-control"
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <input
            id="category"
            name="category"
            value={inputs.category || ""}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g., Technology, Fashion, Food"
          />
        </div>

        <div className="form-group">
          <label htmlFor="ad">Ad Text:</label>
          <textarea
            id="ad"
            name="ad"
            value={inputs.ad || ""}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter your ad text here"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Advertisement Image:</label>
          <ImageUpload onImageConvert={setBase64Image} />
        </div>

        <button type="submit" className="submit-button">
          Create Campaign
        </button>
      </form>
    </div>
  );
};

const ImageUpload = ({ onImageConvert }) => {
  const [base64, setBase64] = React.useState(null);
  const [isDragging, setIsDragging] = React.useState(false);

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
    <div 
      className={`image-upload-container ${isDragging ? 'dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        setIsDragging(false);
        handleDrop(e);
      }}
    >
      <div className="upload-area">
        {base64 ? (
          <div className="preview">
            <img src={base64} alt="Preview" className="image-preview" />
          </div>
        ) : (
          <div className="upload-prompt">
            <p>Drag and drop an image here, or</p>
            <input
              type="file"
              onChange={handleChange}
              accept="image/*"
              className="file-input"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCampaignForm;