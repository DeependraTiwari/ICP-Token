import React, { useEffect, useState } from "react";

const backend = window.fungible_token_backend;

export default function BalanceCard({ userId }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchBalance() {
    if (!userId) return;
    setLoading(true);
    try {
      const result = await backend.balance_of(userId);
      if ("ok" in result) {
        setBalance(result.ok);
      } else {
        setBalance("Error");
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setBalance("Error");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchBalance();
  }, [userId]);

  return (
    <div className="bg-black bg-opacity-30 p-5 rounded-xl shadow-lg text-center border border-white border-opacity-10">
      <h2 className="text-xl font-semibold mb-2">🪙 Your Balance</h2>
      {loading ? (
        <p className="animate-pulse text-gray-400">Fetching...</p>
      ) : (
        <p className="text-3xl font-bold text-cyan-400 animate-glow">
          {balance !== null ? `${balance} Ⓜ️` : "—"}
        </p>
      )}
      <button
        onClick={fetchBalance}
        className="mt-3 text-sm bg-white bg-opacity-10 px-3 py-1 rounded hover:bg-opacity-20"
      >
        Refresh
      </button>
    </div>
  );
}
