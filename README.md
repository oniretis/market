# HeyWhy Marketplace

A modern, full-featured marketplace platform built with Next.js 14, TypeScript, and Prisma. This platform enables users to buy and sell products across multiple categories with comprehensive admin management, user authentication, and payment processing.

## 🚀 Features

### For Users
- **User Authentication**: Secure login/signup with Kinde Auth
- **Product Management**: Create, edit, and manage product listings
- **Multi-category Support**: Browse products by categories (Properties, Gadgets, Cars, Others)
- **Advanced Search**: Search and filter products across all categories
- **Review System**: Rate and review products with moderation
- **Rich Product Editor**: Advanced text editor with TipTap for detailed product descriptions
- **File Uploads**: Multiple image uploads with UploadThing
- **User Profiles**: Personal dashboards to manage listings and account

### For Administrators
- **Admin Dashboard**: Comprehensive platform overview with real-time analytics
- **Product Approval System**: Review and approve/reject product submissions
- **User Management**: Manage user roles and permissions (USER, ADMIN, SUPER_ADMIN)
- **Review Moderation**: Approve or moderate user reviews
- **Category & Tag Management**: Organize products with custom categories and tags
- **Revenue Analytics**: Track sales, revenue, and platform performance
- **Activity Monitoring**: Comprehensive audit trail of all platform activities
- **Bulk Operations**: Mass approval, rejection, and export capabilities
- **Advertisement Management**: Manage platform advertisements and promotions

### Platform Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Beautiful interface with shadcn/ui components
- **Real-time Updates**: Live data synchronization across the platform
- **Payment Processing**: Stripe integration for secure payments
- **Email Notifications**: Transactional emails with React Email and Resend
- **Dark Mode**: Theme switching with next-themes
- **SEO Optimized**: Built-in SEO optimizations and meta tags

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern React component library
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icon library
- **TipTap**: Rich text editor
- **React Hook Form**: Form management with Zod validation

### Backend
- **Prisma**: Modern database toolkit
- **PostgreSQL**: Database (configurable)
- **Kinde Auth**: Authentication and authorization
- **Stripe**: Payment processing
- **UploadThing**: File upload service
- **Resend**: Email delivery service
- **React Email**: Email template development

### Development Tools
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **TypeScript**: Static type checking

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel routes
│   ├── api/               # API routes
│   ├── billing/           # Billing and payment pages
│   ├── components/        # Reusable components
│   ├── products/          # Product listing pages
│   └── globals.css        # Global styles
├── components/            # Shared components
│   └── ui/               # Base UI components
├── lib/                  # Utility functions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── .windsurf/            # Workflow configurations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or compatible database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd market
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   - `DATABASE_URL`: Your database connection string
   - `KINDE_CLIENT_ID`: Kinde authentication client ID
   - `KINDE_CLIENT_SECRET`: Kinde authentication client secret
   - `KINDE_ISSUER_URL`: Kinde issuer URL
   - `KINDE_SITE_URL`: Your application URL
   - `KINDE_POST_LOGIN_REDIRECT_URL`: Post-login redirect URL
   - `KINDE_POST_LOGOUT_REDIRECT_URL`: Post-logout redirect URL
   - `STRIPE_SECRET_KEY`: Stripe secret key
   - `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
   - `UPLOADTHING_SECRET`: UploadThing secret
   - `UPLOADTHING_APP_ID`: UploadThing app ID
   - `RESEND_API_KEY`: Resend API key

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The application uses Prisma with the following main models:

- **User**: User accounts with roles and authentication
- **Product**: Product listings with approval workflow
- **Category**: Product categories
- **Tag**: Product tags for better organization
- **Review**: User reviews with moderation
- **Activity**: Audit trail for admin actions

## 🔐 Authentication & Authorization

- **Kinde Auth**: Handles user authentication and session management
- **Role-based Access Control**: Three user roles (USER, ADMIN, SUPER_ADMIN)
- **Protected Routes**: Middleware protects admin and sensitive routes
- **Activity Logging**: All admin actions are logged for security

## 📦 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.