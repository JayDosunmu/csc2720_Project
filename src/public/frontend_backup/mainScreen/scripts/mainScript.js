debugger;
var initialLoad = true;
var url2 = new URL(window.location.href);
    var me = url2.searchParams.get("user");
     
    var you = url2.searchParams.get("recipient");
  
  var socket;

  if(window.location.port != "")
  {
    url = window.location.protocol+"//"+window.location.hostname+":"+window.location.port;
    socket = io(url);
    console.log("url: "+url);
  }else{
    // url = window.location.protocol+"//"+window.location.hostname;
    socket = io();
  }
  console.log("socket: "+socket);
  
  // var socket = io.connect('http://mydomain.com/');
  
  document.addEventListener("DOMContentLoaded", function(event) {
          
          const sendBtn = document.getElementById('sendBtnId');
          var passiveSupported = false;
          
          sendBtn.addEventListener("mouseup", msgSendHandler, passiveSupported
                               ? { passive: true } : false);
          
          const encodeBtn = document.getElementById("myEncodeBtn");
          encodeBtn.addEventListener("mouseup", encryptBtnHandler, passiveSupported
                               ? { passive: true } : false);



  });



//add username to the ?user=[username] & ?recipient=[recipientUsername] query param to get a specific user's message box
    
  
  window.onload = () =>
  {


     debugger;

    initialLoad = true;
     

    //if either param is empty, do not bring up user's thread

    if(me == "" || you == "" || me == null || you == null)
    {

      me = ""; you = "";
    }

  
    
    const url = createUrl(window.location.host, '/api/getMessages/', me);

     $.ajax({url: url, async: true, success: function(result){
            debugger;
            loadMsgs(result);  
        }
      });
  }  



const msgSendHandler = function(evt){


  console.log("event handled");
  const elm = document.getElementById("myTextBox");

  if(elm.value == "")
  {
    return;
  }
  console.log("Show me text: "+elm.value);
debugger;
  socket.emit('addMsg', {sender: me, recipient: you, msg: elm.value });

};

const encryptBtnHandler = function(evt)
{

    debugger;
      console.log("target event: "+evt.target);
      const encodeBtn = document.getElementById(evt.target.id);

      if(initialLoad)
      {
        sessionStorage.setItem("doWhatNext", "encrypt");
         sessionStorage.setItem("encryptedDoc", null);
         initialLoad = false;
      }
      //get doWhatNext from state, save in const
      const doWhatNext = sessionStorage.getItem("doWhatNext");

      //set do what now
      var doWhat = "", key = "", secDoc = "";
      
      //if doWhatNext state has been saved, retrieve state
      if(doWhatNext != "" || doWhatNext != null)
      {
        //getting state
        encodeBtn["doWhatNext"] = doWhatNext;
      }

      //check if doWhatNext exists, if has not been set, set it
      if(encodeBtn["doWhatNext"] == null || encodeBtn["doWhatNext"] == "")
      {
        
        encodeBtn["doWhatNext"] = "encrypt";  
      }
      else //else get current doWhat, and set accordingly
      {
        switch(encodeBtn["doWhatNext"])
        {
          case "encrypt": 
            encodeBtn["doWhatNext"] = "decrypt";  
            //encrypt now (decrypt later)
            doWhat = "encrypt";

            break;
          
          case "decrypt": 
            encodeBtn["doWhatNext"] = "encrypt"; 
            //decrypt now (encrypt later)
            doWhat = "decrypt";

            //if decrypting now, get key from localStorage
             key = sessionStorage.getItem("kissKey");
             secDoc = JSON.stringify(sessionStorage.getItem("encryptedDoc"));

             break;

          //if nothing matches, throw a warning
          default:
          
          console.log("encrption or decryption option has not been selected");
          console.warn("encrption or decryption option has not been selected");
          console.warn("encrption or decryption option has not been selected");
        }
      }
      //if no key, put empty string
      if(key == null)
      {
        key == "";

         secDoc == "";
       
      }
      if(secDoc == "")
      {
         secDoc == "";
      }

      //save doWhat state to sessionStorage
      sessionStorage.setItem("doWhatNext", encodeBtn["doWhatNext"]);
      

      const url = createUrl(window.location.host, '/api/encryptHelper/', me+"/"+doWhat+"?key="+key+"&secDoc="+secDoc);

     $.ajax({url: url, async: true, success: function(result){
            debugger;
            
            if(doWhat == "encrypt")
            {
              //if sec is not empt, save kissKey
              if(typeof result.obj.sec != "undefined" || typeof result.obj.sec != null)
              {
                //save kissKey & delete from object
                sessionStorage.setItem("kissKey", result.obj.sec);
                console.log("kissKey: "+result.obj.sec)
                delete result.obj.sec;
              } 

              
              


            }
            const temp1 = result.obj.data;
            const temp2 = JSON.stringify(temp1);
            sessionStorage.setItem("encryptedDoc",temp2);

            loadMsgs(result);  
        }
      });

};
const createUrl = (host, path, params) =>
{
  debugger;
  
  return window.location.protocol+"//"+host+path+params;
}

