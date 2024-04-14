import { spawn } from "child_process";
import fetch from 'node-fetch';

interface NgrokApiResponse {
  tunnels: {
    proto: string;
    public_url: string;
  }[];
  uri: string;
}

export const ngrokUtils = {
  async start(): Promise<string>{
    const ngrokProcess = spawn("ngrok", ["http", "http://localhost:9000"]);

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const response = await fetch("http://127.0.0.1:4040/api/tunnels");
          const data = await response.json() as NgrokApiResponse;
          const httpsTunnel = data.tunnels.find(tunnel => tunnel.proto === 'https');
          if (httpsTunnel) {
            resolve(httpsTunnel.public_url);
          } else {
            reject("No HTTPS tunnel found.");
          }
        } catch (error) {
          console.error("Failed to fetch ngrok tunnels:", error);
          reject(error);
        }
      }, 2000);
    });
  }
}
