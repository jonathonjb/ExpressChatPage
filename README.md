# The Chat App

[View the chat web application here](https://jonb-chat-app.herokuapp.com/).

This is an web application which allows users to register an account by typing out their email address, username and password. Users may also log in using their facebook account or by using their gmail address.

The authentication process was done using the passport.js express library. The documentation may be viewed here: http://www.passportjs.org/docs/

## Server

The node.js runtime environment was used as this web application's server. There are two main javascript files in the server: server.js and auth.js.

### server.js
All of the express routes are placed here. For this web application, I used the *ejs* view engine to render the pages. All of the *ejs* files are placed in the /views directory.

### auth.js
This is the module which contains all of the neccessary functions to set up the passport.js strategies. Since we have three different ways for the user to log into our page (Manual registration, facebook, google), we need three different strategies allocated with passport.js, and three different functions which checks if the database contains that account. All of these are placed in this file, in addition to the synchronizeUser and desynchronizeUser functions. 

![Home Screen](https://github.com/jonathonjb2015/ExpressChatPage/blob/master/readme_images/HomeScreen.png)

![Sign Up Screen](https://github.com/jonathonjb/ExpressChatPage/blob/master/readme_images/ChatPageSignUp.png)

![Messages page](https://github.com/jonathonjb2015/ExpressChatPage/blob/master/readme_images/Messages.png)
