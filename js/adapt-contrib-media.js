/*
* adapt-contrib-media
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Chris Steele <chris.steele@kineo.com>, Daryl Hedley <darylhedley@hotmail.com>,
*               Kevin Corry <kevinc@learningpool.com>
*/
define(function(require) {

    var mep = require("components/adapt-contrib-media/js/mediaelement-and-player.min.js");
    var Adapt = require("coreJS/adapt");
    var ComponentView = require("coreViews/componentView");
    var Handlebars = require('handlebars');

    var Media = ComponentView.extend({

        preRender: function() {
            this.listenTo(Adapt, 'device:resize', this.onScreenSizeChanged);
            this.listenTo(Adapt, 'device:changed', this.onDeviceChanged);
        },

        onScreenSizeChanged: function() {
            this.$('audio, video').width(this.$('.component-widget').width());
        },

        onDeviceChanged: function() {
            if (this.model.get('_media').source) {
                this.$('.mejs-container').width(this.$('.component-widget').width());
            }
        },

        postRender: function() {
            this.mediaElement = this.$('audio, video').mediaelementplayer({
                pluginPath:'assets/',
                success: _.bind(function (mediaElement, domObject) {
                    this.setReadyStatus();
                    this.setupEventListeners(mediaElement);
                }, this),
                features: ['playpause','progress','current','duration']
            });

            // We're streaming - set ready now, as success won't be called above
            if (this.model.get('_media').source) {
                this.$('.media-widget').addClass('external-source');
                this.setReadyStatus();
            }
        },

        setupEventListeners: function(mediaElement) {
            var completionEvent = (!this.model.get('_setCompletionOn')) ? 'play' : this.model.get('_setCompletionOn');
            if (completionEvent !== "inview") {
                mediaElement.addEventListener(completionEvent, _.bind(function() {
                    mediaElement.removeEventListener(completionEvent);
                    this.setCompletionStatus();
                }, this), false);
            } else {
                this.$('.component-widget').on('inview', _.bind(this.inview, this));
            }
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.$('.component-inner').off('inview');
                    this.setCompletionStatus();
                }
                
            }
        }

    });

    Adapt.register("media", Media);

    return Media;

});
