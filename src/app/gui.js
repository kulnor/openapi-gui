Vue.component('gui-main', {
	props: ['openapi', 'importSchema'],
	data: function() {
		return {}
	},
	methods: {

	  showResource : function(key) {
			var target = 'resource_'+key.split('/').join('').split('{').join('').split('}').join('');
			document.getElementById(target).scrollIntoView();
	  },

		addResource : function() {
			if (!this.openapi.paths['/newPath']) {
				Vue.set(this.openapi.paths, '/newPath', {});
			}
		},

		removePath : function(target) {
			this.$root.save();
			Vue.delete(this.openapi.paths,target);
		},

		removeAll: function () {
			bootbox.confirm('Remove all paths, methods and parameters, are you sure?', function (result) {
				if (result) {
					this.$root.save();
					this.openapi.paths = {};
				}
			});
		},

		addTag : function() {
			if (!this.openapi.tags.newTag) {
				var newTag = {};
				newTag.name = 'newTag';
				newTag.externalDocs = {};
				this.openapi.tags.push(newTag);
			}
		},

		removeTag : function(index) {
			this.$root.save();
			this.openapi.tags.splice(index, 1);
		},

		addSecurityDefinition : function() {
			if (!this.openapi.securityDefinitions.newSecurityDef) {
				var newSecDef = {};
				newSecDef.type = 'apiKey';
				newSecDef.name = 'api_key';
				newSecDef.in = 'query';
				this.openapi.securityDefinitions.newSecurityDef = newSecDef;
			}
		},

		removeSecurityDefinition : function(index) {
			this.$root.save();
			Vue.delete(this.openapi.securityDefinitions, index);
		},

		addScope : function(sdName) {
			var secDef = this.openapi.securityDefinitions[sdName];
			if (!secDef.scopes) secDef.scopes = {};
			if (!secDef.scopes.newScope) {
				Vue.set(secDef.scopes, 'newScope','description');
			}
		},

		removeScope : function(sdName, sName) {
			this.$root.save();
			Vue.delete(this.openapi.securityDefinitions[sdName].scopes, sName);
		},

		loadSchema: function () {
			var schema;
			try {
				schema = JSON.parse(this.importSchema);
				bootbox.alert('JSON definition loaded successfully');
			}
			catch (ex) {
				try {
					schema = jsyaml.safeLoad(this.importSchema);
					bootbox.alert('YAML/blank definition loaded successfully');
				}
				catch (ex) {
					bootbox.alert('The definition could not be parsed');
				}
			}

			if (schema.swagger == '2.0') {
				this.openapi = schema;
				if (window.localStorage) window.localStorage.setItem('swagger2', JSON.stringify(schema));
				this.openapi = postProcessDefinition(this.openapi);
			}
			else {
				bootbox.alert('Swagger version must be 2.0');
			}
		},

  	renderOutput : function() {
        // Pretty print has an issue correctly rendering output when we modify
        // the content in an already "prettified" element. This hack creates a
        // new element so prettyPrint() will correctly re-render the output
        $('#json-output').html('<pre class="prettyprint" id="pretty-json"></pre>');
        output = JSON.stringify(this.openapi, null, 4);
        $('#pretty-json').html( output );
        clippy = new Clipboard('#copy-json');
        prettyPrint();
				var data = "text/json;charset=utf-8," + encodeURIComponent(output);
				$('#download-output').attr('href','data:' + data);
				$('#download-output').attr('download','swagger.json');
      },

    	renderOutputYaml : function() {
        $('#yaml-output').html('<pre class="prettyprint" id="pretty-yaml"></pre>');
        try {
					output = jsyaml.dump(this.openapi);
				}
				catch (ex) {
					alert(ex.message);
				}
        $('#pretty-yaml').html( output );
        clippy = new Clipboard('#copy-yaml');
        prettyPrint();
				var data = "text/x-yaml;charset=utf-8," + encodeURIComponent(output);
				$('#download-yaml').attr('href','data:' + data);
				$('#download-yaml').attr('download','swagger.yaml');
      },

			scrollTop : function() {
	    	var elem = document.getElementById('scrollTop');
				elem.scrollIntoView();
	  	},

	  	save : function() {
				if (window.localStorage) {
					window.localStorage.setItem('swagger2',JSON.stringify(this.openapi));
				}
			},

	  	undo : function() {
				if (window.localStorage) {
					this.openapi = JSON.parse(window.localStorage.getItem('swagger2'));
				}
			}

	},
	template: '#template-gui-main'
});

/*

	  this.renameSecurityDefinition = function(oldName, newName) {
	    if ((newName != oldName) && (newName != '')) {
	      this.apiConfig.securityDefinitions[newName] = this.apiConfig.securityDefinitions[oldName];
		  delete this.apiConfig.securityDefinitions[oldName];
		}

	  this.addScope = function(sdName) {
		if (!this.apiConfig.securityDefinitions[sdName].scopes) {
			this.apiConfig.securityDefinitions[sdName].scopes = {};
		}
	    this.apiConfig.securityDefinitions[sdName].scopes['newScope'] = 'Description';
	  };

	  this.renameScope = function(sdName, oldName, newName) {
	    if (newName != oldName) {
	      this.apiConfig.securityDefinitions[sdName].scopes[newName] = this.apiConfig.securityDefinitions[sdName].scopes[oldName];
		  delete this.apiConfig.securityDefinitions[sdName].scopes[oldName];
		}
	  };

	  this.removeScope = function(sdName, sName) {
		if (window.localStorage) window.localStorage.setItem('swagger2',JSON.stringify(apiConfig));
		delete this.apiConfig.securityDefinitions[sdName].scopes[sName];
	  };

)};
*/