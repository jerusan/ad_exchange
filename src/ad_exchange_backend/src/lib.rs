use candid::{candid_method, types::principal, CandidType, Deserialize, Nat, Principal};
use ic_cdk::{
    api::call::{CallResult, ManualReply},
    caller, query, update,
};

use serde::Serialize;
use std::{
    cell::RefCell,
    collections::HashMap,
    str::{self, FromStr},
};
mod max_heap;
use max_heap::{CampaignIdBidPair, MaxHeap};
type CampaignIDType = u64;
use ic_ledger_types::{Subaccount, Timestamp, Tokens, TransferError, DEFAULT_SUBACCOUNT};

use std::collections::HashSet;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Hash, PartialEq)]
pub struct Conf {
    ledger_canister_id: Principal,
    // The subaccount of the account identifier that will be used to withdraw tokens and send them
    // to another account identifier. If set to None then the default subaccount will be used.
    // See the [Ledger doc](https://internetcomputer.org/docs/current/developer-docs/integrations/ledger/#accounts).
    subaccount: Option<Subaccount>,
    transaction_fee: Tokens,
}

impl Default for Conf {
    fn default() -> Self {
        Conf {
            ledger_canister_id: Principal::from_text("ajuq4-ruaaa-aaaaa-qaaga-cai").unwrap(),
            subaccount: None,
            transaction_fee: Tokens::from_e8s(10),
        }
    }
}

// #[derive(CandidType, Serialize, Deserialize, Clone, Debug, Hash)]
// pub struct TransferArgs {
//     amount: Tokens,
//     to_principal: Principal,
//     to_subaccount: Option<Subaccount>,
// }

#[derive(CandidType, Deserialize, Clone, Debug)]
struct Account {
    owner: Principal,
    subaccount: Option<Subaccount>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
struct TransferArg {
    from_subaccount: Option<Subaccount>,
    to: Account,
    amount: Nat,
    fee: Option<Tokens>,
    memo: Option<Vec<u8>>,
    created_at_time: Option<Timestamp>,
}

#[derive(CandidType, Debug, Deserialize, Clone)]
struct AddCampaignType {
    bid: u64,
    category: String,
    ad: String,
    base_64_img: String,
}

#[derive(CandidType, Debug, Deserialize, Clone)]
struct CampaignResponseType {
    id: CampaignIDType,
    advertiser: Principal,
    challenge: String,
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
    static ICP_STORE: RefCell<HashMap<Principal, u64>> = RefCell::default();
    static PRINCIPAL_CHALLENGES: RefCell<HashMap<Principal, HashSet<String>>> = RefCell::default();
    static CONF: RefCell<Conf> = RefCell::new(Conf::default());
}

// #[init]
// #[candid_method(init)]
// fn init(conf: Conf) {
//     CONF.with(|c| c.replace(conf));
// }

#[update]
async fn create_campaign(add_campaign: AddCampaignType) {
    let caller = caller();
    ic_cdk::println!("Caller create campaign {}", caller.to_text());
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
            campaign_store.borrow_mut().insert(
                id,
                Campaign {
                    id,
                    advertiser: caller,
                    bid: add_campaign.bid,
                    category: add_campaign.category,
                    ad: add_campaign.ad,
                    base_64_img: add_campaign.base_64_img,
                },
            );
        });
    });
}

fn generate_challenge() -> String {
    // let mut rng = rand::thread_rng();
    // let challenge = rng.gen::<[u8; 32]>();
    // let challenge = hex::encode(challenge);
    let challenge = String::from_str("test");
    challenge.unwrap()
}

#[query(manual_reply = true)]
fn get_campaign(category: String) -> ManualReply<CampaignResponseType> {
    ic_cdk::println!("Caller get campaign {}", caller());
    let campaign_id_bid_pair = CATEGORY_STORE.with(|category_store| {
        let mut store = category_store.borrow_mut();
        if let Some(heap) = store.get_mut(&category) {
            heap.pop()
        } else {
            None
        }
    });

    let challenge = generate_challenge();
    PRINCIPAL_CHALLENGES.with(|principal| {
        principal
            .borrow_mut()
            .entry(caller())
            .or_insert(HashSet::new())
            .insert(challenge.clone());
    });

    if let Some(campaign) = campaign_id_bid_pair {
        CAMPAIGN_STORE.with(|campaign_store| {
            let campaign_store_mut = campaign_store.borrow_mut();
            let z = campaign_store_mut.get(&campaign.campaign_id).unwrap();

            let u = CampaignResponseType {
                id: z.id,
                advertiser: z.advertiser,
                challenge: challenge.to_string(),
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
            challenge: challenge.to_string(),
            bid: 0,
            category: String::new(),
            ad: String::new(),
            base_64_img: String::new(),
        };
        ManualReply::one(campaign)
    }
}

#[update]
#[candid_method(update)]
async fn verify_ad_interaction(campaign_id: CampaignIDType, signature: String) {
    let principal = caller();
    ic_cdk::println!(
        "Caller verify ad interaction {}, signature: {}",
        caller(),
        signature
    );

    // TODO: verifiy signature logic
    let verified = true;
    // TODO: Get campaign bid from campaign id
    if verified {
        let resp = mint(10, Some(principal.to_string())).await;
        ic_cdk::println!("Send 100 ICP to {} {:?}", principal, resp);
    }
    // PRINCIPAL_CHALLENGES.with(|principal_challenges| {
    //     let principal_challenges = principal_challenges.borrow();
    //     if let Some(challenges) = principal_challenges.get(&principal) {
    //         if challenges.contains(&signature) {
    //             // Challenge is valid, increment ICP for principal
    //             ICP_STORE.with(|icp_store| {
    //                 let mut icp_store = icp_store.borrow_mut();
    //                 *icp_store.entry(principal).or_insert(0) += 1;
    //             });
    //         } else {
    //             // Invalid challenge
    //             return;
    //         }
    //     }
    // });
}

#[update]
#[candid_method(update)]
async fn mint(amount: u64, principal: Option<String>) -> CallResult<(Result<Nat, TransferError>,)> {
    // if principal not none, send tokens to the caller of this function
    let to_principal = match principal {
        Some(p) => Principal::from_text(p).unwrap(),
        None => caller(),
    };

    ic_cdk::println!(
        "Transferring {} tokens to principal {} subaccount {:?}",
        &amount,
        &to_principal,
        &DEFAULT_SUBACCOUNT
    );
    let ledger_canister_id = CONF.with(|conf| conf.borrow().ledger_canister_id);
    let transfer_args = CONF.with(|conf| {
        let conf = conf.borrow();
        TransferArg {
            memo: None,
            amount: Nat::from(amount),
            fee: Some(conf.transaction_fee),
            from_subaccount: None,
            to: Account {
                owner: to_principal,
                subaccount: Some(DEFAULT_SUBACCOUNT),
            },
            created_at_time: None,
        }
    });

    // TODO: Ledger canister client code is not up to date yet
    let transfer_result =
        ic_cdk::call(ledger_canister_id, "icrc1_transfer", (transfer_args,)).await;
    ic_cdk::println!("Transfer output :::::::: {:?}", transfer_result);
    transfer_result
}
