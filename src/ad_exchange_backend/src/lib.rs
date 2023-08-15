use base64;
use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{api::call::ManualReply, query, update};
use std::{str, cell::RefCell, collections::HashMap};

mod max_heap;

use max_heap::{CampaignIdBidPair, MaxHeap};
type CampaignIDType = u64;

#[derive(CandidType, Debug, Deserialize, Clone)]
struct AddCampaignType {
    advertiser: Principal,
    bid: u64,
    category: String,
    ad: String,
    base_64_img: String,
}

#[derive(CandidType, Debug, Deserialize, Clone)]
struct CampaignResponseType {
    id: CampaignIDType,
    advertiser: Principal,
    bid: u64,
    category: String,
    ad: String,
    base_64_img: String,
}

#[derive(CandidType, Debug, Deserialize, Clone)]
struct Campaign {
    id: CampaignIDType,
    advertiser: Principal,
    bid: u64,
    category: String,
    ad: String,
    base_64_img: String,
}

thread_local! {
    static CAMPAIGN_ID: RefCell<CampaignIDType> =RefCell::new(0);
    static CAMPAIGN_STORE: RefCell<HashMap<CampaignIDType, Campaign>> = RefCell::default();
    static CATEGORY_STORE: RefCell<HashMap<String, MaxHeap>> = RefCell::default();
}

#[update]
async fn create_campaign(add_campaign: AddCampaignType) {
    // let principal_id = ic_cdk::api::caller();

    CAMPAIGN_ID.with(|campaign_id| {
        let id = *campaign_id.borrow_mut();
        *campaign_id.borrow_mut() += 1;

        // Add the campaign to the category for calculating the bed bid for each category
        CATEGORY_STORE.with(|category_store| {
            let item = CampaignIdBidPair {
                campaign_id: id,
                bid: add_campaign.bid,
            };

            let mut store = category_store.borrow_mut();
            if let Some(heap) = store.get_mut(&add_campaign.category) {
                heap.push(item);
            } else {
                let mut heap = MaxHeap::new();
                heap.push(item);
                store.insert(add_campaign.category.clone(), heap);
            }
        });

        // Store the campaign related data to campaign store
        CAMPAIGN_STORE.with(|campaign_store| {
            println!("{:?}", add_campaign.base_64_img);

            // let img_bytes = base64::decode(addCampaign.base_64_img).unwrap_or_else(|err| {
            //     // panic!("Failed to decode base64 image: {:?}", err);
            //     Vec::new()
            // });

            campaign_store.borrow_mut().insert(
                id,
                Campaign {
                    id,
                    advertiser: add_campaign.advertiser,
                    bid: add_campaign.bid,
                    category: add_campaign.category,
                    ad: add_campaign.ad,
                    base_64_img: add_campaign.base_64_img,
                },
            );
        });
    });
}

#[query(manual_reply = true)]
fn get_campaign(category: String) -> ManualReply<CampaignResponseType> {
    let campaign_id_bid_pair = CATEGORY_STORE.with(|category_store| {
        let mut store = category_store.borrow_mut();
        if let Some(heap) = store.get_mut(&category) {
            heap.pop()
        } else {
            None
        }
    });

    if let Some(campaign) = campaign_id_bid_pair {
        CAMPAIGN_STORE.with(|campaign_store| {
            let campaign_store_mut = campaign_store.borrow_mut();
            let z = campaign_store_mut.get(&campaign.campaign_id).unwrap();
   
            // let img_string = base64::encode(&z.base_64_img);
            let u = CampaignResponseType { 
                id: z.id, 
                advertiser: z.advertiser, 
                bid: z.bid, 
                category: z.category.to_string(), 
                ad: z.ad.to_string(), 
                base_64_img: z.base_64_img.to_string(),
            };
            ManualReply::one(u)
        })
    } else {
        let campaign = CampaignResponseType {
            id: 0,
            advertiser: Principal::anonymous(),
            bid: 0,
            category: String::new(),
            ad: String::new(),
            base_64_img: String::new(),
        };
        ManualReply::one(campaign)
    }
}
