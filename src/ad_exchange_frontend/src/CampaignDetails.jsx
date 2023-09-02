import * as React from "react";
import { useAuth } from "./useAuthClient";

const CampaignDetails = () => {
  const [category, setCategory] = React.useState("");
  const [campaign, setCampaign] = React.useState({});

  const { backendActor } = useAuth();

  const changeCategory = (event) => {
    const { _, value } = event.target;
    setCategory(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let adCampaign = await backendActor.get_campaign(category);
    setCampaign(adCampaign);
  };

  const canvasRef = React.useRef(null);

  React.useEffect( () =>  {

    const img = new Image();
    img.src = campaign.base_64_img

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
          coordinate: {
            x: x,
            y: y
          },
          pixel: {
            r: pixel[0],
            g: pixel[1],
            b: pixel[2],
            a: pixel[3]
          }
        }
        sampledPixels.push(sampledData)
      }

      // Send proof to backend
      console.log('sampledPixels', sampledPixels);
      await backendActor.verify_ad_interaction(campaign.id, sampledPixels);
    };

  }, [campaign]);

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
          <canvas ref={canvasRef} />
        </form>
      </div>
    </>
  );
};

export default CampaignDetails;