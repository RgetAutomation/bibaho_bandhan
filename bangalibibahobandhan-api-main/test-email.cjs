const axios = require('axios');

async function testEmail() {
  try {
    const res = await axios.post('http://localhost:5000/api/v1/auth/send-otp', {
      email: 'supertech491@gmail.com' // Replace with a valid email
    });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.error("Error Status:", err.response.status);
      console.error("Error Data:", err.response.data);
    } else {
      console.error("Network Error:", err.message);
    }
  }
}

testEmail();
