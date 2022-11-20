import express from 'express'

import BlockChain from './block-chain'
import P2p from './p2p'
import configureRoutes from './routes'

export const blockChain = new BlockChain()
export const p2p = new P2p(8001)

export default () => {
    const app = express()
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    configureRoutes(app)

    return app
}
