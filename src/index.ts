// import ngrok from 'ngrok'

import createApp from './app'

const app = createApp()

app.listen(8000, async () => {
    console.log('server listening at port 8000')

    // const url = await ngrok.connect(8000)
    // console.log(url)
})
