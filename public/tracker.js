window.trackEvent = function (eventName, email) {
  const payload = {
    email:"sushilbhatachas@gmail.com",
    feature_id: 'login',
    feature_date: new Date().toISOString(),
    device: "web",
    organization:"66158fe71bfe10b58cb23eea"
  }

  console.log("Sending payload:", payload)
const url = " http://localhost:5001/api/events"
  fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer 666158fe71bfe10b58cb23eea"
  },
  body: JSON.stringify(payload),
  // don't set mode: 'no-cors' — default is 'cors' and needed for custom headers
})
  .then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(console.log)
  .catch(console.error);

}
