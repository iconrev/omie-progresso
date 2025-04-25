const handlebars = require("handlebars");
const fs = require("fs").promises;
const path = require("path");

const pathTemplates = "./services/generico/templates";

const getTemplate = async (templateName) => {
  const pathfull = path.resolve(`${pathTemplates}/${templateName}.html`);
  const html = await fs.readFile(pathfull, { encoding: "utf-8" });

  return html;
};

exports.loadTemplate = async (templateName, dataReplacements) => {
  const template = handlebars.compile(await getTemplate(templateName));
  const html = template(dataReplacements);

  return html;
};
