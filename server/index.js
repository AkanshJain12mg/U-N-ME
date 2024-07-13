const {Server} = require("socket.io");

const io = new Server(3000 , {
  cors : true,
        
});

//connection maps
const userToSocketIdMap = new Map();
const socketIdToUserMap = new Map();



io.on('connection' , (socket) =>{

    console.log(`socket connected -` , socket.id);

    socket.on('room:join' , data=>{

        const {username  , room } = data;

        userToSocketIdMap.set(username , socket.id);
        socketIdToUserMap.set(socket.id , username);

        io.to(room).emit('user:joined', { username , id : socket.id})

        socket.join(room);

        io.to(socket.id).emit('room:join' , data);

        console.log(data);
    });


    socket.on('user:call' , ({ to , offer}) =>{

        io.to(to).emit("incoming:call" , { from : socket.id , offer});

    });

    socket.on("call:accepted", ({ to, ans }) => {

        io.to(to).emit("call:accepted", { from: socket.id, ans });
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
        console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });
    
    socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
});


