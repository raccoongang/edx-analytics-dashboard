define(function(require) {
    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Marionette = require('marionette'),

        ActiveFiltersView,

        activeFiltersTemplate = require('text!components/generic-list/list/templates/active-filters.underscore');

    ActiveFiltersView = Marionette.ItemView.extend({
        events: {
            'click .action-clear-filter': 'clearOneFilter',
            'click .action-clear-all-filters': 'clearAllFilters'
        },

        template: _.template(activeFiltersTemplate),

        initialize: function(options) {
            this.options = options || {};
            if (this.options.collection.mode === 'client') {
                this.listenTo(this.options.collection, 'backgrid:refresh', this.render);
            } else {
                this.listenTo(this.options.collection, 'sync', this.render);
            }
        },

        getFormattedActiveFilters: function(activeFilters) {
            var formattedFilters = [],
                collection = this.options.collection;

            _(activeFilters).each(function(filterVal, filterKey) {
                // create individual filters for each filter value (split by ','),
                // except for the text search where the user might enter in a comma
                var filterValues = filterKey === 'text_search' ?
                    [filterVal] : filterVal.split(',');
                _(filterValues).each(function(filter) {
                    var formattedFilterVal = (filterKey === 'text_search') ?
                        '"' + filter + '"' : collection.getFilterValueDisplayName(filterKey, filter),
                        filterDisplayName = collection.filterDisplayName(filterKey),
                        // Translators: this is a label describing a filter selection that the user initiated.
                        displayName = _.template(gettext('<%= filterDisplayName %>: <%= filterVal %>'))({
                            filterDisplayName: filterDisplayName,
                            filterVal: formattedFilterVal
                        });
                    formattedFilters.push({
                        name: filter,
                        filterKey: filterKey,
                        displayName: filterDisplayName === '' ? formattedFilterVal : displayName
                    });
                }, this)
            }, this);

            return formattedFilters;
        },

        templateHelpers: function() {
            // Note that search is included in 'activeFilters'
            var activeFilters = this.options.collection.getActiveFilterFields(true),
                hasActiveFilters = !_.isEmpty(activeFilters);

            activeFilters = this.getFormattedActiveFilters(activeFilters);

            return {
                hasActiveFilters: hasActiveFilters,
                activeFilters: activeFilters,
                activeFiltersTitle: gettext('Filters In Use:'),
                removeFilterMessage: gettext('Click to remove this filter'),
                // Translators: "Clear" in this context means "remove all of the filters"
                clearFiltersMessage: gettext('Clear'),
                clearFiltersSrMessage: gettext('Click to remove all filters')
            };
        },

        clearOneFilter: function(event) {
            var filterKey;
            event.preventDefault();
            filterKey = $(event.currentTarget).data('filter-key');
            this.options.collection.clearFilter(
                $(event.currentTarget).data('filter-key'),
                $(event.currentTarget).data('filter-name')
            );
        },

        clearAllFilters: function(event) {
            event.preventDefault();
            this.options.collection.clearAllFilters();
        }
    });

    return ActiveFiltersView;
});
