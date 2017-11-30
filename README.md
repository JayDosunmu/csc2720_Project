


<h2> Datastructures Group Project </h2>
<hr>
<b>Objective:</b> 
We are building a Web Chat Application that will contain a smooth user interface similar to a mordern SMS/Texting Application. Our build will use the standard iOS texting app as a design guide, as it was built using S.O.L.I.D Object Oriented Design Principles. When sending messages to the recipient, we will communicate data from the front-end to the back-end using an Application Protocool Interface (API).  Upon initially viewing the chat app for the first time, a user should be able to select the option to login or quickly create a user account. We will allow users to login with other social media accounts such as: Facebook, Twitter, Gmai, etc. 

<b>Features: </b>
<ul>
    <li>
        encoding the originial human readable message. This not only allows the opportunity to showcase profficient usage of data   structures, but also allows the opportunity for our team of developers to explore the basics of encryption/decryption, and implementing our own proof of concept algorithms. 
    </li>
    <li>
        Voice recognition & speech recognition. Voice Recognition Allows for users to be authenticated via distict wave patterns, speech recognition allows for speech to text transcription. This feature invovles more advanced concepts of Computer Science, touching sub-topics like Artificial Intelligence. Implementing Speech API's shows a fundumental understanding of practical, real world usage of today's cutting edge Software Technologies.
    </li>    
</ul>

<i> SideNote: Documentation and maintenance for the <b>Java Encryption Server</b> is currently being maintained in a seperate repository. If you are here for that, please see the <a href="https://github.com/WiseNN/javaChatDataServer">javaChatDataServer</a> repo. </i>

<hr />


<h2>Documentation</h2>



<h3>Client-Side Usage</h3>
The UI is Currently in BETA 1 testing phase, and does not have all of the visual features that would complement using the Private Messenger. Therefore, there are certain guidelines to use it until more UI has been added.<b>Currently, this application is experiencing bugs in the Safari browser. This issue is being investigated.</b>

<ul>
<li>
<h4>Initial Load: </h4> The landing page: <code>https://chatappproject.herokuapp.com</code>, load a blank chat interface, simply because no user or recipient has been entered into the search query parameters of the URL. This is not an error.
</li>
<li><h4>Adding A User: </h4> To add a user to the private messenger you must download <a href="https://www.getpostman.com">Postman </a>, and send a <b>POST</b> request to the url: <b><code>[domain]/api/users/createUser/:userId</code></b>. Remember to add the sender, and recipient user. 
</li>
<li>
<h4>Starting a Chat: </h4> In order to start a chat between two users, you must type both users into the corresponding query parameters: user, recipient of the url address: <code>https://chatappproject.herokuapp.com?user=<b>senderId</b>&recipient=<b>recipientId</b></code>
</li>
<li>
<h4>Mobile Usage: </h4> While you are able to load the chat website on a mobile device, because it is not configured for touch events the send button will not respond, rendering the application unusable on mobile platforms. This will soon change with an update, but is currently the case.
</li>
</ul>



<h3>Messaging API: [type of api method call] </h3>

<h5>A New User [Post]</h5>

   `/api/users/createUser/:userId`
   

    
<h5>Add Voice Recognition ID tag to a specified existing user [PUT]</h5>

   `/api/users/voiceRecognition/:userId/:voiceId`

<h5>Create A Conversation Between the current user, and recipient user. DO NOT try to add messages to to a user's conversation with-out creating calling this end-point. [POST]</h5>

   `/api/privateChat/createConvo/:userId/:recipeintId`
   
   
<h5>Add a message to a conversation between two users [PUT]</h5>
<i>This route will likely be modified to serve a better implementation</i>

   `/api/privateChat/addMessage/:userId/:recipientId/:message`   
   


<h5>Response format for all API Calls:</h5>

