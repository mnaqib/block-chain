import { Request, Response } from 'express'

import { p2p } from '../../app'

export default [
    (req: Request, res: Response) => {
        p2p.connectToPeers(req.body.peer)
        res.sendStatus(201)
    },
]
