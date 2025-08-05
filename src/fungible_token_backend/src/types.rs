use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Metadata for the token itself.
#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub total_supply: u64,
}

/// Type alias for user balance.
pub type Balance = u64;

/// Unique user ID assigned on first login (random string).
pub type UserId = String;

/// The full user account data.
#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct UserAccount {
    pub id: UserId,
    pub principal: Principal,
    pub balance: Balance,
}

/// Stores the entire token state in memory.
#[derive(Default)]
pub struct TokenState {
    /// Map of user ID → UserAccount
    pub accounts: HashMap<UserId, UserAccount>,

    /// Map of Principal → UserId for lookup
    pub principal_map: HashMap<Principal, UserId>,

    /// Token metadata
    pub metadata: TokenMetadata,

    /// Admin principal (creator)
    pub admin: Principal,
}
