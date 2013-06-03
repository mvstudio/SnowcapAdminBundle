SnowcapAdmin.Form = (function($) {
    /**
     * Form Collection view
     * Used to manage Symfony form collection type
     *
     */
    var Collection = SnowcapCore.Form.Collection.extend({
        events: {
            'click .add-element': 'addItem', // Legacy
            'click *[data-admin=form-collection-add]': 'addItem',
            'click .remove-element': 'removeItem', // Legacy
            'click [data-admin=form-collection-remove]': 'removeItem'
        },
        /**
         * Initialize
         *
         */
        initialize: function() {
            SnowcapCore.Form.Collection.prototype.initialize.apply(this);

            this.on('form:collection:add', textAutocompleteFactory);
            this.on('form:collection:add', autocompleteFactory);
        },
        /**
         * Remove a collection item
         *
         * @param event
         */
        removeItem: function(event) {
            event.preventDefault();
            var
                $target = $(event.currentTarget),
                $collectionItem;

            $collectionItem = $target.parents('[data-admin=form-collection-item]');
            if(0 === $collectionItem.length) {
                $collectionItem = $target.parent();
            }

            if(this.options.confirmDelete) {
                var modal = new SnowcapBootstrap.Modal({'url': this.options.confirmDeleteUrl});
                modal.on('modal:confirm', _.bind(function() {
                    this.fadeAndRemoveItem($collectionItem);
                }, this));
            }
            else {
                this.fadeAndRemoveItem($collectionItem);
            }

            this.trigger('form:collection:remove');
            this.$form.trigger('change');
        },
        /**
         * Fade and remove a collection item
         *
         * @param $item
         */
        fadeAndRemoveItem: function($item) {
            $item.fadeOut(function() {
                $item.remove();
            });
        }
    });

    /**
     * Form collection factory function
     *
     * @param $context
     */
    var collectionFactory = function() {
        var $context = (0 === arguments.length) ? $('body') : arguments[0];
        $context.find('[data-admin=form-collection]').each(function(offset, container) {
            var options = {
                el: $(container),
                confirmDelete: $(container).data('options-confirm-delete-url') ? true : false,
                confirmDeleteUrl: $(container).data('options-confirm-delete-url') ? $(container).data('options-confirm-delete-url') : null
            };

            new SnowcapAdmin.Form.Collection(options);
        });
    };

    /**
     * Form Autocomplete view
     * Used to handle snowcap_admin_autocomplete form type
     *
     */
    var TextAutocomplete = Backbone.View.extend({
        $textInput: null,
        listUrl: null,
        labels: [],
        /**
         * Initialize
         *
         */
        initialize: function () {
            this.$el.css('position', 'relative');
            this.$textInput = this.$el.find('input[type=text]');
            this.listUrl = this.$el.data('options-url');

            this.initializeTypeahead();

            // Handle focus / blur
            this.$textInput
                .on('focus', function(){
                    $(this).data('prev', $(this).val());
                    $(this).val('');
                })
                .on('blur', function(){
                    if($(this).val() === '') {
                        $(this).val($(this).data('prev'));
                    }
                });
        },
        /**
         * Initialize typeahead widget
         *
         */
        initializeTypeahead: function() {
            // Initialize typeahead
            this.$textInput.typeahead({
                source: _.bind(this.source, this),
                minLength: 3,
                items: 10
            });
        },
        /**
         * Bootstrap typeahead source implementation
         *
         * @param query
         * @param process
         */
        source: function(query, process) {
            var replacedUrl = this.listUrl.replace('__query__', query);
            $.getJSON(replacedUrl, _.bind(function(data) {
                this.labels = [];
                $.each(data.result, _.bind(function (i, item) {
                    this.labels.push(item);
                }, this));
                process(this.labels);
            }, this));
        }
    });

    /**
     * Autocomplete factory function
     *
     * @param $context
     */
    var textAutocompleteFactory = function() {
        var $context = (0 === arguments.length) ? $('body') : arguments[0];
        $context.find('[data-admin=form-text-autocomplete]').each(function(offset, autocompleteContainer) {
            new TextAutocomplete({el: $(autocompleteContainer)});
        });
    };

    /**
     * Form Autocomplete view
     * Used to handle snowcap_admin_autocomplete form type
     *
     */
    var Autocomplete = TextAutocomplete.extend({
        $textInput: null,
        listUrl: null,
        mode: null,
        mapped: {},
        events: {
            'click a[data-admin=content-add]': 'add'
        },
        /**
         * Initialize
         *
         */
        initialize: function () {
            TextAutocomplete.prototype.initialize.apply(this);

            this.$valueInput = this.$el.find('input[type=hidden]');
            this.mode = this.$el.data('options-mode');

            if('multiple' === this.mode) {
                $('ul.tokens').on('click', 'a[rel=remove]', _.bind(function(event) {
                    event.preventDefault();
                    var value = $(this).parent('li').data('value');
                    $(this).parent('li').remove();
                    this.$el.find('input[value=' + value + ']').remove();
                }, this));
            }
        },
        /**
         * Initialize typeahead widget
         *
         */
        initializeTypeahead: function() {
            // Initialize typeahead
            this.$textInput.typeahead({
                source: _.bind(this.source, this),
                minLength: 3,
                items: 10,
                matcher: _.bind(this.matcher, this),
                updater: _.bind(this.updater, this)
            });
        },
        /**
         * Bootstrap typeahead source implementation
         *
         * @param query
         * @param process
         */
        source: function(query, process) {
            var replacedUrl = this.listUrl.replace('__query__', query);
            $.getJSON(replacedUrl, _.bind(function(data) {
                this.mapped = {};
                this.labels = [];
                $.each(data.result, _.bind(function (i, item) {
                    this.mapped[item[1]] = item[0];
                    this.labels.push(item[1]);
                }, this));
                process(this.labels);
            }, this));
        },
        /**
         * Bootstrap typeahed matcher implementation
         *
         * @param item
         * @returns {boolean}
         */
        matcher: function(item) {
            var existingTokens = this.$el.find('.token span').map(function() {
                return $(this).html();
            });

            return -1 === $.inArray(item, existingTokens);
        },
        /**
         * Bootstrap typeahed updater implementation
         *
         * @param item
         * @returns {*}
         */
        updater: function(item) {
            if('single' === this.mode) {
                this.$el.find('input[type=hidden]').val(this.mapped[item]).trigger('change');
                return item;
            }
            else {
                var prototype = this.$el.data('prototype');
                var $prototype = $(prototype.replace(/__name__/g, this.$el.find('input[type=hidden]').length));
                $prototype.val(this.mapped[item]);
                this.$el.prepend($prototype);
                $prototype.trigger('change');

                $token = $('<li>').addClass('token').html($('<span>').html(item)).append($('<a>').html('&times;').addClass('close').attr('rel', 'remove'));
                this.$el.find('.tokens').append($token);

                return "";
            }
        },
        /**
         * Add a new entity and select it within the widget
         *
         * @param event
         */
        add: function(event) {
            event.preventDefault();
            var $trigger = $(event.currentTarget);
            var contentModal = new SnowcapAdmin.Content.Modal({url: $trigger.attr('href')});
            contentModal.on('modal:success', _.bind(function(result){
                var
                    option = $('<option>'),
                    entity_id = result.entity_id,
                    entity_name = result.entity_name;
                if('single' === this.mode) {
                    // TODO refactor with autocomplete updater
                    this.$textInput.val(entity_name);
                    this.$valueInput.val(entity_id).trigger('change');
                }
                else {
                    var prototype = this.$el.data('prototype');
                    var $prototype = $(prototype.replace(/__name__/g, this.$el.find('input[type=hidden]').length));
                    $prototype.val(entity_id);
                    this.$el.prepend($prototype);
                    $prototype.trigger('change');

                    var $token = $('<li>').addClass('token').html($('<span>').html(entity_name)).append($('<a>').html('&times;').addClass('close').attr('rel', 'remove'));
                    this.$el.find('.tokens').append($token);
                }
            }, this));
        }
    });

    /**
     * Autocomplete factory function
     *
     * @param $context
     */
    var autocompleteFactory = function() {
        var $context = (0 === arguments.length) ? $('body') : arguments[0];
        $context.find('[data-admin=form-autocomplete]').each(function(offset, autocompleteContainer) {
            new Autocomplete({el: $(autocompleteContainer)});
        });
    };

    return {
        Collection: Collection,
        collectionFactory: collectionFactory,
        TextAutocomplete: TextAutocomplete,
        textAutocompleteFactory: textAutocompleteFactory,
        Autocomplete: Autocomplete,
        autocompleteFactory: autocompleteFactory
    }
})(jQuery);

jQuery(document).ready(function() {

    SnowcapAdmin.Form.collectionFactory();
    SnowcapAdmin.Form.textAutocompleteFactory();
    SnowcapAdmin.Form.autocompleteFactory();

});