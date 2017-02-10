/**
 * Collection of courses stored client-side.
 */
define(function(require) {
    'use strict';

    var $ = require('jquery'),
        ListCollection = require('components/generic-list/common/collections/collection'),
        CourseModel = require('course-list/common/models/course'),
        FieldFilter = require('course-list/common/filters/field-filter'),
        FilterSet = require('course-list/common/filters/filter-set'),
        SearchFilter = require('course-list/common/filters/search-filter'),

        CourseListCollection;

    CourseListCollection = ListCollection.extend({

        mode: 'client',

        model: CourseModel,

        /**
         * The collection in its entirety.  Used to restore the collection clear
         * clearing filters.
         */
        shadowCollection: undefined,

        /**
         * Matcher used when searching and created by the paginator's ClientSideFilter.
         */
        searchMatcher: undefined,

        initialize: function(models, options) {
            ListCollection.prototype.initialize.call(this, models, options);

            // original collection are saved for filtering and restoring when filters are unset
            this.shadowCollection = new ListCollection(models, options);

            this.registerSortableField('catalog_course_title', gettext('Course Name'));
            this.registerSortableField('start_date', gettext('Start Date'));
            this.registerSortableField('end_date', gettext('End Date'));
            this.registerSortableField('cumulative_count', gettext('Total Enrollment'));
            this.registerSortableField('count', gettext('Current Enrollment'));
            this.registerSortableField('count_change_7_days', gettext('Change Last Week'));
            this.registerSortableField('verified_enrollment', gettext('Verified Enrollment'));

            this.registerFilterableField('availability', gettext('Availability'));
            this.registerFilterableField('pacing_type', gettext('Pacing Type'));
        },

        state: {
            pageSize: 100,
            sortKey: 'catalog_course_title',
            order: 0
        },

        /**
         * Constructors a filter ANDed between search and filterable fields.
         * The results are ORed Within the filterable fields,
         */
        constructFilter: function() {
            var activeFilterFields = this.getActiveFilterFields(),
                filters = [];
            if (this.searchMatcher) {
                filters.push(new SearchFilter(this.searchMatcher))
            }

            _(activeFilterFields).each(function(value, key) {
                var activeFilters;
                activeFilters = _(value.split(',')).map(function(field) {
                    return new FieldFilter(key, field);
                });
                filters.push(new FilterSet('OR', activeFilters));
            });

            return new FilterSet('AND', filters);
        },

        updateSearch: function () {
            if (this.pageableCollection) {
                this.pageableCollection.getFirstPage({silent: true});
            }
            this.refresh();
            this.trigger('backgrid:searchChanged', {
                searchTerm: this.getSearchString(),
                collection: this
            });
        },

        unsetSearchString: function() {
            ListCollection.prototype.unsetSearchString.call(this);
            this.searchMatcher = undefined;
            this.updateSearch(undefined);
        },

        setSearchString: function(searchString, matcher) {
            ListCollection.prototype.setSearchString.call(this, searchString);
            this.searchMatcher = matcher;
            this.updateSearch();
        },

        /**
         * Given a filter type, returns the filters that can be applied and
         * display name.
         */
        getFilterValues: function(filterType) {
            var filters = {
                pacing_type: [{
                    name: 'instructor_paced',
                    displayName: this.getFilterValueDisplayName('pacing_type', 'instructor_paced')
                }, {
                    name: 'self_paced',
                    displayName: this.getFilterValueDisplayName('pacing_type', 'self_paced')
                }],
                availability: [{
                    name: 'Upcoming',
                    displayName: this.getFilterValueDisplayName('availability', 'Upcoming')
                }, {
                    name: 'Current',
                    displayName: this.getFilterValueDisplayName('availability', 'Current')
                }, {
                    name: 'Archived',
                    displayName: this.getFilterValueDisplayName('availability', 'Archived')
                }]
            };

            return filters[filterType];
        },

        refresh: function() {
            var filter = this.constructFilter();
            ListCollection.prototype.refresh.call(this);
            // Surprisingly calling refresh() does not emit a backgrid:refresh event. So do that here:
            this.reset(filter.filter(this.shadowCollection), {reindex: false});
            this.trigger('backgrid:refresh', {collection: this});
        },

        // Override PageableCollection's setPage() method because it has a bug where it assumes that backgrid getPage()
        // will always return a promise. It does not in client mode.
        // Note: this function will only work in client mode. It should be removed if this collection is used
        // in server mode.
        setPage: function(page) {
            var deferred = $.Deferred();

            this.getPage(page - (1 - this.state.firstPage), {reset: true});
            // getPage() will probably throw an exception if it fails in client mode, so assume succeeded
            this.isStale = false;
            this.trigger('page_changed');
            deferred.resolve();
            return deferred.promise();
        }
    });

    return CourseListCollection;
});
