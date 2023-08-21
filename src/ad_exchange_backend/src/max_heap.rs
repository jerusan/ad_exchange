#[derive(Debug, PartialEq)]
pub struct CampaignIdBidPair {
    pub campaign_id: u64,
    pub bid: u64,
}

pub struct MaxHeap {
    pub vec: Vec<CampaignIdBidPair>,
}

impl MaxHeap {
    pub fn new() -> Self {
        MaxHeap { vec: Vec::new() }
    }

    pub fn push(&mut self, element: CampaignIdBidPair) {
        self.vec.push(element);
        self.bubble_up(self.vec.len() - 1);
    }

    pub fn pop(&mut self) -> Option<CampaignIdBidPair> {
        if self.vec.len() == 0 {
            None
        } else {
            let res = self.vec.swap_remove(0);
            if self.vec.len() > 1 {
                self.bubble_down(0);
            }
            Some(res)
        }
    }

    fn bubble_up(&mut self, index: usize) {
        let mut current = index;
        while current > 0 {
            let parent = (current - 1) / 2;
            if self.vec[current].bid > self.vec[parent].bid {
                self.vec.swap(current, parent);
                current = parent;
            } else {
                break;
            }
        }
    }

    fn bubble_down(&mut self, index: usize) {
        let mut current = index;
        let last = self.vec.len() - 1;

        while current > last {
            let left = 2 * current + 1;
            let right = 2 * current + 2;
            let mut smallest = current;

            if left <= last && self.vec[left].bid > self.vec[smallest].bid {
                smallest = left;
            }

            if right <= last && self.vec[right].bid > self.vec[smallest].bid {
                smallest = right;
            }

            if smallest != current {
                self.vec.swap(current, smallest);
                current = smallest;
            } else {
                break;
            }
        }
    }

    fn size(&mut self) {
        println!("Size {}", self.vec.len());
    }
}

fn _test() {
    let mut min_heap = MaxHeap::new();

    min_heap.push(CampaignIdBidPair {
        campaign_id: 1,
        bid: 500,
    });
    min_heap.push(CampaignIdBidPair {
        campaign_id: 2,
        bid: 1000,
    });
    min_heap.push(CampaignIdBidPair {
        campaign_id: 3,
        bid: 200,
    });
    min_heap.size();
    println!("Popped: {:?}", min_heap.pop());
    min_heap.push(CampaignIdBidPair {
        campaign_id: 4,
        bid: 1200,
    });
    
    min_heap.size();

    println!("Popped: {:?}", min_heap.pop());
    min_heap.size();

    println!("Popped: {:?}", min_heap.pop());
    min_heap.size();

    println!("Popped: {:?}", min_heap.pop());
    min_heap.size();
}
