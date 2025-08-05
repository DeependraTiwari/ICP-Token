mod error;
mod token_logic;
mod types;

use candid::{candid_method, Principal};
use ic_cdk::api::caller;
use ic_cdk_macros::{init, query, update};

use crate::error::TokenError;
use crate::token_logic::{
    get_all_accounts, get_balance, get_metadata, get_user_id, mint_tokens,
    register_user, transfer_tokens,
};
use crate::types::{Balance, TokenMetadata, UserAccount, UserId};
use token_logic::init_state;

/// Initialize the canister (called once at deploy time)
#[init]
fn init() {
    let admin = caller();
    init_state(admin);
}

/// Called when a user logs in – registers them if new.
#[update]
#[candid_method(update)]
fn login_or_register() -> UserAccount {
    let principal = caller();
    register_user(principal)
}

/// Get your own user ID
#[query]
#[candid_method(query)]
fn my_user_id() -> Option<UserId> {
    get_user_id(caller())
}

/// Get balance of a specific user
#[query]
#[candid_method(query)]
fn balance_of(user_id: UserId) -> Result<Balance, TokenError> {
    get_balance(&user_id)
}

/// Transfer tokens to another user by their ID
#[update]
#[candid_method(update)]
fn transfer(recipient_id: UserId, amount: u64) -> Result<(), TokenError> {
    transfer_tokens(caller(), recipient_id, amount)
}

/// Admin-only: mint 10 tokens to a user
#[update]
#[candid_method(update)]
fn mint(to_user_id: UserId) -> Result<(), TokenError> {
    mint_tokens(caller(), to_user_id)
}

/// Get token metadata
#[query]
#[candid_method(query)]
fn metadata() -> TokenMetadata {
    get_metadata()
}

/// Admin-only: Get list of all balances
#[query]
#[candid_method(query)]
fn list_accounts() -> Option<Vec<(UserId, Balance)>> {
    get_all_accounts(caller()).map(|map| map.into_iter().collect())
}

/// Export Candid interface
#[cfg(test)]
mod tests {
    use super::*;
    use candid::export_service;

    #[test]
    fn export_candid() {
        export_service!();
        std::fs::write(
            "src/fungible_token_backend.did",
            __export_service(),
        )
        .unwrap();
    }
}
