'use strict'

const { response } = require('express');
const express = require('express');
const {asyncHandler} = require('./middleware/async-handler'); //import async handler function
const {User, Course} = require('./models');
//
//Construct a router instance
const router = express.Router();

//import authentication middleware
const {authenticateUser} = require('./middleware/auth-user');

//basic-auth import to access username of current user
const auth = require('basic-auth'); //Basic authentication library

//User Routes
/*GET Returns the authenticate user with 200 HTTP status code */
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
   // res.send('Returns list of users');
   const credentials = auth(req);
   const user = await User.findOne({where: {emailAddress: credentials.name}});
    //return user info and status code 200
    res.status(200).json(user);
}));

/*POST Creates a new user, set Location header to / and return 201 status code with no content */
router.post('/users', asyncHandler( async(req, res) => {
     // Get the user from the request body.
        const user = req.body;
    //TODO: Check for can remove below and use a try catch block instead
  const errors = [];
  if(!user.firstName)//checks that  the name property exists and that it is not undefined, null, or empty
  {
    errors.push('Please provide a value for "firstName"'); //adds name error message
  }
  if(!user.lastName)//checks that  the name property exists and that it is not undefined, null, or empty
  {
    errors.push('Please provide a value for "lastName"'); //adds name error message
  }
  
  if(!user.emailAddress)//checks that email property exists and it is not empty
  {
    errors.push('Please add a value for "email"');
  }
  
  if(!user.password)//checks for password value
  {
    errors.push('Please provide a value for "password"');
  }
  else if(user.password.length < 8 || user.password.length > 20){
    errors.push("Your password must be between 8 and 20 characters");
  }
  
  //if there are any errors
  if(errors.length > 0){
    //return errors to clients
    res.status(400).json({errors});
  }
  else{
    //console.log(user); 
    // Add the user to the database
     await User.create(user);
    // Set the status to 201 Created and end the response.
    res.status(201).location('/').end();
  }

}));


//Courses Routes
/*GET Returns a list of all courses including user that owns the course and 200 HTTP status code*/
router.get('/courses', asyncHandler( async(req, res) => {
    const courses = await Course.findAll({ include: [{model: User, as: 'user'}]});
    res.status(200).json(courses);
}));

/*GET Returns the corresponding course, the User that owns the course, and a 200 HTTP Status code*/
router.get('/courses/:id', asyncHandler( async(req, res) => {
    const courseId = req.params.id;
    console.log(courseId);
    if(isNaN(courseId)){
      res.status(400).json({error: 'Bad request: Please enter a course id'});
    }
    else{
      //const course = await Course.findByPk(courseId);
      const course = await Course.findAll({where: {id: courseId},
        include: [{model: User, as: 'user'}]});
      if(course.length > 0){
        res.status(200).json(course);
      }
      else{
        res.status(400).json({error: 'Bad Request: Course does not exist'});
      }
    
    }
}));

/*POST Creates a new course, sets the Location header to the URI for the new course, and returns 201 status code with no contet*/
router.post('/courses', authenticateUser, asyncHandler( async(req, res) => {
  //Get course info from request body
  const course = req.body;

  //array to keep track of any errors
  const errors = [];
  if(!course.title)//checks that the title property is not null or undefined
  {
    errors.push('Please provide a value for "title"'); //adds error message
  }
  if(!course.description)//checks that the description property is not null or undefined
  {
    errors.push('Please provide a value for "description"'); //adds error message
  }
  if(!course.userId)//checks that the userId property is not null or undefined
  {
    errors.push('Please provide a value for "userId"'); //adds error message
  }
  

  //if there are any errors
  if(errors.length > 0){
    //return errors to clients
    res.status(400).json({errors});
  }
  else{
    console.log(course); 
    // Add the user to the database
    //TODO Hash the password

    //create the course and add it to the database
    const courseCreated = await Course.create(course);
    // Set the status to 201 Created and end the response.
    res.status(201).location(`/courses/${courseCreated.id}`).end();
  }
}));

/*PUT Updates the corresponding course and returns 204 HTTP status code with no content*/
router.put('/courses/:id', authenticateUser, asyncHandler( async(req, res) => {
  const course = await Course.findByPk(req.params.id);
  if(course){
    const info = req.body;
    console.log(info);
    //check for required information them make changes to database
    if(info.title && info.description){
      course.title = info.title;
      course.description = info.description;
      //Check for other courses info and update accordingly
      if(info.estimatedTime){ //updates the estimated time of the course
        course.estimatedTime = info.estimatedTime;
      }
      if(info.materialsNeeded){ //updates the materials needed for the course
        course.materialsNeeded = info.materialsNeeded;
      }
      if(await User.findByPk(info.userId)){ //updates the userId of the user if it exists
        course.userId = info.userId; //ignores it if it does not exist
      }
      
      await course.save();

      res.status(204).end();
    }
    else
    {
      res.status(400).json({error: "There is information missing for this course"});
    }
  }
  else{
    res.status(400).json({error: "This course does not exist"});
  }
}));

/*DELETE Deletes the corresponding course and returns 204 HTTP code and no content*/
router.delete('/courses/:id', authenticateUser, asyncHandler( async(req, res) => {
    const course = await Course.findByPk(req.params.id);
    if(course){
      await course.destroy(); //deletes the course
      res.status(204).end();
    }
    else{
      res.status(400).json({error: "This course does not exist"});
    }
    res.send('Deletes a course');
}));

module.exports = router;