const API = "http://localhost:3000";

async function addLoan() {

  const token = localStorage.getItem("token");

  const borrower_name =
    document.getElementById("name").value;

  const phone =
    document.getElementById("phone").value;

  const address =
    document.getElementById("address").value;

  const principal =
    document.getElementById("principal").value;

  const interest_rate =
    document.getElementById("rate").value;

  const interest_type =
    document.getElementById("type").value;

  const start_date =
    document.getElementById("date").value;

  const response = await fetch(API + "/loans", {

    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },

    body: JSON.stringify({
      borrower_name,
      phone,
      address,
      principal,
      interest_rate,
      interest_type,
      start_date
    })

  });

  const result = await response.json();

  document.getElementById("message").innerText =
    result.message || result.error;

  loadLoans();
}


async function loadLoans() {

  const token = localStorage.getItem("token");

  const response = await fetch(API + "/loans", {

    headers: {
      "Authorization": "Bearer " + token
    }

  });

  const loans = await response.json();

  const table = document.getElementById("loanTable");

  table.innerHTML = "";

  loans.forEach(loan => {

    table.innerHTML += `
      <tr>
        <td>${loan.id}</td>
        <td>${loan.borrower_name}</td>
        <td>${loan.principal}</td>
        <td>${loan.total_interest}</td>
        <td>${loan.total_amount}</td>
        <td>
          <button onclick="closeLoan(${loan.id})">
            Close Loan
          </button>
        </td>
      </tr>
    `;

  });

}
async function closeLoan(id) {

  const token = localStorage.getItem("token");

  const response = await fetch(API + "/loans/" + id + "/close", {

    method: "POST",

    headers: {
      "Authorization": "Bearer " + token
    }

  });

  const result = await response.json();

  alert(result.message);

  loadLoans();
}
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
