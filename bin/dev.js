const app = require('../app')

/**
 * Server Configuration.
 */
const port = 3000           // Port.
const hostname = '0.0.0.0'  // Hostname.

/**
 * Create Static Server.
 */
app.listen(port, hostname)

console.log('\nWelcome to Docsify! :)')
console.log(`Listening at http://${hostname}:${port}\n`)
