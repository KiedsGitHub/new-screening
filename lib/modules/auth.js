module.exports = {

    provider: async function(options, name) {
        const provider = await this.setAuthProvider(name, options);

        return { identity: provider.identity };
    },

    identify: async function(options) {
        const provider = await this.getAuthProvider(this.parseRequired(options.provider, 'string', 'auth.validate: provider is required.'));

        return provider.identity;
    },

    validate: async function(options) {
        const provider = await this.getAuthProvider(this.parseRequired(options.provider, 'string', 'auth.validate: provider is required.'));
        const { action, username, password, remember } = this.req.body;

        if (action == 'validate') {
            return provider.validate(username, password);
        }

        if (action == 'login') {
            return provider.login(username, password, remember);
        }

        if (action == 'logout') {
            return provider.logout();
        }

        if (!provider.identity) {
            return provider.unauthorized();
        }
    },

    login: async function(options) {
        const provider = await this.getAuthProvider(this.parseRequired(options.provider, 'string', 'auth.login: provider is required.'));
        const username = this.parseOptional(options.username, 'string', this.parse('{{$_POST.username}}'));
        const password = this.parseOptional(options.password, 'string', this.parse('{{$_POST.password}}'));
        const remember = this.parseOptional(options.remember, '*', this.parse('{{$_POST.remember}}'));

        return provider.login(username, password, remember);
    },

    logout: async function(options) {
        const provider = await this.getAuthProvider(this.parseRequired(options.provider, 'string', 'auth.logout: provider is required.'));

        return provider.logout();
    },

    restrict: async function(options) {
        const provider = await this.getAuthProvider(this.parseRequired(options.provider, 'string', 'auth.restrict: provider is required.'));

        return provider.restrict(this.parse(options));
    },

    impersonate: async function(options) {
        const provider = await this.getAuthProvider(this.parseRequired(options.provider, 'string', 'auth.impersonate: provider is required.'));
        const identity = this.parseRequired(options.identity, 'string', 'auth.impersonate: identity is required.');

        return provider.impersonate(identity);
    },

    verify: async function(options) {
        const provider = await this.getAuthProvider(this.parseRequired(options.provider, 'string', 'auth.verify: provider is required.'));
        const username = this.parseRequired(options.username, 'string', 'auth.verify: username is required.');
        const password = this.parseRequired(options.password, 'string', 'auth.verify: password is required.');

        return provider.validate(username, password);
    },

};