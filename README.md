<<<<<<< HEAD
# DTA Dashboard - Major Digital Projects

Interactive dashboard for tracking and visualizing major digital projects in the Australian government, based on the DTA (Digital Transformation Agency) dataset.

## Features

### 📊 KPI Dashboard
- **Total Active Projects**: Real-time count of ongoing projects
- **Total Digital Budget**: Aggregated budget in billions
- **High-Risk Projects**: Projects with Low/Medium-Low DCA ratings
- **Healthy Tier 1&2 Projects**: Percentage of critical projects with High/Medium-High DCA

### 🎯 Interactive Filters
- **Portfolio**: Filter by government portfolio
- **Agency**: Filter by specific agencies
- **Tier**: Filter by project importance (Tier 1, 2, 3)
- **Delivery Status**: Active vs Closed projects
- **DCA 2025**: Filter by Delivery Confidence Assessment levels

### 📈 Visualizations
1. **DCA Distribution by Tier**: Stacked bar chart showing confidence levels across project tiers
2. **Budget Allocation by Portfolio**: Treemap visualization of budget distribution
3. **DCA Change Tracking**: Comparative analysis of DCA changes from 2024 to 2025
4. **Project Details Table**: Searchable and sortable table with full project information

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data**: CSV parsing with fallback to sample data

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Place your data file**:
   - Copy `mdpr-dataset-project-data-1.csv` to the root directory
   - The app will use sample data if the file is not found

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for production

```bash
npm run build
npm start
```

## Data Structure

The dashboard expects CSV data with the following columns:
- `Portfolio`: Government portfolio
- `Agency`: Responsible agency
- `Tier`: Project tier (Tier 1, Tier 2, Tier 3)
- `Project name`: Full project name
- `DCA 2024`: Delivery confidence assessment for 2024
- `DCA 2025`: Delivery confidence assessment for 2025
- `Delivery status`: Active or Closed
- `Total budget (millions)`: Total project budget
- `Digital budget (millions)`: Digital component budget
- `Project end date`: Expected completion date
- `Project description`: Full project description

## DCA (Delivery Confidence Assessment) Levels

- **High** 🟢: Project on track with high confidence
- **Medium-High** 🟡: Generally positive outlook
- **Medium** 🟠: Some concerns but manageable
- **Medium-Low** 🔴: Significant risks identified
- **Low** 🔴: High risk of failure or major issues

## Usage

1. **Overview**: Start with the KPI panel to get high-level metrics
2. **Filter**: Use the sidebar filters to focus on specific portfolios, agencies, or project types
3. **Analyze**: Examine the visualizations to identify trends and risk patterns
4. **Detail**: Use the project table for detailed information and search functionality
5. **Compare**: Track DCA changes to identify improving or deteriorating projects

## Customization

### Colors
DCA colors are defined in `tailwind.config.js` and can be customized:
```javascript
colors: {
  'dca-high': '#10b981',      // Green
  'dca-medium-high': '#84cc16', // Light green
  'dca-medium': '#f59e0b',    // Yellow
  'dca-medium-low': '#f97316', // Orange
  'dca-low': '#ef4444',       // Red
}
```

### Charts
Charts use Recharts and can be customized in their respective component files:
- `components/DCAByTierChart.tsx`
- `components/BudgetByPortfolio.tsx`
- `components/DCAComparisonChart.tsx`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by the Australian Digital Transformation Agency (DTA)
- Built with Next.js and React
- Charts powered by Recharts
- Styling with Tailwind CSS
=======