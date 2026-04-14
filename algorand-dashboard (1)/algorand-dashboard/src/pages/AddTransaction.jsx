import { useState } from 'react';
import algosdk from 'algosdk';
import { algodClient, peraWallet } from '../utils/algorand';
import './AddTransaction.css';

const AddTransaction = ({ accountAddress }) => {
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accountAddress) {
      setMessage({ type: 'error', text: 'Please connect your wallet first.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Clean address
      const recV = receiverAddress ? receiverAddress.trim() : '';
      const toAddress = recV || accountAddress;

      console.log("From:", accountAddress);
      console.log("To:", toAddress);

      if (!toAddress) {
        throw new Error("Address must not be null or undefined");
      }

      // Validate
      if (!algosdk.isValidAddress(accountAddress)) {
        throw new Error(`Invalid sender address: ${accountAddress}`);
      }

      if (!algosdk.isValidAddress(toAddress)) {
        throw new Error(`Invalid receiver address: ${toAddress}`);
      }

      // Convert ALGO → microAlgos
      const amountValue = amount
        ? Math.floor(parseFloat(amount) * 1000000)
        : 1000; // default small amount

      // Encode note
      const noteUint8 =
        note && note.trim().length > 0
          ? new TextEncoder().encode(note)
          : undefined;

      // Params
      const suggestedParams = await algodClient.getTransactionParams().do();
      suggestedParams.fee = 1000;
      suggestedParams.flatFee = true;

      const txConfig = {
        sender: accountAddress,
        receiver: toAddress,
        amount: amountValue,
        suggestedParams,
      };

      if (noteUint8 !== undefined) {
        txConfig.note = noteUint8;
      }

      // Create txn
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject(txConfig);

      // Pera Wallet signTransaction requires an array of transaction groups (array of arrays)
      const txnGroup = [{
        txn,
        signers: [accountAddress],
      }];

      const signedTxn = await peraWallet.signTransaction([txnGroup]);

      // Send
      let txId;
      try {
        const response = await algodClient.sendRawTransaction(signedTxn).do();
        txId = response.txId;
      } catch (err) {
        if (err?.status === 400 || err?.message?.includes("TransactionPool.Remember")) {
          txId = txn.txID().toString();
        } else {
          throw err;
        }
      }

      setMessage({
        type: 'success',
        text: `Transaction Sent! Waiting for confirmation... ID: ${txId}`,
      });

      setReceiverAddress('');
      setAmount('');
      setNote('');

      // Check confirmation in background
      algosdk.waitForConfirmation(algodClient, txId, 10).then(() => {
        setMessage({
          type: 'success',
          text: `Transaction confirmed! ID: ${txId}`,
        });
      }).catch(confirmError => {
        console.warn("Confirmation polling error:", confirmError);
      });
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: error?.message || 'Transaction failed or rejected.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!accountAddress) {
    return (
      <div className="add-tx-empty">
        <div className="empty-state-card">
          <span className="empty-icon">🔌</span>
          <h2>Wallet Not Connected</h2>
          <p>Please connect your Pera Wallet to send transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-tx-container">
      <div className="add-tx-card">
        <h2>Submit Transaction</h2>
        <p className="subtitle">Send ALGO or attach a note to the blockchain</p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="tx-form">
          <div className="form-group">
            <label>Receiver Address (Optional)</label>
            <input
              type="text"
              placeholder="Defaults to your own address if left blank"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Amount in ALGO (Optional)</label>
            <input
              type="number"
              step="0.000001"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Note / Message</label>
            <textarea
              rows="4"
              placeholder="Enter your message (e.g., Booking ID: 12345)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            ></textarea>
            <span className="helper-text">
              This will be permanently stored on the Algorand blockchain.
            </span>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Processing...' : 'Send Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;