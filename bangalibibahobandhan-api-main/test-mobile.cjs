const axios = require('axios');

async function testMobile() {
  try {
    const res = await axios.post('http://localhost:5000/api/v1/auth/send-otp', {
      mobile: '93307 33857' // Replace with your actual 10-digit mobile number
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

testMobile();
