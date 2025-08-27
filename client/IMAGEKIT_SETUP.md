# ImageKit Setup Guide

This guide will help you set up ImageKit for image storage in the PG Student Manager application.

## 🚀 What is ImageKit?

ImageKit is a cloud-based image optimization and transformation service that provides:
- **Fast CDN delivery** for images
- **Automatic optimization** and compression
- **Real-time transformations** (resize, crop, quality adjustment)
- **Secure storage** with backup
- **Cost-effective** compared to storing images in MongoDB

## 📋 Prerequisites

1. **ImageKit Account**: Sign up at [imagekit.io](https://imagekit.io)
2. **Node.js**: Version 18+ installed
3. **MongoDB**: Running locally or cloud instance

## 🔧 Setup Steps

### 1. Create ImageKit Account

1. Go to [imagekit.io](https://imagekit.io)
2. Sign up for a free account
3. Create a new project
4. Note down your credentials:
   - **Public Key**
   - **Private Key** 
   - **URL Endpoint**

### 2. Configure Environment Variables

Create a `.env` file in the `client` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# ImageKit Configuration
VITE_IMAGEKIT_PUBLIC_KEY=your_public_key_here
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
VITE_IMAGEKIT_AUTH_ENDPOINT=http://localhost:3001/api/imagekit/auth
```

Create a `.env` file in the `server` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/pg-student-manager

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint

# Server Configuration
PORT=3001
```

### 3. Replace Placeholder Values

Replace the following in your `.env` files:

- `your_public_key_here` → Your ImageKit Public Key
- `your_private_key_here` → Your ImageKit Private Key  
- `your_endpoint` → Your ImageKit URL Endpoint

### 4. Install Dependencies

```bash
# Client dependencies
cd client
npm install

# Server dependencies  
cd ../server
npm install
```

### 5. Start the Application

```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```

## 🎯 Features

### Image Upload
- **Drag & Drop**: Users can drag images directly onto the upload area
- **Click to Upload**: Traditional file selection
- **Preview**: Real-time image preview before upload
- **Validation**: File type and size validation
- **Progress**: Upload progress indicator

### Image Storage
- **Optimized Storage**: Images are automatically optimized
- **CDN Delivery**: Fast global delivery via ImageKit CDN
- **Transformations**: Automatic resizing and quality optimization
- **Backup**: Secure cloud storage with redundancy

### Image Display
- **Profile Images**: Circular profile photos in student list
- **Details View**: Large profile images in student details
- **Fallback**: Placeholder images when no photo is uploaded
- **Responsive**: Optimized for all screen sizes

## 🔒 Security

### Client-Side Security
- **File Validation**: Only allowed image types (JPEG, PNG, WebP)
- **Size Limits**: Maximum 5MB file size
- **Authentication**: Secure upload with ImageKit authentication

### Server-Side Security
- **Private Key**: Server-side operations use private key
- **File Deletion**: Automatic cleanup when students are deleted
- **Error Handling**: Graceful error handling for failed uploads

## 📊 Performance Benefits

### Database Optimization
- **Reduced Size**: MongoDB stores only URLs, not binary data
- **Faster Queries**: Smaller document size = faster queries
- **Lower Storage**: Significant reduction in database storage

### User Experience
- **Fast Loading**: CDN-delivered images load quickly
- **Optimized Images**: Automatic compression and optimization
- **Responsive**: Images adapt to different screen sizes

## 🛠️ Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check ImageKit credentials in `.env` files
   - Verify network connectivity
   - Check file size and type restrictions

2. **Images Don't Display**
   - Verify ImageKit URL endpoint
   - Check browser console for errors
   - Ensure images are uploaded successfully

3. **Authentication Errors**
   - Verify public and private keys
   - Check server authentication endpoint
   - Ensure server is running

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
DEBUG=true
```

## 📈 Monitoring

### ImageKit Dashboard
- **Usage Statistics**: Monitor upload and delivery metrics
- **Storage Analytics**: Track storage usage and costs
- **Performance Metrics**: CDN performance and optimization stats

### Application Monitoring
- **Upload Success Rate**: Track successful vs failed uploads
- **Storage Efficiency**: Monitor database size reduction
- **User Experience**: Track image loading performance

## 🔄 Migration

### From Local Storage
If you're migrating from local image storage:

1. **Backup**: Create backup of existing images
2. **Upload**: Use ImageKit upload API to migrate images
3. **Update URLs**: Update database records with new ImageKit URLs
4. **Verify**: Test image display and functionality

### From Other CDN
If migrating from another CDN:

1. **Export URLs**: Export image URLs from current CDN
2. **Upload to ImageKit**: Upload images to ImageKit
3. **Update Database**: Replace old URLs with new ImageKit URLs
4. **Test**: Verify all images display correctly

## 💰 Cost Optimization

### Free Tier
- **10GB Storage**: Sufficient for most PG applications
- **20GB Bandwidth**: Good for moderate usage
- **1000 Transformations**: Basic image optimization

### Paid Plans
- **Starter**: $20/month for 100GB storage
- **Professional**: $50/month for 500GB storage
- **Enterprise**: Custom pricing for large scale

## 🆘 Support

### ImageKit Support
- **Documentation**: [docs.imagekit.io](https://docs.imagekit.io)
- **Community**: [community.imagekit.io](https://community.imagekit.io)
- **Email**: support@imagekit.io

### Application Support
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check README files for setup guides
- **Community**: Join developer community for help

---

**Happy Image Management! 🖼️** 