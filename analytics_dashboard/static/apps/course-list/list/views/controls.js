/**
 * A wrapper view for controls.
 */
define(function(require) {
    'use strict';

    var _ = require('underscore'),
        ParentView = require('components/generic-list/common/views/parent-view'),

        CheckboxFilter = require('components/filter/views/checkbox-filter'),
        CourseListSearch = require('course-list/list/views/search'),
        courseListControlsTemplate = require('text!course-list/list/templates/controls.underscore'),

        CourseListControlsView;

    CourseListControlsView = ParentView.extend({
        template: _.template(courseListControlsTemplate),

        regions: {
            search: '.course-list-search-container',
            availabilityFilter: '.course-list-availability-filter-container',
            pacingTypeFilter: '.course-list-pacing-type-filter-container'
        },

        initialize: function(options) {
            var defaultFilterOptions;
            this.options = options || {};

            defaultFilterOptions = {
                collection: this.options.collection,
                trackingModel: this.options.trackingModel,
                trackSubject: this.options.trackSubject,
                appClass: this.options.appClass
            };

            this.childViews = [
                {
                    region: 'search',
                    class: CourseListSearch,
                    options: {
                        collection: this.options.collection,
                        name: 'text_search',
                        placeholder: gettext('Find a course'),
                        trackingModel: this.options.trackingModel
                    }
                }, {
                    region: 'availabilityFilter',
                    class: CheckboxFilter,
                    options: _({
                        filterKey: 'availability',
                        filterValues: this.options.collection.getFilterValues('availability'),
                        sectionDisplayName: this.options.collection.filterDisplayName('availability')
                    }).defaults(defaultFilterOptions)
                }, {
                    region: 'pacingTypeFilter',
                    class: CheckboxFilter,
                    options: _({
                        filterKey: 'pacing_type',
                        filterValues: this.options.collection.getFilterValues('pacing_type'),
                        sectionDisplayName: this.options.collection.filterDisplayName('pacing_type')
                    }).defaults(defaultFilterOptions)
                }

            ];
        }
    });

    return CourseListControlsView;
});


