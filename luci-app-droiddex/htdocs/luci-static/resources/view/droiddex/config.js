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

var callServiceAction = rpc.declare({
    object: 'service',
    method: 'event',
    params: ['action', 'name'],
    expect: { }
});

return view.extend({
    title: _('DroidDex Configuration'),
    description: _('Configure DroidDex Android screen mirroring service'),

    load: function() {
        return uci.load('droiddex');
    },

    parseAdbDevices: function(output) {
        var devices = [];
        if (!output || !output.trim()) return devices;
        
        var lines = output.trim().split('\n');
        for (var i = 1; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line && line.includes('device')) {
                var parts = line.split(/\s+/);
                if (parts.length >= 2 && parts[1] === 'device') {
                    devices.push(parts[0]);
                }
            }
        }
        return devices;
    },

    render: function() {
        var m = new form.Map('droiddex', _('DroidDex'), 
            _('Configuration DroidDex service'));

        var s = m.section(form.NamedSection, 'config', 'droiddex', _('General Settings'));
        s.addremove = false;

        var port = s.option(form.Value, 'server_port', _('Server Port'), 
            _('Port to run the web server on (default: 8000)'));
        port.datatype = 'port';
        port.placeholder = '8000';

        var device = s.option(form.ListValue, 'device', _('ADB Device'), 
            _('ADB device ID to connect to'));
        device.value('', _('-- Select Device --'));

        var self = this;
        device.load = function(section_id) {
            return fs.exec('adb', ['devices']).then(function(result) {
                if (result.code === 0) {
                    var devices = self.parseAdbDevices(result.stdout || '');
                    devices.forEach(function(deviceId) {
                        device.value(deviceId, deviceId);
                    });
                }
                return uci.get('droiddex', section_id, 'device') || '';
            }).catch(function() {
                return uci.get('droiddex', section_id, 'device') || '';
            });
        };

        var refreshDevices = s.option(form.Button, 'refresh_devices', _('Refresh Devices'));
        refreshDevices.inputtitle = _('Refresh ADB Devices');
        refreshDevices.onclick = function(ev) {
            var btn = ev.target;
            btn.disabled = true;
            btn.value = _('Scanning...');
            
            return fs.exec('adb', ['devices']).then(function(result) {
                if (result.code === 0) {
                    var devices = self.parseAdbDevices(result.stdout || '');
                    
                    while (device.keylist.length > 1) {
                        device.keylist.pop();
                        device.vallist.pop();
                    }
                    
                    devices.forEach(function(deviceId) {
                        device.value(deviceId, deviceId);
                    });
                    
                    var selectEl = document.querySelector('select[data-name="device"]');
                    if (selectEl) {
                        var currentValue = selectEl.value;
                        selectEl.innerHTML = '<option value="">-- Auto Detect --</option>';
                        
                        devices.forEach(function(deviceId) {
                            var option = document.createElement('option');
                            option.value = deviceId;
                            option.textContent = deviceId;
                            selectEl.appendChild(option);
                        });
                        
                        if (devices.indexOf(currentValue) !== -1) {
                            selectEl.value = currentValue;
                        }
                    }
                    
                    ui.addNotification(null, 
                        E('p', _('Found %d device(s)').format(devices.length)), 
                        'info'
                    );
                } else {
                    ui.addNotification(null, 
                        E('p', _('ADB command failed')), 
                        'warning'
                    );
                }
            }).catch(function() {
                ui.addNotification(null, 
                    E('p', _('Failed to scan devices')), 
                    'error'
                );
            }).finally(function() {
                btn.disabled = false;
                btn.value = _('Refresh ADB Devices');
            });
        };

        var bitrate = s.option(form.Value, 'video_bit_rate', _('Video Bit Rate'), 
            _('Video bit rate for scrcpy streaming (default: 1024000)'));
        bitrate.datatype = 'uinteger';
        bitrate.placeholder = '1024000';


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
 
