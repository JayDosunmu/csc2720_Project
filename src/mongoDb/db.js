//system modules
import mongoose from 'mongoose';
import colors from 'colors';
import {ObjectId} from 'mongodb';
import _ from 'underscore';
import superagent from 'superagent';




//custom modules
import Util from '../utilities/util';
const  myUtil = new Util();


//-----------------------------------


//get production url or localhost or exit with failure code
if(process.env.NODE_ENV == "production")
{
	if(process.env.dbUrl != null || process.env.dbUrl != "")
	{
		
		mongoose.connect(process.env.dbUrl);
		console.log("production...".green)
	}else{
		console.log("DATABASE URL HAS BEEN OFFLOADED, PLEASE CONTACT AN APPLICATION ADMINISTRATOR".red.bgWhite);
		console.log("DATABASE URL HAS BEEN OFFLOADED, PLEASE CONTACT AN APPLICATION ADMINISTRATOR".red.bgWhite);

		process.exit(1);
	}
	
}else{
	mongoose.connect('mongodb://localhost/chatAppProject');	
	console.log("development...".green)
}


const db = mongoose.connection;


db.once('open', () => {console.log("database is connected!...".red);});

db.on('error', (err) => {console.log(("There was an error connecting to the database: "+err).red);});
var callNum = 0;

import dbSchema from './dbSchema';
//get Models from mongoose Schema 
const userPrivateConvos = mongoose.model('UserPrivateConvos');

const groupChat = mongoose.model('GroupChat');
// const privateConvo = mongoose.model('PrivateConvo');
const message = mongoose.model('Message');
const users = mongoose.model('Users');


//partial Filter Expressions
// privateConvo.collection.createIndex({"recipientId" : 1 } , {partialFilterExpression: { recipientId: {$exists:true}}}, function(err , result){
     
//      console.log(("Partial Filter Expression Logger: \nERR: "+err+"\nResults: "+result).black.bgYellow);
//  });


export default class chatAppDb
{
	
	constructor()
	{
		//binding scope of class
		this.createPrivateConvo = this.createPrivateConvo.bind(this);
		this.deletePrivateConvo = this.deletePrivateConvo.bind(this);
		this.addUser = this.addUser.bind(this);
		this.addVoiceRecognitionId = this.addVoiceRecognitionId.bind(this);
		this.removeUser = this.removeUser.bind(this);
		this.addMessage = this.addMessage.bind(this);
		this.readDb = this.readDb.bind(this);
		this.saveDb = this.saveDb.bind(this);
		this.sendJSONorSocketresponse = this.sendJSONorSocketresponse.bind(this);
	}
	

	addUser(userId, response)
	{
		if(typeof userId != undefined)
		{
			const newUser = new users({_id:userId, isActive:true});
			const newUserPrivateConvos = new userPrivateConvos({_id: userId, privateConvos: []});
			
			debugger;
			const that = this;
			//save privateConvos Collection, then callback users Collection, pass null 'response' to avoid setting http headers twice
			this.saveDb(newUserPrivateConvos,null,null,function(){

				debugger;
				that.saveDb(newUser,response,null,null);		
			});
			
		}else{
			const responseMsg = "There is no userName to add";
			console.log(responseMsg.magenta.bgBlack);
			this.sendJSONorSocketresponse(response, 404, {error:true, success:false, msg:responseMsg});
		}
		
	}

	removeUser(userId, response)
	{
			debugger;
		if(typeof userId != 'undefined')
		{

			const that = this;
			userPrivateConvos.findByIdAndRemove(userId, (err,doc) => {
				const responseMsg = "";
				if(doc && !err)
				{
					that.saveDb(doc,response);
				}
				else if(err)
				{
					const responseMsg = "ERR: "+err;
					console.log(responseMsg.red);
					that.sendJSONorSocketresponse(response, 400, {error:true, success: false, msg: responseMsg});
				}
				else if(!doc)
				{
					const responseMsg = "No user with the username: "+userId+" exists";
					console.log(responseMsg.red);
					that.sendJSONorSocketresponse(response, 200, {error: true, success: false, msg: responseMsg});
				}
				
			});
		}
		else
		{
			const responseMsg = "no UserId was specified"
			this.sendJSONorSocketresponse(response, 404, {error:true, success: false, msg: responseMsg});
		}
	}

