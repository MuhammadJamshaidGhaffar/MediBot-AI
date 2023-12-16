import OpenAI from "openai";
import { readFromJsonFile, saveToJsonFile } from "./utils/json-methods.js";
import { getContext } from "./vector_database/db-methods.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
});

//----- threads ----------
const threadByUser_path = "data/threadByUser.json";
let threadByUser = {}; // Store thread IDs by user

try{
  console.log("Attempting to read threadByUser.json file")
  threadByUser = readFromJsonFile(threadByUser_path);
}catch(err){
  console.log("Error while reading threadByUser.json");
  console.log(err);
  threadByUser = {};
}

export async function getResponse(userId , userMessage) {
  console.log("--- getResponse called --- " , userId , "   ,   " , userMessage);
  const assistantIdToUse = 'asst_78A0tVzLT9vKjMOMz2BHhTPR'; // Replace with your assistant ID
  const modelToUse = "gpt-3.5-turbo-1106"; // Specify the model you want to use
  //const userId = user_id; // You should include the user ID in the request

  // Create a new thread if it's the user's first message
  if (!threadByUser[userId]) {
    try {
      const myThread = await openai.beta.threads.create();
      console.log("New thread created with ID: ", myThread.id, "\n");
      threadByUser[userId] = myThread.id; // Store the thread ID for this user
      saveToJsonFile(threadByUser_path , threadByUser);
    } catch (error) {
      console.error("Error creating thread:", error);
      return "Error creating the thread error";
      return;
    }
  }


  // Add a Message to the Thread
  try {
    const myThreadMessage = await openai.beta.threads.messages.create(
      threadByUser[userId], // Use the stored thread ID for this user
      {
        role: "user",
        content: userMessage,
        
      }
    );
    console.log("This is the message object: ", myThreadMessage, "\n");

    // get the similar data from our vector store
    // let context = await getContext(query);

    // Run the Assistant
    const myRun = await openai.beta.threads.runs.create(
      threadByUser[userId], // Use the stored thread ID for this user
      {
        assistant_id: assistantIdToUse,
        instructions: "Please address the user as patient. Tell the user of possible cause of that problem. Give short and to the point answer preferably in bullet points. Give warning at the end too so user will not get an idea to cross check the results with actual doctor. If user asks any other question which is not related to medical then respond that you're medical bot and you can only respond to medical related queries.",
      }
    );
    console.log("This is the run object: ", myRun, "\n");

    // Periodically retrieve the Run to check on its status
    const retrieveRun = async () => {
      let keepRetrievingRun;

      while (myRun.status !== "completed") {
        keepRetrievingRun = await openai.beta.threads.runs.retrieve(
          threadByUser[userId], // Use the stored thread ID for this user
          myRun.id
        );

        console.log(`Run status: ${keepRetrievingRun.status}`);

        if (keepRetrievingRun.status === "completed") {
          console.log("\n");
          break;
        }
      }
    };
    retrieveRun();

    // Retrieve the Messages added by the Assistant to the Thread
    const waitForAssistantMessage = async () => {
      await retrieveRun();

      const allMessages = await openai.beta.threads.messages.list(
        threadByUser[userId] // Use the stored thread ID for this user
      );

      // Send the response back to the front end
    //   res.status(200).json({
    //     response: allMessages.data[0].content[0].text.value,
    //   });
      console.log(
        "------------------------------------------------------------ \n"
      );

      console.log("User: ", myThreadMessage.content[0].text.value);
      console.log("Assistant: ", allMessages.data[0].content[0].text.value);
      return allMessages.data[0].content[0].text.value;
    };
    return await waitForAssistantMessage();
  } catch (error) {
    console.error("Error:", error);
    // res.status(500).json({ error: "Internal server error" });
    return "Internal Error";
  }
};