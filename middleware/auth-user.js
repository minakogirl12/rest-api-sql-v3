/** Middleware to authenticate user */

'use strict'

const auth = require('basic-auth'); //Basic authentication library
const bcrypt = require('bcrypt');
const {User} = require('../models'); //imports the user model

exports.authenticateUser = async (req, res, next) => {
    let message; //store a display message
    
    //Parse the user credentials from authorization header
    const credentials = auth(req);

    //if credentials are available
    if(credentials){
        //find the user account with matching email
        const user = await User.findOne({where: {emailAddress: credentials.name}});
        console.log(user);

        if(user)//if the user exists check the password
        {
            //compare user's password to saved password
            const authenticated = bcrypt.compareSync(credentials.pass, user.password);
            if(authenticated){//if the passwords match
                console.log(`Authentication successful for email ${user.emailAddress}`);

                //store the user on the Request object
                req.currentUser = user; //adds a property named currentUser to the request object and setting it to the authenticated user.
            }
            else{
                message = `Authentication failed for email: ${user.emailAddress}`;
            }

        }
        else{
            message = `User not found for email: ${credentials.name}`;
        }
    }
    else{
        message = 'Auth header not found';
    }
    

    // If user authentication failed...
        // Return a response with a 401 Unauthorized HTTP status code.
    if(message){
        console.warn(message);
        res.status(401).json({message: 'Access Denied'});
    }
    else
     {// Or if user authentication succeeded...
         // Call the next() method.
        next(); //passes execution to the next middleware function
    }
};