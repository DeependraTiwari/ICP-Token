import React, { useState } from "react";

const backend = window.fungible_token_backend;

export default function TransferForm({ senderId, onTransfer }) {
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!senderId || !toId || !amount) return;

    setIsSending(true);
    setMessage(null);

    try {
      const result = await backend.transfer(senderId, toId, parseInt(amount));
      if ("ok" in result) {
        setMessage({ type: "success", text: `✅ Sent ${amount} tokens.` });
        onTransfer(); // refresh balance
        setAmount("");
        setToId("");
      } else {
        setMessage({ type: "error", text: `❌ ${result.err}` });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Transfer failed!" });
    }

    setIsSending(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black bg-opacity-30 p-5 rounded-xl border border-white border-opacity-10"
    >
      <h2 className="text-xl font-semibold mb-4">🔁 Transfer Tokens</h2>

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
        disabled={isSending}
        className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded transition"
      >
        {isSending ? "Sending..." : "Send Tokens"}
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
