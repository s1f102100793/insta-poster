import { edenFetch } from "@elysiajs/eden";
import { App } from "server";
import env from "../env";
import { handleError } from "../utils/handleError";

const fetch = edenFetch<App>(env.SERVER_URL);

export const postsService = {
  postSns: async (data: number) => {
    return fetch("/api/posts/", {
      method: "POST",
      body: data,
    }).then(handleError);
  },
};