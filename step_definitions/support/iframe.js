const DEFAULT_OPTS = {
    log: true,
    timeout: 30000,
}
const DEFAULT_IFRAME_SELECTOR = 'iframe'

function sleep(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout))
}

function timeout(cb, timeout) {
    return new Promise(resolve => {
        let done = false
        let finish = () => done || resolve()
        cb().then(finish)
        sleep(timeout).then(finish)
    })
}
