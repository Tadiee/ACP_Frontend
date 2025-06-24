<div style="display: flex; align-items: center; gap: 20px; margin-bottom: 10px;">
  <img src="public/images/reallogo.png" alt="Access Control Portal" width="80" style="vertical-align: middle;" />
  <h1 style="margin: 0; display: inline-block; vertical-align: middle;">Access Control Portal (Frontend)</h1>
</div>
<p style="margin-top: 0;">A modern web application built with Next.js for managing access control requests and approvals within an organization.</p>

## Features

- **Role-based Access Control**: Different interfaces for requestors and approvers
- **Dynamics 365 Integration**: Seamless integration with D365 for user management
- **Document Viewer**: Built-in PDF and document viewing capabilities
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Stay up-to-date with the latest requests and approvals

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **UI Library**: React 19 with Material-UI (MUI)
- **Styling**: Styled Components with Emotion
- **Data Visualization**: Chart.js and MUI X Charts
- **Document Handling**: React PDF Viewer
- **State Management**: React Context API
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/access-control-portal.git
   cd access-control-portal/acp-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the necessary environment variables:
   ```
   NEXT_PUBLIC_API_URL=your_api_url_here
   # Add other environment variables as needed
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
src/
├── app/                    # App router pages and layouts
│   ├── D365App/            # D365 integration components
│   ├── approver/           # Approver dashboard and pages
│   ├── requestor/          # Requestor interface
│   ├── layout.js           # Root layout
│   └── page.js             # Home page
├── components/             # Reusable components
├── context/                # React context providers
├── lib/                    # Utility functions
├── public/                 # Static files
└── styles/                 # Global styles
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
