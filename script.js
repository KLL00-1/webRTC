let APP_ID = 'de0d129457e440859729bee5639ba096'

let token = null
let uid =String(Math.floor(Math.random()* 10000)) 

let client;
let channel;

let localStream;
let remoteStream;
let peerConnection;
const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

const init = async () => {
    client = await AgoraRTM.createInstance(APP_ID)
    await client.login({uid,token})

    channel = client.createChannel('main')
    await channel.join()


    channel.on('MemberJoined', handleUserJoined)
    client.on('MessageFromPeer', handleMessageFromPeer)
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  document.getElementById("user-1").srcObject = localStream;

};
let handleMessageFromPeer = async (message, MemberId)=>{
    message = JSON.parse(message.text)
    console.log('Message:', message)
}

let handleUserJoined = async(MemberId)=>{
console.log('New joined:', MemberId)
createOffer(MemberId);
}

const createOffer = async (MemberId) => {
  peerConnection = new RTCPeerConnection(servers);
  remoteStream = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStream;

  localStream.getTracks().forEach((track)=>{
    peerConnection.addTrack(track,localStream)
  })
  peerConnection.ontrack = (event)=>{
    event.streams[0].getTracks().forEach((track)=>{
        remoteStream.addTrack(track)
    })
  }

  peerConnection.onicecandidate = async (event)=>{
    if(event.candidate){
        console.log('New ice candidate:', event.candidate)
    }
  }

  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  client.sendMessageToPeer({text:JSON.stringify({'type':'offer','offer':offer})}, MemberId)
};

init();
