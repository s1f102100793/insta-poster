import { env } from "../env";
import { convertUnitNameToRomaji } from "./memberName";

function outputPath(
  unitName: string,
  title: string,
  folder: string,
  suffix: string,
): string {
  const base = env.OUTPUT_PATH ?? "../output";
  return `${base}/${folder}/${unitName}_${title}${suffix}`;
}

const cwd = process.cwd();

export const path = {
  getPaths: (unitName: string, title: string, folderPrefix: string) => {
    const unitNameRomaji = convertUnitNameToRomaji(unitName);
    const titleEncoded = encodeURIComponent(title);

    return {
      screenshotOutput: outputPath(
        unitName,
        title,
        `${folderPrefix}${unitName}スクショ`,
        ".png",
      ),
      removeFrameImageOutput: outputPath(
        unitName,
        title,
        `${folderPrefix}${unitName}画像`,
        ".png",
      ),
      firstPostImageOutput: outputPath(unitName, title, "完成", "_1.png"),
      secondPostImageOutput: outputPath(unitName, title, "完成", "_2.png"),
      firstPostImageEnd: `complete/${unitNameRomaji}_${titleEncoded}_1.png`,
      secondPostImageEnd: `complete/${unitNameRomaji}_${titleEncoded}_2.png`,
    };
  },
  mockImagePath: `${cwd}/assets/mock.png`,
};
