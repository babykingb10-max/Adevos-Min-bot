const fs = require('fs')

global.owner = "255663402315" //owner number
global.footer = "Adevos" //footer section
global.status = false //"self/public" section of the bot
global.prefa = ['','!','.',',','🐤','🗿']
global.owner = ['255']
global.xprefix = '.'
global.gambar = "https://files.catbox.moe/4ag7es.jpg"
global.OWNER_NAME = "@adevosX" //
global.DEVELOPER = ["255663402315"] //
global.BOT_NAME = "Adevos Min-Bot"
global.bankowner = "Adevos Min-Bot"
global.creatorName = "Adevos Min-Bot"
global.ownernumber = '255663402315'  //creator number
global.location = "Nigeria,kwara"
global.prefa = ['','!','.','#','&']
//================DO NOT CHANGE OR YOU'LL GET AN ERROR=============\
global.footer = "Adevos Min-Bot" //footer section
global.link = "https://chat.whatsapp.com/C3HgAWtt08fBdw907vePBe?mode=gi_t"
global.autobio = true//auto update bio
global.botName = "Adevos-X"
global.version = "1.0.0"
global.botname = "Adevos Min-Bot"
global.author = "Adevos-X"
global.themeemoji = "🥷"
global.wagc = 'https://chat.whatsapp.com/C3HgAWtt08fBdw907vePBe?mode=gi_t'
global.thumbnail = 'https://files.catbox.moe/oytpd5.jpg'
global.richpp = ' '
global.packname = "Sticker by Adevos-X tech"
global.author = "Adevos"
global.creator = "255663402315@s.whatsapp.net"
global.ownername = 'Adevos' 
global.onlyowner = `Notice ⚠️: Only Adevos X can use this Command 💜🥷`
  // reply 
global.database = `*To Exist In The Database Contact The Owner of this bot*`
  global.mess = {
wait: "*Configurating.......*",
   success: "*Successfully acknowledged ☑️*",
   on: "*Activated ✅*", 
   prem: "*Feature For Premium Users only 📛*", 
   off: "*Deactivated 📛*",
   query: {
       text: "*Please, Provide A Text Query 📑*",
       link: "Please, provide a valid link 🔗*",
   },
   error: {
       fitur: "*Status 🌐: Feature Or Command error ❌*",
   },
   only: {
       group: "*Notice ⚠️: Group only feature ❌*",
private: "*Notice ⚠️: Private chat feature only ❌*",
       owner: "*Notice ⚠️: Owner feature only ❌*",
       admin: "*Notice ⚠️: bot owner feature only ❌*",
       badmin: "*Notice ⚠️: Seek admin privilege's to use this command ❌*",
       premium: "*Notice ⚠️: Availabe for premium users only ❌*",
   }
}

global.hituet = 0
//false=disable and true=enable
global.autoviewstatus = false
global.autoread = false //auto read messages
global.autobio = true //auto update bio
global.anti92 = true //auto block +92 
global.autoswview = true //auto view status/story

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})

//Powered By Adevos-X Tech 

