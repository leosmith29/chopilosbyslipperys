//Import Libraries
const express = require('express');
const bodyparse = require('body-parser')
const cors = require('cors')
//Import Routes
const { AuthRoute } = require('./routes/auth.js')
const { InstallRoute } = require('./routes/install.js')
const dotenv = require('dotenv')

const app = express();

app.use(express.json())
app.use(cors())
app.use(bodyparse.urlencoded({extended: false}))

dotenv.config()

InstallRoute({app})
AuthRoute({app})
process.on("uncaughtException", (err) => {
    console.error("Fatal error", err);
    //process.exit(1);
  });

  //Run Server
var server = app.listen(process.env.PORT || 8002, "0.0.0.0", function () {
    var host = server.address().address;
    var port = server.address().port;
  
    console.log("Example app listening at http://%s:%s", host, port, process.env);
   
    
  });