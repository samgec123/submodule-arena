
# Steps to add a domain for Assets Delivery

This document outlines the steps needed to add a custom domain for delivery tier for Assets. The custom domain will have one to one mapping with each AEM environment.

## 1. Add custom domain to cloud manager

To add a custom domain to Cloud Manager, please follow the [documentation](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/using-cloud-manager/custom-domain-names/introduction) and the steps outlined below:

		1. Add the Certificate: Begin by adding the certificate for your custom domain to Cloud Manager. The certificate for *.marutisuzuki.com has already been installed, which will cover subdomains like assets-dev-arena.marutisuzuki.com. However, please note that assets.dev-arena.marutisuzuki.com is not included in the existing certificate. Ensure that the selected domain is supported by the installed certificate.


		2. Add the Custom Domain: Proceed to add your custom domain to Cloud Manager.

		3. Configure DNS Settings: Update your DNS settings by adding the necessary CNAME or APEX records to point to AEM as a Cloud Service.

		4. Review Domain Verification Status: Check the verification status of your domain to ensure it has been properly recognized.

		5. Check DNS Record Status: Finally, verify the status of your DNS records to confirm that everything is set up correctly


## 2. [Log a support case](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/dynamicmedia/dynamic-media-open-apis/configure-custom-domain) to facilitate the configuration of the custom domain, ensuring it directs to the delivery tier.

## 3. Add the custom domain mapping in AIO action for assetpicker config
			1. AIO action codebase location: https://github.com/MSILDigital/msil-adobe-aio/
			2. Make changes in Environment_Mapping to add environment and custom domain mapping. Currently deployed action has following mapping defined:
			ENVIRONMENT_MAPPING={"author-p135331-e1341966.adobeaemcloud.com":"assets-dev-arena.marutisuzuki.com/","author-p135331-e1368241.adobeaemcloud.com":"assets-qa-arena.marutisuzuki.com","author-p135331-e1368298.adobeaemcloud.com":"assets-int-arena.marutisuzuki.com","author-p135331-e1416989.adobeaemcloud.com":"assets-uat-arena.marutisuzuki.com","author-p135331-e1368300.adobeaemcloud.com":"assets-stage-arena.marutisuzuki.com","author-p135331-e1368299.adobeaemcloud.com":"assets-arena.marutisuzuki.com"}

			3. Deploy action in AIO project : https://developer.adobe.com/console/projects/1964180/4566206088345269715/overview
## 4. Change the CDN config to include preconnect header for the custom domain. 
Refer to [PR](https://github.com/MSILDigital/MSIL-AEM-Transformation/pull/99/files) for reference
