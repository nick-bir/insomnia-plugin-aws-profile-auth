# Insomnia plugin for aws profiles

## Usage

1. Install the plugin
2. In the request drop-down menu, select `Set AWS profile`
3. All subsequent request will be signed using auth data from that profile. Auth parameters of the request will be overriden and ignored
4. When you don't need to use profile anymore - in the request drop-down menu, select 'Clear AWS profile'

Please note, that this setting affects all request in your workbook, not only the one that was clicked on.