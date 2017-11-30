import express from 'express';
import Util from '../utilities/util';
import chatAppDb from '../mongoDb/db';

const db = new chatAppDb();
var router = express.Router();


//create user
router.post("/users/createUser/:userId", (req,res) => {
	
	console.log("params: "+JSON.stringify(req.params));
	//attempts to add user to db, will send response to client
	db.addUser(req.params.userId, res);
	
});

router.delete("/users/removeUser/:userId", (req,res) => {
	
	console.log("params: "+JSON.stringify(req.params));
	//attempts to add user to db, will send response to client
	db.removeUser(req.params.userId, res);
	
});

//add voice recognition Id
router.put("/users/voiceRecognition/:userId/:voiceId", (req,res) => {

	//attempts to add voiceId to existing user, will send response to client
	db.addVoiceRecognitionId(req.params.userId, req.params.voiceId, res);
});


//creates a private convo with the sender & recipient
router.post("/privateChat/createConvo/:userId/:recipeintId", (req,res) => {


	db.createPrivateConvo(req.params.userId,req.params.recipeintId, res);

});

router.delete("/privateChat/deleteConvo/:userId/:recipeintId", (req,res) => {

	db.deletePrivateConvo(req.params.userId,req.params.recipeintId, res);

});


router.get("/encryptHelper/:userId/:doWhat", (req, res) => {

	// res.send("Hey");
	
	db.encryptHelper(res, req.params.userId, req.params.doWhat,req.query.key, req.query.secDoc);
});



//add message to a private chat
//PLEASE UPDATE TO USE REQUEST BODY, DO NOT PASS MESSAGE VIA PARAMS

router.put("/privateChat/addMessage/:userId/:recipientId/:message", (req,res) => {
	
	console.log("params from routes: "+req.params.message);

	
	db.addMessage(req.params.userId, req.params.recipientId, req.params.message, res);

	
});

router.get("/getMessages/:userId", (req, res) => {
	db.readDb(null, req.params.userId, res);
});




export default router;