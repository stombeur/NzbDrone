'use strict';
define(
    [
        'vent',
        'marionette',
        'backgrid',
        'System/Logs/Table/LogTimeCell',
        'System/Logs/Table/LogLevelCell',
        'System/Logs/Table/LogRow',
        'Shared/Grid/Pager',
        'System/Logs/LogsCollection',
        'Shared/Toolbar/ToolbarLayout',
        'Shared/LoadingView',
        'jQuery/jquery.spin'
    ], function (vent, Marionette, Backgrid, LogTimeCell, LogLevelCell, LogRow, GridPager, LogCollection, ToolbarLayout, LoadingView) {
        return Marionette.Layout.extend({
            template: 'System/Logs/Table/LogsTableLayoutTemplate',

            regions: {
                grid   : '#x-grid',
                toolbar: '#x-toolbar',
                pager  : '#x-pager'
            },

            attributes: {
                id: 'logs-screen'
            },

            columns:
                [
                    {
                        name    : 'level',
                        label   : '',
                        sortable: true,
                        cell    : LogLevelCell
                    },
                    {
                        name    : 'logger',
                        label   : 'Component',
                        sortable: true,
                        cell    : Backgrid.StringCell.extend({
                            className: 'log-logger-cell'
                        })
                    },
                    {
                        name    : 'message',
                        label   : 'Message',
                        sortable: false,
                        cell    : Backgrid.StringCell.extend({
                            className: 'log-message-cell'
                        })
                    },
                    {
                        name : 'time',
                        label: 'Time',
                        cell : LogTimeCell
                    }
                ],

            initialize: function () {
                this.collection = new LogCollection();

                this.listenTo(this.collection, 'sync', this._showTable);
                vent.on(vent.Events.CommandComplete, this._commandComplete, this);
            },

            onRender: function () {
                this.grid.show(new LoadingView());
            },

            onShow: function () {
                this._showToolbar();
            },

            _showTable: function () {
                this.grid.show(new Backgrid.Grid({
                    row       : LogRow,
                    columns   : this.columns,
                    collection: this.collection,
                    className : 'table table-hover'
                }));

                this.pager.show(new GridPager({
                    columns   : this.columns,
                    collection: this.collection
                }));
            },

            _showToolbar: function () {
                var filterButtons = {
                    type         : 'radio',
                    storeState   : true,
                    menuKey      : 'logs.filterMode',
                    defaultAction: 'all',
                    items        :
                    [
                        {
                            key           : 'all',
                            title         : '',
                            tooltip       : 'All',
                            icon          : 'icon-circle-blank',
                            callback      : this._setFilter
                        },
                        {
                            key           : 'info',
                            title         : '',
                            tooltip       : 'Info',
                            icon          : 'icon-info',
                            callback      : this._setFilter
                        },
                        {
                            key           : 'warn',
                            title         : '',
                            tooltip       : 'Warn',
                            icon          : 'icon-warn',
                            callback      : this._setFilter
                        },
                        {
                            key           : 'error',
                            title         : '',
                            tooltip       : 'Error',
                            icon          : 'icon-error',
                            callback      : this._setFilter
                        }
                    ]
                };
                
                var leftSideButtons = {
                    type      : 'default',
                        storeState: false,
                        items     :
                    [
                        {
                            title         : 'Refresh',
                            icon          : 'icon-refresh',
                            ownerContext  : this,
                            callback      : this._refreshTable
                        },

                        {
                            title          : 'Clear Logs',
                            icon           : 'icon-trash',
                            command        : 'clearLog'
                        }
                    ]
                };

                this.toolbar.show(new ToolbarLayout({
                    left    :
                        [
                            leftSideButtons
                        ],
                    right  :
                        [
                            filterButtons
                        ],
                    context: this
                }));
            },

            _refreshTable: function (buttonContext) {
                this.collection.state.currentPage = 1;
                var promise = this.collection.fetch({ reset: true });

                if (buttonContext) {
                    buttonContext.ui.icon.spinForPromise(promise);
                }
            },
            
            _setFilter: function(buttonContext) {
                var mode = buttonContext.model.get('key');
                
                this.collection.setFilterMode(mode, { reset: false });
                
                this.collection.state.currentPage = 1;
                var promise = this.collection.fetch({ reset: true });
                
                if (buttonContext) {
                    buttonContext.ui.icon.spinForPromise(promise);
                }
            },

            _commandComplete: function (options) {
                if (options.command.get('name') === 'clearlog') {
                    this._refreshTable();
                }
            }
        });
    });
