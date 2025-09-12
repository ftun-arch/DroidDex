/*
 * This is open source software, licensed under the MIT License.
 * Copyright (C) 2024 BobbyUnknown
 */

'use strict';
'require view';
'require form';
'require uci';
'require rpc';
'require fs';
'require ui';

var callServiceList = rpc.declare({
    object: 'service',
    method: 'list',
    params: ['name'],
    expect: { '': {} }
});

return view.extend({
    title: _('DroidDex Overview'),
    description: _('Web-based Android screen mirroring using scrcpy'),

    load: function() {
        return uci.load('droiddex');
    },

    render: function() {
        var m = new form.Map('droiddex', _('DroidDex'), 
            _('Web-based Android screen mirroring using scrcpy'));

        var controlSection = m.section(form.NamedSection, 'config', 'droiddex', _('Service Control'));
        controlSection.addremove = false;

        var statusOption = controlSection.option(form.DummyValue, '_status', _('Service Status'));
        statusOption.cfgvalue = function() {
            return fs.exec('/etc/init.d/droiddex', ['status']).then(function(result) {
                if (result.code === 0) {
                    return E('span', { 'style': 'color: #28a745; font-weight: bold;' }, _('● RUNNING'));
                } else {
                    return E('span', { 'style': 'color: #dc3545; font-weight: bold;' }, _('● STOPPED'));
                }
            }).catch(function() {
                return E('span', { 'style': 'color: #dc3545; font-weight: bold;' }, _('● STOPPED'));
            });
        };
        
        setInterval(function() {
            var statusElements = document.querySelectorAll('[data-widget-id="_status"]');
            if (statusElements.length > 0) {
                var statusElement = statusElements[0];
                fs.exec('/etc/init.d/droiddex', ['status']).then(function(result) {
                    if (result.code === 0) {
                        statusElement.innerHTML = '<span style="color: #28a745; font-weight: bold;">● RUNNING</span>';
                    } else {
                        statusElement.innerHTML = '<span style="color: #dc3545; font-weight: bold;">● STOPPED</span>';
                    }
                }).catch(function() {
                    statusElement.innerHTML = '<span style="color: #dc3545; font-weight: bold;">● STOPPED</span>';
                });
            }
        }, 5000);

        var startBtn = controlSection.option(form.Button, 'start', _('Start Service'));
        startBtn.inputtitle = _('Start');
        startBtn.onclick = function(ev) {
            var btn = ev.target;
            btn.disabled = true;
            btn.value = _('Starting...');
            
            Promise.all([
                fs.exec('/etc/init.d/droiddex', ['start']),
                fs.exec('/etc/init.d/droiddex', ['enable'])
            ]).then(function(results) {
                if (results[0].code === 0) {
                    ui.addNotification(null, E('p', _('DroidDex service started')), 'info');
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                } else {
                    ui.addNotification(null, E('p', _('Failed to start DroidDex service')), 'error');
                }
            }).catch(function(err) {
                ui.addNotification(null, E('p', _('Failed to start DroidDex service')), 'error');
            }).finally(function() {
                btn.disabled = false;
                btn.value = _('Start');
            });
        };

        var stopBtn = controlSection.option(form.Button, 'stop', _('Stop Service'));
        stopBtn.inputtitle = _('Stop');
        stopBtn.onclick = function(ev) {
            var btn = ev.target;
            btn.disabled = true;
            btn.value = _('Stopping...');
            
            Promise.all([
                fs.exec('/etc/init.d/droiddex', ['stop']),
                fs.exec('/etc/init.d/droiddex', ['disable'])
            ]).then(function(results) {
                if (results[0].code === 0) {
                    ui.addNotification(null, E('p', _('DroidDex service stopped')), 'info');
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                } else {
                    ui.addNotification(null, E('p', _('Failed to stop DroidDex service')), 'error');
                }
            }).catch(function(err) {
                ui.addNotification(null, E('p', _('Failed to stop DroidDex service')), 'error');
            }).finally(function() {
                btn.disabled = false;
                btn.value = _('Stop');
            });
        };

        var restartBtn = controlSection.option(form.Button, 'restart', _('Restart Service'));
        restartBtn.inputtitle = _('Restart');
        restartBtn.onclick = function(ev) {
            var btn = ev.target;
            btn.disabled = true;
            btn.value = _('Restarting...');
            
            fs.exec('/etc/init.d/droiddex', ['restart']).then(function(result) {
                if (result.code === 0) {
                    ui.addNotification(null, E('p', _('DroidDex service restarted')), 'info');
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                } else {
                    ui.addNotification(null, E('p', _('Failed to restart DroidDex service')), 'error');
                }
            }).catch(function(err) {
                ui.addNotification(null, E('p', _('Failed to restart DroidDex service')), 'error');
            }).finally(function() {
                btn.disabled = false;
                btn.value = _('Restart');
            });
        };

        fs.exec('/etc/init.d/droiddex', ['status']).then(function(result) {
            if (result.code === 0) {
                startBtn.readonly = true;
            } else {
                stopBtn.readonly = true;
                restartBtn.readonly = true;
            }
        }).catch(function() {
            stopBtn.readonly = true;
            restartBtn.readonly = true;
        });

        var footerSection = m.section(form.TypedSection, 'footer');
        footerSection.addremove = false;
        footerSection.anonymous = true;
        footerSection.render = function() {
            return E('div', { 'style': 'text-align: center; padding: 10px; font-style: italic;' }, [
                E('span', {}, [
                    _('© Dibuat oleh '),
                    E('a', { 
                        'href': 'https://github.com/bobbyunknow', 
                        'target': '_blank',
                        'style': 'text-decoration: none;'
                    }, 'BobbyUnknown')
                ])
            ]);
        };

        return m.render();
    },

    handleSave: null,
    handleSaveApply: null,
    handleReset: null
});
