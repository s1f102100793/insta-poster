import env from "../env";

export const authService = {
  login: async (username: string, password:string) => {
    const token = btoa(`${username}:${password}`);
    const response = await fetch(`${env.SERVER_URL}/api/login/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${token}`,
      },
    })
    if (!response.ok) {
      alert('Failed to login');
      throw new Error('Failed to login');
    }
  }
};