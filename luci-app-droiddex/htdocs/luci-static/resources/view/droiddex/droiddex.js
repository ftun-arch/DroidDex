/*
 * This is open source software, licensed under the MIT License.
 * Copyright (C) 2024 BobbyUnknown
 * Mod @ftun-arch
 */

'use strict';
'require view';
'require uci';
'require fs';

return view.extend({
	title: _('DroidDex Mirror'),
	description: _('Real-time Android screen mirroring'),

	render: function() {
		return uci.load('droiddex').then(function() {
			var port = uci.get('droiddex', 'config', 'server_port') || '8000';
			var url = 'http://' + window.location.hostname + ':' + port;

			var iframe = E('iframe', {
				'src': url,
				'style': 'width: 100%; height: 80vh; border: none; min-height: 700px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);'
			});

			var serviceStatus = E('p', { 'id': 'service_status', 'style': 'font-weight: bold;' }, _('Checking service status...'));

			fs.exec('/etc/init.d/droiddex', ['status']).then(function(result) {
				var statusElem = document.getElementById('service_status');
				if (result.code === 0) {
					statusElem.innerHTML = '<span style="color: #28a745;">●</span> ' + _('Service is running. Mirror should appear below.');
				} else {
					statusElem.innerHTML = '<span style="color: #dc3545;">●</span> ' + _('Service is not running. Please start it from the Home tab.');
					iframe.style.display = 'none';
				}
			}).catch(function() {
				var statusElem = document.getElementById('service_status');
				statusElem.innerHTML = '<span style="color: #dc3545;">●</span> ' + _('Could not determine service status.');
				iframe.style.display = 'none';
			});

			var footer = E('div', { 'style': 'text-align: center; padding: 10px; font-style: italic;' }, [
                E('span', {}, [
                    _('© Dibuat oleh '),
                    E('a', { 
                        'href': 'https://github.com/bobbyunknow', 
                        'target': '_blank',
                        'style': 'text-decoration: none;'
                    }, 'BobbyUnknown')
                ])
            ]);

			return E('div', { 'class': 'cbi-map' }, [
				E('h2', _('DroidDex Screen Mirror')),
				E('div', { 'class': 'cbi-section' }, [
					E('div', { 'class': 'cbi-section-descr' }, serviceStatus),
					iframe,
					footer
				])
			]);
		});
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
