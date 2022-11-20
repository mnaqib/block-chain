import { Request, Response } from 'express'

import { blockChain } from '../../app'

export default [
    (_: Request, res: Response) => {
        res.send(blockChain.getBlockChain())
    },
]
