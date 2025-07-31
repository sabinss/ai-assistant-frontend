window.trackEvent = function (eventName, eventData) {
  // Default payload structure
  const defaultPayload = {
    feature_id: eventName,
    feature_date: new Date().toISOString(),
    device: "web",
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  }

  // Merge default payload with provided event data
  const payload = {
    ...defaultPayload,
    ...eventData
  }

  console.log("Sending tracking payload:", payload)
  
  const url = "http://localhost:5001/api/events"
  
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 666158fe71bfe10b58cb23eea"
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
    console.log("Tracking event sent successfully:", data);
  })
  .catch((error) => {
    console.error("Error sending tracking event:", error);
  });
}
