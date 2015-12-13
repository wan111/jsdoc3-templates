/**
 * Generate Markdown-formatted document
 *
 * query:
 *   filename: output filename (default: "readme.md")
 *   ext: file extension (default: ".md")
 *   title: document title (default: "")
 *   captions: captions file
 *
 * @example
 *   ./jsdoc test.js -t templates/markdown -q "filename=test.md&title=Test&captions=ja"
 *
 * @author wan <thewanwan111@gmail.com>
 * @license MIT License <http://opensource.org/licenses/mit-license.php/>
 */

var template = require('jsdoc/template'),
	fs = require('jsdoc/fs'),
	path = require('jsdoc/path'),
	taffy = require('taffydb').taffy,
	helper = require('jsdoc/util/templateHelper'),
	_ = require('underscore'),
	replaceInlineTags = require('jsdoc/tag/inline').replaceInlineTags,
	filename = 'readme.md',
	title = '',
	db,
	tmpl,
	outdir = env.opts.destination,
	captions = {},
	def_captions = {
		"classes": "Classes:",
		"extends": "Extends:",
		"externals": "Externals:",
		"events": "Events:",
		"globals": "Globals:",
		"mixins": "Mixins:",
		"modules": "Modules:",
		"namespaces": "Namespaces:",
		"properties": "Properties:",
		"members": "Members:",
		"methods": "Methods:",
		"parameters": "Parameters:",
		"returns": "Returns:",
		"examples": "Examples:",
		"mixesin": "Mixes In:",
		"description": "Description:",
		"changeLog": "ChangeLog:",
		"constant": "constant",
		"optional": "optional",
		"default": "Default:",
		"version": "Version:",
		"since": "Since:",
		"inheridFrom": "Inherid From:",
		"deprecated": "Deprecated:",
		"author": "Author:",
		"copyright": "Copyright:",
		"license": "License:",
		"see": "See:",
		"attributes": {
			"private": "private",
			"protected": "protected",
			"static": "static",
			"inner": "inner",
			"constant": "constant",
			"virtual": "abstract",
			"readonly": "readonly"
		},
		"param": {
			"name": "Name",
			"type": "Type",
			"argument": "Argument",
			"default": "Default",
			"optional": "optional",
			"nullable": "nullable",
			"variable": "repeatable",
			"description": "Description"
		}
	};


/**
 * @param {TAFFY} taffyData See <http://taffydb.com/>.
 * @param {object} opts
 * @param {Tutorial} tutorials
 */
exports.publish = function(taffyData, opts, tutorials) {
	db = taffyData;
//dump(db().get());

	db({undocumented: true}).remove();
	db({ignore: true}).remove();
	if (!env.opts.private) db({access: 'private'}).remove();
	db({memberof: '<anonymous>'}).remove();

	//db.sort('longname');

    var templatePath = opts.template;
	tmpl = new template.Template(templatePath + '/tmpl');

	fs.mkPath(outdir);

	if(opts.query){
		var q = opts.query;
		if(q.filename){
			filename = q.filename;
			if(filename.indexOf('.') == -1) filename += '.md';
		}
		if(q.ext && /^..+/.test(q.ext)){
			filename = filename.replace(/\.[^.]+$/, q.ext);
		}
		if(q.title) title = q.title;
		if(q.captions){
			if(q.captions.slice(-5) != '.json') q.captions += '.json';
			var json = fs.readFileSync(path.join(templatePath + '/captions', q.captions), 'utf8');
			captions = JSON.parse(json);
		}
	}


	var members = helper.getMembers(db);

	function addAttribs(d){
		d.attribs =  helper.getAttribs(d);
	}

	var obj, len;
	for(var kind in members){
		if(kind == 'classes' || kind == 'namespaces' || kind == 'modules' || kind == 'externals' || kind == 'mixins'){
			len = members[kind].length;
			for(var i = 0; i < len; i++){
				obj = members[kind][i];
				obj.attribs = helper.getAttribs(obj);
				obj.members = db({kind: ['member', 'constant'], memberof: obj.longname}).get();
				obj.methods = db({kind: 'function', memberof: obj.longname}).get();
				obj.events = db({kind: 'event', memberof: obj.longname}).get();
				
				obj.members.forEach(addAttribs);
				obj.methods.forEach(addAttribs);
				obj.events.forEach(addAttribs);
			}
		}
	}

	members.globals.forEach(addAttribs);

	/*
	{
		classes: [
			{
				...
				members: [],
				methods: [],
				events: [],
			}
		],
		externals: [],
		events: [],
		globals: [],
		mixins: [],
		modules: [],
		namespaces: [] 
	}
	*/

	tmpl.captions = _.defaults(captions, def_captions);

	tmpl.println = function(fn, space){
		return function(s, level){
			var sp = Array(level + 1).join(space);
			s = s.replace(/[\n\r]+/g, "\n" + sp);
			fn(sp + s + "\n");
		};
	};

	tmpl.strLength = (function(){
		var len = {};
		return function(s){
			if(!len[s]) len[s] = escape(s).replace(/%((u)[\da-fA-F]{4}|[\da-fA-F]{2})/g, '$2a').length;
			return len[s];
		};
	})();

	var md = tmpl.render('markdown.tmpl', {title: title, data: members});

	function processLink(str, tagInfo){
		var text = tagInfo.text.replace(/^([^\s|]+)\s*\|?\s*(.*)$/, function(a, link, str){
			return str ? "["+ str + "](" + link + ")" : link;
		});
		return str.replace(tagInfo.completeTag, text);
	}

	var replacers = {
		link: processLink,
		linkcode: processLink,
		linkplain: processLink,
		tutorial: processLink
	}
	md = replaceInlineTags(md, replacers).newString;

	var outpath = path.join(outdir, filename);
	fs.writeFileSync(outpath, md, 'utf8');
}
