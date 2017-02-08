/**
 * Catches the skipLinkClicked event and sets the focus on the target.  It's
 * expected that "skipTarget" is defined in the ui hash.
 */
define(function(require) {
    'use strict';

    var $ = require('jquery'),
        Marionette = require('marionette'),
        registerBehaviour = require('components/utils/register-behaviour'),

        SkipTargetBehaviour;

    SkipTargetBehaviour = Marionette.Behavior.extend({

        events: {
            skipLinkClicked: 'skipLinkClicked'
        },

        skipLinkClicked: function(e) {
            var targetId = $(e.target).attr('href'),
                thisId = '#' + $(this.ui.skipTarget).attr('id');
            // the event can bubble, so check to ensure this is the correct target
            if (targetId === thisId) {
                this.ui.skipTarget.focus();
                this.ui.skipTarget[0].scrollIntoView();
            }
        }

    });

    registerBehaviour(SkipTargetBehaviour, 'SkipTargetBehaviour');

    return SkipTargetBehaviour;
});
