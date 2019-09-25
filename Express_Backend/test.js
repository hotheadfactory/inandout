const axios = require("axios");

async function good() {
  const response = await axios.post(
    "http://in.econovation.kr:3000/process/card/login",
    {
      cardnumber: "0000000000000000"
    }
  );
  console.log(response);
}
good();
