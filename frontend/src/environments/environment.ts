export const environment = {
  production: false,
  apiUrl: 'https://al-project-server.vercel.app',

  // Allow larger file uploads
  maxFileSize: 20 * 1024 * 1024, // 20MB in bytes
  allowedFileTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};
