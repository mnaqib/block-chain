import CryptoJS from 'crypto-js'

import Block from './block'
import { isValidChain, isValidNewBlock } from './isValid'

import { p2p } from '../app'
import { hexToBinary } from '../utils'

class BlockChain {
    private blocks: Block[]
    /**the genesis block of the block chain */
    genesisBlock = new Block(
        0,
        '0f072a3e5308e527aaed548c45dab57554234e12ff1116adc95aa48acbbf2c3a',
        '',
        1668935101644,
        'my genesis block',
        0,
        0
    )

    /**The time interval between the generation of new block (in seconds) */
    static BLOCK_GENERATION_INTERVAL = 10
    /**The interval to adjust the difficulty of mining new blocks */
    static DIFFICULTY_ADJUSTMENT_INTERVAL = 10

    constructor() {
        this.blocks = [this.genesisBlock]
    }

    /**get the blocks in the chain */
    getBlockChain() {
        return this.blocks
    }

    /**get the latest block in the chain */
    getLatestBlock() {
        return this.blocks[this.blocks.length - 1]
    }

    /**generating new block in chain */
    generateNextBlock(blockData: string) {
        const previousBlock = this.getLatestBlock()
        const nextIndex = previousBlock.index + 1
        const nextTimestamp = new Date().getTime()
        const difficulty = this._getDifficulty()

        const newBlock = this._findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty)
        this.blocks.push(newBlock)
        p2p.broadcastLatest()
        return newBlock
    }

    /**if a chain is behind a block, this adds an block to the chain */
    addBlock(newBlock: Block) {
        if (isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.blocks.push(newBlock)
            return true
        }
        return false
    }

    /**handle conflict */
    replaceChain(newBlocks: Block[]) {
        if (isValidChain(newBlocks)) {
            console.log('Recieved blockchain is valid ')

            if (this._commulativeDifficulty(newBlocks) > this._commulativeDifficulty(this.blocks)) {
                console.log('replacing current block chain with recieved blockchain')
                this.blocks = newBlocks

                //broadcast
                p2p.broadcastLatest()
            }
        } else {
            console.log('Received blockchainchain is invalid')
        }
    }

    /**calculate hash for next block */
    calculateHash(idx: number, prevHash: string, timestamp: number, data: string, diff: number, nonce: number) {
        return CryptoJS.SHA256(idx + prevHash + timestamp + data + diff + nonce).toString()
    }

    /**find a next block which satisfies nonce and difficulty */
    private _findBlock(index: number, previousHash: string, timestamp: number, data: string, difficulty: number) {
        let nonce = 0
        while (true) {
            const hash = this.calculateHash(index, previousHash, timestamp, data, difficulty, nonce)

            if (this._hashMatchesDifficulty(hash, difficulty)) {
                return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce)
            }

            nonce++
        }
    }

    /**to verify that hash matches the difficulty */
    private _hashMatchesDifficulty(hash: string, difficulty: number) {
        const hashinBinary = hexToBinary(hash)
        const requiredPrefix = '0'.repeat(difficulty)
        return hashinBinary.startsWith(requiredPrefix)
    }

    /**get difficulty of latest block */
    private _getDifficulty() {
        const latestBlock = this.getLatestBlock()
        if (latestBlock.index % BlockChain.DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
            return this._getAdjustedDifficulty(latestBlock)
        }
        return latestBlock.difficulty
    }

    /**adjust the difficulty for the mining new blocks */
    private _getAdjustedDifficulty(latestBlock: Block) {
        const prevAdjustedBlock = this.blocks[this.blocks.length - BlockChain.DIFFICULTY_ADJUSTMENT_INTERVAL]
        const timeExpected = BlockChain.BLOCK_GENERATION_INTERVAL * BlockChain.DIFFICULTY_ADJUSTMENT_INTERVAL
        const timeTaken = latestBlock.timestamp - prevAdjustedBlock.timestamp

        if (timeTaken < timeExpected / 2) {
            return prevAdjustedBlock.difficulty + 1
        } else if (timeTaken > timeExpected * 2) {
            return prevAdjustedBlock.difficulty - 1
        } else {
            return prevAdjustedBlock.difficulty
        }
    }

    /**find the commulative difficulty of blockchain */
    private _commulativeDifficulty(blocks: Block[]) {
        let commulativeDiff = 0
        for (let i = 0; i < blocks.length; i++) {
            commulativeDiff += 2 ** blocks[i].difficulty
        }

        return commulativeDiff
    }
}

export default BlockChain
