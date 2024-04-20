import { env } from "../env";
import { convertUnitNameToRomaji } from "./memberName";

function outputPath(unitName: string, title: string, folder: string, suffix: string): string {
  const base = env.OUTPUT_PATH ?? '../output';
  return `${base}/${folder}/${unitName}_${title}${suffix}`;
}

export const path = {
  screenshotOutput: (unitName: string, title: string, folderPrefix: string): string => 
    outputPath(unitName, title, `${folderPrefix}${unitName}スクショ`, ".png"),
  removeFrameImageOutput: (unitName: string, title: string, folderPrefix: string): string => 
    outputPath(unitName, title, `${folderPrefix}${unitName}画像`, ".png"),
  firstPostImageOutput: (unitName: string, title: string): string => 
    outputPath(unitName, title, "完成", "_1.png"),
  secondPostImageOutput: (unitName: string, title: string): string => 
    outputPath(unitName, title, "完成", "_2.png"),
  firstPostImageEnd: (unitName: string, title: string): string => 
    `complete/${convertUnitNameToRomaji(unitName)}_${encodeURIComponent(title)}_1.png`,
  secondPostImageEnd: (unitName: string, title: string): string =>
    `complete/${convertUnitNameToRomaji(unitName)}_${encodeURIComponent(title)}_2.png`
};