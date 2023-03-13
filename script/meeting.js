const Peer = window.Peer;

(async function main() {
    ////////////////////////////////////////////////////////////////////////////////////////////
    //変数宣言

    //title-container
    const roomId = document.getElementById('room-id');

    //videos-container
    const videosContainer = document.getElementById('videos-container');
    const localVideo = document.getElementById('local-video');
    // const messages = document.getElementById('js-messages');

    //joiner-container
    const controlerContainer = document.getElementById('controller-container');
    // const localId = document.getElementById('js-local-id');
    const roomNameInput = document.getElementById('room-name');
    const userNameInput = document.getElementById('user-name');
    const joinRoom = document.getElementById('join-room');

    //meeting-container
    const meetingContainer = document.getElementById('meeting-container');
    const disconnect = document.getElementById('disconnect');
    const cameraButton = document.getElementById('camera-button');
    const micButton = document.getElementById('mic-button');

    //chat-container
    const chatContainer = document.getElementById('chat-container');
    const messageLog = document.getElementById('message-log');
    const messageInput = document.getElementById('message-input');
    const messageSend = document.getElementById('message-send');

    ////////////////////////////////////////////////////////////////////////////////////////////
    //本体

    //URLからルーム名を取得
    const hashValue = location.hash.substring(1)
    const nameOut = decodeURI(hashValue);
    roomId.textContent = nameOut;
    roomNameInput.value = nameOut;

    //ローカルビデオ取得
    const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
    localVideo.srcObject = localStream;

    //peer生成
    const peer = new Peer({
        key: window.__SKYWAY_KEY__,
        debug: 3,
    });

    //Enter Room クリック時
    joinRoom.addEventListener('click', () => {
        //ルーム名とユーザー名を取得
        const roomName = roomNameInput.value;
        const userName = userNameInput.value;

        if(!userName){
            alert("ユーザー名を入力してください");
            return;
        }

        //画面領域を変更
        controlerContainer.style.display = 'none';
        meetingContainer.style.display = 'flex';
        chatContainer.style.display = 'block';

        //video領域変更
        document.documentElement.style.setProperty('--int', '37.5%');
        videosContainer.style.top = '15%';


        //ルームへの参加
        const room = peer.joinRoom(roomName, {
            mode: 'sfu',
            stream: localStream,
        });

        //入室時の処理
        room.on('open', () => {
            //自分の参加をルームに通知
            const message = '===== ' + userName + ' joined =====\n';
            room.send(message);
            //参加ログ表示
            messageLog.textContent += `===== You joined =====\n`;
        });

        //チャット機能
        messageSend.addEventListener('click', () => {
            const message = userName + ' > ' + messageInput.value + '\n';
            room.send(message);
            messageLog.textContent += `自分 > ${messageInput.value}\n`;
        })

        //メッセージの受け取り処理
        room.on('data', data => {
            messageLog.textContent += `${data.data}`;
        });

        //他者のビデオストリーム受信
        room.on('stream', async stream => {
            const remoteVideo = document.createElement('video');
            remoteVideo.srcObject = stream;
            remoteVideo.playsInline = true;
            remoteVideo.setAttribute('data-peer-id', stream.peerId);
            videosContainer.append(remoteVideo);

            await remoteVideo.play().catch(console.error);
        });

        //他者が退室した場合の処理
        room.on('peerLeave', peerId => {
            const remoteVideo = videosContainer.querySelector(`[data-peer-id="${peerId}"]`);
            remoteVideo.srcObject.getTracks().forEach(track => {
                track.stop();
            });
            remoteVideo.srcObject = null;
            remoteVideo.remove();

            //messages.textContent += `===${peerId} left===\n`;
        });

        //ルームが閉じた場合の処理
        room.once('close', () => {
            //messages.textContent += '===You left ===\n';
            const remoteVideos = videosContainer.querySelectorAll('[data-peer-id]');
            Array.from(remoteVideos)
            .forEach(remoteVideo => {
                remoteVideo.srcObject.getTracks().forEach(track => track.stop());
                remoteVideo.srcObject = null;
                remoteVideo.remove();
            });
        });

        //カメラミュート
        cameraButton.addEventListener('click', () => {

            //ミュート状態変更
            localStream.getVideoTracks()[0].enabled = !(localStream.getVideoTracks()[0].enabled);

            //image変更
            if(localStream.getVideoTracks()[0].enabled){
                cameraButton.style.backgroundImage = 'url("../images/camera.png")';
            }else{
                cameraButton.style.backgroundImage = 'url("../images/cameraMute.png")';
            }

        });

        //マイクミュート
        micButton.addEventListener('click', () => {

            //ミュート状態変更
            localStream.getAudioTracks()[0].enabled = !(localStream.getAudioTracks()[0].enabled);

            //image変更
            if(localStream.getAudioTracks()[0].enabled){
                micButton.style.backgroundImage = 'url("../images/mic.png")';
            }else{
                micButton.style.backgroundImage = 'url("../images/micMute.png")';
            }
            
        });

        //切断ボタン
        disconnect.addEventListener('click', () => {

            //ルームを閉じる
            room.close();

            //画面領域変更
            controlerContainer.style.display = '';
            meetingContainer.style.display = 'none';
            chatContainer.style.display = 'none';

            document.documentElement.style.setProperty('--int', '50%');
            videosContainer.style.top = '10%';

        }, { once: true });
    });

    peer.on('error', console.error);
})();