const loadMsgs = (result) =>
{
  var convoFrags = document.createDocumentFragment();
            var msgsFrags = document.createDocumentFragment();

            // console.log(JSON.stringify(result,null,3));
            var userId = "",privateConvos = "",removeAllChildren=false;
            

            


            if(result.success)
            {
              
              //test to see if calling from encrpyt or initial load
              if(result.obj.data != undefined)
              {
                 userId = result.obj.data._id;
                 privateConvos = result.obj.data.privateConvos;
                 removeAllChildren = true;
              }
              else
              {
                userId = result.obj._id;
                 privateConvos = result.obj.privateConvos;
              }

              
              for(var i=0; i < privateConvos.length;i++)
              {
                const recipientId = privateConvos[i].recipientId;
                const messages = privateConvos[i].messages;
                const textPreview = messages[messages.length - 1].text;
                
                if(textPreview.length > 199)
                {
                  textPreview = textPreview.substring(0,200);
                }

                const userConvo = addUserConvo(textPreview, recipientId);
                convoFrags.appendChild(userConvo);

                debugger;
                for(var k=0; k<messages.length; k++)
                {
                  const msg = addMsg(userId, recipientId, messages[k]);
                  msgsFrags.appendChild(msg);
                }

              }  
            debugger;
              const convos = document.getElementById("convoBoxWrapper");
              const msgs = document.getElementById("msgsWrapper");

              if(removeAllChildren)
              {
                //safely remove all children
                while (convos.hasChildNodes()) 
                {
                     convos.removeChild(convos.lastChild);
                }
                
                while (msgs.hasChildNodes()) 
                {
                     msgs.removeChild(msgs.lastChild);
                }

                

              }
                //then append child nodes
                convos.appendChild(convoFrags);
                msgs.appendChild(msgsFrags);  
              
                scrollDown();
            }
}
//adds a message to the msgsContainer  
const addMsg = (userId, recipientId, msgObj) =>
{
  var whichUser = "";
  if(userId == msgObj.sender)
  {
    whichUser = "right";
  }
  else if(recipientId == msgObj.sender)
  {
    whichUser = "left";
  }

  var frag = document.createDocumentFragment();
  var div1 = document.createElement('div');
  div1.className = whichUser+" msgContainer";

      var div2 = document.createElement('div');
      div2.className = "userMsgBubble";

          var div3 = document.createElement('div');
          div3.className = "msgBubbleTxt"+whichUser.capitalizeFirst();
          div3.textContent = msgObj.text; //add text for message here

      var div4 = document.createElement('div');
      div4.className = "onlineIndicator";

      var div5 = document.createElement('div');
      div5.className = "userNamePlate";
      div5.textContent = ""; //add user's initials here

  div1.appendChild(div2);

      div2.appendChild(div3);

  div1.appendChild(div4);      

  div1.appendChild(div5);

  frag.appendChild(div1);      
  return frag;

};
  



//creating userConvo fragment and adding it to DOM
const addUserConvo = (textPreview, recipientId) =>
{
  var frag = document.createDocumentFragment();
  var div1 = document.createElement('div');
  div1.className = "userConvo";
    
      var p = document.createElement('p');
      p.className = "convoBoxText";
      
      var textPreviewNode = document.createTextNode("  "+textPreview);  //sets the text preview
      

          var span = document.createElement('span');
          span.className = "recipientUsernameInConvoBox";
          span.textContent = recipientId; //sets recipient username

      var hr = document.createElement('hr');
      hr.className = "divider";

  div1.appendChild(p);

      p.appendChild(span);
      p.appendChild(textPreviewNode);

          div1.appendChild(hr);            


  //finally, add the userConvo to the convoBox
  // document.getElementById('convoBoxWrapper').appendChild(div);
  frag.appendChild(div1);
  return frag;
}


String.prototype.capitalizeFirst = function(){
    return this.charAt(0).toUpperCase() + this.slice(1);
}



// *********************************** SOCKET ******************************************


//when server has disconnected, not when user disconnects  
socket.on('disconnect', function(){

    console.log("Uh-Oh, Looks like the server is down. Please wait, it will be back online shortly");
    // socket.emit('disconnected', 'WiseNN');
});


debugger;

  socket.on('connect', function(){
debugger;
    console.log("me: "+me);
    socket.emit('addCustomId', me);

    
    socket.on('newMsg', function(data)
    {
      debugger;
      if(data.success)
      {
        console.log("WE GOT A NEW MESSAGE!!!")
        console.log(JSON.stringify(data,null,3));
        
        const elmFrag = addMsg(me, you, data);
        const msgs = document.getElementById("msgsWrapper");
        msgs.appendChild(elmFrag);  
        scrollDown()
      }
      else if(data.error)
      {
        console.warn(data.errorMsg);
        console.log("data.errorMsg");
        throw data.errorMsg;
        
      }
      
    });

      window.onbeforeunload = confirmExit;
  
      function confirmExit()
      {
        socket.emit('disconnected', me);
      }
  });
  

   function scrollDown()
    {
        $("#msgsWrapper").animate({ scrollTop: $("#msgsWrapper")[0].scrollHeight}, 0);
    }
/*
Observations: 
- WHenever the server sends us a 'disconnect' event, this is not dependent upon our page refresh or us disconnecting,
	whenever we disconnect from the server, regardless of why, we need to send the sever a disconnection event in some 
	form, to let the server know we are disconnecting, or the transport layer will close on us and we will not know 
	who just disconnected from the server.
*/