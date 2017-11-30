import mongoose from 'mongoose';

/*
{
	privateChat :{
			userId :{
				recipientId :{
						messages : uid(ObjectID_Key) : {
							date : `_DATE`,
							time : _TIME,
							sender : _recipientId or _userId,
							messages : _MESSAGE
								
					}
				}
	
		} 
	}
}
*/

//DO NOT DIRECTLY CALL db.save() on this schema
const userMessage = mongoose.Schema({
						
						
							date: {type: String, required: true},
							time: {type: String, required: true},
							sender: {type: String, required: true},
							text: {type: String, required: true}
							
				});
//DO NOT DIRECTLY CALL db.save() on this schema
// const privateConvo = mongoose.Schema({
// 			 _id: {type: String, required: true },
// 	recipientId : {type: String, required: false , unique: true, sparse: true, dropDups: true},
// 		messages: {type: [userMessage]}
// });

const userPrivateConvos = mongoose.Schema({
	_id: {type: String, required: true},
	privateConvos: {type: [{
		 _id: {type: String, required: true },
	recipientId : {type: String, required: false , unique: true, sparse: true, dropDups: true},
		messages: {type: [userMessage]}
	}], unique: true, sparse: true}
});

const users = mongoose.Schema({
	_id: {type: String, required: true},
	voiceId: {type: String, required: false},
	isActive: {type: Boolean, required: true} 
});

const groupChat = mongoose.Schema({
	_id: String,
	userPosts: [{ //this is an array of objects that contain userPosts
		userId: String,
		message: String
	}]
});


userPrivateConvos.index(
    { recipientId: 1},
    {
        partialFilterExpression: { recipientId: { $exists: true } }
        
    }
);


// mongoose.model('PrivateConvo', privateConvo);
mongoose.model('UserPrivateConvos', userPrivateConvos);
mongoose.model('Message', userMessage);
mongoose.model('Users', users);
mongoose.model('GroupChat', groupChat);

