import fs from "fs/promises";
import path from "path";

export class FileReader {
  static async readFile(filePath: string): Promise<string> {
    try {
      const absolutePath = path.join(process.cwd(), filePath);
      const content = await fs.readFile(absolutePath, "utf-8");
      return content;
    } catch (error) {
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }
}
