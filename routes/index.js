var express = require('express');
var router = express.Router();
var session = require('express-session');
var nforce = require('nforce');
//var cookieParser = require('cookie-parser');
//AWS modules
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');
global.navigator = require('web-midi-api');
 var AWS= require('aws-sdk');
//var app = express();
 //app.use(cookieParser());
var poolData = {
    UserPoolId : "us-east-1_SpQcyv6cV",
    ClientId : "34v4s9o8pcen9o5mpglv9e7jrl"
};
var awsPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var org = nforce.createConnection({
	clientId: '3MVG9L8AofS.N0y63PKCJ2G.fmv.wf4XBanL10nJfAU6aFCH6KpjatFrUB5XNPaYcBfIISDy9dTe5a0RuN_t2',
	clientSecret: '63821A160D0B9D33C753C6F2AE4B2B3339B43BD367E0B18F8EC027C8D43EAC83',
	redirectUri: 'https://127.0.0.1:8080',
	apiVersion: 'v45.0',
	eniveroment: 'producation',
	mode: 'single'
});
// var sfUsername      = 'sajjannehal@gmail.com',
//     sfPassword      = 'Web@1884',
//     sfSecurityToken = 'ZdVE9uSbirOib0cBiJ0lwI5k';

var sfUsername      = 'hd+lotus@onto-genesis.co.uk',
    sfPassword      = 'tquila22',
    sfSecurityToken = 'DUdRKHlYYMYqiG8ldqXa0W0V';


router.get('/', function(req, res){
	
	res.render('index', {title: title});
});
router.get('/test', function(req, res){
	var params = {
      GroupName: 'SFUser1',  
      UserPoolId: 'us-east-1_SpQcyv6cV'  
    };
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:8f5d3423-135a-4eb3-8194-29ce54473854',
});
 

 

   var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider(poolData);
 cognitoidentityserviceprovider.getGroup(params, function(err, data) {
  if (err) 
  {
	  console.log(err, err.stack);
	       req.flash('error', 'error');
  }	  // an error occurred
  else   {
	  console.log(data); 
	     req.flash('success','success');
  }	  // successful response
});

	res.render('test');
});
 
 
router.get('/lightning', function(req, res){
	 res.render('lightning', {title: title});
}); 
router.get('/reset', function(req, res){
	 res.render('reset',{
		 status:req.session['reset-password-status'],
		 message:req.session['reset-password-message'],
		 error:req.session['reset-password-errors'],
		 session: req.session
	
		 
	 });
}); 

 router.post('/reset', function(req,res ){
	 req.session['reset-password-errors']=[];
     if(req.body.email){
    	 const userDetails = { Username: req.body.email , Pool : awsPool} ;
    	  
    	 const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails);
    	   cognitoUser.forgotPassword({
                onSuccess: function (result) {
                    console.log('call result: ' + result);
        			req.session['reset-password-email']= req.body.email;
        			req.session['reset-password-status']='Email Sent';
        			//req.session['reset-password-message']= `check Your Email ${}`;
        			   console.log('call result: ' + result);
			  req.flash('success', 'Please check a reset password link in your ('+req.body.email+') mail!' );
        				 res.redirect('/reset');
                },
                onFailure: function(err) {
                    console.log(err);
        			req.session['reset-password-errors'].push(err);
			 req.flash('error', err.message);
        			res.redirect('/reset');
                }
            });
     }
 
});

router.get('/resetpassword', function(req, res){
    res.render('newpassword');
});

router.post('/resetpassword', function(req, res){
    var email = req.body.email;
    var code = req.body.code;
    var password = req.body.password;
     if(req.body.code){
        const userDetails = { Username: email, Pool: awsPool} ;
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails);
        cognitoUser.confirmPassword(code, password ,{
            onSuccess: function (result) {
                console.log(result);
                req.flash('success', 'User Created and Password Changed');
        		res.redirect('/');
            },
            onFailure: function(err) {
                console.log(err);
			 req.flash('error', err.message);	
        	    res.redirect('/resetpassword');
            }
        });
     }
 
});
 
router.get('/newpassword/', function(req, res){
 
  console.log(req.query.code);
    res.render('newpassword', {code: req.query.code ,email:  req.query.email});
});
router.get('/setpassword/:email/:code', function(req, res){
 

    res.render('setpassword', {code: req.params.code ,email:  req.params.email});
});
router.get('/setpassword', function(req, res){
 

    res.render('setpassword');
});
router.post('/setpassword', function(req, res){
    var email = req.body.email;
    var code = req.body.code;
    var password = req.body.password;
     if(req.body.code){
        const userDetails = { Username: email, Pool: awsPool} ;
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails);
        cognitoUser.confirmPassword(code, password ,{
            onSuccess: function (result) {
                console.log(result);
                req.flash('success', 'User Created and Password Changed');
        		res.redirect('/');
            },
            onFailure: function(err) {
                console.log(err);
				 req.flash('error', err.message);
        	    res.redirect('/setpassword/'+email+'/'+code);
            }
        });
     }
 
});
router.post('/lightning', function(req, res){
	var coUsername = req.body.email;
    var coPassword = req.body.password;

    if (coUsername || coPassword){
        const authenticationData = {
            Username : coUsername,
            Password : coPassword
        };
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        const userData = {
            Username : coUsername,
            Pool : awsPool
        };
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                session.result = result.getIdToken().payload;
                const cognitoId = result.getIdToken().payload.sub;
                console.log('Cognito User -----' + result.getIdToken().payload);
                console.log('CognitoUser logged in' + cognitoId);
                

				org.authenticate({username: sfUsername, password: sfPassword, securityToken: sfSecurityToken}, function(err, resp){
					if (!err) {
                        console.log('instance_url:------' + resp.instance_url);
						console.log('Token: ' + resp.access_token);
						var outhtoken = resp.access_token;
						var lightningEndPointURI = "https://customcomm-dev-ed.lightning.force.com";
						res.cookie('outhtoken', outhtoken);
						res.cookie('lightningEndPointURI',lightningEndPointURI);
						res.cookie('cognitoId',cognitoId);
						res.cookie('result', session.result);
					 
                        req.flash('success', 'Thanks for signing up to try Blue Inc.');
			            res.render('lightning', {title: title});
						
					}else{
						console.log('Error: ' + err);
						req.flash('error',  err.message + ' !');
						res.redirect('/');
					}
				});
            },
            onFailure: function(err) {
            	console.log('Error: ' + err.message);
                req.flash('error',  err.message + ' !');
                res.redirect('/');
            }

        });
    }else {
        req.flash('error', 'Email or Password is empty!');
        res.redirect('/');
    }

});

router.get('/signout', function(req, res){
    // const cognitoUser = awsPool.getCurrentUser();
    // if (cognitoUser){
        res.clearCookie('outhtoken');
        res.clearCookie('lightningEndPointURI');
        res.clearCookie('cognitoId');
        res.clearCookie('result');
        res.clearCookie('connect.sid');
        res.clearCookie('csrftoken');
        res.clearCookie('sessionid');
        // cognitoUser.signOut();
        console.log('Signout successfully!');
        req.flash('success', 'Signout successfully!');
        res.redirect('/');
    // }else{
    //     req.flash('error', 'You Already Signout! Kine k var signout kre ga hun!');
    //     res.redirect('/');
    // }

});

module.exports = router;
