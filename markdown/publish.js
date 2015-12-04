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
	filename = 'readme.md',
	title = '',
	db,
	tmpl,
	outdir = env.opts.destination,
	captions = {},
	def_captions = {
		"classes": "Classes:",
		"externals": "Externals:",
		"events": "Events:",
		"globals": "Globals:",
		"mixins": "Mixins:",
		"modules": "Modules:",
		"namespaces": "Namespaces:",
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
		"default_": "default:",
		"param": {
			"name": "Name",
			"type": "Type",
			"argument": "Argument",
			"default_": "Default",
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

	var obj, len;
	for(var kind in members){
		if(kind == 'classes' || kind == 'modules' || kind == 'mixins' || kind == 'namespaces'){
			len = members[kind].length;
			for(var i = 0; i < len; i++){
				obj = members[kind][i];
				obj.members = db({kind: ['member', 'constant'], memberof: obj.longname}).get();
				obj.methods = db({kind: 'function', memberof: obj.longname}).get();
				obj.events = db({kind: 'event', memberof: obj.longname}).get();
			}
		}
	}
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

	var outpath = path.join(outdir, filename);
	fs.writeFileSync(outpath, md, 'utf8');
}
