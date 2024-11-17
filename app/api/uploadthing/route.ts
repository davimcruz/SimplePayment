import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "@/server/uploadthing"

const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
})

export { GET, POST } 