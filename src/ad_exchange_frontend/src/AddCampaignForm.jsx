import { Principal } from "@dfinity/principal";
import { useAuth } from "./useAuthClient";
import * as React from "react";

const AddCampaignForm = () => {
  const [inputs, setInputs] = React.useState({});
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

    const campaign = {
      advertiser: Principal.fromText(inputs.advertiser),
      bid: parseInt(inputs.bid, 10),
      category: inputs.category,
      ad: inputs.ad,
      base_64_img: inputs.base64Img,
    };

    const to_principal = {
      owner: Principal.fromText("be2us-64aaa-aaaaa-qaabq-cai"),
      subaccount: [], 
    }

    const transferArgs = {
      memo: [],
      from_subaccount: [],
      to: to_principal,
      fee: [],
      amount: 1000,
      created_at_time: []
    };
    console.log("ledger canister id", ledgerCanisterID);
    console.log('Transfer Args', transferArgs);
    // let x = await ledgerActor.icrc1_transfer(transferArgs)

    // console.log("ICRC1_transfer", x)
    let response = await backendActor.create_campaign(campaign);
    alert(x);
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

export default AddCampaignForm;