Successfull

    {
      "error": boolean,
      "success": booleam,
      "msg": String,
      "obj": JSON Object
    }      
 
 Error / Unsuccessful
 
    {
      "error": boolean,
      "success": booleam,
      "msg": String
    }      
    
 <h3>Database Method Signatures</h3>
    <i>The  method signatures below will present the name of the function, the data type of each argument and the name of the argument as it appears in the database file. The response code block will not be the response to the user, but the object that is created in response to the database call.</i>
<ul>
    
<li>
<h5>Creates a private conversation between two users</h5>

  `createPrivateConvo(String sender,String recipeint,Object response) `

  
        call: createPrivateConvo("WiseNN", "TaslimD", res)
        response: 
           {
           	"_id" : "WiseNN",
            "privateConvos" : [
                                {
                                  "recipientId" : "Nommel",
                                   "_id" : "WiseNN",
                                   "messages" : [ ]
                                }
                           	],
            "__v" : 1
           }

          
</li>

<li>
<h5>Delete a private conversation between two users</h5>

  `deletePrivateConvo(String sender, String recipeint, Object response) `
  
        call: db.deletePrivateConvo("WiseNN", "TaslimD", res);
        response: (succeeds silently)
</li>

<li>
<h5>Add a user to the database</h5>

  `addUser(String userId, String res) `

        call: addUser("WiseNN");
        response: { "_id" : "WiseNN", "isActive" : true, "__v" : 0 }
</li>

<li>
<h5>Add a voice recognition token to the specified user</h5>

  `addVoiceRecognitionId(String userId, String voiceId, Object res) `
  

        call: addVoiceRecognitionId("WiseNN","kjdns89d8dshcsiudIWEUHIUWE", res);
        response:
            {
            	"_id" : "WiseNN",
               	"isActive" : true,
            	"__v" : 0,
            	"voiceId" : "kjdns89d8dshcsiudIWEUHIUWE"
            }
</li>

<li>
<h5>Remove a user from the database</h5>

  `removeUser(userId, response) `
  
        call: removeUser("WiseNN");
        response: (succeeds silently)

</li>

<li>
<h5>Add a message to a conversation between two users</h5>

  `addMessage(sender, recipient, msg,response) `
        
        call: db.addMessage("WiseNN", "TaslimD", "Hey What's Up!");
        response: (re-constructing)
</li>

</ul>


<h4>Utility Database functions</h4>
<ul>
 <li>
   <h7>Reads the contents of a database document. Pass in a database Schema, and the function will log all documents present</h7>
         
      readDb(db)

 </li>

 <li>
   <h7>Saves newly created database documents. Pass in a database document, or a newly created object out of a database Schema, and a response object, to respond to the client.   The response Parameter can be: `null`</h7>
           
     saveDb(doc, response)
 </li>

 <li>
  <h7>Sends the client a JSON response and status code, depending on the request. Pass in the response object, an http status code, and the json content that needs to be sent back to the client. <b>Do Not Modify</b></h7>
        
    sendJSONresponse(res, status, content)

 </li>
</ul>

<hr />
## CSC 2720 Datastructures Group Project Members

1. **Adobah** 

    Github:

    LinkedIn: 

    Website: 

2. **Brandon**

    LinkedIn: 

    Github: 

    Website: 

3. **Nommel Djedjero**

    LinkedIn: [https://www.linkedin.com/in/nommeldjedjero/](https://www.linkedin.com/in/nommeldjedjero/)

    Github: [https://github.com/NommelDjedjero](https://github.com/NommelDjedjero)

    Website: 

4. **Taslim Dosunmu**

    LinkedIn: [https://www.linkedin.com/in/taslimdosunmu/](https://www.linkedin.com/in/taslimdosunmu/)

    Github: [github.com/JayDosunmu](github.com/JayDosunmu)  

    Website: 

5. **Hasan Raza**

    LinkedIn: 

    Github: 

    Website: 

6. **Norris Wise**

    LinkedIn: [https://www.linkedin.com/in/norris-wise-jr-57352189/](https://www.linkedin.com/in/norris-wise-jr-57352189/)

    Github: [https://github.com/WiseNN](https://github.com/WiseNN)

    Website: 