	addVoiceRecognitionId(userId,voiceId,response)
	{
		const that = this;
		users.findById(userId, function(err,doc){
			if(typeof doc != 'undefined')
			{
				doc.voiceId = voiceId;
				that.saveDb(doc, response);
			}
			else
			{
				const responseMsg = "Voice recognition cannot be setup for a user in this document because it does not exist ERROR: "+err;
				that.sendJSONorSocketresponse(response, 404, {error:true, success:false, msg:responseMsg});
			}
			
		});
	}

	//creates one private convo with a given recipient
	createPrivateConvo(sender, recipient, response, callback)
	{debugger;
		const that = this;
		
		
		users.count({_id: recipient}, function (err, count){ 
		    debugger;
		    if(!(count>0))
		    {
		        const responseMsg = "The recipient: "+recipient+" does not exist";
		         that.sendJSONorSocketresponse(response, 200, {error:false, success:true, msg:responseMsg});

		    }else
		    {
		    	//search for user in userPrivateConvos Schema
				userPrivateConvos.findById(sender, function(err,doc){
						debugger;
							console.log("doc in userPrivateConvos: "+JSON.stringify(doc,null,3));

					//doc error checking, then handle data
					if(doc != null && err == null)
					{
						//see if recipient and user already have a convo in userPrivateConvos Schema, if not create & save convo
						const result = _.findWhere(doc.privateConvos, {recipientId: recipient});
						if(typeof result == "undefined")
						{
							
							//creation
							const newConvo = {
								_id: sender,
								recipientId: recipient,
							};
							//           {doc}
							//add to userPrivateConvos.privateConvos array in Schema & save
							//             ^
							doc.privateConvos.push(newConvo);
							
							that.saveDb(doc,response,null,callback);

						}
						//if there is a doc, report that it exists
						else if (typeof result != "undefined")
						{
							const responseMsg = "convo in "+doc.constructor.modelName+" between sender: "+sender+" & recipient: "+recipient+" has already been created";
							console.log(responseMsg.magenta.bgWhite);
							that.sendJSONorSocketresponse(response, 204, {error:false, success: true, msg: responseMsg});
						}
						//else report that there is a serious error creating userPrivateConvos
						else{
							const responseMsg = "Serious ERROR in Schema: "+doc.constructor.modelName+" check createPrivateConvo() function";
							console.log(responseMsg.magenta.bgWhite);
							that.sendJSONorSocketresponse(response, 500, {error:true, success: false, msg: responseMsg});

						}

						


					}
					else if (doc == null){
						const responseMsg = "There is no user by that username: "+newConvo._id;
						console.log(responseMsg);
						//interaal server error code because client is not responsible for error
						that.sendJSONorSocketresponse(response, 404, {error:true, success:false, msg:responseMsg});

					}
					else if(err)
					{
						const responseMsg = "createPrivateConvo() ERROR: "+err;
						//internal server error code because client is not responsible for error
						that.sendJSONorSocketresponse(response, 500, {error:true, success:false, msg:responseMsg});

					}	
				});	


		    }
				
		});
	}

	


	deletePrivateConvo(sender, recipient, response)
	{
		userPrivateConvos.findById(sender,function(err,doc){
			
			if(doc != null && err == null)
			{
				const that = this;
				doc.privateConvos.findOneAndRemoveOne({recipientId: recipient},{new: true}, function(subErr, subDoc){
					if(subDoc != null && subErr == nul)
					{
						const responseMsg = sender+" privateConvos After recipient: "+recipient+" Deletion: "+subDoc;
						console.log((responseMsg).green.bgBlack);

						that.sendJSONorSocketresponse(response,204,{error:false, success:true, msg:responseMsg});

					}
					else{
						const responseMsg = "deletePrivateConvo ERR >> findOneAndRemove SubERR: "+subErr;
						console.log((responseMsg).red);

						that.sendJSONorSocketresponse(response,404, {error:true, success:false, msg:responseMsg});
					}
				});	
			}
			else{
				console.log(("deletePrivateConvo ERR: "+err).red);
			}
		});
	}
	

	
		
