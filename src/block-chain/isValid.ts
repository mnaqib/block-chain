import Block from './block'

import { blockChain as chain } from '../app'

export const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index')
        return false
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previous hash')
        return false
    } else if (!isValidTimeStamp(newBlock, previousBlock)) {
        console.log('invalid timestamp')
        return false
    } else {
        const newHash = chain.calculateHash(
            newBlock.index,
            newBlock.previousHash,
            newBlock.timestamp,
            newBlock.data,
            newBlock.difficulty,
            newBlock.nonce
        )
        if (newHash !== newBlock.hash) {
            console.log(typeof newBlock.hash + ' ' + typeof newHash)
            console.log('invalid hash: ' + newHash + ' ' + newBlock.hash)
            return false
        }
    }

    return true
}

export const isValidBlockStructure = (block: Block): boolean => {
    return (
        typeof block.index === 'number' &&
        typeof block.hash === 'string' &&
        typeof block.previousHash === 'string' &&
        typeof block.timestamp === 'number' &&
        typeof block.data === 'string'
    )
}

export const isValidChain = (blockChain: Block[]): boolean => {
    const isValidGenesis = (block: Block): boolean => {
        return JSON.stringify(block) === JSON.stringify(chain.genesisBlock)
    }

    if (!isValidGenesis(blockChain[0])) {
        return false
    }

    for (let i = 1; i < blockChain.length; i++) {
        if (!isValidNewBlock(blockChain[i], blockChain[i - 1])) {
            return false
        }
    }

    return true
}

export const isValidTimeStamp = (newBlock: Block, previousBlock: Block) => {
    return previousBlock.timestamp - 60 < newBlock.timestamp && newBlock.timestamp - 60 < new Date().getTime()
}
