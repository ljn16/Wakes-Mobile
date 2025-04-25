// app.config.ts
import 'dotenv/config';

export default {
  expo: {
    "ios": {
      "bundleIdentifier": "com.ljn16.wakes-expo"
    },
    name: "Wakes",
    slug: "wakes-expo",
    version: "1.0.0",
    scheme: "wakes",
    experimental: {
      newArchEnabled: false
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      awsRegion: process.env.AWS_REGION,
      s3BucketName: process.env.S3_BUCKET_NAME,
      nextPublicS3BucketName: process.env.EXPO_PUBLIC_S3_BUCKET_NAME,
    },
  },
};