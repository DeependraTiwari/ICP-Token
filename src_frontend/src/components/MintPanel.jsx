import React, { useState, useEffect } from "react";

const backend = window.fungible_token_backend;

export default function MintPanel({ userId, onMint }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState(null);
  const [isMinting, setIsMinting] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const result = await backend.is_admin(userId);
        setIsAdmin(result);
      } catch (err) {
        console.error("Failed to check admin status:", err);
      }
    }

    if (userId) checkAdmin();
  }, [userId]);

  const handleMint = async (e) => {
    e.preventDefault();
    if (!toId || !amount) return;

    setIsMinting(true);
    setMessage(null);

    try {
      const result = await backend.mint(toId, parseInt(amount));
      if ("ok" in result) {
        setMessage({ type: "success", text: `✅ Minted ${amount} tokens.` });
        setAmount("");
        setToId("");
        onMint();
      } else {
        setMessage({ type: "error", text: `❌ ${result.err}` });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Minting failed!" });
    }

    setIsMinting(false);
  };

  if (!isAdmin) return null;

  return (
    <form
      onSubmit={handleMint}
      className="bg-black bg-opacity-30 p-5 rounded-xl border border-white border-opacity-10 mt-6"
    >
      <h2 className="text-xl font-semibold mb-4">👑 Mint Tokens (Admin)</h2>

      <input
        type="text"
        placeholder="Recipient ID"
        value={toId}
        onChange={(e) => setToId(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-white bg-opacity-10 text-white placeholder-gray-400"
        required
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-white bg-opacity-10 text-white placeholder-gray-400"
        required
        min="1"
      />

      <button
        type="submit"
        disabled={isMinting}
        className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition"
      >
        {isMinting ? "Minting..." : "Mint Tokens"}
      </button>

      {message && (
        <p
          className={`mt-3 text-sm ${
            message.type === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
