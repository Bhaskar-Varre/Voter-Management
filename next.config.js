/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  basePath: isProd ? '/voter-management' : '',
  // other config options
};
