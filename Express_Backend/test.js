const axios = require("axios");
import { Redirect } from "react-router-dom";
class sss {
  constructor(props) {
    this.state = {
      password: "",
      StudentNumber: "",
      cookie: "",
      isLogined: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChange(e) {
    console.log(e.target.name);
    if (e.target.name == "password")
      return this.setState({ password: e.target.value });
    this.setState({ StudentNumber: e.target.value });
  }

  async submit(event) {
    event.preventDefault();
    console.log("로그인");
    try {
      const response = await axios.post("/process/login", {
        id: this.state["StudentNumber"],
        password: this.state["password"],
        type: "member"
      });
      console.log(response);
      if (response.data.success) {
        this.setState({ cookie: response.data.data, isLogined: true });

      }
    } catch (e) {
      console.log(e);
    }
  render(){
      const {isLogined} = this.state

      if(isLogined){
          return <Redirect to="Submit" push={true}></Redirect>
      }
      return (
        html
      )

      
  }
}

async function good() {
  const response = await axios.post(
    "http://in.econovation.kr:3000/process/login",
    {
      id: "jokojay",
      password: "111111",
      type: "member"
    }
  );
  console.log(response.data);
}
