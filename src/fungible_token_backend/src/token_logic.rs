use crate::error::TokenError;
use crate::types::*;
use candid::Principal;
use once_cell::sync::OnceCell;
use rand::{distributions::Alphanumeric, Rng};
use std::collections::HashMap;
use std::sync::Mutex;

// GLOBAL STATE SINGLETON
static TOKEN_STATE: OnceCell<Mutex<TokenState>> = OnceCell::new();

/// Initialize the token state once (called in `main.rs`)
pub fn init_state(admin: Principal) {
    let metadata = TokenMetadata {
        name: "MyToken".to_string(),
        symbol: "MTK".to_string(),
        total_supply: 0,
    };

    let state = TokenState {
        accounts: HashMap::new(),
        principal_map: HashMap::new(),
        metadata,
        admin,
    };

    TOKEN_STATE.set(Mutex::new(state)).ok();
}

/// Generate a random user ID (10 alphanumeric chars)
fn generate_user_id() -> UserId {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(10)
        .map(char::from)
        .collect()
}

/// Register a new user (called on login if unknown)
pub fn register_user(principal: Principal) -> UserAccount {
    let mut state = TOKEN_STATE.get().unwrap().lock().unwrap();

    if let Some(user_id) = state.principal_map.get(&principal) {
        return state.accounts.get(user_id).unwrap().clone();
    }

    let new_id = generate_user_id();
    let new_user = UserAccount {
        id: new_id.clone(),
        principal,
        balance: 100, // Airdrop 100 tokens
    };

    state
        .accounts
        .insert(new_id.clone(), new_user.clone());
    state
        .principal_map
        .insert(principal, new_id.clone());

    // Update total supply
    state.metadata.total_supply += 100;

    new_user
}

/// Get user ID from principal (if exists)
pub fn get_user_id(principal: Principal) -> Option<UserId> {
    let state = TOKEN_STATE.get().unwrap().lock().unwrap();
    state.principal_map.get(&principal).cloned()
}

/// Get balance of a given user ID
pub fn get_balance(user_id: &UserId) -> Result<Balance, TokenError> {
    let state = TOKEN_STATE.get().unwrap().lock().unwrap();

    match state.accounts.get(user_id) {
        Some(user) => Ok(user.balance),
        None => Err(TokenError::UserNotFound),
    }
}

/// Transfer tokens from sender to recipient
pub fn transfer_tokens(
    sender: Principal,
    recipient_id: UserId,
    amount: u64,
) -> Result<(), TokenError> {
    if amount == 0 {
        return Err(TokenError::InvalidInput("Amount must be > 0".to_string()));
    }

    let mut state = TOKEN_STATE.get().unwrap().lock().unwrap();

    // Ensure sender is registered
    let sender_id = match state.principal_map.get(&sender) {
        Some(id) => id,
        None => return Err(TokenError::Unauthorized),
    };

    // Get mutable sender and recipient
    let sender_account = state
        .accounts
        .get_mut(sender_id)
        .ok_or(TokenError::UserNotFound)?;

    let recipient_account = state
        .accounts
        .get_mut(&recipient_id)
        .ok_or(TokenError::UserNotFound)?;

    if sender_account.balance < amount {
        return Err(TokenError::InsufficientBalance);
    }

    sender_account.balance -= amount;
    recipient_account.balance += amount;

    Ok(())
}

/// Mint 10 tokens to a given user (admin only)
pub fn mint_tokens(
    caller: Principal,
    to_user_id: UserId,
) -> Result<(), TokenError> {
    let mut state = TOKEN_STATE.get().unwrap().lock().unwrap();

    if caller != state.admin {
        return Err(TokenError::Unauthorized);
    }

    let account = state
        .accounts
        .get_mut(&to_user_id)
        .ok_or(TokenError::UserNotFound)?;

    account.balance += 10;
    state.metadata.total_supply += 10;

    Ok(())
}

/// Get token metadata
pub fn get_metadata() -> TokenMetadata {
    let state = TOKEN_STATE.get().unwrap().lock().unwrap();
    state.metadata.clone()
}

/// Get all accounts (admin only)
pub fn get_all_accounts(caller: Principal) -> Option<HashMap<UserId, Balance>> {
    let state = TOKEN_STATE.get().unwrap().lock().unwrap();

    if caller != state.admin {
        return None;
    }

    Some(
        state
            .accounts
            .iter()
            .map(|(id, acc)| (id.clone(), acc.balance))
            .collect(),
    )
}
