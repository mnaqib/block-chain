import { Request, Response } from 'express'

import { blockChain } from '../../app'

export default [
    (req: Request, res: Response) => {
        const newBlock = blockChain.generateNextBlock(req.body.data)
        res.send(newBlock)
    },
]
