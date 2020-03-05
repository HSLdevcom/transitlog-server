export function cleanup(callback: () => any) {
  // do app specific cleaning before exiting
  process.on('exit', () => {
    console.log('exit')
    callback()
  })

  // catch ctrl+c event and exit normally
  process.on('SIGINT', () => {
    console.log('Ctrl-C...')
    process.exit(2)
  })

  process.on('SIGUSR1', () => {
    console.log('Ctrl-C...')
    process.exit(2)
  })

  process.on('SIGUSR2', () => {
    console.log('Ctrl-C...')
    process.exit(2)
  })

  // catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', (e) => {
    console.log('Uncaught Exception...')
    console.log(e.stack)
    process.exit(2)
  })
}
