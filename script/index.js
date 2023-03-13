const Peer = window.Peer;

(async function main() {
    const makeRoom = document.getElementById('make-room');
    const makeRoomId = document.getElementById('make-room-name')

    /*
    peer.on('open', (id) => {
        localId.textContent = id;
    });
    */

    //画面遷移
    makeRoom.addEventListener('click', e => {
        e.preventDefault();
        const roomName = makeRoomId.value;
        if(!roomName){
            alert('ルーム名を入力してください');
            return;
        }
        location.href = `./meeting.html#${roomName}`;
    });
})();