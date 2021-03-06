import {BroadcastChannel} from 'broadcast-channel'
import * as events from './events'
import * as redirect from './redirect'

const channel = new BroadcastChannel('one-wallet-channel')


// todo remove
Object.values(events).forEach(eventName => {
    window.addEventListener(eventName, (e: any) => {
        channel.postMessage(JSON.stringify({eventName, payload: e.detail}))
    })
})


const parseMessage = (crossTabEvent: string) => {
    return JSON.parse(crossTabEvent)
}

// todo timeouts and rejects
export const auth = async () => {
    redirect.auth()

    return new Promise((resolve, reject) => {
        const handler = (crossTabEvent: string) => {
            const e = parseMessage(crossTabEvent)

            if (e.eventName === events.walletConnectedEvent) {
                channel.removeEventListener('message', handler)
                resolve(e.payload)
            }
        }

        channel.addEventListener('message', handler)
    })
}

export const send = async (from: string, to: string, amount: number) => {
    redirect.send(from, to, amount)

    return new Promise((resolve, reject) => {
        const handler = (crossTabEvent: string) => {
            const e = parseMessage(crossTabEvent)

            if (e.eventName === events.transactionSentEvent) {
                channel.removeEventListener('message', handler)
                resolve(e.payload)
            }

            if (e.eventName === events.transactionSentErrorEvent) {
                channel.removeEventListener('message', handler)
                reject(e.payload)
            }
        }

        channel.addEventListener('message', handler)
    })
}