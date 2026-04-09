const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, '../client/src/pages/LenderHub.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Add state variable
content = content.replace(
  "const [showVerifyModal, setShowVerifyModal] = useState(null);",
  "const [showVerifyModal, setShowVerifyModal] = useState(null);\n  const [showManualModal, setShowManualModal] = useState(null);\n  const [manualAmount, setManualAmount] = useState('');\n  const [manualType, setManualType] = useState('INTEREST');"
);

// 2. Add handleManualPayment function
const methodInsert = `
  const handleManualPayment = async (e) => {
    e.preventDefault();
    try {
      await fetch(\`http://localhost:3000/payments/\${showManualModal.id}/manual\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
        body: JSON.stringify({ amount: manualAmount, payment_type: manualType })
      });
      setShowManualModal(null);
      setManualAmount('');
      setManualType('INTEREST');
      fetchLoans();
    } catch (err) {
      alert('Manual payment failed');
    }
  };
`;
content = content.replace(
  "const handleReject =",
  methodInsert + "\n  const handleReject ="
);

// 3. Update the Loan Card Header
const oldCardHeader = `                <span className={\`badge \${loan.status === 'ACTIVE' ? 'badge-warning' : 'badge-success'}\`}>
                  {loan.status}
                </span>`;
const newCardHeader = `                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {loan.status === 'ACTIVE' && (
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setShowManualModal(loan)}>
                      Log Payment
                    </button>
                  )}
                  <span className={\`badge \${loan.status === 'ACTIVE' ? 'badge-warning' : 'badge-success'}\`}>
                    {loan.status}
                  </span>
                </div>`;
content = content.replace(oldCardHeader, newCardHeader);

// 4. Append Manual Modal HTML at the end before </>;
const modalHtml = `
      {showManualModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Update Loan</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Log an offline payment directly for {showManualModal.borrower_name}.
            </p>
            <form onSubmit={handleManualPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Amount Recieved (₹)</label>
                <input type="number" step="0.01" required value={manualAmount} onChange={e => setManualAmount(e.target.value)} />
              </div>
              <div>
                <label>Action</label>
                <select value={manualType} onChange={e => setManualType(e.target.value)}>
                  <option value="INTEREST">Reduce Partial Interest</option>
                  <option value="FULL">Settle & Close Full Loan</option>
                </select>
              </div>
              <div className="flex-between" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowManualModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-primary)' }}>Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}
`;
content = content.replace("    </>\n  );\n}", modalHtml + "    </>\n  );\n}");

fs.writeFileSync(filepath, content);
console.log("Updated LenderHub successfully.");
