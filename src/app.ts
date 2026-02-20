import Fastify, { FastifyInstance, FastifyServerOptions }  from "fastify"

export function buildApp(opts: FastifyServerOptions = {}): FastifyInstance {
    const app = Fastify(opts)

    app.get('/ping', async() => {
        return {
            message: 'Cofre online',
            }
    })

  
    return app
}