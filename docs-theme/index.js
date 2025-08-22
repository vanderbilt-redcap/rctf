import fs from 'fs/promises';
import path from 'path';
import template from 'lodash/template.js';
import GithubSlugger from 'github-slugger';
import { util } from 'documentation/src/index.js';
import hljs from 'highlight.js';
import { fileURLToPath } from 'url';
import rctfPackageJson from '../redcap_cypress/node_modules/rctf/package.json' assert { type: "json" }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { LinkerStack, createFormatters } = util;

async function copyDir(sorce, dest) {
  await fs.mkdir(dest, { recursive: true });
  let entries = await fs.readdir(sorce, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(sorce, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory()
      ? await copyDir(srcPath, destPath)
      : await fs.copyFile(srcPath, destPath);
  }
}

function isFunction(section) {
  return (
    section.kind === 'function' ||
    (section.kind === 'typedef' &&
      section.type &&
      section.type.type === 'NameExpression' &&
      section.type.name === 'Function')
  );
}

const slugger = new GithubSlugger();
const slugs = {};

function getSlug(str) {
  if (slugs[str] === undefined) {
    slugs[str] = slugger.slug(str);
  }
  return slugs[str];
}

export default async function (comments, config) {
  var linkerStack = new LinkerStack(config).namespaceResolver(
    comments,
    function (namespace) {
      return '#' + getSlug(namespace);
    }
  );

  var formatters = createFormatters(linkerStack.link);

  hljs.configure(config.hljs || {});

  var sharedImports = {
    imports: {
      slug(str) {
        return getSlug(str);
      },
      shortSignature(section) {
        var prefix = '';
        if (section.kind === 'class') {
          prefix = 'new ';
        } else if (!isFunction(section)) {
          return section.name;
        }
        return prefix + section.name + formatters.parameters(section, true);
      },
      signature(section) {
        var returns = '';
        var prefix = '';
        if (section.kind === 'class') {
          prefix = 'new ';
        } else if (!isFunction(section)) {
          return section.name;
        }
        if (section.returns.length) {
          returns = ': ' + formatters.type(section.returns[0].type);
        }
        return prefix + section.name + formatters.parameters(section) + returns;
      },
      md(ast, inline) {
        if (
          inline &&
          ast &&
          ast.children.length &&
          ast.children[0].type === 'paragraph'
        ) {
          ast = {
            type: 'root',
            children: ast.children[0].children.concat(ast.children.slice(1))
          };
        }
        return formatters.markdown(ast);
      },
      formatType: formatters.type,
      autolink: formatters.autolink,
      highlight(example) {
        if (config.hljs && config.hljs.highlightAuto) {
          return hljs.highlightAuto(example).value;
        }
        return hljs.highlight(example, { language: 'js' }).value;
      }
    }
  };

  sharedImports.imports.renderSectionList = template(
    await fs.readFile(path.join(__dirname, 'section_list._'), 'utf8'),
    sharedImports
  );
  sharedImports.imports.renderSection = template(
    await fs.readFile(path.join(__dirname, 'section._'), 'utf8'),
    sharedImports
  );
  sharedImports.imports.renderNote = template(
    await fs.readFile(path.join(__dirname, 'note._'), 'utf8'),
    sharedImports
  );
  sharedImports.imports.renderParamProperty = template(
    await fs.readFile(path.join(__dirname, 'paramProperty._'), 'utf8'),
    sharedImports
  );

  var pageTemplate = template(
    await fs.readFile(path.join(__dirname, 'index._'), 'utf8'),
    sharedImports
  );

  // IMPORTANT: THIS IS THE KEY TO ALL GHERKIN GENERATOR MAGIC WORKING!  DO NOT DELETE!
  await fs.copyFile('./node_modules/rctf/step_definitions/support/mappings.js', __dirname + '/assets/mappings.js')
  await fs.copyFile('./node_modules/rctf/step_definitions/support/all_mappings.js', __dirname + '/assets/all_mappings.js')

  await copyDir(__dirname + '/assets/', config.output + '/assets/');

  //Fetch the files currently in the docs directory
  let current_doc_files = await fs.readdir(config.output);

  let versions = []
  for (let doc of current_doc_files) {
    if(doc !== 'assets' && doc!== 'index.html') versions.push(doc) //Filter out all files except the versioned files
  }

  //Get the version from the package.json file as installed in Cypress
  config['rctf_version'] = rctfPackageJson.version

  versions.push( 'v' + config['rctf_version'] + '.html')

  //Add the UNQIUE versions to the config file
  config['versions'] = [... new Set(versions)]

  const string = pageTemplate({ docs: comments, config });

  if (!config.output) {
    return string;
  }

  let str = `const rctf_versions = [`
  config['versions'].forEach(function(v) {
    str += `'${v}',`
  })
  str = str.slice(0, -1) + ']\n'

  str += '  window.versions = \'\'\n' +
'rctf_versions.forEach(function(v) {\n' +
'  window.versions += `<li><a href="${v}">${v}</a></li>`\n' +
'})\n'

  await fs.writeFile(config.output + '/assets/rctf_versions.js', str, 'utf8');

  //Write a copy to version specific file
  await fs.writeFile(config.output + '/v' + config['rctf_version'] + '.html', string, 'utf8');

  //This serves as the landing page and represents the current version of the repository
  await fs.writeFile(config.output + '/index.html', string, 'utf8');
}
