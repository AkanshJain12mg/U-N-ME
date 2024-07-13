import React  , { useEffect  , useCallback , useState, useRef} from 'react'

import { useSocket } from '../context/SocketProvider';
import peer from '../service/peer';


const RoomPage = () => {

     
    const socket = useSocket();
    const [remoteSocketId , setRemoteSocketId] = useState(null);
    const [myStream , setMyStream] = useState(null);   
    const videoRef = useRef(null);
    const remotevideoRef = useRef(null);
    const [remoteStream, setRemoteStream] = useState();

    const handleUserJoined = useCallback(( { username , id} )=>{ //notify the room creater user and give socketid to remote user

        console.log(`user: ${username} joined the room`)
        setRemoteSocketId(id);

    } , []);

    const handleCallUser = useCallback( async ()=> {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio : true ,
            video : true
        })

        const offer = await peer.getOffer();
        socket.emit("user:call" , { to: remoteSocketId , offer})

        setMyStream(stream);

    } , [remoteSocketId , socket])



    const handleIncomingCall = useCallback(      //connect to offer 
        async ({ from, offer }) => {
          setRemoteSocketId(from);
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });

          setMyStream(stream);
          console.log(`Incoming Call`, from, offer);
          const ans = await peer.getAnswer(offer);
          socket.emit("call:accepted", { to: from, ans });
        },
        [socket]
    );

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
          peer.peer.addTrack(track, myStream);
        }
      }, [myStream]);

    const handleCallAccepted = useCallback( 
        ({ from, ans }) => {
          peer.setLocalDescription(ans);
          console.log("Call Accepted!");
          sendStreams();
        },
        [sendStreams]
    );


    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
      }, [remoteSocketId, socket]
    );

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
          peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
      }, [handleNegoNeeded]
    );

    const handleNegoNeedIncoming = useCallback(
        async ({ from, offer }) => {
          const ans = await peer.getAnswer(offer);
          socket.emit("peer:nego:done", { to: from, ans });
        },
        [socket]
    );
    
    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
      },[]
    );
    

    
    
    
    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
          const remoteStream = ev.streams;
          console.log("GOT TRACKS!!");
          setRemoteStream(remoteStream[0]);
        });
      }, []);

    useEffect(()=>{ //register and unregistering

        socket.on('user:joined' , handleUserJoined)
        socket.on("incoming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncoming);
        socket.on("peer:nego:final", handleNegoNeedFinal);

        return ()=>{

            socket.off('user:joined' , handleUserJoined)
            socket.off("incoming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncoming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        }
    } , [socket , handleUserJoined ,  handleIncomingCall , handleCallAccepted , handleNegoNeedIncoming , handleNegoNeedFinal])

    useEffect(() => {
        if (myStream && videoRef.current) {
            videoRef.current.srcObject = myStream;
        }
    }, [myStream]);

    useEffect(() => {
        if (remoteStream && remotevideoRef.current) {
            remotevideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (

        <div class = 'room-page'>
           <h1>
              IN ROOM
           </h1>
           <h4>
              {remoteSocketId ? 'connected' : 'Waiting'}
           </h4>

           {myStream && <button onClick={sendStreams}>Send Your video</button>}
           
           {
            remoteSocketId && <button onClick = {handleCallUser}>Connect</button>
           }
           {
            myStream && (
                <>
                    <h3>Me</h3>

                    <video ref={videoRef} autoPlay playsInline height="300px" width="300px" />

                </>
                
            ) 
           }
           {
            remoteStream && (
                <>
                    <h3>other User</h3>

                    <video ref={remotevideoRef} autoPlay playsInline height="300px" width="300px" />

                </>
                
            ) 
           }
          
           
        </div>
    )
}

export default RoomPage;