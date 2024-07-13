import React , {useState , useCallback , useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketProvider';


const HomeScreen = ()=>{

    const [username , setUsername] = useState("");
    const [room , setRoom] = useState("");

    const socket = useSocket();
    const navigate = useNavigate();

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        console.log({
            username ,
            room
        });

        socket.emit('room:join' , { username , room})
    } , [room , username , socket]);

    const handleJoinRoom = useCallback((data)=>{

        const {username ,  room} = data;
        navigate(`/room/${room}`)
    } , [navigate])

    useEffect(()=>{

        socket.on('room:join' ,handleJoinRoom)

        return ()=> {

            socket.off('room:join' , handleJoinRoom);
        }
    } , [socket , handleJoinRoom])

    return (

        // <div>
        //     <h1>Create or Join Room</h1>
        //     <form onSubmit={handleSubmitForm}>

        //         <label htmlFor="username"> Username</label>
        //         <input type="text" id="username" value={username} onChange={(e)=> setUsername(e.target.value)} />

        //         <br/><br/>
        //         <label htmlFor="room">Room No</label>
        //         <input type="text" id="room"  value={room} onChange={(e)=> setRoom(e.target.value)} />

        //         <br/><br/>

        //         <button>Join</button>
        //     </form>


        // </div>

        <div class="login-page">
            
            <div class="form" >
                 <h3> Join or Create Room</h3>
                <form class="login-form" onSubmit={handleSubmitForm}>
                <input type="text" placeholder="username" id ="username"  value={username} onChange={(e)=> setUsername(e.target.value)} />
                <input type="text" placeholder="Room No"  id="room"  value={room} onChange={(e)=> setRoom(e.target.value)}/>
                <button>Join</button>
                
                </form>
            </div>
        </div>
    );
};

export default HomeScreen;