# Consultation App Admin Panel

A modern, responsive admin panel built with React.js and Tailwind CSS for managing the Consultation App.

## Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Authentication**: Secure admin login with JWT
- **Dashboard**: Comprehensive overview with charts and statistics
- **User Management**: Manage seekers and providers
- **Consultation Management**: Monitor and manage consultations
- **Category Management**: Add/edit consultation categories
- **Payment Tracking**: Monitor payment status and revenue
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React.js 18
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Notifications**: React Hot Toast

## Project Structure

```
admin/
├── public/           # Static files
├── src/
│   ├── components/   # Reusable components
│   ├── contexts/     # React contexts
│   ├── pages/        # Page components
│   ├── App.js        # Main app component
│   ├── index.js      # Entry point
│   └── index.css     # Global styles
├── package.json      # Dependencies
├── tailwind.config.js # Tailwind configuration
└── README.md         # This file
```

## Pages

### Dashboard
- Overview statistics
- User growth charts
- Revenue trends
- Recent consultations

### Users
- List all users
- Filter by user type
- View user details
- Manage user status

### Providers
- Provider management
- Verification status
- Specialization management
- Performance metrics

### Seekers
- Seeker management
- Consultation history
- Rating and reviews

### Consultations
- All consultations
- Status management
- Payment tracking
- Chat monitoring

### Categories
- Consultation categories
- Add/edit categories
- Category management

### Payments
- Payment history
- Revenue tracking
- Refund management

## Installation

1. **Navigate to admin directory**
   ```bash
   cd admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Environment Setup

The admin panel connects to the backend API. Make sure your backend is running on `http://localhost:5000` or update the proxy in `package.json`.

## Usage

### Login
1. Navigate to `/login`
2. Enter admin credentials
3. Access the dashboard

### Navigation
- Use the sidebar for navigation between sections
- Responsive design adapts to screen size
- Mobile-friendly with collapsible sidebar

### Data Management
- View and filter data in tables
- Use search and pagination
- Export data when needed

## API Integration

The admin panel integrates with the following backend endpoints:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Providers**: `/api/providers/*`
- **Consultations**: `/api/consultations/*`
- **Categories**: `/api/categories/*`
- **Payments**: `/api/payments/*`

## Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for custom CSS classes
- Use Tailwind utility classes for rapid styling

### Components
- Reusable components in `src/components/`
- Page components in `src/pages/`
- Easy to extend and modify

### Charts
- Charts built with Recharts
- Customizable data visualization
- Responsive chart components

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin-only features
- **Protected Routes**: Automatic redirect for unauthorized access
- **Secure API Calls**: Axios with authentication headers

## Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: Tailwind CSS responsive utilities
- **Sidebar**: Collapsible on mobile, fixed on desktop
- **Tables**: Horizontal scroll on small screens

## Performance

- **Code Splitting**: React Router for lazy loading
- **Optimized Builds**: Production builds with optimizations
- **Efficient Rendering**: React 18 features
- **Bundle Optimization**: Tree shaking and minification

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Code Style

- Follow React best practices
- Use functional components with hooks
- Consistent naming conventions
- Proper error handling

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy build folder**
   - Upload `build/` folder to your web server
   - Configure server for React Router
   - Set up environment variables

3. **Environment Variables**
   - Ensure backend API is accessible
   - Configure CORS if needed
   - Set up proper domain configuration

## Troubleshooting

### Common Issues

1. **API Connection Error**
   - Check if backend is running
   - Verify API endpoints
   - Check CORS configuration

2. **Authentication Issues**
   - Clear localStorage
   - Check JWT token validity
   - Verify admin privileges

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Test on multiple devices
4. Update documentation as needed

## Support

For support and questions:
- Check the backend API documentation
- Review React and Tailwind CSS documentation
- Contact the development team

## License

This project is licensed under the ISC License.


