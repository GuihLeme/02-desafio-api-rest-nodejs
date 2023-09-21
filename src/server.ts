import { app } from './app'

app.get('/hi', () => {
  return 'hi'
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Server Running 🔥')
  })
