import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";
import { Buffer } from "buffer";

// Initialize Pera Wallet Connect
export const peraWallet = new PeraWalletConnect();

// Algorand TestNet Config using AlgoNode
const algodToken = "";
const algodServer = "https://testnet-api.algonode.cloud";
const algodPort = "";
export const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

const indexerToken = "";
const indexerServer = "https://testnet-idx.algonode.cloud";
const indexerPort = "";
export const indexerClient = new algosdk.Indexer(indexerToken, indexerServer, indexerPort);

// Helper to decode Base64 strings or Uint8 arrays to ASCII/UTF-8
export const decodeNote = (base64Note) => {
  if (!base64Note) return "";
  try {
    return new TextDecoder().decode(new Uint8Array(Buffer.from(base64Note, 'base64')));
  } catch (error) {
    try {
      return atob(base64Note);
    } catch {
      return "";
    }
  }
};

/**
 * Global Utilities for Dashboard Data Processing
 */

export const getBalance = async (address) => {
  if (!address) return 0;
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    const microAlgos = typeof accountInfo.amount === 'bigint' ? Number(accountInfo.amount) : accountInfo.amount;
    return microAlgos / 1000000;
  } catch (err) {
    console.error("Error fetching balance:", err);
    return 0;
  }
};

export const getAllTransactions = async (address) => {
  if (!address) return [];
  try {
    // Fetch up to 500 latest transactions bounds
    const txInfo = await indexerClient.searchForTransactions()
      .address(address)
      .limit(500)
      .do();
    return txInfo.transactions || [];
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return [];
  }
};

export const parseTransactions = (transactions, accountAddress) => {
  if (!transactions || !Array.isArray(transactions)) return [];

  return transactions
    .filter(tx => tx.txType === 'pay' || tx['tx-type'] === 'pay')
    .map(tx => {
      const payment = tx.paymentTransaction || tx['payment-transaction'];
      if (!payment) return null;

      const isSender = tx.sender === accountAddress;
      const isReceiver = payment.receiver === accountAddress;
      
      const amountAlgo = Number(payment.amount) / 1000000;
      const feeAlgo = Number(tx.fee || 0) / 1000000;

      const rt = tx.roundTime || tx['round-time'];
      const dateObj = rt ? new Date(Number(rt) * 1000) : new Date();
      
      const confirmedRound = tx.confirmedRound || tx['confirmed-round'];
      
      const txId = tx.id || tx?.txn?.txid;

      return {
        id: txId,
        date: dateObj,
        status: confirmedRound ? "Confirmed" : "Pending",
        amount: amountAlgo,
        fee: feeAlgo,
        isSender,
        isReceiver,
        sender: tx.sender,
        receiver: payment.receiver,
        note: decodeNote(tx.note)
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.date - a.date); // Most recent first
};
