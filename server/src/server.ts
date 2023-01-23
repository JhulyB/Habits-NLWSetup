import cors from "@fastify/cors";
import Fastify from "fastify";
import { appRotes } from "./routes";

const app = Fastify()

app.register(cors)
app.register(appRotes)

app.listen({
    port: 3333,
    host: '0.0.0.0'
}).then(() => {
    console.log('HTTP server running');
})