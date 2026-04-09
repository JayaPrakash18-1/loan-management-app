const API = "http://localhost:3000";

async function register() {

  const name =
    document.getElementById("name").value;

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  const response = await fetch(API + "/auth/register", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      name,
      email,
      password
    })

  });

  const result = await response.json();

  document.getElementById("message").innerText =
    result.message || result.error;

  if (result.message) {

    window.location.href = "login.html";

  }

}
