import http from "node:http";
import { route } from "./router.js";

const PORT = process.env.PORT || 3000;
http.createServer(route).listen(PORT, () => console.log(`listening on ${PORT}`));
