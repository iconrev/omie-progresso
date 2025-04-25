const ExcelJS = require("exceljs");

class WorkbookException extends Error {
  constructor(message) {
    super(message);
    this.name = "WorkbookException";
  }
}

class WorkbookBase {
  #workbook;

  #worksheet = null;

  #sheetVersion = null;

  #sheetRevisionDate = null;

  #data = null;

  get workbook() {
    return this.#workbook;
  }

  setWorksheetByIndex(index) {
    this.#worksheet = this.#workbook.getWorksheet(index);

    if (!this.#worksheet) {
      throw new WorkbookException("Invalid worksheet data");
    }
  }

  async #loadWorkbook(key, value) {
    this.#workbook = new ExcelJS.Workbook();

    try {
      if (key === "file") {
        await this.#workbook.xlsx.readFile(value);
      }
      if (key === "buffer") {
        await this.#workbook.xlsx.read(value);
      }
      this.#workbook.creator = "Simbiose @ Omie";
      this.#workbook.company = "Omiexperience S.A.";
    } catch (error) {
      throw new WorkbookException("Invalid Workbook");
    }

    if (!this.#workbook) {
      throw new WorkbookException("Invalid Workbook Type");
    }
  }

  async #getVersion() {
    const worksheet = this.#workbook.worksheets[1];

    if (!worksheet) {
      throw new WorkbookException("Invalid worksheet version");
    }

    this.#sheetVersion = worksheet.getCell("B1").text;
    this.#sheetRevisionDate = worksheet.getCell("B2").text;
  }

  async readFile(pathToFile) {
    await this.#loadWorkbook("file", pathToFile);
    await this.#getVersion();
  }

  async readStream(fileStream) {
    await this.#loadWorkbook("buffer", fileStream);
    await this.#getVersion();
  }

  async saveToStream(stream) {
    await this.#workbook.xlsx.write(stream);
  }

  getItem(cell, valueDefault = null, forceType = null) {
    if (!this.#worksheet) {
      throw new WorkbookException("Invalid worksheet data");
    }

    const value = this.#worksheet.getCell(cell).text;

    let valueDefined = value === "" ? valueDefault : value;

    if (forceType) {
      try {
        if (forceType === "perc") {
          valueDefined = parseFloat(valueDefined);
          valueDefined *= 100;
          valueDefined = parseFloat(valueDefined.toFixed(2));
        }
        if (forceType === "float") {
          valueDefined = parseFloat(valueDefined);
        }
        if (forceType === "int") {
          valueDefined = parseInt(valueDefined, 10);
        }
      } catch (error) {
        console.logger(error);
      }
    }

    return valueDefined;
  }

  setItem(cell, text) {
    if (!this.#worksheet) {
      throw new WorkbookException("Invalid worksheet data");
    }

    this.#worksheet.getCell(cell).value = text;
  }
}

module.exports.WorkbookBase = WorkbookBase;
