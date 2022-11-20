import { Request, Response } from 'express'

import { p2p } from '../../app'

export default [
    (_: Request, res: Response) => {
        res.send(p2p.getSockets().map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort))
    },
]
