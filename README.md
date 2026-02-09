# StudentHub - Professional Student Management System

A modern, responsive, and accessible student management interface built with semantic HTML5, professional CSS architecture, and Supabase backend integration.

## 🚀 Features

- **Modern Architecture**: Professional CSS with design system and utility classes
- **Responsive Design**: Mobile-first approach with systematic breakpoints
- **Accessibility**: WCAG compliant with ARIA labels and screen reader support
- **Semantic HTML5**: Proper document structure and SEO optimization
- **Professional UI**: Clean, modern interface with smooth animations
- **Vercel Ready**: Optimized for seamless deployment
- **Supabase Backend**: Real-time database with serverless API functions
- **RESTful API**: Full CRUD operations for students, homework, and tests

## 📁 Project Structure

```
Student Management/
├── src/
│   ├── components/          # Future component files
│   ├── styles/
│   │   └── main.css        # Main stylesheet with professional architecture
│   ├── script.js           # Main JavaScript with API integration
│   └── index.html          # Main HTML file
├── api/
│   ├── students.js         # Student management API endpoints
│   └── homework.js         # Homework management API endpoints
├── public/
│   ├── images/             # Static images folder
│   └── icons/              # Favicons and icons
├── vercel.json             # Vercel deployment configuration
├── package.json            # Project metadata and dependencies
├── .env.example            # Environment variables template
├── supabase-schema.sql     # Database schema and setup
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Styling**: Professional CSS with design system
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## �️ Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Set Up Database Schema
1. Open the Supabase SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL script to create all tables and indexes

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
3. Add your values:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

## 🚀 Deployment

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Vercel Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Set environment variables in Vercel**:
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

4. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## 📋 Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build for production (static site)
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to Vercel production

## 🔌 API Endpoints

### Students API
- `GET /api/students` - Retrieve all students
- `POST /api/students` - Create a new student
- Query parameters for `GET`:
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 10)
  - `class` - Filter by class
  - `search` - Search in name, email, or student ID
  - `status` - Filter by status

### Homework API
- `GET /api/homework` - Retrieve all homework
- `POST /api/homework` - Create new homework
- Query parameters for `GET`:
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 10)
  - `class` - Filter by class
  - `subject` - Filter by subject
  - `status` - Filter by status
  - `priority` - Filter by priority

## 🎨 Architecture Highlights

### CSS Design System
- **Color Palette**: Systematic 50-900 scale for all colors
- **Typography**: Modular scale with proper font weights
- **Spacing**: Consistent spacing scale for predictable layouts
- **Components**: Reusable component-based architecture
- **Utilities**: Comprehensive utility class library

### API Architecture
- **RESTful Design**: Standard HTTP methods and status codes
- **Error Handling**: Comprehensive error responses
- **Validation**: Input validation and sanitization
- **CORS**: Proper cross-origin resource sharing
- **Pagination**: Efficient data pagination

### Database Design
- **Normalized Schema**: Proper relationships and constraints
- **Indexes**: Optimized for performance
- **Triggers**: Automatic timestamp updates
- **Views**: Convenient data aggregation
- **RLS**: Row Level Security for data protection

## 🔧 Configuration

### Environment Variables
Create a `.env` file with the following variables:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NODE_ENV=development
```

### Vercel Configuration
The `vercel.json` file handles:
- Static file serving
- API route mapping
- Cache headers for optimal performance
- Proper asset delivery

## 📝 Development Notes

### Adding New API Endpoints
1. Create new files in `api/` directory
2. Follow the existing pattern for error handling
3. Add proper CORS headers
4. Include input validation

### Adding New Database Tables
1. Update `supabase-schema.sql`
2. Create corresponding API endpoints
3. Add indexes for performance
4. Update RLS policies

### Frontend API Integration
The JavaScript includes helper functions for:
- `apiRequest()` - Generic API request handler
- `fetchStudents()` - Get students with filters
- `createStudent()` - Create new student
- `fetchHomework()` - Get homework with filters
- `createHomework()` - Create new homework

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🌟 Acknowledgments

- Built with modern web standards
- Powered by Supabase and Vercel
- Inspired by professional design systems
- Optimized for performance and accessibility
