window.trackEvent = function (feature, data) {
  // Default payload structure
  const payload = {
    email: data.email || "sushilbhatachas@gmail.com",
    feature_id: data.feature,
    feature: data.feature,
    feature_date: new Date(),
    device: "web",
    organization: data.organization || "66158fe71bfe10b58cb23eea"
  }

  console.log("Raw req.body:\n", JSON.stringify(payload, null, 2));
  
  const url = "https://grjr9d0i7k.execute-api.us-east-2.amazonaws.com/dev/api/customer_features"
  
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 66158fe71bfe10b58cb23eea"
    },
    body: JSON.stringify(payload),
  })
  .then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then((data) => {
    console.log("✅ API Response:", data);
  })
  .catch((error) => {
    console.log("❌ Tracking API Error:", error);
  });
}
