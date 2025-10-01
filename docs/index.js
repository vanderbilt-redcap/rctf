import fs from 'fs/promises';
import path from 'path';
import template from 'lodash/template.js';
import GithubSlugger from 'github-slugger';
import { util } from 'documentation/src/index.js';
import hljs from 'highlight.js';
import { fileURLToPath } from 'url';
import PromptSync from 'prompt-sync';
import child_process from 'child_process'
import {} from '../step_definitions/support/all_mappings.js'

const prompt = PromptSync()

const rctfCommit = child_process.execSync(`git log -1 --format=%h`, { encoding: 'utf8' }).trim()
if(prompt(`Are you sure ${rctfCommit} is working as expected against recent cloud builds (y/n)? `) !== 'y'){
  console.log(`Please check out the rctf branch working against recent cloud builds in order to update the docs.`)
  process.exit()
}

const redcapVersion = child_process.execSync(`grep REDCAP_VERSION: ../redcap_cypress_docker/redcap_cypress/.circleci/config.yml |cut -d'"' -f 2`, { encoding: 'utf8' }).trim()
if(prompt(`Are cloud builds currently running against REDCap ${redcapVersion} (y/n)? `) !== 'y'){
  console.log(`In the redcap_cypress directory, please check out the branch from which recent successful cloud builds have run.`)
  process.exit()
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { LinkerStack, createFormatters } = util;

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

async function addExamples(comments) {
  const fileContentByPath = {}
  const Given = (s) => {
    return s
  }

  for (const comment of comments) {
    if(comment.examples.length > 0){
      // One or more examples have been explicitly set.  Use those instead generate of generating an example from string passed to Given().
      continue;
    }

    let content = fileContentByPath[comment.context.file]
    if(!content){
        content = await fs.readFile(comment.context.file, 'utf8')
        fileContentByPath[comment.context.file] = content
    }

    const endIndex = content.indexOf('\n', comment.context.loc.start.index)
    const firstContextLine = content.substring(comment.context.loc.start.index, endIndex)
    if(firstContextLine.trim().startsWith('Given')){
      const firstArg = eval(firstContextLine + '})')
      if(typeof firstArg === 'string'){
        comment.examples.push({description: firstArg})
      }
      else{
        // We're likely dealing with a regex.  Do nothing.
      }
    }
  }
}

export default async function (comments, config) {
  comments = comments.filter(comment =>  {
    if(comment.deprecated){
      return false
    }

    comment.params.forEach(param => {
      const parameterType = window.parameterTypes[param.name]
      if(!parameterType){
        // This is likely a simple string param where the user is allowed to enter anything.
        return
      }

      if(param.description !== undefined){
        console.log(JSON.stringify(param.description, null, 2))
        throw 'A "' + param.name + '" param has been specified with a description.  Please remove the parameter description, as they are now automatically generated.'
      }

      param.description = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: 'available options: ' + "'" + window.parameterTypes[param.name].join("', '") + "'"
              }
            ]
          }
        ]
      }
    })

    return true
  })

  await addExamples(comments)

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

  const string = pageTemplate({ docs: comments, config, redcapVersion, rctfCommit });

  if (!config.output) {
    return string;
  }

  //This serves as the landing page and represents the current version of the repository
  await fs.writeFile(config.output + '/index.html', string, 'utf8');
}
