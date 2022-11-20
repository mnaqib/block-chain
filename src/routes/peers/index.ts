import { Router } from 'express'
const r = Router()

import createPeer from './create'
import getPeers from './get'

r.post('/', ...createPeer)
r.get('/', ...getPeers)

export default r
