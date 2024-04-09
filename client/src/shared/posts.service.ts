import env from "../env";

export const postsService = {
  postSns: async (formData: FormData) => {
    return fetch(`${env.SERVER_URL}/api/posts/`, {
      method: "POST",
      body: formData,
    });
  },
};
