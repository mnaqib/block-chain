import { Express } from 'express'

import blocksRouter from './blocks'
import peersRouter from './peers'

export default (app: Express) => {
    //routes
    app.use('/blocks', blocksRouter)
    app.use('/peers', peersRouter)

    //health
    app.get('/health', (_, res) => {
        res.send('Hello from block chain server')
    })
}
