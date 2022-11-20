import { WebSocket, Server } from 'ws'

import { blockChain } from './app'

import Block from './block-chain/block'
import { isValidBlockStructure } from './block-chain/isValid'

import { MessageType } from './constants'
import { JSONToObject } from './utils'

import { Message } from './types'

class P2p {
    private sockets: WebSocket[]
    private p2pPort: number

    constructor(p2pPort: number) {
        this.sockets = []
        this.p2pPort = p2pPort
    }

    connectToPeers(newPeer: string): void {
        const ws: WebSocket = new WebSocket(newPeer)
        ws.on('open', () => {
            this._initConnection(ws)
        })
        ws.on('error', () => {
            console.log('connection failed')
        })
    }

    broadcastLatest(): void {
        this._broadcast(this._responseLatestMsg())
    }

    getSockets = () => this.sockets

    initP2PServer() {
        const server: Server = new WebSocket.Server({ port: this.p2pPort })
        server.on('connection', (ws: WebSocket) => {
            this._initConnection(ws)
        })
        console.log('listening websocket p2p port on: ' + this.p2pPort)
    }

    private _initConnection = (ws: WebSocket) => {
        this.sockets.push(ws)
        this._initMessageHandler(ws)
        this._initErrorHandler(ws)
        this._write(ws, this._queryChainLengthMsg())
    }

    private _initMessageHandler = (ws: WebSocket) => {
        ws.on('message', (data: string) => {
            const message: Message = JSONToObject<Message>(data)
            if (message === null) {
                console.log('could not parse received JSON message: ' + data)
                return
            }
            console.log('Received message' + JSON.stringify(message))
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    this._write(ws, this._responseLatestMsg())
                    break
                case MessageType.QUERY_ALL:
                    this._write(ws, this._responseChainMsg())
                    break
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks: Block[] = JSONToObject<Block[]>(message.data)
                    if (receivedBlocks === null) {
                        console.log('invalid blocks received:')
                        console.log(message.data)
                        break
                    }
                    this._handleBlockchainResponse(receivedBlocks)
                    break
            }
        })
    }

    private _initErrorHandler = (ws: WebSocket) => {
        const closeConnection = (myWs: WebSocket) => {
            console.log('connection failed to peer: ' + myWs.url)
            this.sockets.splice(this.sockets.indexOf(myWs), 1)
        }
        ws.on('close', () => closeConnection(ws))
        ws.on('error', () => closeConnection(ws))
    }

    private _handleBlockchainResponse = (receivedBlocks: Block[]) => {
        if (receivedBlocks.length === 0) {
            console.log('received block chain size of 0')
            return
        }
        const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1]
        if (!isValidBlockStructure(latestBlockReceived)) {
            console.log('block structuture not valid')
            return
        }
        const latestBlockHeld: Block = blockChain.getLatestBlock()
        if (latestBlockReceived.index > latestBlockHeld.index) {
            console.log(
                'blockchain possibly behind. We got: ' +
                    latestBlockHeld.index +
                    ' Peer got: ' +
                    latestBlockReceived.index
            )
            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                if (blockChain.addBlock(latestBlockReceived)) {
                    this._broadcast(this._responseLatestMsg())
                }
            } else if (receivedBlocks.length === 1) {
                console.log('We have to query the chain from our peer')
                this._broadcast(this._queryAllMsg())
            } else {
                console.log('Received blockchain is longer than current blockchain')
                blockChain.replaceChain(receivedBlocks)
            }
        } else {
            console.log('received blockchain is not longer than received blockchain. Do nothing')
        }
    }

    private _write = (ws: WebSocket, message: Message): void => ws.send(JSON.stringify(message))

    private _broadcast = (message: Message): void => this.sockets.forEach((socket) => this._write(socket, message))

    private _queryChainLengthMsg = (): Message => ({ type: MessageType.QUERY_LATEST, data: null })

    private _queryAllMsg = (): Message => ({ type: MessageType.QUERY_ALL, data: null })

    private _responseChainMsg = (): Message => ({
        type: MessageType.RESPONSE_BLOCKCHAIN,
        data: JSON.stringify(blockChain.getBlockChain()),
    })

    private _responseLatestMsg = (): Message => ({
        type: MessageType.RESPONSE_BLOCKCHAIN,
        data: JSON.stringify([blockChain.getLatestBlock()]),
    })
}

export default P2p
