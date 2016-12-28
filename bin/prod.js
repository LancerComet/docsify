const app = require('../app')

/**
 * Server Configuration.
 */
const port = 50003            // Port.
const hostname = '127.0.0.1'  // Hostname.

/**
 * Create Static Server.
 */
app.listen(port, hostname)

console.log('\nWelcome to Docsify! :)')
console.log(`Listening at http://${hostname}:${port}\n`)
