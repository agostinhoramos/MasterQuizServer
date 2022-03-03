const express = require('express'); //requires express module
const socket = require('socket.io'); //requires socket.io module
const fs = require('fs');
const app = express();
const path = require('path')

const { lookup } = require('geoip-lite');
const router = express.Router();

// .Env
const dotenv = require('dotenv');
dotenv.config();

app.use('/static', express.static(path.join(__dirname, 'public')))

router.get('/country', (req,res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip); // ip address of the user
    console.log(lookup(ip)); // location of the user
    res.send(
        lookup(ip)['country']
    )
  });
  
app.use('/loc', router);

var PORT = process.env.PORT || 3000;
const server = app.listen(PORT); //tells to host server on localhost:3000

var users_list = {}

//Playing variables:
app.use(express.static('public')); //show static files in 'public' directory
console.log(`Server http://127.0.0.1:${PORT} is running`);
const io = socket(server);

// Socket.io Connection------------------
io.on('connection', (socket) => {
    //console.log("New socket connection: " + socket.id)

    socket.on('notify', (notify) => {
        const OBJ = JSON.parse(notify)
        var name = OBJ["name"]
        users_list[name] = OBJ["score"]
        io.emit('notify', name);
        console.log(users_list)
    })
    
    socket.on('initList', async () => {
        var json_array = []
        for (var [key, value] of Object.entries(users_list)) {
            json_array.push({ name: key, score: value })
        }
        io.emit('list', JSON.stringify(json_array))
    })
})