	//adds a message to the privateConvo
	addMessage(sender, recipient, msg,response, socketDic,swapped, callback)
	{
		const that = this;
		//printing arguments
		console.log("args: ",sender, recipient, msg,response, socketDic);
		console.log("trip starting...");
		
		//if a socketDicionary was sent, attactch the recipient to it
		if(socketDic != null)
		{
			console.log("ASSIGNED RECIPIENT TO DICTIONARY!!");

			socketDic["tempRecipient"] = recipient;
		}
		

		//check if recipient exists, if not send error
		users.count({_id: recipient}, function (err, count){ 
		    debugger;
		    if(!(count>0))
		    {
		    	console.log("cancelling trip...");
		        const responseMsg = "The recipient: "+recipient+" does not exist";
		        const myObj = {
		        	error: true,
		        	errorMsg: responseMsg,
		        	success: false
		        };
		        	//if sender's socket is still connected, send error response to client
		        	if(socketDic != null && socketDic[sender] != null)
		        	{
		        		console.log("trip cancelled.a");

		        		
		        		socketDic[sender].emit("newMsg", myObj);
		        	}
		        	else{ //if not, log that sender is not connected error
		        		console.log("trip cancelled.b");
		        		const responseMsg = "Sender's socket is not connected anymore? Why? ";
		        		console.log(responseMsg.red.bgWhite);
		        		throw responseMsg;
		        		
		        	}

		        	
		         //do not send socket dictionary, respond to client here for now...
		         that.sendJSONorSocketresponse(response, 404, {error:true, success:false, msg:responseMsg});
		        
		    }
		    else
		    { //if recipient exists, continue
		    
				 debugger;
				 console.log("trip 1");
				//search for sender in userPrivateConvos Schema
				userPrivateConvos.findById(sender,function(err,senderDoc){

						console.log("trip 2");
		
					const dateTime = myUtil.getDateAndTime();

						debugger;
						console.log(("err: "+JSON.stringify(err,null,3)+"\n doc: "+JSON.stringify(senderDoc,null,3)).bgBlack);

						//doc error handling, check if user exists, if does, check if user's PrivateConvo Exists between recipient and sender
						if(senderDoc != null && err == null)
						{
							console.log("trip 3");
		
							//search for recipient in user's privateConvos
							const result = _.findWhere(senderDoc.privateConvos, {recipientId: recipient});


							//if recipient and sender have privateConvo, add message
							if(typeof result != 'undefined')
							{
								debugger;
								console.log("trip 4");
		

								
								//if sender & recipient has been reversed in param (for recursive call), put correct sender in object
								if(swapped != null && swapped == true)
								{		console.log("SWAPPED SENDER & RECIPIENT!!");
									 	const newMsg = new message({
										date: dateTime.date,
										time: dateTime.time,
										text: msg,
										sender: recipient
									});
									 	result.messages.push(newMsg);
									
								}
								else{
										console.log("NOT SWAPPED SENDER & RECIPIENT");

										const newMsg = new message({
										date: dateTime.date,
										time: dateTime.time,
										text: msg,
										sender: sender
									});
										result.messages.push(newMsg);
								}
								
								console.log(JSON.stringify(result).black.bgWhite);

								
								debugger;

								
								//after newMsg push, save the 'result' (derived from userPrivateConvo Schema)
								const shouldRespond = (swapped) ? response : null;
								that.saveDb(senderDoc, shouldRespond, socketDic, function(){
									debugger;

									console.log("trip 6");
									//if we have added the msg to recipient's thread do that now
									if(swapped == null)
									{
										console.log("trip 7");
										//dont send response to server, one has already been sent, THIS IS UNSAFE!
										that.addMessage(recipient, sender, msg, response,socketDic, true);	
									}
									
								});
								
							}
							//if sender and recipient do not have a private convo, create privateConvo in userPrivateConvo Schema
							else if (typeof result == 'undefined')
							{
									console.log("trip 8");
									const responseMsg = "The recipient: "+recipient+" does not exist...creating convo";
									debugger;
									that.createPrivateConvo(sender, recipient,null,function(){
										debugger;
										console.log("trip 9");
										
										//*** MARK SWAPPED FLAG TO AVOID WRONG SENDER ERROR!
										that.addMessage(sender,recipient, msg, response, socketDic, true);
										debugger;
									});
									// that.sendJSONorSocketresponse(response, 404, {error:true, success:false, msg:responseMsg})
							}	


								
						}
						else if(err)
						{
							console.log("trip 10");
							debugger;
							const responseMsg = "ERROR: "+err;
							that.sendJSONorSocketresponse(response, 400, {error:true, success:false, msg:responseMsg});
						}
						else if(senderDoc == null)
						{
							console.log("trip 11");
							debugger;
							const responseMsg = "This User: "+sender+" does not Exist";
							that.sendJSONorSocketresponse(response, 404, {error:true, success:false, msg:responseMsg});
						}
				});	
		    }
		});
	}
	


