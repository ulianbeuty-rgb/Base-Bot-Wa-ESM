
}
if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE || await question('Masukkan nomor WhatsApp (6281367291300): ')
    const code = await sock.requestPairingCode(phoneNumber.trim())
    console.log('Kode Pairing:', code)
    rl.close()
}
if (!sock.authState.creds.registered) {
    const phoneNumber = '6281367291300'
    const code = await sock.requestPairingCode(phoneNumber)
    console.log('Kode Pairing:', code)
}
const question = (text) => new Promise(resolve => rl.question(text, resolve))

async function startBot(6281367291300) {
  const { state, saveCreds } = await useMultiFileAuthState('session')
  const sock = makeWASocket({ /* ... */ })

  if (!sock.authState.creds.registered) {
    const phoneNumber = process.argv[2] || process.env.PHONE || await question('Masukkan nomor WhatsApp (62813672911300): ')
    const code = await sock.requestPairingCode(phoneNumber.trim())
    console.log('Kode Pairing:', code)
    rl.close()
  }

  // ... event handlers ...
  sock.ev.on('creds.update', saveCreds)
}