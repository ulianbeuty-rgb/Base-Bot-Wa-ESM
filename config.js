import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.namebot = "Neo AI"
global.owner = ["62xxx"] // ganti dengan nomor owner
global.prefix = ["!", ".", ","]
global.premium = ["62xxx"]

global.mess = {
    wait: "Tunggu sebentar ya...",
    owner: "Fitur ini khusus owner!",
    admin: "Fitur ini khusus admin!",
    premium: "Fitur ini khusus premium!",
    group: "Fitur ini hanya bisa digunakan di dalam group!",
    private: "Fitur ini hanya bisa di private chat!"
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update config.js"))
  import(`${file}?update=${Date.now()}`)
})