	addGroupMsg(userObj)
	{
		//this is an object to access a userPost for a group message 
		userObj.userPosts[i].userId;
		userObj.userPost[i].message;
	}

	createGroupChat(groupChatId)
	{
		groupChat.find(function(err,doc){
			//...
		});
	}
	
	//Sends a request to java server to encrpt data
	encryptHelper(response,userId,doWhat,key, secDoc)
	{
		debugger;
		const jsonObj = {
			"_id": "WiseN",
			"__v": 4,
			"privateConvos": [
			  {
			     "recipientId": "TaslimD",
			     "_id": "WiseN",
			     "__v": 0,
			     "messages": [
			        {
			           "_id": "5a130b5ac9b53d2d73e10952",
			           "text": "Hey Whats Up", 
			           "sender": "WiseN",
			           "time": " 12:05:29 GMT-0500 (EST)",
			           "date": "October 20, 2017"
			        },
			        {
			           "_id": "5a130c2fc9b53d2d73e10953",
			           "text": "Hey, Nothing much, this API has really been kicking my ass", 
			           "sender": "TaslimD",
			           "time": " 12:09:03 GMT-0500 (EST)",
			           "date": "October 20, 2017"
			        },
			        {
			           "_id": "5a130c70c9b53d2d73e10954",
			           "text": "I bet. This homework as pretty much taken over my life. Im just trying to stay a float lol",
			           "sender": "WiseN",
			           "time": " 12:10:08 GMT-0500 (EST)",
			           "date": "October 20, 2017"
			        }
			     ]
			  }
			   
			]
		};

		
		//if there is no key and this is a decrypt request abort
		if((key == "" || key == null || key == undefined) && doWhat == "decrypt")
		{
			const responseMsg = "there is no key to decrypt with";
			sendJSONorSocketresponse(response,400,{error: true, success:false, msg:responseMsg}, null);
			console.log(responseMsg);
			return "";

		}
		else if (doWhat == "encrypt")
		{
			if(!(key == "" || key == null || key == undefined))
			{
				const responseMsg = "calling encrypt with a decryption key is not allowed. Bad request.";
				sendJSONorSocketresponse(response,400,{error: true, success:false, msg:responseMsg}, null);
				console.log(responseMsg);
				return "";				
			}
			
		}

		var reqUrl = "";
		if(process.env.NODE_ENV == "production")
		{
			switch(doWhat)
			{
				case "encrypt":  reqUrl = process.env.encryptUrl;
					break;
				case "decrypt" : reqUrl = process.env.decryptUrl;
					break;
				default: 
					console.log("FATAL ERROR FROM: encryptHelper()");
			}
			
		}
		else
		{
			//get cooresponding URL for encrypt or decrytion, if  doWhat is not specified, quit (conmment when testing)
			switch(doWhat)
			{
				case "encrypt":  reqUrl = 'http://localhost:4567/encryptData';
					break;
				case "decrypt" : reqUrl = 'http://localhost:4567/decryptData';
					break;
				default: 

					console.log("FATAL ERROR FROM: encryptHelper()...option for encryption or decryption has not been set");
					// return "";
			}

		}
		const that = this;
		//get all users messages to encrypt from db
		userPrivateConvos.findById(userId,function(err,doc){
debugger;
			
			if(err)
			{
				const responseMsg = err;

				that.sendJSONorSocketresponse(response,400,{error: true, success:false, msg:responseMsg}, null);

			}
			else if(!doc)
			{
				const responseMsg = "there was no user in the database by that username: encryptHelper()";

				that.sendJSONorSocketresponse(response,404,{error: true, success:false, msg:responseMsg}, null);
			}
			else
			{	
					
				var sendDoc = "";
					if(doWhat == "decrypt")
					{
						doc = JSON.parse(secDoc);
						sendDoc = doc;
					}else{
						 sendDoc = JSON.stringify(doc);	
					}
					

					// else if(doWhat == "decrypt" && typeof secDoc != undefined)
					// {
					// 	console.log("THERE IS NO SECURE DOC TO DECRYPT".red.bgBlack);
					// }
					console.log("URL: "+reqUrl);
					console.log(("doc--: "+doc).green);
					// console.log(("DB-DOC:"+JSON.stringify(doc,null,3)).green.bgBlack);

					//send request to java server
					superagent.get(reqUrl)
					.query({"dataObj":sendDoc , "doWhat": doWhat, "key":key})
					 // .set('accept', 'json')
					 //  .set('content-type', 'application/json')
					.end((err, res) => 
					{
debugger;
						

						

					 //  if(err && res) 
					 //  {
					 //  	const responseObj = JSON.parse(res.text);
					 //  	console.log(("res: "+JSON.stringify(responseObj,null,3)).white.bgBlack);
						// console.log(("resFULL: "+JSON.stringify(res,null,3)).white.bgBlack);

					 //  	const responseMsg = "Succeded with error: "+err;
					 //  	console.log(("ERR: "+err).red.bgWhite);
					 //  	console.log(("BODY: "+res.req).green.bgBlack);
					 //  	// console.log(("EXPLAINATION"+res.body.explanation).magenta.bgBlack);

					 //  	that.sendJSONorSocketresponse(response,200,{error: true, success:true, msg:responseMsg, obj:responseObj}, null);
					 //  }
					  if(err)
					  {
					  	const responseMsg = err;
					  	console.log(("ERR: "+err).red.bgWhite);

					  	that.sendJSONorSocketresponse(response,400,{error: true, success:false, msg:responseMsg}, null);
					  }
					  else if(!res)
					  {
					  	
					  	const responseMsg = "there was no response, check the java server";
					  	console.log(responseMsg.red.bgWhite);
					  	that.sendJSONorSocketresponse(response,404,{error: true, success:false, msg:responseMsg}, null);

					  }else{

					  	
					  	console.log(("BODY: "+res.body.url).green.bgBlack);
					  	console.log(("EXPLAINATION"+res.body.explanation).magenta.bgBlack);
					  	
					  	const responseObj = JSON.parse(res.text);
					  	console.log(("res: "+JSON.stringify(responseObj,null,3)).white.bgBlack);
						console.log(("resFULL: "+JSON.stringify(res,null,3)).white.bgBlack);


					  	const responseMsg = "success";
					  	that.sendJSONorSocketresponse(response,200,{error: false, success:true, msg:responseMsg, obj:responseObj}, null);

					  }

					});

			}
		});
	}

