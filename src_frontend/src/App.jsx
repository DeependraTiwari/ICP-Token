import React, { useEffect, useState } from "react";
import {
  AuthClient
} from "@dfinity/auth-client";
import BalanceCard from "./components/BalanceCard";
import TransferForm from "./components/TransferForm";
import MintPanel from "./components/MintPanel";
import TimerDisplay from "./components/TimerDisplay";

const canisterId = process.env.CANISTER_ID_FUNToken_BACKEND; // Replace if needed
const backend = window.fungible_token_backend;

export default function App() {
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    const client = await AuthClient.create();
    setAuthClient(client);

    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();
      setIdentity(identity);
      await loginOrRegister();
    }
  }

  async function login() {
    await authClient.login({
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        setIdentity(identity);
        await loginOrRegister();
      }
    });
  }

  async function logout() {
    await authClient.logout();
    setIdentity(null);
    setUserId(null);
    setIsAdmin(false);
  }

  async function loginOrRegister() {
    const user = await backend.login_or_register();
    setUserId(user.id);

    // Set admin if caller is the principal who deployed
    const all = await backend.list_accounts();
    if (all && Array.isArray(all)) {
      const callerId = await backend.my_user_id();
      const creator = all[0]?.[0]; // First user is admin
      if (callerId && creator && callerId === creator) {
        setIsAdmin(true);
      }
    }
  }

  return (
    <div className="text-white min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6 animate-glow text-center">
        <span className="drop-shadow-[0_0_10px_#00f7ff]">
          💠 MyToken Dashboard
        </span>
      </h1>

      {!identity ? (
        <button
          onClick={login}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-all duration-300"
        >
          Login with Internet Identity
        </button>
      ) : (
        <>
          <div className="frosted-glass p-6 rounded-xl w-full max-w-md space-y-4">
            <BalanceCard userId={userId} />
            <TransferForm />
            {isAdmin && <MintPanel />}
            <TimerDisplay />
            <button
              onClick={logout}
              className="mt-4 bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
