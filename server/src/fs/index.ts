import fs from "fs";

export const ensureDir = async (dir: string) => {
  try {
    await fs.promises.access(dir, fs.constants.F_OK);
  } catch (e) {
    await fs.promises.mkdir(dir, { recursive: true });
  }
};
