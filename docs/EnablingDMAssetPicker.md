
# Steps to Enable Custom AssetPicker for Any Field

This document outlines the workflow for enabling a custom asset picker for any field. The custom picker adds the delivery URLs for the selected assets to the EDS blocks while allowing the author to have an author-backed repository view for asset selection.

## Prerequisite

1. Custom Extension for AssetPicker must be enabled for the org.
2. AIO action to retrieve the config must be deployed to the org.

## Steps to Modify the Model

1. Set the component of the desired field to ``` 
"component": "custom-asset-namespace:custom-asset"
```
2. Set config URL to the Adobe IO action deployed to fetch the config JSON:

```
"configUrl": "https://290622-assetpickerconfig-stage.adobeio-static.net/api/v1/web/assetpicker_config_aio/get-config"
```
3. Set Asset Type to image/video as per the filter to be applied for assets search
4. For videos make sure the following additional fields are also defined. Check [_video.json](https://github.com/MSILDigital/arena/blob/dev/blocks/video/_video.json) for an example.
			```
			{
				"component": "custom-asset-namespace:custom-asset",
				"name": "video_link",
				"label": "Video",
				"configUrl": "https://1964180-msilassetpickerconf.adobeio-static.net/api/v1/web/assetpicker_config_aio/get-config",
				"valueType": "string",
				"assetType":"video"
			},
			{
				"component": "custom-asset-namespace:custom-video-poster",
				"name": "video_poster",
				"valueType": "string"
			},
			{
				"component": "custom-asset-namespace:custom-video-asset-name",
				"name": "video_linkText",
				"valueType": "string"
			}

			```

## Field Naming Conventions

Name of the video field has to end with _link.
Name of the poster image and asset name fields has to end with _poster and _linkText respectively. The string before the underscore has to be the same for all fields so that the fields are grouped together.
Options field for styling can be provided as below. Please note that the field name has to end with _linkTitle.

- Name of the video field has to end with `_link`.
- Name of the poster image field has to end with `_poster`.
- Name of the asset name field has to end with `_linkText`.
- The string before the underscore has to be the same for all fields so that the fields are grouped together.
- Options field for styling can be provided as below. Please note that the field name has to end with `_linkTitle`.

```
"component": "multiselect",
"valueType": "string",
"name": "video_linkTitle",
"value": "",
"label": "Options",
"options": [
	{
		"name": "Hero",
		"value": "hero"
	},
	{
		"name": "Inline",
		"value": "inline"
	},
	{
		"name": "Autoplay",
		"value": "autoplay"
	}
]
```

5. Make sure that the custom asset picker extension for Universal Editor is deployed and enabled in Maruti's org. Currently the extension is deployed in the MSIL Custom Picker Adobe Extension [project](https://developer.adobe.com/console/projects/1964180/4566206088345269715/overview)

The extension (## AEM Custom Asset Picker for delivery repository) can be enabled/disabled at https://experience.adobe.com/#/@maruti/aem/extension-manager/universal-editor
