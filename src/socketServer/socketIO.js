import chatAppDb from '../mongoDb/db';
import _ from 'underscore';



//express server instance from from app.js


	const db = new chatAppDb();
	var clients = {};
	// io.engine.generateId = (req) => {
	//   return "custom:id:" + custom_id++; // custom id must be unique
	// }

	module.exports = function(io)
	{
			io.on('connection', function(socket){

	debugger;

			socket.on('addCustomId',function(newId){
				debugger;
				if(clients[newId] == null)
				{
					socket.customId = newId;

					clients[socket.customId] = socket;

					console.log(("new Connection: "+socket.customId).yellow.bgBlack);
					// console.log(("Connected Clients: "+JSON.stringify(clients,null,3)).yellow.bgBlack);
					console.log(("Connected Clients: "+Object.keys(clients)).yellow.bgBlack);	
				}else{
					
					console.log("User: "+newId+" is already connected");
					delete clients[newId];
					clients[newId] = socket;
					console.log(("Connected Clients: "+Object.keys(clients)).yellow.bgBlack);	
				}
				

			});

			socket.on('addMsg', function(obj){
				debugger;
				console.log("adding message from socket.io on Server...");	
				console.log("see: "+JSON.stringify(obj));
				db.addMessage(obj.sender, obj.recipient, obj.msg, null,clients,null, null);
			});

			// 1) create group chat id
			// 2) decipher if group chat or private chat
			// 3) 
			socket.on('addGroupMsg', function(obj){

				//send obj to database
				//{userPost}
				db.addGroupMsg(obj);
			});

			socket.on('disconnect', function(userId){

				console.log(("user: "+userId+ "has been disconnect from their socket").yellow.bgBlack);
				delete clients[userId];
				console.log(("(from disconnect) Connected Clients: "+Object.keys(clients)).yellow.bgBlack);

			});

			// socket.on('disconnected', function(userId){
				
			// 	console.log(("Whoa, "+userId+" left really fast!").yellow.bgBlack);
			// 		delete clients[userId];
			// 	console.log(("user: "+userId+ " has been disconnect from their socket").yellow.bgBlack);
			// 	console.log(("(from disconnected) Connected Clients: "+Object.keys(clients)).yellow.bgBlack);

			
			// });

			//need successful reconnection listener, this is a bit unreliable
			// socket.on('reconnected', function(userId){
			// 	console.log(("user: "+userId+" has re-connected").yellow.bgBlack);

			// });

		});


	}
	