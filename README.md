such-jukebox
============

LIVE VERSION: jukebox.suchteam.ca

Music streaming app for parties.  This is written in JavaScript using node.js.  In order to run it, node.js will need to be installed.  Once installed, navigate to the directory of this file and run "sudo node app".  The app is now running on port 3000.

Inside of the a /views directory is the jade files for each of the pages of the app.  Jade is a templating engine which uses similar syntax to HTML and that is rendered to HTML.  The CSS folder contains a style.css which has all of our styling for the app, the rest is from the Bootstrap css library that we are using.  

All client side logic (e.g. stremaing songs, handling voting, changing songs, etc.) for the party page is in the file js/player.js.