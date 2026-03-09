// Node 18+ has native fetch support


async function testApi() {
    const datasetId = 'd41c5c1c-1bae-4871-af56-1eca5b340039';
    const apiUrl = `https://data.gov.au/data/api/3/action/package_show?id=${datasetId}`;

    console.log(`--- Testing API Fetch for Dataset: ${datasetId} ---`);
    console.log(`URL: ${apiUrl}\n`);

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            const result = data.result;
            console.log('✅ Successfully fetched metadata!');
            console.log(`Title: ${result.title}`);
            console.log(`Modified: ${result.metadata_modified}`);
            console.log(`Resources found: ${result.resources.length}\n`);

            // List resources
            result.resources.forEach((resource, index) => {
                console.log(`Resource ${index + 1}:`);
                console.log(`  Name: ${resource.name}`);
                console.log(`  Format: ${resource.format}`);
                console.log(`  URL: ${resource.url}\n`);
            });

            // Try to fetch the CSV resource ('Major Digital Projects Report 2026 - Project Data')
            const csvResource = result.resources.find(r => r.name.includes('Project Data') && r.format.toLowerCase() === '.csv');

            if (csvResource) {
                console.log(`--- Testing CSV Data Fetch: ${csvResource.name} ---`);
                const csvResponse = await fetch(csvResource.url);
                if (csvResponse.ok) {
                    const csvText = await csvResponse.text();
                    console.log('✅ Successfully fetched CSV content!');
                    console.log('Preview (first 200 chars):');
                    console.log(csvText.substring(0, 200) + '...');
                } else {
                    console.log(`❌ Failed to fetch CSV content. Status: ${csvResponse.status}`);
                }
            } else {
                console.log('⚠️ Could not find CSV resource for project data.');
            }

        } else {
            console.log('❌ API call was not successful according to "success" field.');
        }
    } catch (error) {
        console.error('❌ Error during API test:', error.message);
    }
}

testApi();
