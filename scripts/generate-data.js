const fs = require('fs');
const path = require('path');

/**
 * Pre-process all data sources into optimized JSON
 * This runs at build time, not runtime
 */
function generateOptimizedData() {
  console.log('🔄 Starting data pre-processing...');
  
  const allProjects = [];
  const metadata = {
    generatedAt: new Date().toISOString(),
    totalProjects: 0,
    dataSources: []
  };

  // Process CSV files
  const csvFiles = [
    'mdpr-dataset-project-data-1.csv',
    'digital-project-data_v2.csv'
  ];

  csvFiles.forEach(fileName => {
    const filePath = path.join(process.cwd(), fileName);
    if (fs.existsSync(filePath)) {
      console.log(`📄 Processing ${fileName}...`);
      const projects = processCSVFile(filePath);
      allProjects.push(...projects);
      metadata.dataSources.push({
        file: fileName,
        count: projects.length,
        type: 'csv'
      });
    }
  });

  // If no files found, use sample data
  if (allProjects.length === 0) {
    console.log('⚠️  No data files found, using sample data');
    allProjects.push(...getSampleData());
    metadata.dataSources.push({
      file: 'sample-data',
      count: allProjects.length,
      type: 'sample'
    });
  }

  // Remove duplicates based on project name
  const uniqueProjects = removeDuplicates(allProjects);
  
  // Generate optimized data structure
  const optimizedData = {
    projects: uniqueProjects,
    metadata: {
      ...metadata,
      totalProjects: uniqueProjects.length,
      lastUpdated: new Date().toISOString()
    },
    // Pre-computed aggregations for better performance
    aggregations: generateAggregations(uniqueProjects)
  };

  // Ensure public directory exists
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Write optimized JSON
  const outputPath = path.join(publicDir, 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(optimizedData, null, 2));

  console.log(`✅ Data generation complete!`);
  console.log(`📊 Total projects: ${uniqueProjects.length}`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`💾 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
}

function processCSVFile(filePath) {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    const record = {};
    
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    
    records.push(normalizeProjectData(record));
  }
  
  return records;
}

function normalizeProjectData(record) {
  return {
    Portfolio: record.Portfolio || '',
    Agency: record.Agency || '',
    Tier: record.Tier || 'Tier 3',
    'Project name': record['Project name'] || '',
    'DCA 2024': record['DCA 2024'] || '',
    'DCA 2025': record['DCA 2025'] || '',
    'Delivery status': record['Delivery status'] || 'Active',
    'Total budget (millions)': parseFloat(record['Total budget (millions)']) || 0,
    'Digital budget (millions)': parseFloat(record['Digital budget (millions)']) || 0,
    'Project end date': record['Project end date'] || '',
    'Project description': record['Project description'] || '',
  };
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(item => item.replace(/^"|"$/g, ''));
}

function removeDuplicates(projects) {
  const seen = new Set();
  return projects.filter(project => {
    const key = project['Project name'];
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function generateAggregations(projects) {
  const portfolios = [...new Set(projects.map(p => p.Portfolio))].sort();
  const agencies = [...new Set(projects.map(p => p.Agency))].sort();
  const tiers = [...new Set(projects.map(p => p.Tier))].sort();
  const deliveryStatuses = [...new Set(projects.map(p => p['Delivery status']))].sort();
  const dcaLevels = [...new Set(projects.map(p => p['DCA 2025'] || 'Not reported'))].sort();
  
  const totalBudget = projects.reduce((sum, p) => sum + p['Total budget (millions)'], 0);
  const digitalBudget = projects.reduce((sum, p) => sum + p['Digital budget (millions)'], 0);
  
  return {
    portfolios,
    agencies,
    tiers,
    deliveryStatuses,
    dcaLevels,
    totalBudget,
    digitalBudget,
    projectCount: projects.length
  };
}

function getSampleData() {
  return [
    {
      Portfolio: "Attorney-General's",
      Agency: "Australian Criminal Intelligence Commission",
      Tier: 'Tier 1',
      'Project name': 'National Criminal Intelligence System (NCIS)',
      'DCA 2024': 'Medium-High',
      'DCA 2025': 'Medium',
      'Delivery status': 'Active',
      'Total budget (millions)': 373.7,
      'Digital budget (millions)': 373.7,
      'Project end date': '30.06.2027',
      'Project description': 'The NCIS will provide secure access to a national view of criminal information and intelligence.'
    },
    {
      Portfolio: "Agriculture, Fisheries and Forestry",
      Agency: "Department of Agriculture, Fisheries and Forestry",
      Tier: 'Tier 2',
      'Project name': 'Capital Security, Technology and Asset Refresh (CapSTAR)',
      'DCA 2024': '',
      'DCA 2025': 'Medium-High',
      'Delivery status': 'Active',
      'Total budget (millions)': 279,
      'Digital budget (millions)': 189.8,
      'Project end date': '30.06.2028',
      'Project description': 'The CapSTAR program aims to refresh and maintain essential property and ICT assets.'
    },
    {
      Portfolio: "Attorney-General's",
      Agency: "Australian Federal Police",
      Tier: 'Tier 3',
      'Project name': 'Investigation Management Solution (IMS) Program',
      'DCA 2024': '',
      'DCA 2025': 'High',
      'Delivery status': 'Active',
      'Total budget (millions)': 45,
      'Digital budget (millions)': 45,
      'Project end date': '30.06.2025',
      'Project description': 'The IMS is providing the Australian Federal Police (AFP) with the ability to manage investigative processes.'
    }
  ];
}

// Run the script
generateOptimizedData();
