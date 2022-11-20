import { Router } from 'express'
const r = Router()

import getBlocks from './get'
import mintBlock from './mint-block'

r.get('/', ...getBlocks)
r.post('/mint', ...mintBlock)

export default r
