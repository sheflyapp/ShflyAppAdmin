# 📄 Static Content Management - Shfly Admin Panel

## 🎯 Overview
The Static Content Management system allows administrators to manage all static content for the Shfly consultation app, including privacy policy, terms & conditions, help documentation, and more.

## ✨ Features

### 🌐 Multi-Language Support
- **English & Arabic** content support
- **Real-time language switching** in the admin panel
- **Separate content fields** for each language

### 📝 Content Types
1. **Privacy Policy** - User privacy and data protection information
2. **Terms & Conditions** - Terms of service and user agreements
3. **Help Center** - Help documentation and support content
4. **Onboarding** - Welcome and getting started content
5. **About Us** - Company information and about page content
6. **Contact** - Contact information and support details
7. **FAQ** - Frequently asked questions

### 🔧 Admin Features
- **Create & Edit** content with rich text editor
- **Preview** content before publishing
- **Version control** for content updates
- **SEO optimization** (title, description, keywords)
- **Status management** (active/inactive)
- **Multi-language editing** interface
- **Content listing** with search and filter

## 🚀 Getting Started

### 1. Access the Admin Panel
```
URL: http://localhost:3000/static-content
```

### 2. Navigate to Static Content
- Click on "Static Content Management" in the sidebar
- Or go directly to `/static-content` route

### 3. Create Content
1. Click on any content type card (e.g., Privacy Policy)
2. Fill in the content form:
   - **Title**: Content title
   - **Content**: Main content (English)
   - **Arabic Content**: Arabic translation
   - **SEO Fields**: SEO optimization
   - **Version**: Content version
3. Click "Create" to save

### 4. Edit Existing Content
1. Click "Edit" on any content type card
2. Modify the content as needed
3. Click "Update" to save changes

## 📋 API Endpoints

### Public APIs (No Authentication)
```bash
# Get all active content
GET /api/content

# Get specific content by type
GET /api/content/privacy-policy
GET /api/content/terms-conditions
GET /api/content/help
GET /api/content/onboarding
GET /api/content/about
GET /api/content/contact
GET /api/content/faq

# Get content in specific language
GET /api/content/privacy-policy?lang=ar
GET /api/content/terms-conditions?lang=en
```

### Admin APIs (Require Authentication)
```bash
# Create or update content
POST /api/content/{type}
PUT /api/content/{type}

# Delete content
DELETE /api/content/{type}

# Get all content for admin
GET /api/content/admin/all
```

## 🔧 Technical Implementation

### Frontend (React Admin Panel)
- **Location**: `src/pages/StaticContent.js`
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **State Management**: React hooks
- **API Integration**: Custom callAPI service

### Backend (Node.js API)
- **Model**: `models/StaticContent.js`
- **Routes**: `routes/staticContent.js`
- **Database**: MongoDB with Mongoose
- **Validation**: Express validator
- **Authentication**: JWT middleware

### Database Schema
```javascript
{
  type: String, // privacy-policy, terms-conditions, etc.
  title: String,
  content: String, // English content
  contentAr: String, // Arabic content
  version: String,
  isActive: Boolean,
  lastUpdatedBy: ObjectId,
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  metadata: Map,
  timestamps: true
}
```

## 🌍 Internationalization

### English Translations
- **File**: `src/i18n/locales/en.json`
- **Key**: `staticContent.*`

### Arabic Translations
- **File**: `src/i18n/locales/ar.json`
- **Key**: `staticContent.*`

## 🎨 UI Components

### Content Type Cards
- **Grid layout** with responsive design
- **Icon representation** for each content type
- **Status indicators** (active/inactive)
- **Action buttons** (create/edit/delete)

### Content Editor
- **Multi-language tabs** (English/Arabic)
- **Rich text areas** for content editing
- **SEO fields** for optimization
- **Preview functionality**
- **Form validation**

### Content List Table
- **Sortable columns** (type, title, version, status, date)
- **Action buttons** (edit/delete)
- **Status badges** (active/inactive)
- **Responsive design**

## 🔐 Security Features

### Authentication
- **JWT token** required for admin operations
- **Role-based access** (admin only)
- **Token validation** on all protected routes

### Validation
- **Input sanitization** for all content fields
- **Required field validation**
- **Content type validation**
- **Version format validation**

## 📱 Responsive Design

### Mobile Support
- **Responsive grid** layout
- **Mobile-friendly** forms
- **Touch-optimized** buttons
- **Collapsible** navigation

### Desktop Features
- **Full sidebar** navigation
- **Multi-column** layouts
- **Hover effects** and animations
- **Keyboard shortcuts**

## 🚀 Deployment

### Development
```bash
# Start the admin panel
cd ShflyAppAdmin
npm start

# Start the API server
cd ShflyAppAPI
npm start
```

### Production
- **Build** the React admin panel
- **Deploy** to your hosting platform
- **Configure** environment variables
- **Set up** database connection

## 📊 Usage Examples

### 1. Create Privacy Policy
```javascript
const privacyData = {
  title: 'Privacy Policy',
  content: 'Your privacy policy content...',
  contentAr: 'محتوى سياسة الخصوصية...',
  version: '1.0.0',
  seoTitle: 'Privacy Policy - Shfly',
  seoDescription: 'Learn about our privacy practices',
  seoKeywords: ['privacy', 'policy', 'data protection']
};
```

### 2. Get Content via API
```javascript
// Get privacy policy in English
const response = await fetch('/api/content/privacy-policy');
const data = await response.json();

// Get terms in Arabic
const responseAr = await fetch('/api/content/terms-conditions?lang=ar');
const dataAr = await responseAr.json();
```

## 🎉 Benefits

### For Administrators
- **Easy content management** without technical knowledge
- **Multi-language support** for global reach
- **SEO optimization** for better search visibility
- **Version control** for content tracking
- **Real-time preview** before publishing

### For Users
- **Consistent content** across all languages
- **Up-to-date information** with version control
- **SEO-optimized** content for better discoverability
- **Mobile-friendly** content display

## 🔧 Troubleshooting

### Common Issues
1. **Content not loading**: Check API server status
2. **Authentication errors**: Verify admin token
3. **Language switching**: Check translation files
4. **Form validation**: Ensure all required fields are filled

### Debug Steps
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check database connection
4. Validate authentication tokens

## 📞 Support

For technical support or questions about the Static Content Management system:
- **Email**: support@shfly.com
- **Documentation**: Check the main README files
- **Issues**: Report bugs through the issue tracker

---

**🎯 Ready to manage your static content efficiently!** 🚀
