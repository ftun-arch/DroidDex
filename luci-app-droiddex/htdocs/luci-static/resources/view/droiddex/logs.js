/*
 * This is open source software, licensed under the MIT License.
 *
 * Copyright (C) 2024 BobbyUnknown
 *
 * Description:
 * This software provides a RAM release scheduling application for OpenWrt.
 * The application allows users to configure and automate the process of 
 * releasing RAM on their OpenWrt router at specified intervals, helping
 * to optimize system performance and resource management through a 
 * user-friendly web interface.
 */

'use strict';
'require view';
'require fs';
'require ui';
'require poll';

return view.extend({
    handleSaveApply: null,
    handleSave: null,
    handleReset: null,

    loadLog: function() {
        return fs.read('/var/log/droiddex/droiddex.log')
            .then(function(log) {
                if (!log || !log.trim()) {
                    return _('No log entries found');
                }
                // Reverse log lines to show newest first
                var lines = log.trim().split('\n');
                return lines.reverse().join('\n');
            })
            .catch(function(err) {
                console.error('Error reading log:', err);
                return _('Error reading log file or file is empty');
            });
    },

    createDefaultLog: function() {
        var defaultMessage = 'No log found';
        return fs.write('/var/log/droiddex/droiddex.log', defaultMessage + '\n')
            .then(function() {
                return defaultMessage;
            })
            .catch(function(err) {
                console.error('Error creating default log:', err);
                return 'Error: Unable to initialize log file';
            });
    },

    render: function() {
        var logTextarea = E('textarea', {
            'class': 'cbi-input-textarea',
            'readonly': true,
            'style': 'width: 100%; height: 400px; font-family: monospace; font-size: 12px; resize: vertical; border: 1px solid #ccc;'
        });

        var updateLog = function() {
            this.loadLog().then(function(log) {
                logTextarea.value = log;
                logTextarea.scrollTop = 0;
            });
        }.bind(this);

        updateLog();

        poll.add(updateLog, 5);

        return E('div', { 'class': 'cbi-map' }, [
            E('h2', _('DroidDex Log')),
            E('div', { 'class': 'cbi-section' }, [
                E('div', { 'class': 'cbi-section-descr' }, _('Log entries are displayed with newest entries first. Auto-refreshes every 5 seconds.')),
                logTextarea
            ]),
            E('div', { 'class': 'cbi-section-actions' }, [
                E('button', {
                    'class': 'btn cbi-button cbi-button-remove',
                    'click': ui.createHandlerFn(this, function(ev) {
                        var button = ev.target;
                        button.disabled = true;
                        button.textContent = _('Clearing...');
                        
                        return fs.write('/var/log/droiddex/droiddex.log', 'Log cleared\n')
                            .then(function() {
                                updateLog();
                            })
                            .catch(function(err) {
                                console.error('Error clearing log:', err);
                            })
                            .finally(function() {
                                button.disabled = false;
                                button.textContent = _('Clear Log');
                            });
                    })
                }, _('Clear Log'))
            ]),
            E('div', { 'style': 'text-align: center; padding: 10px; font-style: italic;' }, [
                E('span', {}, [
                    _('© Dibuat oleh '),
                    E('a', { 
                        'href': 'https://github.com/bobbyunknow', 
                        'target': '_blank',
                        'style': 'text-decoration: none;'
                    }, 'BobbyUnknown')
                ])
            ])
        ]);
    }
});
