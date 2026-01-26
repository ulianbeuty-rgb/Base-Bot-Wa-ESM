import './config.js'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import util from 'util'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginFolder = path.join(__dirname, 'plugin')
let plugins = {}

const loadPlugins = async () => {
    const files = fs.readdirSync(pluginFolder)
    for (let file of files) {
        if (file.endsWith('.js')) {
            const module = await import(`./plugin/${file}?update=${Date.now()}`)
            plugins[file] = module.default
        }
    }
}
loadPlugins()

export const handler = async (sock, m) => {
    if (!m.message) return
    if (m.key.fromMe) return

    const body =
        m.message.conversation ||
        m.message.extendedTextMessage?.text ||
        m.message.imageMessage?.caption ||
        m.message.videoMessage?.caption ||
        ''

    const prefix = global.prefix.find(p => body.startsWith(p))
    const isCmd = !!prefix
    const command = isCmd
        ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase()
        : ''
    
    const text = isCmd
        ? body.slice(prefix.length + command.length).trim()
        : body.trim()

    const isGroup = m.key.remoteJid.endsWith('@g.us')
    const isNewsletter = m.key.remoteJid.endsWith('@newsletter')
    const chatType = isGroup ? 'Group' : isNewsletter ? 'Newsletter' : 'Private'

    const sender = isGroup ? m.key.participant : m.key.remoteJid
    const number = sender?.split('@')[0] || '-'
    const pushname = m.pushName || 'Unknown'
    const jid = m.key.remoteJid
    if (!jid) return

    const reply = (text) => {
        return sock.sendMessage(jid, { text }, { quoted: m })
    }

    m.reply = reply

    const msgType = Object.keys(m.message)[0]

    console.log(chalk.green('Message Detected'))
    console.log('Username:', pushname)
    console.log('Nomor:', number)
    console.log('Type Chat:', chatType)
    console.log('Type Message:', msgType)
    console.log('Text:', body)
    console.log('--------------------------')

    if (!isCmd) return

    const isOwner = global.owner.includes(number)
    const isPremium = isOwner || global.premium.includes(number)

    if (global.selfmode && !isOwner) return

    let groupMetadata = {}
    let participants = []
    let isAdmin = false

    if (isGroup) {
        groupMetadata = await sock.groupMetadata(jid)
        participants = groupMetadata.participants || []
        isAdmin = participants.some(v => v.id === sender && v.admin !== null)
    }

    for (let name in plugins) {
        const plugin = plugins[name]
        if (!plugin || !plugin.command) continue

        if (plugin.command.test(command)) {
            if (plugin.owner && !isOwner) return reply(global.mess.owner)
            if (plugin.premium && !isPremium) return reply(global.mess.premium)
            if (plugin.group && !isGroup) return reply(global.mess.group)
            if (plugin.admin && !isAdmin) return reply(global.mess.admin)
            if (plugin.private && isGroup) return reply(global.mess.private)

            try {
                await plugin(m, { sock, text, prefix, command, reply, isOwner, isAdmin, isPremium })
            } catch (e) {
                console.error(e)
            }
            break
        }
    }
}