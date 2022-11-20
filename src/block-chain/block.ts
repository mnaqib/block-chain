class Block {
    index: number
    hash: string
    previousHash: string
    timestamp: number
    data: string
    difficulty: number
    nonce: number

    constructor(
        index: number,
        hash: string,
        previousHash: string,
        timestamp: number,
        data: string,
        difficulty: number,
        nonce: number
    ) {
        this.index = index
        this.hash = hash
        this.previousHash = previousHash
        this.timestamp = timestamp
        this.data = data
        this.difficulty = difficulty
        this.nonce = nonce
    }
}

export default Block
