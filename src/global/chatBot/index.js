import React from "react";
import ChatBot from "react-simple-chatbot";

/** @reference 
 * https://medium.com/javascript-in-plain-english/may-i-help-you-build-a-chatbot-in-10-minutes-with-react-df19e940bbc8
 */
function CustomChatbot(props) {
    const steps = [
        {
          id: "Greet",
          message: "Hello, Welcome to our shop",
          trigger: "Ask Name"
        },
        {
          id: "Ask Name",
          message: "Please type your name?",
          trigger: "Waiting user input for name"
        },
        {
          id: "Waiting user input for name",
          user: true,
          trigger: "Asking options to eat"
        },
        {
          id: "Asking options to eat",
          message: "Hi {previousValue}, Glad to know you !!",
          trigger: "Done"
        },
        {
          id: "Done",
          message: "Have a great day !!",
          end: true
        }
     ];
    const config = {
        width: "300px",
        height: "400px",
        floating: true
    };
  return <ChatBot steps={steps} {...config} />;
}
export default CustomChatbot;