﻿'use strict';
define(['app', 'Series/SeriesModel', 'Series/Delete/DeleteSeriesView', 'Quality/QualityProfileCollection'], function () {

    NzbDrone.Series.EditSeriesView = Backbone.Marionette.ItemView.extend({
        template: 'Series/Edit/EditSeriesTemplate',
        tagName: 'div',
        className: "modal",

        ui: {
            progressbar: '.progress .bar',
            qualityProfile: '.x-quality-profile',
            backlogSettings: '.x-backlog-setting',
        },

        events: {
            'click .x-save': 'saveSeries',
            'click .x-remove': 'removeSeries'
        },

        onRender: function () {
            NzbDrone.ModelBinder.bind(this.model, this.el);
        },


        saveSeries: function () {
            //Todo: Get qualityProfile + backlog setting from UI
            var qualityProfile = this.ui.qualityProfile.val();
            var qualityProfileText = this.ui.qualityProfile.children('option:selected').text();
            var backlogSetting = this.ui.backlogSettings.val();

            this.model.set({ qualityProfileId: qualityProfile, backlogSetting: backlogSetting, qualityProfileName: qualityProfileText });

            this.model.save();
            this.trigger('saved');
            this.$el.parent().modal('hide');
        },

        removeSeries: function () {
            var view = new NzbDrone.Series.DeleteSeriesView({ model: this.model });
            NzbDrone.modalRegion.show(view);
        }
    });

});