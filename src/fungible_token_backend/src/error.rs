use candid::CandidType;
use serde::{Deserialize, Serialize};

/// Standard error type for the token canister
#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum TokenError {
    /// Caller is not authorized (not the admin)
    Unauthorized,

    /// Recipient user ID not found
    UserNotFound,

    /// Insufficient balance to transfer
    InsufficientBalance,

    /// Invalid input (e.g., empty user ID)
    InvalidInput(String),

    /// Minting error
    MintError(String),

    /// Transfer error
    TransferError(String),
}