	//DB Helper Function
	/******************************************************************************/
	/******************************************************************************/
	
	//not available to call from API
	readDb(db, userId,response)
	{
		if(db)
		{
			db.find((err, doc) => {
				console.log("ReadDB collection named: "+doc.constructor.modelName+":: "+JSON.stringify(doc,null,3));
			});	
		}
		else if (response)
		{
			const that = this;
			userPrivateConvos.findById(userId, function(err, doc){

				
							debugger;
							//if doc is present, do not save newConvo document
							if(doc && !err)
							{
								const responseMsg = "Reading Database";
								that.sendJSONorSocketresponse(response, 200, {error:false, success:true, msg:responseMsg, obj: doc},null);
							}//if err, send err
							else if(err)
							{
								const responseMsg = "ERR: "+err;
								that.sendJSONorSocketresponse(response, 500, {error:true, success:false, msg:responseMsg},null);
							}//if doc is not present, save doc and update userPrivateConvos
							else if(!doc)
							{
								const responseMsg = "The user: "+userId+" does ont exist";
								that.sendJSONorSocketresponse(response, 404, {error:false, success:true, msg:responseMsg},null);
							}
					});
		}
	}
		
	


	saveDb(doc, response, socketDic, callback)
	{
		console.log("trip 12");
		debugger;
		callNum++;
		console.log("SaveDb DOC: "+JSON.stringify(doc));
		const that = this;
		//if doc is not undefined/null
		if(typeof doc != null)
		{
			debugger;
			console.log("trip 13");
			const that = this;
			//save dat
			doc.save(function(err,newDoc){
				console.log("trip 14");
				debugger;
				console.log(("call num: "+callNum+", NEW DOC FROM SAVE: "+newDoc).black.bgWhite);
				//if save returns newDoc, print newDoc in magenta with black background to console
			if(newDoc)
				{
					console.log("trip 15");
					const responseMsg = "Updated "+doc.constructor.modelName+" Database";
					
					console.log((responseMsg+": "+JSON.stringify(newDoc, null, 3)).magenta.bgBlack);
					debugger;

					that.sendJSONorSocketresponse(response,201, {error: false, success:true, msg:responseMsg, obj: newDoc}, socketDic);

					if(callback != null)
					{
						console.log("trip 16");
						callback();
					}	

					
				}//if save error, print error 
				else if(err)
				{
					console.log("trip 17");
					const responseMsg = "There was an error updating an item. ERORR: "+err;

					console.log((responseMsg).red.bgWhite);

					that.sendJSONorSocketresponse(response,400, {error: true, success:false, msg:responseMsg}, socketDic);
					
				}
			});	
		}else{
				console.log("trip 18");
				const responseMsg = "CANNOT SAVE DOCUMENT FOR"+ doc.constructor.modelName;
				
				console.log((responseMsg).red);
				
				that.sendJSONorSocketresponse(response,500, {error: true, success:false, msg:responseMsg}, socketDic);
		}

		
		
	}

	
	sendJSONorSocketresponse(res, status, content,socketDic)
	{
		console.log("trip 19");

		console.log(("SOCKET-DIC: "+socketDic).green.bgBlack);
		debugger;
		if(res != null)
		{
			console.log("trip 20");
			res.status(status);
			res.json(content);
				
		}
		else if(socketDic != null)
		{
			console.log("trip 21.a");
			console.log("CALLED SOCKET-DIC!".green.bgBlack);
			//get id of sender
			const doc = content.obj._doc;

			//if sender is online (in the socketDictionary), see if recipient is online & send socResponse to client (to update view)
			if(socketDic[doc._id] != null)
			{


				console.log("trip 21");

				
				//look for recipient's id in sender's list of privateConvos (get their convo)
				const result = _.findWhere(doc.privateConvos, {recipientId: socketDic["tempRecipient"]});
				
				//if convo found, check if recipient is online, send response to sender
				if(typeof result != "undefined")
				{
					console.log("trip 21.b.a");

					content = result.messages[result.messages.length-1];

					//create message response for both parties
					var myObj = {
							success: true,
							error: null,
							errorMsg: "",
							sender: content.sender,
							recipient: socketDic["tempRecipient"],
   							text: content.text,
   							time: content.time,
   							date: content.date
					};

					//commented because recursive call to addMessage takes care of calling the recipient's socket
					// //check if recipient is online, if so, send response to recipient's client
					// if(socketDic[socketDic["tempRecipient"]] != null)
					// {
					// 	socketDic[socketDic["tempRecipient"]].emit("newMsg", myObj);
					// }
					// else{//if not, log message to console
					// 	console.log("recipient "+socketDic["tempRecipient"]+" is not online");
					// }

					
					console.log("trip 22");	

					//sending message to sender's client
					socketDic[doc._id].emit('newMsg', myObj);	
				}
				else{//if convo not found log an error 
						console.log("trip 23");	
					console.log("ERROR FROM sendJSONorSocketresponse() RECIPIENT WASNT FOUND MAJOR ERRROR!".red.bgWhite);

					const myObj = {
						error: true,
						errorMsg: "Conversation between sender: "+doc._id+" and recipient: "+socketDic["tempRecipient"]+" was not found",
						success: false
					};
					socketDic[doc._id].emit('newMsg', myObj);	
				}

				
			}
			else{//if sender is not online, log message

				console.log(("USER: "+doc._id+" is not online").red.bgWhite);
			}
			

		}
		else{
			console.warn("No JSON or SOCKET response was sent in call".red.bgYellow);
		}

		console.log("trip 24");
		
		if(socketDic != null && typeof socketDic["tempRecipient"] != null)
		{
			delete socketDic["tempRecipient"];
		}
		
		
	}
}

const db1 = new chatAppDb();
// db1.addUser("WiseNN");
// db1.addVoiceRecognitionId("WiseNN","kjdns89d8dshcsiudIWEUHIUWE");
// db1.removeUser("WiseNN");
// db1.encryptHelper(null,"WiseNN","encrypt");


