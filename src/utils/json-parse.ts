export const JSONToObject = <T>(data: string): T => {
    try {
        return JSON.parse(data)
    } catch (e) {
        console.log(e)
        //@ts-ignore
        return null
    }
}
