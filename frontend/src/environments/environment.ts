export const environment = {
  production: false,
  apiUrl: 'http://localhost:8001/api',

  // Allow larger file uploads
  maxFileSize: 20 * 1024 * 1024, // 20MB in bytes
  allowedFileTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};
