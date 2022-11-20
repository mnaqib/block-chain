import { Server as Http } from 'http'
import { Server } from 'socket.io'
import { v4 } from 'uuid'

import Block from './block-chain/block'

class Socket {
    io: Server
    broadcastId: string
    private peers: string[]

    constructor(server: Http) {
        this.io = new Server(server)
        this.peers = []
        this.broadcastId = v4()
    }

    getSockets() {
        return this.peers
    }

    broadcastLatest(blocks: Block[]) {
        this.io.to(this.broadcastId).emit(JSON.stringify(blocks))
    }

    addPeer(id: string) {
        this.peers.push(id)
    }
}

export default Socket
